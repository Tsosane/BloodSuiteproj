# Blood Suite Full System Documentation

Version: 1.0.0  
Prepared: April 20, 2026  
Audience: Developers, testers, maintainers, project supervisors, and system administrators

## 1. Purpose Of This Document

This document explains the Blood Suite system end to end as it exists in the current repository. It is intended to be the single clear reference for:

- what the system is for
- how the system is structured
- how each major module works
- how data moves through the platform
- how to run the system locally
- how to feed the system real data
- which areas are fully live today and which areas are still scaffolded or need more refactoring

This document is based on the current code in the repository, plus direct verification performed on April 20, 2026.

## 2. System Summary

Blood Suite is a smart blood bank management system designed to support blood inventory tracking, hospital blood requests, donor management, analytics, and demand forecasting.

At a high level the system has four active runtime parts:

1. A React frontend used by admins, hospitals, donors, and blood bank managers.
2. A Node.js and Express backend API that handles authentication, database access, business logic, approvals, inventory, requests, and imports.
3. A PostgreSQL database that stores users, hospitals, donors, inventory, requests, notifications, and import logs.
4. A Python FastAPI forecast service that reads historical demand from PostgreSQL, trains forecasting models, and returns demand forecasts and shortage alerts.

## 3. Business Goals

The platform is designed to solve these core operational problems:

- track current blood inventory by hospital and blood type
- allow hospitals to request blood and manage demand
- maintain donor profiles and donation history
- identify shortages before they become critical
- notify eligible donors through in-app alerts and optional outbound channels
- let administrators import historical demand data
- retrain demand forecasting models when new demand data is added
- support role-based access so each user sees the correct tools

## 4. Current Runtime Topology

When running locally, the expected endpoints are:

| Component | Default URL | Purpose |
| --- | --- | --- |
| Frontend | `http://localhost:3000` | User interface |
| Backend API | `http://localhost:5000` | Core REST API |
| Backend Health | `http://localhost:5000/health` | API liveness check |
| Forecast Service | `http://localhost:8001` | AI forecasting service |
| Forecast Health | `http://localhost:8001/health` | Forecast service liveness check |
| PostgreSQL | `localhost:5432` | Primary relational database |

## 5. High-Level Architecture

```text
React Frontend
    |
    v
Express Backend API
    |
    +--> PostgreSQL
    |
    +--> FastAPI Forecast Service
            |
            +--> PostgreSQL
            +--> Saved model artifacts in forecast-service/models
```

### Runtime Interaction Pattern

1. The frontend authenticates against the backend using JWT.
2. The backend validates the token and applies role-based access control.
3. Business actions read from and write to PostgreSQL through Sequelize.
4. Historical fulfilled requests are used by the forecast service as demand history.
5. When an admin imports historical demand, the backend inserts request records and triggers model retraining in the forecast service.
6. When a forecasted shortage is detected, the backend can notify eligible donors through in-app notifications and optional email, SMS, and WhatsApp channels.
7. Managers consume forecast and analytics data through the frontend.

## 6. Repository Structure

| Path | Purpose |
| --- | --- |
| `frontend-web/` | React frontend |
| `backend/` | Express API server |
| `forecast-service/` | Python FastAPI forecasting service |
| `docs/` | Project documentation |
| `database/` | Database-related assets and scripts |
| `config/` | Shared configuration assets |
| `scripts/` | Utility scripts |
| `sample_blood_demand.csv` | Sample historical demand import file |
| `mobile-app/` | Planned mobile app area |
| `ai-ml/` | Minimal placeholder module, not the main live forecast service |
| `ai-demo/` | Demo notebooks/assets and local Python environment artifacts |

## 7. Technology Stack

### Frontend

- React 18
- React Router v6
- Material UI
- Recharts
- Axios

### Backend

- Node.js
- Express
- Sequelize ORM
- PostgreSQL
- JWT authentication
- Express Validator
- Multer for file uploads

### Forecast Service

- Python
- FastAPI
- Pandas
- NumPy
- SQLAlchemy
- ARIMA
- Prophet
- TensorFlow and LSTM support
- Scheduled background retraining

## 8. Roles And Access Model

Blood Suite currently uses four application roles.

