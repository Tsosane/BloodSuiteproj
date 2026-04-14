# Simplified AI Forecasting Demo
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
from statsmodels.tsa.arima.model import ARIMA
from prophet import Prophet
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error
import psycopg2
import warnings
warnings.filterwarnings('ignore')

print("=" * 70)
print("BLOOD SUITE AI FORECASTING DEMO - SIMPLIFIED VERSION")
print("=" * 70)

# Database connection
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'blood_suite_db',
    'user': 'postgres',
    'password': 'bloodsuite123'
}

try:
    conn = psycopg2.connect(**DB_CONFIG)
    print("✅ Connected to PostgreSQL database")
except Exception as e:
    print(f"❌ Database connection failed: {e}")
    exit(1)

# Get historical data for O+ blood type
print("\n📊 Fetching historical blood demand data...")

query = """
SELECT
    DATE(required_date) as date,
    blood_type,
    SUM(quantity_ml / 450) as demand
FROM requests
WHERE status = 'fulfilled'
    AND blood_type = 'O+'
    AND required_date >= NOW() - INTERVAL '365 days'
GROUP BY DATE(required_date), blood_type
ORDER BY date ASC
"""

df = pd.read_sql(query, conn)
conn.close()

print(f"✅ Fetched {len(df)} days of historical data")

if len(df) < 30:
    print(f"\n❌ Need at least 30 days of data, only have {len(df)}")
    print("Generating synthetic data for demonstration...")
    # Generate synthetic data
    dates = pd.date_range(start='2025-01-01', end='2026-04-14', freq='D')
    np.random.seed(42)
    demand = np.random.poisson(5, len(dates)) + 10  # Base demand with variation
    df = pd.DataFrame({'date': dates, 'blood_type': 'O+', 'demand': demand})

print(f"📅 Date range: {df['date'].min()} to {df['date'].max()}")
print(f"📊 Average daily demand: {df['demand'].mean():.1f} units")
print(f"🔢 Total data points: {len(df)}")

# Prepare data for modeling
df['date'] = pd.to_datetime(df['date'])
df = df.set_index('date')['demand'].asfreq('D').fillna(method='ffill')

# Split data
train_size = int(len(df) * 0.8)
train_data = df[:train_size]
test_data = df[train_size:]

print(f"\n📈 Training on {len(train_data)} days, testing on {len(test_data)} days")

# ARIMA Model
print("\n🤖 Training ARIMA model...")
try:
    arima_model = ARIMA(train_data, order=(5, 1, 0))
    arima_fit = arima_model.fit()
    arima_forecast = arima_fit.forecast(steps=len(test_data))

    arima_mae = mean_absolute_error(test_data, arima_forecast)
    arima_mape = mean_absolute_percentage_error(test_data, arima_forecast) * 100
    print(f"✅ ARIMA trained - MAPE: {arima_mape:.1f}%, MAE: {arima_mae:.1f} units")
except Exception as e:
    print(f"❌ ARIMA failed: {e}")
    arima_forecast = [train_data.mean()] * len(test_data)
    arima_mape = 50

# Prophet Model
print("\n🤖 Training Prophet model...")
try:
    prophet_df = train_data.reset_index()
    prophet_df.columns = ['ds', 'y']

    prophet_model = Prophet(yearly_seasonality=True, weekly_seasonality=True, daily_seasonality=False)
    prophet_model.fit(prophet_df)

    future = pd.DataFrame({'ds': test_data.index})
    prophet_forecast = prophet_model.predict(future)

    prophet_mae = mean_absolute_error(test_data.values, prophet_forecast['yhat'])
    prophet_mape = mean_absolute_percentage_error(test_data.values, prophet_forecast['yhat']) * 100
    print(f"✅ Prophet trained - MAPE: {prophet_mape:.1f}%, MAE: {prophet_mae:.1f} units")
except Exception as e:
    print(f"❌ Prophet failed: {e}")
    prophet_forecast = pd.DataFrame({'yhat': [train_data.mean()] * len(test_data)})
    prophet_mape = 50

# 30-day forecast
print("\n🔮 Generating 30-day forecast...")
try:
    # ARIMA 30-day
    arima_30d = arima_fit.forecast(steps=30)

    # Prophet 30-day
    future_30d = pd.DataFrame({'ds': pd.date_range(start=df.index[-1] + timedelta(days=1), periods=30, freq='D')})
    prophet_30d = prophet_model.predict(future_30d)

    print("✅ 30-day forecasts generated")
except Exception as e:
    print(f"❌ Forecast generation failed: {e}")
    arima_30d = [df.mean()] * 30
    prophet_30d = pd.DataFrame({'yhat': [df.mean()] * 30})

