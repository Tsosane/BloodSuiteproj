# app/models/lstm_model.py
import pandas as pd
import numpy as np
import pickle
import os
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping
import warnings
warnings.filterwarnings('ignore')

from app.config import config

class LSTMModel:
    """
    LSTM (Long Short-Term Memory) Neural Network
    Captures complex non-linear patterns and long-term dependencies
    """
    
    def __init__(self, blood_type: str):
        self.blood_type = blood_type
        self.model = None
        self.scaler = MinMaxScaler()
        self.last_sequence = None
        self.is_trained = False
        self.sequence_length = 30  # Look back 30 days
        self.model_path = os.path.join(config.MODELS_DIR, f'lstm_{blood_type}.h5')
        self.scaler_path = os.path.join(config.MODELS_DIR, f'lstm_{blood_type}_scaler.pkl')
    
    def _create_sequences(self, data, sequence_length):
        """Create sequences for LSTM training"""
        X, y = [], []
        for i in range(len(data) - sequence_length):
            X.append(data[i:i + sequence_length])
            y.append(data[i + sequence_length])
        return np.array(X), np.array(y)
    
    def train(self, historical_data: pd.DataFrame, epochs: int = 100, batch_size: int = 32):
        """Train LSTM model on historical data"""
        from tensorflow.keras.optimizers import Adam
        
        # Prepare data
        series = historical_data.set_index('date')['demand'].sort_index()
        series = series.asfreq('D').fillna(0)
        
        # Normalize data
        scaled_data = self.scaler.fit_transform(series.values.reshape(-1, 1))
        
        # Create sequences
        X, y = self._create_sequences(scaled_data, self.sequence_length)
        
        if len(X) < 10:
            raise ValueError(f"Insufficient data for LSTM training. Need at least {self.sequence_length + 10} days.")
        
        # Split into train and validation
        split = int(0.8 * len(X))
        X_train, X_val = X[:split], X[split:]
        y_train, y_val = y[:split], y[split:]
        
        # Build LSTM model
        self.model = Sequential([
            LSTM(100, return_sequences=True, input_shape=(self.sequence_length, 1)),
            Dropout(0.2),
            LSTM(50, return_sequences=False),
            Dropout(0.2),
            Dense(25),
            Dense(1)
        ])
        
        # Compile model
        self.model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss='mse',
            metrics=['mae']
        )
        
        # Early stopping callback
        early_stop = EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True
        )
        
        # Train model
        self.model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=epochs,
            batch_size=batch_size,
            callbacks=[early_stop],
            verbose=0
        )
        
        self.is_trained = True
        self.last_sequence = X[-1]
        
        # Save model
        self._save()
        
        return self.model
    
    def forecast(self, steps: int = 30):
        """Generate forecast for next 'steps' days"""
        if not self.is_trained:
            raise ValueError("Model not trained yet")
        
        if self.last_sequence is None:
            raise ValueError("No previous sequence available for LSTM forecasting")
        
        sequence = self.last_sequence.copy()
        predictions = []
        
        for i in range(steps):
            input_seq = sequence.reshape(1, self.sequence_length, 1)
            pred_scaled = self.model.predict(input_seq, verbose=0)[0][0]
            pred_actual = self.scaler.inverse_transform([[pred_scaled]])[0][0]
            
            predictions.append(max(0, pred_actual))
            
            sequence = np.roll(sequence, -1)
            sequence[-1] = pred_scaled
        
        std_pred = np.std(predictions) if predictions else 0
        
        forecasts = []
        for i, pred in enumerate(predictions):
            forecasts.append({
                'day': i + 1,
                'date': (pd.Timestamp.now() + pd.Timedelta(days=i+1)).strftime('%Y-%m-%d'),
                'predicted_demand': round(pred),
                'lower_bound': round(max(0, pred - 1.96 * std_pred)),
                'upper_bound': round(pred + 1.96 * std_pred)
            })
        
        return {
            'blood_type': self.blood_type,
            'model': 'LSTM',
            'forecasts': forecasts,
            'confidence_level': 0.8
        }
    
    def get_accuracy(self, actual_data: pd.DataFrame):
        """Calculate accuracy metrics on actual demand data"""
        from sklearn.metrics import mean_absolute_error, mean_squared_error, mean_absolute_percentage_error

        if not self.is_trained:
            raise ValueError("Model not trained yet")

        series = actual_data.set_index('date')['demand'].sort_index()
        series = series.asfreq('D').fillna(0)
        scaled_data = self.scaler.transform(series.values.reshape(-1, 1))
        X, y = self._create_sequences(scaled_data, self.sequence_length)

        if len(X) == 0:
            raise ValueError("Insufficient data for accuracy calculation")

        predictions = []
        for i in range(len(X)):
            pred_scaled = self.model.predict(X[i].reshape(1, self.sequence_length, 1), verbose=0)[0][0]
            predictions.append(pred_scaled)

        predicted_actual = self.scaler.inverse_transform(np.array(predictions).reshape(-1, 1)).flatten()
        actual_values = self.scaler.inverse_transform(y).flatten()

        mae = mean_absolute_error(actual_values, predicted_actual)
        mape = mean_absolute_percentage_error(actual_values, predicted_actual) * 100
        rmse = np.sqrt(mean_squared_error(actual_values, predicted_actual))

        return {
            'mae': round(mae, 2),
            'mape': round(mape, 2),
            'rmse': round(rmse, 2)
        }
    
    def _save(self):
        """Save trained model to disk"""
        os.makedirs(config.MODELS_DIR, exist_ok=True)
        self.model.save(self.model_path)
        with open(self.scaler_path, 'wb') as f:
            pickle.dump({'scaler': self.scaler, 'last_sequence': self.last_sequence}, f)
    
    def load(self):
        """Load trained model from disk"""
        from tensorflow.keras.models import load_model
        if os.path.exists(self.model_path):
            self.model = load_model(self.model_path)
            with open(self.scaler_path, 'rb') as f:
                data = pickle.load(f)
                if isinstance(data, dict):
                    self.scaler = data.get('scaler', self.scaler)
                    self.last_sequence = data.get('last_sequence', self.last_sequence)
                else:
                    self.scaler = data
            self.is_trained = True
            return True
        return False