| Role | Purpose | Main Capabilities |
| --- | --- | --- |
| `admin` | Platform administrator | Manage users, approve hospitals, import data, retrain forecasts |
| `hospital` | Hospital operator | Manage hospital inventory, create and track requests |
| `donor` | Blood donor | Manage donor profile and record donation activity |
| `blood_bank_manager` | Blood bank manager | View analytics, forecasts, and shortage intelligence |

### Authorization Implementation

Authorization is enforced in two layers:

- `backend/src/middleware/auth.js`: validates the JWT and loads the user
- `backend/src/middleware/rbac.js`: restricts routes by role

The frontend also uses route protection:

- `frontend-web/src/components/Auth/PrivateRoute.js`

Important note:

- The frontend route guard checks authentication and optionally roles.
- The backend remains the real security boundary.

## 9. Core Data Model

The current main database entities are described below.

### 9.1 `users`

Purpose: authentication and global identity.

Key fields:

- `id`
- `email`
- `password_hash`
- `role`
- `is_active`
- `last_login`

Relationships:

- one-to-one with `donors`
- one-to-one with `hospitals`
- one-to-many with `notifications`
- one-to-many with `import_logs`

### 9.2 `donors`

Purpose: donor profile and donation eligibility.

Key fields:

- `user_id`
- `full_name`
- `blood_type`
- `date_of_birth`
- `gender`
- `phone`
- `address`
- `latitude`
- `longitude`
- `last_donation_date`
- `is_eligible`
- `donation_count`

Rules:

- donor eligibility is recalculated using a 56-day waiting period
- `beforeSave` hooks automatically update `is_eligible`

### 9.3 `hospitals`

Purpose: hospital profile and approval state.

Key fields:

- `user_id`
- `hospital_name`
- `license_number`
- `address`
- `phone`
- `latitude`
- `longitude`
- `capacity`
- `is_approved`
- `approval_status`

Approval status values:

- `pending`
- `approved`
- `rejected`

### 9.4 `blood_inventory`

Purpose: current physical blood units available in the system.

Key fields:

- `hospital_id`
- `donor_id`
- `blood_type`
- `quantity_ml`
- `collection_date`
- `expiry_date`
- `storage_location`
- `testing_status`
- `status`

Inventory statuses:

- `available`
- `reserved`
- `expired`
- `used`

Testing statuses:

- `pending`
- `passed`
- `failed`

### 9.5 `requests`

Purpose: blood demand raised by hospitals or historical demand imported into the system.

Key fields:

- `hospital_id`
- `blood_type`
- `quantity_ml`
- `urgency`
- `status`
- `patient_name`
- `patient_age`
- `patient_blood_type`
- `required_date`
- `notes`
- `fulfilled_from`

Request statuses:

- `pending`
- `processing`
- `fulfilled`
- `cancelled`

### 9.6 `notifications`

Purpose: user-facing alerts.

Key fields:

- `user_id`
- `type`
- `priority`
- `title`
- `message`
- `read`
- `action_required`
- `action_url`
- `expiry_date`

### 9.6.1 Notification And Messaging Channels

The system now supports multiple donor outreach channels for shortage alerts:

- in-app notifications stored in `notifications`
- email through Nodemailer when email credentials are configured
- SMS through Twilio when Twilio SMS credentials are configured
- WhatsApp through Twilio when Twilio WhatsApp credentials are configured

The in-app notification is the required baseline channel. External channels are optional enhancements that activate only when their environment variables are present.

### 9.7 `import_logs`

Purpose: audit trail for historical data imports.

Key fields:

- `user_id`
- `file_name`
- `source_type`
- `total_records`
- `inserted_records`
- `skipped_records`
- `status`
- `notes`

## 10. Frontend Architecture

### 10.1 Routing

All main routing is defined in:

- `frontend-web/src/App.js`

The frontend groups pages by role:

- Admin pages
- Hospital pages
- Donor pages
- Manager pages
- Shared pages

### 10.2 Authentication State

Authentication state is managed in:

- `frontend-web/src/context/AuthContext.js`
- `frontend-web/src/services/authService.js`
- `frontend-web/src/services/api.js`

Behavior:

