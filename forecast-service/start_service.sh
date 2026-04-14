#!/bin/bash
# Start Forecast Service and Train Models

echo "=========================================="
echo "BLOOD SUITE FORECAST SERVICE SETUP"
echo "=========================================="

# Navigate to forecast service directory
cd "$(dirname "$0")/forecast-service"

# Install dependencies if needed
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate  # On Windows: venv\Scripts\activate

echo "Installing dependencies..."
pip install -r requirements.txt

# Train models
echo "Training forecasting models..."
python scripts/train_models.py

# Start the service
echo "Starting forecast service on port 8001..."
python run.py