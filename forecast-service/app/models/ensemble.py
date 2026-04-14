# app/models/ensemble.py
import numpy as np
from app.models.arima_model import ARIMAModel
from app.models.prophet_model import ProphetModel
from app.config import config

try:
    from app.models.lstm_model import LSTMModel
except Exception:
    LSTMModel = None

class EnsembleModel:
    """
    Ensemble Model - Combines ARIMA, Prophet, and LSTM predictions
    Uses weighted voting based on recent model performance
    """
    
    def __init__(self, blood_type: str):
        self.blood_type = blood_type
        self.arima = ARIMAModel(blood_type)
        self.prophet = ProphetModel(blood_type)
        self.lstm = LSTMModel(blood_type) if config.LSTM_ENABLED and LSTMModel else None

        default_weights = {
            'arima': 0.45,
            'prophet': 0.35,
            'lstm': 0.20
        }
        self.weights = {
            name: weight
            for name, weight in default_weights.items()
            if getattr(self, name) is not None
        }
        total_weight = sum(self.weights.values())
        if total_weight > 0:
            self.weights = {name: weight / total_weight for name, weight in self.weights.items()}
    
    def train(self, historical_data):
        """Train all three models"""
        # Train ARIMA
        try:
            self.arima.train(historical_data)
        except Exception as e:
            print(f"ARIMA training failed: {e}")
        
        # Train Prophet
        try:
            self.prophet.train(historical_data)
        except Exception as e:
            print(f"Prophet training failed: {e}")
        
        # Train LSTM if enabled
        if self.lstm is not None:
            try:
                self.lstm.train(historical_data)
            except Exception as e:
                print(f"LSTM training failed: {e}")

        # Update weights based on recent accuracy
        self._update_weights(historical_data.tail(30))
    
    def _update_weights(self, recent_data):
        """Update model weights based on recent performance"""
        metrics = {}

        def _safe_accuracy(name, model):
            if model is None or not model.is_trained:
                return None
            if hasattr(model, 'get_accuracy'):
                try:
                    return model.get_accuracy(recent_data)
                except Exception as e:
                    print(f"Could not compute accuracy for {name}: {e}")
            return None

        model_candidates = {
            'arima': self.arima,
            'prophet': self.prophet,
            'lstm': self.lstm
        }

        for name, model in model_candidates.items():
            accuracy = _safe_accuracy(name, model)
            if accuracy and accuracy.get('mape', None) is not None:
                metrics[name] = 1.0 / (accuracy['mape'] + 1.0)

        if not metrics:
            return

        total_score = sum(metrics.values())
        self.weights = {name: score / total_score for name, score in metrics.items()}
    
    def forecast(self, steps: int = 30):
        """Generate ensemble forecast by combining all models"""
        forecasts = []
        
        # Get predictions from each model
        arima_result = self.arima.forecast(steps) if self.arima.is_trained else None
        prophet_result = self.prophet.forecast(steps) if self.prophet.is_trained else None
        lstm_result = self.lstm.forecast(steps) if self.lstm is not None and self.lstm.is_trained else None
        
        # Combine predictions
        for i in range(steps):
            predictions = []
            
            if arima_result:
                predictions.append({
                    'value': arima_result['forecasts'][i]['predicted_demand'],
                    'weight': self.weights['arima']
                })
            
            if prophet_result:
                predictions.append({
                    'value': prophet_result['forecasts'][i]['predicted_demand'],
                    'weight': self.weights['prophet']
                })
            
            if lstm_result:
                predictions.append({
                    'value': lstm_result['forecasts'][i]['predicted_demand'],
                    'weight': self.weights['lstm']
                })
            
            if not predictions:
                raise ValueError("No models available for forecasting")
            
            # Weighted average
            weighted_sum = sum(p['value'] * p['weight'] for p in predictions)
            total_weight = sum(p['weight'] for p in predictions)
            ensemble_value = weighted_sum / total_weight
            
            # Calculate confidence bounds (min/max of individual predictions)
            values = [p['value'] for p in predictions]
            
            forecasts.append({
                'day': i + 1,
                'date': arima_result['forecasts'][i]['date'] if arima_result else prophet_result['forecasts'][i]['date'],
                'predicted_demand': round(ensemble_value),
                'lower_bound': round(min(values)),
                'upper_bound': round(max(values))
            })
        
        # Calculate model weights used
        model_weights = self.weights.copy()
        
        total_predicted = sum(f['predicted_demand'] for f in forecasts)
        
        return {
            'blood_type': self.blood_type,
            'model': 'Ensemble',
            'forecasts': forecasts,
            'model_weights': model_weights,
            'total_predicted_demand': total_predicted,
            'confidence_level': 0.8,
            'models_available': {
                'arima': self.arima.is_trained,
                'prophet': self.prophet.is_trained,
                'lstm': self.lstm.is_trained if self.lstm is not None else False
            }
        }
    
    def load_models(self):
        """Load pre-trained models from disk"""
        try:
            self.arima.load()
            print(f"Loaded ARIMA model for {self.blood_type}")
        except Exception as e:
            print(f"Failed to load ARIMA model for {self.blood_type}: {e}")
            self.arima.is_trained = False
        
        try:
            self.prophet.load()
            print(f"Loaded Prophet model for {self.blood_type}")
        except Exception as e:
            print(f"Failed to load Prophet model for {self.blood_type}: {e}")
            self.prophet.is_trained = False
        
        if self.lstm is not None:
            try:
                self.lstm.load()
                print(f"Loaded LSTM model for {self.blood_type}")
            except Exception as e:
                print(f"Failed to load LSTM model for {self.blood_type}: {e}")
                self.lstm.is_trained = False