- JWT tokens are stored in `localStorage`
- the Axios interceptor automatically attaches `Authorization: Bearer <token>`
- unauthorized responses clear session storage and redirect to `/login`

Stored local session keys include:

- `bloodSuiteToken`
- `bloodSuiteUserRole`
- `bloodSuiteUserEmail`
- `bloodSuiteHospital`
- `bloodSuiteHospitalId`

### 10.3 Layout

The authenticated shell uses:

- `frontend-web/src/components/Layout/Layout.js`

This provides:

- navbar
- sidebar
- role-based navigation shell
- routed main content area

### 10.4 Frontend Service Layer

The frontend uses a dedicated service per backend domain:

| Service | Purpose |
| --- | --- |
| `authService` | login, register, session hydration |
| `adminService` | admin user management |
| `analyticsService` | analytics data retrieval |
| `donorService` | donor profile, donation history, donation recording |
| `forecastService` | manager forecast access |
| `hospitalService` | hospital profile and approval workflows |
| `inventoryService` | blood inventory management |
| `notificationService` | user notifications |
| `requestService` | blood request management |

## 11. Backend Architecture

### 11.1 Server Startup

Startup entry points:

- `backend/server.js`
- `backend/src/app.js`

Startup process:

1. Load environment variables.
2. Connect to PostgreSQL.
3. Run `sequelize.sync({ alter: true })`.
4. Register middleware.
5. Mount route groups.
6. Expose `/health`.

### 11.2 Middleware

Current middleware stack includes:

- `helmet`
- `cors`
- rate limiting
- JSON parsing
- URL-encoded body parsing
- JWT auth
- role-based access control
- request validation

### 11.3 Route Groups

| Route Prefix | Purpose |
| --- | --- |
| `/api/auth` | authentication |
| `/api/inventory` | blood inventory |
| `/api/donors` | donor operations |
| `/api/hospitals` | hospital registration and approval |
| `/api/requests` | blood requests |
| `/api/notifications` | notifications |
| `/api/analytics` | analytics and KPIs |
| `/api/forecast` | proxy to forecast service |
| `/api/data-import` | historical demand import |
| `/api/admin` | admin-only controls |

## 12. API Reference Summary

This section is a practical summary. The more detailed route docs remain in `docs/API_REFERENCE.md`.

### 12.1 Authentication

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register user and role-specific profile |
| `POST` | `/api/auth/login` | Login and issue JWT |
| `GET` | `/api/auth/me` | Get current user and role profile |
| `POST` | `/api/auth/logout` | Logout acknowledgement |

### 12.2 Hospitals

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/hospitals/approved` | Get approved hospitals |
| `GET` | `/api/hospitals` | Admin/manager list of hospitals |
| `GET` | `/api/hospitals/me` | Current hospital profile |
| `GET` | `/api/hospitals/pending` | Pending approval list |
| `POST` | `/api/hospitals/register` | Register hospital profile |
| `PUT` | `/api/hospitals/:id/approve` | Approve hospital |
| `PUT` | `/api/hospitals/:id/reject` | Reject hospital |

### 12.3 Inventory

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/inventory` | List inventory, filtered by role and query |
| `GET` | `/api/inventory/expiring` | Units expiring within 7 days |
| `GET` | `/api/inventory/low-stock` | Blood types below threshold |
| `POST` | `/api/inventory` | Add blood unit |
| `PUT` | `/api/inventory/:id` | Update unit |
| `DELETE` | `/api/inventory/:id` | Delete unit |

### 12.4 Requests

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/requests` | List requests |
| `POST` | `/api/requests` | Create request |
| `PUT` | `/api/requests/:id/status` | Update status |
| `PUT` | `/api/requests/:id/fulfill` | Allocate FEFO units |
| `DELETE` | `/api/requests/:id` | Cancel request |

### 12.5 Donors

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/donors` | Admin/manager donor listing |
| `GET` | `/api/donors/me` | Current donor profile |
| `PUT` | `/api/donors/me` | Update donor profile |
| `GET` | `/api/donors/nearby` | Nearby donors for hospital/admin |
| `POST` | `/api/donors/donate` | Record a real donation |
| `GET` | `/api/donors/history` | Donation history for current donor |

