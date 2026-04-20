# 🩸 Blood Suite - Smart Blood Bank Management System

A technology-driven blood bank and donor management system for Lesotho, built with React, Node.js, and PostgreSQL.

## 🌟 Features

### 🏥 Hospital Dashboard
- Real-time blood inventory tracking
- Donor matching with geolocation
- Blood request management
- Smart notification system
- Analytics and reporting

### 🎨 Frontend (React + MUI)
- **Framework**: React 18
- **UI Library**: Material-UI (MUI)
- **Styling**: CSS-in-JS with Emotion
- **Routing**: React Router v6
- **State Management**: React Hooks
- **Real-time**: WebSocket integration
- **Responsive**: Mobile-first design

### ⚙️ Backend (Node.js + Express)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT tokens
- **Validation**: Input sanitization
- **API**: RESTful endpoints

### 🤖 AI/ML Forecast Service (Python + FastAPI)
- **Framework**: FastAPI with TensorFlow
- **Models**: LSTM, ARIMA, Prophet for demand forecasting
- **Data Processing**: Pandas, NumPy, scikit-learn
- **Database**: SQLAlchemy for PostgreSQL integration
- **Training**: Automated model retraining with new data
- **API**: RESTful endpoints for forecasts and analytics

### 📊 Data Import & AI Training
The system supports feeding real historical data to train AI models:

1. **Access Data Import**: Admin Dashboard → Data Import
2. **Prepare Data**: Use CSV/Excel with columns: `date`, `blood_type`, `demand`
3. **Upload & Validate**: Web interface validates data format and blood types
4. **Automatic Training**: System imports data and retrains AI models
5. **Real-time Updates**: Forecasts update based on actual demand patterns

**Supported Blood Types**: O+, O-, A+, A-, B+, B-, AB+, AB-
**Date Format**: YYYY-MM-DD
**Sample Data**: Available in `sample_blood_demand.csv`

### 📱 Mobile Support
- **Framework**: Flutter (planned)
- **Features**: Donor registration, notifications, location services

