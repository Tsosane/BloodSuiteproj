# app/main.py
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from app.config import config
from app.services.forecast_service import forecast_service
from app.services.training_service import training_service
from app.schemas.forecast import ForecastRequest, ForecastResponse, ShortageAlert

app = FastAPI(
    title="Blood Suite Forecast Service",
    description="AI/ML Demand Forecasting for Blood Bank Management",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Start training service on startup
@app.on_event("startup")
async def startup_event():
    training_service.start()
    # Start a first background training run if no saved models exist
    if not any(
        model.arima.is_trained or model.prophet.is_trained or (model.lstm is not None and model.lstm.is_trained)
        for model in forecast_service.models.values()
    ):
        forecast_service.train_all_models(background=True)

    print("Forecast Service Started")
    print(f"Available blood types: {config.BLOOD_TYPES}")

@app.on_event("shutdown")
async def shutdown_event():
    training_service.stop()

# ==================== HEALTH ENDPOINTS ====================

@app.get("/")
async def root():
    return {
        "service": "Blood Suite Forecast Service",
        "status": "running",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# ==================== FORECAST ENDPOINTS ====================

@app.get("/forecast/{blood_type}")
async def get_forecast(
    blood_type: str,
    horizon: str = Query("30day", regex="^(7day|30day|90day)$")
):
    """
    Get demand forecast for a specific blood type
    
    - blood_type: A+, A-, B+, B-, AB+, AB-, O+, O-
    - horizon: 7day, 30day, or 90day
    """
    if blood_type not in config.BLOOD_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid blood type. Must be one of {config.BLOOD_TYPES}")
    
    try:
        forecast = forecast_service.get_forecast(blood_type, horizon)
        return JSONResponse(content=forecast)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/forecast/all")
async def get_all_forecasts(
    horizon: str = Query("30day", regex="^(7day|30day|90day)$")
):
    """Get demand forecasts for all blood types"""
    try:
        forecasts = forecast_service.get_all_forecasts(horizon)
        return JSONResponse(content=forecasts)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== ALERT ENDPOINTS ====================

@app.get("/forecast/alerts/shortages")
async def get_shortage_alerts():
    """Get shortage alerts for all blood types"""
    try:
        alerts = forecast_service.get_shortage_alerts()
        return JSONResponse(content={
            "alerts": alerts,
            "total_shortages": len(alerts),
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== ACCURACY ENDPOINTS ====================

@app.get("/forecast/accuracy")
async def get_model_accuracy():
    """Get model accuracy metrics"""
    try:
        accuracy = forecast_service.get_model_accuracy()
        return JSONResponse(content=accuracy)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== TRAINING ENDPOINTS ====================

@app.post("/forecast/train")
async def retrain_models():
    """Force retraining of all models (admin only)"""
    try:
        result = forecast_service.retrain_all_models()
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== TEST ENDPOINTS ====================

@app.post("/forecast/test")
async def test_forecast():
    """Test endpoint for verifying service is working"""
    return {
        "message": "Forecast service is working",
        "timestamp": datetime.now().isoformat(),
        "available_blood_types": config.BLOOD_TYPES,
        "forecast_horizons": list(config.FORECAST_HORIZONS.keys())
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=config.FORECAST_HOST,
        port=config.FORECAST_PORT,
        reload=True
    )