# scripts/test_forecast.py
import requests
import json
import time

BASE_URL = "http://localhost:8001"

def test_health():
    print("\n" + "="*60)
    print("TESTING HEALTH ENDPOINT")
    print("="*60)
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

def test_forecast():
    print("\n" + "="*60)
    print("TESTING FORECAST ENDPOINT")
    print("="*60)
    
    blood_types = ['O+', 'A+', 'B+']
    
    for blood_type in blood_types:
        print(f"\nTesting forecast for {blood_type}...")
        response = requests.get(f"{BASE_URL}/forecast/{blood_type}?horizon=30day")
        
        if response.status_code == 200:
            data = response.json()
            print(f"  Model: {data.get('model', 'Unknown')}")
            print(f"  Forecasts: {len(data.get('forecasts', []))} days")
            if data.get('forecasts'):
                print(f"  First 3 days: {data['forecasts'][:3]}")
        else:
            print(f"  Error: {response.status_code} - {response.text}")

def test_all_forecasts():
    print("\n" + "="*60)
    print("TESTING ALL FORECASTS ENDPOINT")
    print("="*60)
    
    response = requests.get(f"{BASE_URL}/forecast/all?horizon=7day")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Total blood types: {data.get('total_blood_types', 0)}")
        print(f"Successful forecasts: {data.get('successful_forecasts', 0)}")
        
        for forecast in data.get('forecasts', []):
            if 'error' not in forecast:
                print(f"  {forecast['blood_type']}: {len(forecast['forecasts'])} days forecasted")
            else:
                print(f"  {forecast['blood_type']}: ERROR - {forecast.get('error', 'Unknown')}")
    else:
        print(f"Error: {response.status_code}")

def test_shortage_alerts():
    print("\n" + "="*60)
    print("TESTING SHORTAGE ALERTS")
    print("="*60)
    
    response = requests.get(f"{BASE_URL}/forecast/alerts/shortages")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Total shortages: {data.get('total_shortages', 0)}")
        for alert in data.get('alerts', []):
            print(f"  {alert['blood_type']}: Shortage of {alert['shortage']} units (Severity: {alert['severity']})")
    else:
        print(f"Error: {response.status_code}")

def test_accuracy():
    print("\n" + "="*60)
    print("TESTING MODEL ACCURACY")
    print("="*60)
    
    response = requests.get(f"{BASE_URL}/forecast/accuracy")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Last updated: {data.get('last_updated', 'Unknown')}")
        print("\nModel Performance:")
        for model, metrics in data.get('models', {}).items():
            print(f"  {model}: MAPE={metrics.get('mape', 'N/A')}%, MAE={metrics.get('mae', 'N/A')}")
    else:
        print(f"Error: {response.status_code}")

def test_retrain():
    print("\n" + "="*60)
    print("TESTING RETRAIN ENDPOINT")
    print("="*60)
    
    response = requests.post(f"{BASE_URL}/forecast/train")
    
    if response.status_code == 200:
        print(f"Success: {response.json()}")
    else:
        print(f"Error: {response.status_code}")

if __name__ == "__main__":
    print("\n" + "#"*60)
    print("BLOOD SUITE FORECAST SERVICE TEST SUITE")
    print("#"*60)
    
    # Wait for service to start
    print("\nWaiting for service to start...")
    time.sleep(2)
    
    # Run tests
    test_health()
    test_forecast()
    test_all_forecasts()
    test_shortage_alerts()
    test_accuracy()
    
    print("\n" + "#"*60)
    print("TEST COMPLETE")
    print("#"*60)