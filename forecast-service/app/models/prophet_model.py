# app/models/prophet_model.py
import pandas as pd
import numpy as np
import pickle
import os
from prophet import Prophet
import warnings
warnings.filterwarnings('ignore')

from app.config import config

class ProphetModel:
    """
    Prophet Model (by Facebook/Meta)
    Captures seasonality (weekly, monthly, yearly) and holiday effects
    """
    
    def __init__(self, blood_type: str):
        self.blood_type = blood_type
        self.model = None
        self.is_trained = False
        self.model_path = os.path.join(config.MODELS_DIR, f'prophet_{blood_type}.pkl')
    
    def train(self, historical_data: pd.DataFrame):
        """Train Prophet model on historical data"""
        # Prepare data for Prophet (requires 'ds' and 'y' columns)
        df = historical_data.rename(columns={'date': 'ds', 'demand': 'y'})
        df['ds'] = pd.to_datetime(df['ds'])
        
        # Add holiday indicators (custom holidays for Lesotho)
        holidays = pd.DataFrame({
            'holiday': 'lesotho_holiday',
            'ds': pd.to_datetime([
                '2024-01-01',  # New Year's Day
                '2024-03-11',  # Moshoeshoe's Day
                '2024-05-01',  # Workers' Day
                '2024-05-25',  # Africa Day
                '2024-07-17',  # King's Birthday
                '2024-10-04',  # Independence Day
                '2024-12-25',  # Christmas Day
                '2024-12-26',  # Boxing Day
            ]),
            'lower_window': -2,
            'upper_window': 1,
        })
        
        # Initialize and train model
        self.model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            holidays=holidays,
            changepoint_prior_scale=0.05,
            seasonality_prior_scale=10.0,
            holidays_prior_scale=10.0
        )
        
        # Add custom seasonalities
        self.model.add_seasonality(name='monthly', period=30.5, fourier_order=5)
        
        # Fit model
        self.model.fit(df)
        self.is_trained = True
        
        # Save model
        self._save()
        
        return self.model
    
    def forecast(self, steps: int = 30):
        """Generate forecast for next 'steps' days"""
        if not self.is_trained:
            raise ValueError("Model not trained yet")
        
        # Create future dataframe
        future = self.model.make_future_dataframe(periods=steps, include_history=False)
        forecast = self.model.predict(future)
        
        # Extract predictions
        forecasts = []
        for i, row in forecast.iterrows():
            forecasts.append({
                'day': i + 1,
                'date': row['ds'].strftime('%Y-%m-%d'),
                'predicted_demand': round(max(0, row['yhat'])),
                'lower_bound': round(max(0, row['yhat_lower'])),
                'upper_bound': round(row['yhat_upper'])
            })
        
        return {
            'blood_type': self.blood_type,
            'model': 'Prophet',
            'forecasts': forecasts,
            'confidence_level': 0.8
        }
    
    def get_accuracy(self, actual_data: pd.DataFrame):
        """Calculate accuracy metrics on actual demand data"""
        from sklearn.metrics import mean_absolute_error, mean_squared_error, mean_absolute_percentage_error

        if not self.is_trained:
            raise ValueError("Model not trained yet")

        actual = actual_data.copy()
        if 'date' in actual.columns:
            actual = actual.set_index('date')
        actual['ds'] = pd.to_datetime(actual.index)
        actual['y'] = actual['demand']

        forecast_df = self.model.predict(actual[['ds']])
        predicted = forecast_df['yhat'].values
        actual_values = actual['y'].values

        if len(predicted) != len(actual_values):
            predicted = predicted[: len(actual_values)]

        mae = mean_absolute_error(actual_values, predicted)
        mape = mean_absolute_percentage_error(actual_values, predicted) * 100
        rmse = np.sqrt(mean_squared_error(actual_values, predicted))

        return {
            'mae': round(mae, 2),
            'mape': round(mape, 2),
            'rmse': round(rmse, 2)
        }
    
    def get_seasonal_components(self):
        """Extract seasonal components (weekly, yearly patterns)"""
        if not self.is_trained:
            raise ValueError("Model not trained yet")
        
        weekly = self.model.seasonalities['weekly']
        yearly = self.model.seasonalities['yearly']
        
        return {
            'weekly_pattern': weekly,
            'yearly_pattern': yearly
        }
    
    def _save(self):
        """Save trained model to disk"""
        import joblib
        os.makedirs(config.MODELS_DIR, exist_ok=True)
        joblib.dump(self.model, self.model_path)
    
    def load(self):
        """Load trained model from disk"""
        import joblib
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
            self.is_trained = True
            return True
        return False