### 12.6 Notifications

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/notifications` | List notifications |
| `GET` | `/api/notifications/unread-count` | Get unread count |
| `PUT` | `/api/notifications/:id/read` | Mark one as read |
| `PUT` | `/api/notifications/read-all` | Mark all as read |
| `DELETE` | `/api/notifications/:id` | Delete one notification |

### 12.7 Analytics

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/analytics/dashboard` | Dashboard KPIs |
| `GET` | `/api/analytics/inventory-summary` | Inventory by blood type |
| `GET` | `/api/analytics/request-trends` | Request totals and fulfilled totals |
| `GET` | `/api/analytics/donor-stats` | Donor distribution and frequency |

### 12.8 Forecasts

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/forecast/alerts` | Shortage alerts |
| `GET` | `/api/forecast/recommendations` | Stock recommendations |
| `GET` | `/api/forecast/accuracy` | Model accuracy summary |
| `POST` | `/api/forecast/train` | Trigger retraining |
| `POST` | `/api/forecast/notify-donors` | Trigger donor outreach |
| `GET` | `/api/forecast/:bloodType` | Forecast for one blood type |
| `GET` | `/api/forecast` | Forecasts for all blood types |

### 12.9 Data Import

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/data-import/upload` | Import historical demand file |
| `POST` | `/api/data-import/validate` | Validate a file without importing |
| `GET` | `/api/data-import/history` | Import history |
| `GET` | `/api/data-import/template` | Import template metadata |

