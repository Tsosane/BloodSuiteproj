#!/usr/bin/env python
"""
Train all forecasting models for blood demand prediction
"""
import sys
import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Add the app directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.config import config
from app.database import database
from app.models.ensemble import EnsembleModel
from app.services.data_service import data_service

def generate_sample_data():
    """Generate sample historical data if database is empty"""
    print("Generating sample historical data...")

    # Create sample data for the last 2 years
    start_date = datetime.now() - timedelta(days=730)
    dates = pd.date_range(start=start_date, end=datetime.now(), freq='D')

    blood_types = config.BLOOD_TYPES
    sample_data = []

    for blood_type in blood_types:
        # Generate realistic demand patterns
        base_demand = {'O+': 25, 'O-': 8, 'A+': 20, 'A-': 6, 'B+': 12, 'B-': 4, 'AB+': 3, 'AB-': 1}[blood_type]

        for date in dates:
            # Add weekly and monthly seasonality
            weekly_factor = 1 + 0.3 * np.sin(2 * np.pi * date.weekday() / 7)
            monthly_factor = 1 + 0.2 * np.sin(2 * np.pi * date.day / 30)

            # Add some random noise
            noise = np.random.normal(0, base_demand * 0.2)

            demand = max(0, int(base_demand * weekly_factor * monthly_factor + noise))

            sample_data.append({
                'blood_type': blood_type,
                'date': date.date(),
                'demand': demand
            })

    # Save to CSV for reference
    df = pd.DataFrame(sample_data)
    df.to_csv('sample_historical_data.csv', index=False)
    print(f"Generated {len(sample_data)} sample data points")
    return df

def train_models():
    """Train all forecasting models"""
    print("Starting model training...")

    # Ensure models directory exists
    os.makedirs(config.MODELS_DIR, exist_ok=True)

    trained_models = []

    for blood_type in config.BLOOD_TYPES:
        print(f"\nTraining models for {blood_type}...")

        try:
            # Get training data
            training_data = data_service.get_training_data(blood_type, months=24)

            if training_data is None or len(training_data) < 30:
                print(f"  Insufficient data for {blood_type}, generating sample data...")
                # Generate sample data for this blood type
                sample_df = generate_sample_data()
                training_data = sample_df[sample_df['blood_type'] == blood_type][['date', 'demand']]

            if len(training_data) >= 30:
                # Train ensemble model
                model = EnsembleModel(blood_type)
                model.train(training_data)

                # Test forecast
                forecast = model.forecast(steps=7)
                print(f"  Successfully trained {blood_type} model")
                print(f"  7-day forecast total: {sum(f['predicted_demand'] for f in forecast['forecasts'])}")

                trained_models.append(blood_type)
            else:
                print(f"  Still insufficient data for {blood_type}")

        except Exception as e:
            print(f"  Error training {blood_type}: {e}")

    print(f"\nTraining completed. Successfully trained {len(trained_models)}/{len(config.BLOOD_TYPES)} models")
    return trained_models

def test_models():
    """Test trained models"""
    print("\nTesting trained models...")

    from app.services.forecast_service import forecast_service

    for blood_type in config.BLOOD_TYPES:
        try:
            forecast = forecast_service.get_forecast(blood_type, '7day')
            print(f"  {blood_type}: {len(forecast.get('forecasts', []))} day forecast generated")
        except Exception as e:
            print(f"  {blood_type}: Error - {e}")

def main():
    """Main training function"""
    print("=" * 60)
    print("BLOOD SUITE FORECAST MODEL TRAINING")
    print("=" * 60)
    print(f"Training {len(config.BLOOD_TYPES)} blood types: {config.BLOOD_TYPES}")
    print(f"Models directory: {config.MODELS_DIR}")
    print()

    # Train models
    trained_models = train_models()

    # Test models
    if trained_models:
        test_models()

    print("\n" + "=" * 60)
    print("TRAINING COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    main()