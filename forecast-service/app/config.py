# app/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Server
    FORECAST_PORT = int(os.getenv('FORECAST_PORT', 8001))
    FORECAST_HOST = os.getenv('FORECAST_HOST', '0.0.0.0')
    
    # Database
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '5432')
    DB_NAME = os.getenv('DB_NAME', 'blood_suite_db')
    DB_USER = os.getenv('DB_USER', 'postgres')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'bloodsuite123')
    
    @property
    def DATABASE_URL(self):
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    # Models
    ARIMA_ENABLED = os.getenv('ARIMA_ENABLED', 'true').lower() == 'true'
    PROPHET_ENABLED = os.getenv('PROPHET_ENABLED', 'true').lower() == 'true'
    LSTM_ENABLED = os.getenv('LSTM_ENABLED', 'false').lower() == 'true'  # disabled by default on Windows due to TensorFlow DLL compatibility
    ENSEMBLE_ENABLED = os.getenv('ENSEMBLE_ENABLED', 'true').lower() == 'true'
    
    # Blood types
    BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    
    # Forecast horizons (days)
    FORECAST_HORIZONS = {
        '7day': 7,
        '30day': 30,
        '90day': 90
    }
    
    # Training
    TRAIN_SCHEDULE = os.getenv('TRAIN_SCHEDULE', '0 2 * * 0')
    MODELS_DIR = os.path.join(os.path.dirname(__file__), '../models')
    
    # Confidence level (80%)
    CONFIDENCE_LEVEL = 0.8

config = Config()