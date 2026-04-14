# app/database.py
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import pandas as pd
from app.config import config

class Database:
    def __init__(self):
        self.engine = create_engine(config.DATABASE_URL)
        self.SessionLocal = sessionmaker(bind=self.engine)
    
    def get_session(self):
        return self.SessionLocal()
    
    def execute_query(self, query: str, params: dict = None):
        """Execute raw SQL query and return results as DataFrame"""
        try:
            with self.engine.connect() as conn:
                return pd.read_sql(query, conn, params=params)
        except Exception as e:
            print(f"Database query failed: {e}")
            return pd.DataFrame()
    
    def get_historical_demand(self, blood_type: str, months: int = 24):
        """Get historical blood demand data"""
        query = """
        SELECT 
            DATE(created_at) as date,
            SUM(quantity_ml / 450) as demand
        FROM requests
        WHERE blood_type = %(blood_type)s
            AND status = 'fulfilled'
            AND created_at >= NOW() - INTERVAL '%(months)s months'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
        """
        return self.execute_query(query, {'blood_type': blood_type, 'months': months})
    
    def get_historical_demand_all(self, months: int = 24):
        """Get historical demand for all blood types"""
        query = """
        SELECT 
            blood_type,
            DATE(created_at) as date,
            SUM(quantity_ml / 450) as demand
        FROM requests
        WHERE status = 'fulfilled'
            AND created_at >= NOW() - INTERVAL '%(months)s months'
        GROUP BY blood_type, DATE(created_at)
        ORDER BY blood_type, date ASC
        """
        return self.execute_query(query, {'months': months})
    
    def get_current_inventory(self):
        """Get current inventory levels"""
        query = """
        SELECT 
            blood_type,
            COUNT(*) as available_units,
            SUM(quantity_ml) as total_ml
        FROM blood_inventory
        WHERE status = 'available'
            AND expiry_date > NOW()
        GROUP BY blood_type
        """
        return self.execute_query(query)
    
    def get_actual_demand(self, blood_type: str, start_date: str, end_date: str):
        """Get actual demand for a date range (for accuracy calculation)"""
        query = """
        SELECT 
            DATE(created_at) as date,
            SUM(quantity_ml / 450) as actual_demand
        FROM requests
        WHERE blood_type = %(blood_type)s
            AND status = 'fulfilled'
            AND created_at >= %(start_date)s
            AND created_at <= %(end_date)s
        GROUP BY DATE(created_at)
        ORDER BY date ASC
        """
        return self.execute_query(query, {
            'blood_type': blood_type,
            'start_date': start_date,
            'end_date': end_date
        })

database = Database()