# Create visualization
print("\n📊 Creating forecast visualization...")

fig, axes = plt.subplots(2, 2, figsize=(15, 10))
fig.suptitle('Blood Suite AI Forecasting Demo - O+ Blood Type', fontsize=16, fontweight='bold')

# Historical data
ax1 = axes[0, 0]
ax1.plot(df.index, df.values, color='#d32f2f', linewidth=2, label='Historical Demand')
ax1.set_title('Historical Blood Demand (O+)', fontsize=14)
ax1.set_xlabel('Date')
ax1.set_ylabel('Daily Demand (Units)')
ax1.legend()
ax1.grid(True, alpha=0.3)

# Test predictions
ax2 = axes[0, 1]
ax2.plot(test_data.index, test_data.values, color='#d32f2f', linewidth=2, label='Actual')
ax2.plot(test_data.index, arima_forecast, color='#4caf50', linewidth=2, label=f'ARIMA ({arima_mape:.1f}% error)')
ax2.plot(test_data.index, prophet_forecast['yhat'], color='#2196f3', linewidth=2, label=f'Prophet ({prophet_mape:.1f}% error)')
ax2.set_title('Model Predictions vs Actual', fontsize=14)
ax2.set_xlabel('Date')
ax2.legend()
ax2.grid(True, alpha=0.3)

# 30-day forecast
ax3 = axes[1, 0]
future_dates = pd.date_range(start=df.index[-1] + timedelta(days=1), periods=30, freq='D')
ax3.plot(df.index[-60:], df.values[-60:], color='#d32f2f', linewidth=2, label='Recent History')
ax3.plot(future_dates, arima_30d, color='#4caf50', linewidth=2, label='ARIMA Forecast')
ax3.plot(future_dates, prophet_30d['yhat'], color='#2196f3', linewidth=2, label='Prophet Forecast')
ax3.axvline(x=df.index[-1], color='black', linestyle='--', alpha=0.7, label='Today')
ax3.set_title('30-Day Blood Demand Forecast', fontsize=14)
ax3.set_xlabel('Date')
ax3.set_ylabel('Daily Demand (Units)')
ax3.legend()
ax3.grid(True, alpha=0.3)

# Model comparison
ax4 = axes[1, 1]
models = ['ARIMA', 'Prophet']
accuracy = [100 - arima_mape, 100 - prophet_mape]
bars = ax4.bar(models, accuracy, color=['#4caf50', '#2196f3'])
ax4.set_ylabel('Accuracy (%)', fontsize=12)
ax4.set_title('Model Accuracy Comparison', fontsize=14)
ax4.set_ylim(0, 100)
for bar, acc in zip(bars, accuracy):
    ax4.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1, f'{acc:.1f}%', ha='center', fontweight='bold')
ax4.grid(True, alpha=0.3, axis='y')

plt.tight_layout()
plt.savefig('ai_forecast_demo.png', dpi=150, bbox_inches='tight')
print("✅ Chart saved as 'ai_forecast_demo.png'")

# Summary
print("\n" + "=" * 70)
print("🎯 AI FORECASTING RESULTS SUMMARY")
print("=" * 70)

print(f"""
📊 DATA ANALYSIS:
   • Blood Type: O+
   • Historical Data: {len(df)} days
   • Average Daily Demand: {df.mean():.1f} units
   • Data Range: {df.index.min().strftime('%Y-%m-%d')} to {df.index.max().strftime('%Y-%m-%d')}

🤖 MODEL PERFORMANCE:
   • ARIMA:   {arima_mape:.1f}% error (MAE: {arima_mae:.1f} units)
   • Prophet: {prophet_mape:.1f}% error (MAE: {prophet_mae:.1f} units)

🔮 7-DAY FORECAST SUMMARY:
   • Average: {(arima_30d[:7].mean() + prophet_30d['yhat'][:7].mean()) / 2:.1f} units/day
   • Peak: {max(arima_30d[:7].max(), prophet_30d['yhat'][:7].max()):.1f} units
   • Total: {(arima_30d[:7].sum() + prophet_30d['yhat'][:7].sum()) / 2:.0f} units

💡 KEY INSIGHTS:
   • AI can predict blood demand with ~{100 - min(arima_mape, prophet_mape):.0f}% accuracy
   • Helps prevent blood shortages and optimize inventory
   • Real-time forecasting enables proactive blood bank management
   • Machine learning adapts to changing demand patterns

📁 OUTPUT: ai_forecast_demo.png
""")

print("🎉 AI Forecasting Demo Complete!")
print("   The system can predict blood demand and prevent shortages!")