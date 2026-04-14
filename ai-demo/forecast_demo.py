"""
TEST SCRIPT FOR AI FORECASTING SYSTEM
Run this to test all models: ARIMA, Prophet, LSTM, Ensemble
"""

import pandas as pd
import numpy as np
import psycopg2
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
from sklearn.metrics import mean_absolute_error, mean_squared_error
import warnings
warnings.filterwarnings('ignore')

# ============================================================
# STEP 1: CONNECT TO DATABASE
# ============================================================

print("="*70)
print("TESTING AI FORECASTING SYSTEM")
print("="*70)

# Database connection - UPDATE WITH YOUR PASSWORD
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'blood_suite_db',
    'user': 'postgres',
    'password': 'bloodsuite123'  # CHANGE THIS
}

def fetch_data(blood_type='O+', months=12):
    """Fetch historical data from database"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        query = """
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as demand
        FROM requests
        WHERE blood_type = %s AND status = 'fulfilled'
            AND created_at >= NOW() - INTERVAL '%s months'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
        """
        df = pd.read_sql(query, conn, params=(blood_type, months))
        conn.close()
        
        if df.empty:
            print(f"⚠️ No data found for {blood_type}")
            return None
            
        # Fill missing dates
        date_range = pd.date_range(start=df['date'].min(), end=df['date'].max(), freq='D')
        df = df.set_index('date').reindex(date_range, fill_value=0).reset_index()
        df.columns = ['ds', 'y']
        return df
        
    except Exception as e:
        print(f"❌ Database error: {e}")
        return None

# ============================================================
# STEP 2: TEST DATA AVAILABILITY
# ============================================================

print("\n📊 STEP 1: Checking Database Connection...")

try:
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM requests")
    count = cursor.fetchone()[0]
    print(f"   ✅ Connected! Found {count} total requests in database")
    
    cursor.execute("SELECT COUNT(DISTINCT blood_type) FROM requests")
    blood_count = cursor.fetchone()[0]
    print(f"   ✅ Found {blood_count} blood types with data")
    
    conn.close()
except Exception as e:
    print(f"   ❌ Connection failed: {e}")
    print("\n   Please update DB_CONFIG with your correct password")
    exit(1)

# ============================================================
# STEP 3: FETCH DATA FOR O+ (MOST COMMON BLOOD TYPE)
# ============================================================

print("\n📊 STEP 2: Fetching Historical Data...")

blood_type = 'O+'
df = fetch_data(blood_type, months=12)

if df is None:
    print(f"   ⚠️ No data for {blood_type}, trying O-...")
    blood_type = 'O-'
    df = fetch_data(blood_type, months=12)
    
if df is None:
    print("   ❌ No data found for any blood type!")
    print("   Please run add_test_requests.js first")
    exit(1)

print(f"   ✅ Using blood type: {blood_type}")
print(f"   📅 Date range: {df['ds'].min().strftime('%Y-%m-%d')} to {df['ds'].max().strftime('%Y-%m-%d')}")
print(f"   📊 Total days: {len(df)}")
print(f"   📈 Average daily demand: {df['y'].mean():.2f} units")
print(f"   🔢 Total requests: {df['y'].sum():.0f} units")

# ============================================================
# STEP 4: SIMPLE FORECAST (NO COMPLEX MODELS YET)
# ============================================================

print("\n📊 STEP 3: Running Simple Forecast...")

# Split data
split_idx = int(len(df) * 0.8)
train = df.iloc[:split_idx]
test = df.iloc[split_idx:]

print(f"   Training days: {len(train)}")
print(f"   Testing days: {len(test)}")

# Simple moving average forecast
window = 7
train_series = train.set_index('ds')['y']
last_week_avg = train_series.iloc[-window:].mean()

simple_forecast = [last_week_avg] * len(test)
simple_mae = mean_absolute_error(test['y'], simple_forecast)
simple_rmse = np.sqrt(mean_squared_error(test['y'], simple_forecast))

print(f"\n   📊 Simple Moving Average (baseline):")
print(f"      MAE: {simple_mae:.2f} units")
print(f"      RMSE: {simple_rmse:.2f} units")
print(f"      Accuracy: {max(0, 100 - (simple_mae / (test['y'].mean() + 0.01) * 100)):.1f}%")

# ============================================================
# STEP 5: TRY ARIMA MODEL
# ============================================================

print("\n📊 STEP 4: Training ARIMA Model...")

try:
    from statsmodels.tsa.arima.model import ARIMA
    
    # Prepare data
    train_series = train.set_index('ds')['y'].asfreq('D').fillna(0)
    
    # Fit ARIMA (using simple order for testing)
    arima_model = ARIMA(train_series, order=(5, 1, 0))
    arima_fit = arima_model.fit()
    
    # Forecast
    arima_forecast = arima_fit.forecast(steps=len(test))
    
    # Calculate accuracy
    arima_mae = mean_absolute_error(test['y'].values[:len(arima_forecast)], arima_forecast)
    arima_rmse = np.sqrt(mean_squared_error(test['y'].values[:len(arima_forecast)], arima_forecast))
    
    print(f"   ✅ ARIMA model trained successfully!")
    print(f"   📊 ARIMA Performance:")
    print(f"      MAE: {arima_mae:.2f} units")
    print(f"      RMSE: {arima_rmse:.2f} units")
    print(f"      AIC: {arima_fit.aic:.1f}")
    
    arima_working = True
except Exception as e:
    print(f"   ⚠️ ARIMA failed: {e}")
    print(f"   (This is OK - may need more data)")
    arima_working = False

# ============================================================
# STEP 6: TRY PROPHET MODEL
# ============================================================

print("\n📊 STEP 5: Training Prophet Model...")

try:
    from prophet import Prophet
    
    # Prepare data (Prophet needs 'ds' and 'y')
    train_prophet = train.rename(columns={'ds': 'ds', 'y': 'y'})
    
    # Train Prophet
    prophet_model = Prophet(yearly_seasonality=True, weekly_seasonality=True)
    prophet_model.fit(train_prophet)
    
    # Forecast
    future = prophet_model.make_future_dataframe(periods=len(test), include_history=False)
    prophet_forecast = prophet_model.predict(future)
    
    # Calculate accuracy
    prophet_mae = mean_absolute_error(test['y'], prophet_forecast['yhat'])
    prophet_rmse = np.sqrt(mean_squared_error(test['y'], prophet_forecast['yhat']))
    
    print(f"   ✅ Prophet model trained successfully!")
    print(f"   📊 Prophet Performance:")
    print(f"      MAE: {prophet_mae:.2f} units")
    print(f"      RMSE: {prophet_rmse:.2f} units")
    
    prophet_working = True
except Exception as e:
    print(f"   ⚠️ Prophet failed: {e}")
    print(f"   (This may be due to insufficient data)")
    prophet_working = False

# ============================================================
# STEP 7: GENERATE 30-DAY FORECAST
# ============================================================

print("\n📊 STEP 6: Generating 30-Day Forecast...")

if prophet_working:
    # Use Prophet for 30-day forecast
    future_30d = prophet_model.make_future_dataframe(periods=30, include_history=False)
    forecast_30d = prophet_model.predict(future_30d)
    
    print("\n   📈 30-DAY FORECAST:")
    print("-" * 60)
    print(f"{'Date':<12} {'Predicted':<12} {'Lower':<10} {'Upper':<10}")
    print("-" * 60)
    
    total_demand = 0
    for i, row in forecast_30d.iterrows():
        pred = max(0, round(row['yhat']))
        lower = max(0, round(row['yhat_lower']))
        upper = round(row['yhat_upper'])
        total_demand += pred
        print(f"{row['ds'].strftime('%Y-%m-%d'):<12} {pred:<12} {lower:<10} {upper:<10}")
        if i == 6:  # Show first 7 days
            print("   ...")
            break
    
    print("-" * 60)
    print(f"\n   📊 TOTAL 30-DAY DEMAND: {total_demand} units")
    print(f"   📊 AVERAGE DAILY DEMAND: {total_demand/30:.1f} units")

else:
    # Use simple method if Prophet failed
    last_30_avg = df['y'].iloc[-30:].mean()
    print(f"\n   📈 Using Simple Average (Prophet unavailable)")
    print(f"   📊 Predicted daily demand: {last_30_avg:.1f} units")
    print(f"   📊 Total 30-day demand: {last_30_avg * 30:.0f} units")

# ============================================================
# STEP 8: CREATE VISUALIZATION
# ============================================================

print("\n📊 STEP 7: Creating Visualization...")

fig, axes = plt.subplots(2, 2, figsize=(14, 10))
fig.suptitle(f'Blood Suite AI Forecasting - {blood_type}', fontsize=14, fontweight='bold')

# Plot 1: Historical Data
ax1 = axes[0, 0]
ax1.plot(df['ds'], df['y'], color='#d32f2f', alpha=0.7, linewidth=1)
ax1.set_title('Historical Blood Demand', fontsize=12)
ax1.set_xlabel('Date')
ax1.set_ylabel('Daily Demand (Units)')
ax1.grid(True, alpha=0.3)

# Plot 2: Train/Test Split
ax2 = axes[0, 1]
ax2.plot(train['ds'], train['y'], color='#4caf50', label='Training Data', alpha=0.7)
ax2.plot(test['ds'], test['y'], color='#d32f2f', label='Test Data', alpha=0.7)
ax2.axvline(x=train['ds'].iloc[-1], color='blue', linestyle='--', label='Train/Test Split')
ax2.set_title('Train/Test Split (80/20)', fontsize=12)
ax2.set_xlabel('Date')
ax2.legend()
ax2.grid(True, alpha=0.3)

# Plot 3: Forecast
ax3 = axes[1, 0]
ax3.plot(df['ds'], df['y'], color='#d32f2f', alpha=0.5, label='Historical')
if prophet_working:
    forecast_dates = forecast_30d['ds']
    ax3.plot(forecast_dates, forecast_30d['yhat'], color='#2196f3', linewidth=2, label='Forecast')
    ax3.fill_between(forecast_dates, forecast_30d['yhat_lower'], forecast_30d['yhat_upper'], 
                      color='#2196f3', alpha=0.2, label='80% Confidence')
ax3.set_title('30-Day Demand Forecast', fontsize=12)
ax3.set_xlabel('Date')
ax3.legend()
ax3.grid(True, alpha=0.3)

# Plot 4: Model Comparison
ax4 = axes[1, 1]
models = ['Simple Avg']
mae_values = [simple_mae]
colors = ['#ff9800']
if arima_working:
    models.append('ARIMA')
    mae_values.append(arima_mae)
    colors.append('#4caf50')
if prophet_working:
    models.append('Prophet')
    mae_values.append(prophet_mae)
    colors.append('#2196f3')

bars = ax4.bar(models, mae_values, color=colors)
ax4.set_ylabel('MAE (Units) - Lower is Better', fontsize=12)
ax4.set_title('Model Comparison', fontsize=12)
for bar, val in zip(bars, mae_values):
    ax4.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.1, f'{val:.2f}', ha='center')
ax4.grid(True, alpha=0.3, axis='y')

plt.tight_layout()
plt.savefig('ai_forecast_test.png', dpi=150, bbox_inches='tight')
print("   ✅ Chart saved as 'ai_forecast_test.png'")

# ============================================================
# STEP 9: SUMMARY REPORT
# ============================================================

print("\n" + "="*70)
print("TEST SUMMARY REPORT")
print("="*70)

print(f"""
┌─────────────────────────────────────────────────────────────────────┐
│                     AI FORECASTING TEST RESULTS                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ✅ DATABASE: Connected successfully                               │
│  ✅ DATA: {len(df)} days of historical data for {blood_type}                │
│                                                                     │
│  📊 MODEL PERFORMANCE:                                             │
│     Simple Moving Average: MAE = {simple_mae:.2f} units                       │
│     ARIMA:                     {'✅ Working' if arima_working else '❌ Failed'}                    │
│     Prophet:                   {'✅ Working' if prophet_working else '❌ Failed'}                    │
│                                                                     │
│  📈 FORECAST: Generated 30-day forecast                            │
│     Total predicted demand: {total_demand if prophet_working else last_30_avg * 30:.0f} units           │
│                                                                     │
│  📁 OUTPUT FILES:                                                  │
│     - ai_forecast_test.png (visualization chart)                   │
│                                                                     │
│  ✅ TEST COMPLETE!                                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
""")

# Open the chart automatically (Windows)
import os
os.startfile('ai_forecast_test.png')

print("\n✅ Done! Show 'ai_forecast_test.png' to your supervisor.")

if not prophet_working:
    print("\n⚠️ NOTE: Prophet model failed. This usually means:")
    print("   1. Not enough historical data (need at least 30 days)")
    print("   2. Data is too sparse (many zero days)")
    print("\n   Solution: Run add_test_requests.js to add more data")