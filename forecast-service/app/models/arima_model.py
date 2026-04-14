# app/models/arima_model.py
import pandas as pd
import numpy as np
import pickle
import os
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.stattools import adfuller
import warnings
warnings.filterwarnings('ignore')

from app.config import config

class ARIMAModel:
    """
    ARIMA (AutoRegressive Integrated Moving Average) Model
    Captures trends and linear patterns in time series data
    """
    
    def __init__(self, blood_type: str):
        self.blood_type = blood_type
        self.model = None
        self.model_fit = None
        self.order = None
        self.is_trained = False
        self.model_path = os.path.join(config.MODELS_DIR, f'arima_{blood_type}.pkl')
    
    def _check_stationarity(self, series):
        """Check if time series is stationary using Augmented Dickey-Fuller test"""
        result = adfuller(series.dropna())
        is_stationary = result[1] <= 0.05
        return is_stationary, result[1]
    
    def _find_optimal_order(self, series, max_p=5, max_d=2, max_q=5):
        """Find optimal ARIMA order (p, d, q) using AIC"""
        best_aic = float('inf')
        best_order = None
        
        # Find optimal d (differencing order)
        d = 0
        diff_series = series
        for i in range(max_d + 1):
            if i > 0:
                diff_series = diff_series.diff().dropna()
            is_stationary, p_value = self._check_stationarity(diff_series)
            if is_stationary:
                d = i
                break
        
        # Find optimal p and q
        for p in range(max_p + 1):
            for q in range(max_q + 1):
                try:
                    model = ARIMA(series, order=(p, d, q))
                    model_fit = model.fit()
                    aic = model_fit.aic
                    
                    if aic < best_aic:
                        best_aic = aic
                        best_order = (p, d, q)
                except:
                    continue
        
        return best_order
    
    def train(self, historical_data: pd.DataFrame):
        """Train ARIMA model on historical data"""
        # Prepare time series
        series = historical_data.set_index('date')['demand'].sort_index()
        series = series.asfreq('D').fillna(0)
        
        if len(series) < 30:
            raise ValueError(f"Insufficient data for {self.blood_type}. Need at least 30 days.")
        
        # Find optimal order
        self.order = self._find_optimal_order(series)
        
        if self.order is None:
            # Fallback to default order
            self.order = (3, 1, 3)
        
        # Fit model
        self.model = ARIMA(series, order=self.order)
        self.model_fit = self.model.fit()
        self.is_trained = True
        
        # Save model
        self._save()
        
        return self.model_fit
    
    def forecast(self, steps: int = 30, confidence_level: float = 0.8):
        """Generate forecast for next 'steps' days"""
        if not self.is_trained:
            raise ValueError("Model not trained yet")
        
        forecast_result = self.model_fit.get_forecast(steps=steps)
        forecast_mean = forecast_result.predicted_mean
        forecast_ci = forecast_result.conf_int(alpha=1 - confidence_level)
        
        forecasts = []
        for i in range(steps):
            forecasts.append({
                'day': i + 1,
                'date': (pd.Timestamp.now() + pd.Timedelta(days=i+1)).strftime('%Y-%m-%d'),
                'predicted_demand': round(max(0, forecast_mean.iloc[i])),
                'lower_bound': round(max(0, forecast_ci.iloc[i, 0])),
                'upper_bound': round(forecast_ci.iloc[i, 1])
            })
        
        return {
            'blood_type': self.blood_type,
            'model': 'ARIMA',
            'order': self.order,
            'forecasts': forecasts,
            'confidence_level': confidence_level,
            'aic': round(self.model_fit.aic, 2)
        }
    
    def get_accuracy(self, actual_data: pd.DataFrame):
        """Calculate accuracy metrics on test data"""
        from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error
        
        if not self.is_trained:
            raise ValueError("Model not trained yet")
        
        # Align predictions with actual data
        predictions = self.model_fit.predict(start=actual_data.index[0], end=actual_data.index[-1])
        actual = actual_data['demand'].values[:len(predictions)]
        
        mae = mean_absolute_error(actual, predictions)
        mape = mean_absolute_percentage_error(actual, predictions) * 100
        
        return {
            'mae': round(mae, 2),
            'mape': round(mape, 2),
            'rmse': round(np.sqrt(np.mean((actual - predictions) ** 2)), 2)
        }
    
    def _save(self):
        """Save trained model to disk"""
        os.makedirs(config.MODELS_DIR, exist_ok=True)
        with open(self.model_path, 'wb') as f:
            pickle.dump({
                'model': self.model_fit,
                'order': self.order,
                'blood_type': self.blood_type
            }, f)
    
    def load(self):
        """Load trained model from disk"""
        if os.path.exists(self.model_path):
            with open(self.model_path, 'rb') as f:
                data = pickle.load(f)
                self.model_fit = data['model']
                self.order = data['order']
                self.is_trained = True
            return True
        return False