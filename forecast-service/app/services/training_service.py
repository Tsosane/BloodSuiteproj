# app/services/training_service.py
import schedule
import time
import threading
from app.services.forecast_service import forecast_service
from app.config import config

class TrainingService:
    """Scheduled model retraining service"""
    
    def __init__(self):
        self.running = False
    
    def start(self):
        """Start the scheduled training service"""
        if self.running:
            return
        
        # Schedule weekly retraining
        schedule.every().sunday.at("02:00").do(self.retrain_models)
        
        self.running = True
        print(f"Training service started. Schedule: {config.TRAIN_SCHEDULE}")
        
        # Run in background thread
        thread = threading.Thread(target=self._run_scheduler, daemon=True)
        thread.start()
    
    def _run_scheduler(self):
        """Run the scheduler loop"""
        while self.running:
            schedule.run_pending()
            time.sleep(60)
    
    def retrain_models(self):
        """Retrain all forecasting models"""
        print("Starting scheduled model retraining...")
        try:
            result = forecast_service.retrain_all_models()
            print(f"Model retraining completed: {result}")
        except Exception as e:
            print(f"Model retraining failed: {e}")
    
    def stop(self):
        """Stop the training service"""
        self.running = False

training_service = TrainingService()