### 12.10 Admin

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/admin/users` | List users for admin UI |
| `PATCH` | `/api/admin/users/:id/status` | Activate or deactivate a user |

## 13. Forecast Service Architecture

The live forecasting implementation is in `forecast-service/`, not `ai-ml/`.

### 13.1 Main Responsibilities

- read historical fulfilled demand from PostgreSQL
- supplement missing history with generated sample data when real data is insufficient
- train ARIMA, Prophet, and optionally LSTM models
- combine predictions through an ensemble wrapper
- return single-blood-type and all-blood-type forecasts
- calculate shortage alerts
- retrain on schedule and on admin demand

### 13.2 Important Behavior

If there is not enough real historical data, the forecast service does not fail. Instead it:

1. reads whatever real demand is available
2. generates sample demand to supplement gaps
3. fills missing dates with zero-demand rows
4. uses fallback sample forecasts until trained models are ready

This means the system can still operate before a large production dataset exists, while gradually becoming more data-driven as real imports accumulate.

### 13.3 Forecast Service Endpoints

Direct FastAPI endpoints include:

- `GET /health`
- `GET /forecast/{blood_type}`
- `GET /forecast/all`
- `GET /forecast/alerts/shortages`
- `GET /forecast/accuracy`
- `POST /forecast/train`

### 13.4 Model Artifacts

Trained model files are stored in:

- `forecast-service/models/`

Examples:

- `arima_O+.pkl`
- `prophet_A+.pkl`
- `lstm_O+.h5`

### 13.5 Training Schedule

The training service schedules weekly retraining on Sunday at 02:00.

Implementation:

- `forecast-service/app/services/training_service.py`

## 14. Detailed Workflow Descriptions

### 14.1 User Registration And Login

Flow:

1. A user submits registration in the frontend.
2. The backend creates the `users` record.
3. If the role is `donor`, a donor profile is created.
4. If the role is `hospital`, a hospital profile is created with approval required.
5. The user logs in through `/api/auth/login`.
6. A JWT is returned and stored in `localStorage`.
7. The frontend redirects to the role-appropriate dashboard.

### 14.2 Hospital Approval Workflow

Flow:

1. Hospital user registers.
2. The hospital remains unapproved.
3. Admin views pending hospitals.
4. Admin approves or rejects the hospital.
5. Approved hospitals become visible to donor-facing approved hospital queries.

### 14.3 Hospital Inventory Workflow

Flow:

1. Hospital staff loads own inventory through `/api/inventory`.
2. Backend auto-scopes inventory to the current hospital.
3. New units can be added with blood type, quantity, collection date, expiry date, and testing status.
4. Expiring units can be viewed through `/api/inventory/expiring`.
5. Low stock summaries can be queried through `/api/inventory/low-stock`.

### 14.4 Request Workflow

Flow:

1. Hospital creates a new request.
2. Request is stored as `pending`.
3. Urgent and emergency requests now generate notifications for active admins and managers.
4. When fulfilled, inventory allocation uses FEFO ordering.
5. Matching units are marked `reserved`.
6. Request status moves to `processing`.

Important note:

- Current fulfillment allocates from the requesting hospital's own inventory.
- Cross-hospital stock transfer logic is not yet implemented in the current backend.

### 14.5 Donor Workflow

Flow:

1. Donor logs in.
2. Donor dashboard loads real donor profile and donation history.
3. Eligibility is derived from the 56-day rule.
4. Donor can record a donation against an approved hospital.
5. Recording the donation updates donor history and creates a blood inventory unit for the selected hospital.

### 14.6 Historical Data Import Workflow

Flow:

1. Admin opens the data import page.
2. Admin uploads CSV or Excel file.
3. Backend validates required columns and blood type values.
4. Each imported row is converted into a fulfilled `requests` record.
5. Records are written with historical dates using `createdAt`.
6. Import is logged in `import_logs`.
7. Forecast retraining is triggered after import.

Required columns:

- `date`
- `blood_type`
- `demand`

Optional columns:

- `hospital_license_number`
- `hospital_name`
- `notes`

Demand conversion rule:

- imported `demand` is interpreted as number of 450ml units
- backend converts demand units to `quantity_ml`

### 14.7 Forecast Workflow

Flow:

1. Manager requests forecast data from frontend.
2. Backend proxy calls the forecast service.
3. Forecast service gathers historical fulfilled request demand.
4. Model or fallback logic generates predictions.
5. Forecast service returns predicted demand, bounds, confidence, and stock comparison.
6. Manager dashboard and forecast pages render that data.

## 15. Real Data Feeding Guide

Use this when you want to add real demand data to the system.

### 15.1 Input File Rules

Accepted file types:

- `.csv`
- `.xlsx`
- `.xls`

Expected columns:

| Column | Required | Meaning |
| --- | --- | --- |
| `date` | Yes | Demand date in `YYYY-MM-DD` |
| `blood_type` | Yes | Blood type |
| `demand` | Yes | Number of 450ml units demanded |
| `hospital_license_number` | No | Maps import to a real hospital |
| `hospital_name` | No | Alternate hospital matching path |
| `notes` | No | Free text |

Supported blood types:

- `O+`
- `O-`
- `A+`
- `A-`
- `B+`
- `B-`
- `AB+`
- `AB-`

### 15.2 What The Backend Does During Import

- validates structure and values
- reads the file
- creates or reuses a dedicated historical import hospital if needed
- writes fulfilled request records
- records import stats in `import_logs`
- triggers forecast retraining

### 15.3 Sample File

The repository already includes:

- `sample_blood_demand.csv`

## 16. Current Implementation Status

This is the practical status of the system as of April 20, 2026.

### 16.1 Live And Verified Core Areas

These areas are implemented against the real backend and have either been directly verified in runtime or verified through successful build plus API checks:

- login with real backend accounts
- registration against real backend
- admin dashboard live data
- hospital approval workflow
- data import against PostgreSQL
- import history logging
- manager dashboard live data
- manager analytics dashboard live data
- manager forecast reports live data
- hospital dashboard live data
- donor dashboard live data
- forecast service health and forecast response path
- frontend production build

### 16.2 Secondary Screens That Still Need Individual Review Or Further Refactoring

The repository still contains secondary pages that appear scaffolded, partially demo-oriented, or not yet re-verified end to end. They should not all be assumed fully production-ready without another focused pass.

Examples include some pages under:

- `frontend-web/src/pages/Admin/`
- `frontend-web/src/pages/Hospital/`
- `frontend-web/src/pages/Donor/`
- `frontend-web/src/pages/Manager/`
- shared pages such as notifications, settings, and help

The main role dashboards are the safest currently verified entry points.

## 17. Local Setup And Startup

### 17.1 Prerequisites

- Node.js
- npm
- Python 3.11 or compatible local environment for the forecast service
- PostgreSQL

### 17.2 Backend Environment

Main backend variables in `backend/.env`:

- `PORT`
- `NODE_ENV`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRE`
- `FRONTEND_URL`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_SMS_FROM`
- `TWILIO_WHATSAPP_FROM`
- `TWILIO_DEFAULT_COUNTRY_CODE`

### 17.3 Frontend Environment

Frontend variables:

- `REACT_APP_API_URL`
- `REACT_APP_GOOGLE_MAPS_API_KEY`

### 17.4 Forecast Service Environment

Forecast service variables:

- `FORECAST_PORT`
- `FORECAST_HOST`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `ARIMA_ENABLED`
- `PROPHET_ENABLED`
- `LSTM_ENABLED`
- `ENSEMBLE_ENABLED`
- `TRAIN_SCHEDULE`

### 17.5 Start Commands

#### Backend

```powershell
cd backend
npm install
npm run dev
```

#### Frontend

```powershell
cd frontend-web
npm install
npm start
```

#### Forecast Service

```powershell
cd forecast-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

