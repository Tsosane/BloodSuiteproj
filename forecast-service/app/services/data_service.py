# app/services/data_service.py
import pandas as pd
from app.database import database
from app.config import config

class DataService:
    """Service for fetching and preparing data for model training"""
    
    def __init__(self):
        self.db = database
    
    def get_training_data(self, blood_type: str, months: int = 24):
        """Get data for model training"""
        try:
            df = self.db.get_historical_demand(blood_type, months)
        except Exception as e:
            print(f"Database error for {blood_type}: {e}")
            df = pd.DataFrame()

        if df.empty or len(df) < 30:
            # Generate sample data if no real data available
            print(f"Generating sample data for {blood_type}")
            df = self._generate_sample_data(blood_type, months)

        # Ensure complete date range
        if not df.empty:
            date_range = pd.date_range(
                start=df['date'].min(),
                end=pd.Timestamp.now(),
                freq='D'
            )

            # Reindex to fill missing dates
            df = df.set_index('date').reindex(date_range).fillna(0)
            df = df.reset_index()
            df.columns = ['date', 'demand']

        return df

    def _generate_sample_data(self, blood_type: str, months: int = 24):
        """Generate realistic sample data for training"""
        import numpy as np

        start_date = pd.Timestamp.now() - pd.DateOffset(months=months)
        dates = pd.date_range(start=start_date, end=pd.Timestamp.now(), freq='D')

        # Base demand by blood type (realistic ratios)
        base_demands = {
            'O+': 25, 'O-': 8, 'A+': 20, 'A-': 6,
            'B+': 12, 'B-': 4, 'AB+': 3, 'AB-': 1
        }
        base_demand = base_demands.get(blood_type, 10)

        data = []
        for date in dates:
            # Weekly seasonality (higher on weekdays)
            weekly_factor = 1 + 0.3 * np.sin(2 * np.pi * date.weekday() / 7)

            # Monthly seasonality
            monthly_factor = 1 + 0.2 * np.sin(2 * np.pi * date.day / 30)

            # Random noise
            noise = np.random.normal(0, base_demand * 0.2)

            demand = max(0, int(base_demand * weekly_factor * monthly_factor + noise))

            data.append({
                'date': date.date(),
                'demand': demand
            })

        return pd.DataFrame(data)
    
    def get_all_blood_types_data(self, months: int = 24):
        """Get training data for all blood types"""
        all_data = {}
        
        for blood_type in config.BLOOD_TYPES:
            data = self.get_training_data(blood_type, months)
            if data is not None and len(data) > 30:
                all_data[blood_type] = data
        
        return all_data
    
    def get_forecast_input(self, blood_type: str):
        """Get current data for making forecasts"""
        historical = self.get_training_data(blood_type, months=12)
        try:
            inventory = self.db.get_current_inventory()
        except Exception as e:
            print(f"Inventory query failed: {e}")
            inventory = pd.DataFrame()

        current_stock = 0
        if not inventory.empty and 'blood_type' in inventory.columns and 'available_units' in inventory.columns:
            current_stock_values = inventory[inventory['blood_type'] == blood_type]['available_units'].values
            current_stock = int(current_stock_values[0]) if len(current_stock_values) > 0 else 0

        return {
            'historical_data': historical,
            'current_stock': current_stock
        }
    
    def get_shortage_alerts(self):
        """Check for potential shortages"""
        inventory = self.db.get_current_inventory()
        alerts = []
        
        for _, row in inventory.iterrows():
            blood_type = row['blood_type']
            current_stock = row['available_units']
            
            # Get 7-day forecast
            forecast_data = self.get_training_data(blood_type, months=6)
            if forecast_data is not None and len(forecast_data) > 30:
                from app.models.arima_model import ARIMAModel
                model = ARIMAModel(blood_type)
                try:
                    model.train(forecast_data)
                    forecast = model.forecast(steps=7)
                    predicted_demand_7d = sum(f['predicted_demand'] for f in forecast['forecasts'])
                    
                    if predicted_demand_7d > current_stock:
                        alerts.append({
                            'blood_type': blood_type,
                            'current_stock': current_stock,
                            'predicted_demand_7d': predicted_demand_7d,
                            'shortage': predicted_demand_7d - current_stock,
                            'severity': 'high' if (predicted_demand_7d - current_stock) > 10 else 'medium',
                            'days_until_shortage': 7
                        })
                except Exception as e:
                    print(f"Error forecasting {blood_type}: {e}")
        
        return alerts

data_service = DataService()