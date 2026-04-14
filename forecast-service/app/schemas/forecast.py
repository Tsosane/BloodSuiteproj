# app/schemas/forecast.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime

class ForecastPoint(BaseModel):
    day: int
    date: str
    predicted_demand: int
    lower_bound: int
    upper_bound: int

class ForecastResponse(BaseModel):
    blood_type: str
    model: str
    forecasts: List[ForecastPoint]
    confidence_level: float
    current_stock: Optional[int] = None
    shortage_alert: Optional[bool] = None
    total_predicted_demand: Optional[int] = None
    model_weights: Optional[dict] = None
    order: Optional[tuple] = None
    aic: Optional[float] = None

class ShortageAlert(BaseModel):
    blood_type: str
    current_stock: int
    predicted_demand_7d: int
    shortage: int
    severity: str
    days_until_shortage: int

class ForecastRequest(BaseModel):
    blood_type: str
    horizon: str = "30day"
    include_confidence: bool = True

class ModelAccuracy(BaseModel):
    mape: float
    mae: float
    rmse: float

class AccuracyResponse(BaseModel):
    models: dict
    last_updated: str
    training_data_days: int