## 18. Development Test Accounts

These accounts were configured for local testing:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@bloodsuite.org` | `admin123` |
| Hospital | `hospital@qeh.org.ls` | `hospital123` |
| Donor | `donor@example.com` | `donor123` |
| Manager | `manager@bloodsuite.org` | `manager123` |

## 19. Verification Performed

The following checks were completed during the latest update cycle:

- frontend production build completed successfully on April 20, 2026
- manager analytics endpoints responded successfully
- donor profile and donation history endpoints responded successfully
- forecast, alerts, recommendations, and accuracy endpoints responded successfully after route fixes
- a live forecast request created an in-app donor shortage notification for the eligible O+ donor account
- full login, import, and forecast flow had already been verified in this workspace before this documentation pass

One operational note:

- the currently running backend process in the local environment appeared to need a restart to expose the newest `/api/hospitals/approved` route, even though the code now contains that route. If the donor dashboard shows the hospital warning banner, restart the backend process.

## 20. Known Limitations And Notes

- The forecast service supplements missing real history with generated sample data until enough real demand exists.
- LSTM is supported in code but may be disabled or unstable on some Windows environments depending on TensorFlow compatibility.
- SMS and WhatsApp delivery require valid Twilio credentials and a properly formatted donor phone number.
- Cross-hospital fulfillment and transfer orchestration are not implemented in the current request flow.
- Several secondary frontend pages still need dedicated backend alignment and end-to-end verification.
- Some extra frontend auth service methods such as refresh password flows are present in the frontend service layer but do not have matching backend endpoints in the current backend route set.

## 21. Recommended Next Development Steps

The most valuable next steps are:

1. finish refactoring the remaining secondary pages so all screens are backend-driven
2. add automated tests for auth, imports, requests, and notifications
3. restart all local services after major route changes during development
4. implement true appointment scheduling for donors instead of only immediate donation recording
5. add cross-hospital request fulfillment and transfer coordination
6. tighten production secrets and email configuration before deployment

## 22. Primary Source Files For This Document

This document was derived from the current implementation in these key files:

- `frontend-web/src/App.js`
- `frontend-web/src/context/AuthContext.js`
- `frontend-web/src/services/*.js`
- `frontend-web/src/pages/Admin/*.js`
- `frontend-web/src/pages/Hospital/HospitalDashboard.js`
- `frontend-web/src/pages/Donor/DonorDashboard.js`
- `frontend-web/src/pages/Manager/*.js`
- `backend/src/app.js`
- `backend/src/routes/*.js`
- `backend/src/controllers/*.js`
- `backend/src/models/*.js`
- `backend/src/middleware/*.js`
- `backend/src/services/dataImportService.js`
- `backend/src/services/forecastService.js`
- `backend/src/services/donorNotificationService.js`
- `backend/src/services/emailService.js`
- `backend/src/services/messageService.js`
- `forecast-service/app/main.py`
- `forecast-service/app/services/*.py`
- `forecast-service/app/database.py`

## 23. Conclusion

Blood Suite now has a working real-data backbone for authentication, inventory, requests, imports, analytics, and forecasting. The most important operational paths are connected to PostgreSQL and the forecast service. The main remaining work is to finish converting the secondary frontend pages so every screen in the application matches the live-data standard already used by the core dashboards.
