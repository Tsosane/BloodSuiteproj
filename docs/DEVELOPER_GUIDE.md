# Blood Suite - Developer Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Development Environment Setup](#development-environment-setup)
3. [Architecture Overview](#architecture-overview)
4. [Backend Development](#backend-development)
5. [Frontend Development](#frontend-development)
6. [Database Development](#database-development)
7. [API Documentation](#api-documentation)
8. [Testing Guide](#testing-guide)
9. [Deployment Guide](#deployment-guide)
10. [Contributing Guidelines](#contributing-guidelines)

---

## Project Overview

Blood Suite is a comprehensive blood bank management system designed to streamline blood donation, inventory management, and hospital requests. The system is built using modern web technologies and follows best practices for scalability and maintainability.

### Key Features
- **Multi-role Authentication**: Admin, Hospital, and Donor roles
- **Real-time Inventory Tracking**: Live blood stock monitoring
- **Donor Management**: Complete donor lifecycle management
- **Hospital Requests**: Blood request and fulfillment workflow
- **Notification System**: Real-time alerts and communications
- **Analytics Dashboard**: Comprehensive reporting and insights

---

## Development Environment Setup

### Prerequisites
- Node.js 16+ 
- PostgreSQL 12+
- Git
- Modern web browser

### Local Development Setup

1. **Clone the Repository**
```bash
git clone https://github.com/Tsosane/-bloodsuite_project.git
cd Blood_suite
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
```

3. **Frontend Setup**
```bash
cd ../frontend-web
npm install
```

4. **Database Setup**
```bash
# Create PostgreSQL database
createdb blood_suite_db

# Run migrations (if available)
cd ../backend
npm run migrate
```

5. **Start Development Servers**
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend-web
npm start
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database Configuration
DB_NAME=blood_suite_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

---

## Architecture Overview

### System Architecture
```
Blood Suite follows a three-tier architecture:

Frontend (React) 
    |
    v
Backend (Node.js/Express)
    |
    v
Database (PostgreSQL)
```

### Technology Stack

#### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT tokens
- **Security**: Helmet.js, CORS, rate limiting
- **Real-time**: Socket.io (optional)

#### Frontend
- **Framework**: React 18
- **UI Library**: Material-UI (MUI) v5
- **State Management**: React Context API
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: CSS-in-JS with Emotion

#### Database
- **Primary**: PostgreSQL
- **ORM**: Sequelize
- **Migrations**: Sequelize CLI
- **Seeding**: Custom seed scripts

---

## Backend Development

### Project Structure
```
backend/
src/
    controllers/     # Request handlers
    models/          # Sequelize models
    routes/          # Route definitions
    middleware/      # Custom middleware
    services/        # Business logic
    utils/           # Helper functions
    config/          # Configuration files
```

### Key Components

#### Models
- **User**: Authentication and user management
- **Donor**: Donor information and eligibility
- **Hospital**: Hospital registration and management
- **BloodInventory**: Blood stock tracking
- **Request**: Blood request management
- **Notification**: System notifications

#### Controllers
- **authController**: Login, registration, token management
- **donorController**: Donor CRUD operations
- **hospitalController**: Hospital management
- **inventoryController**: Blood inventory operations
- **requestController**: Blood request workflow
- **notificationController**: Notification management

#### Services
- **authService**: Authentication logic
- **emailService**: Email notifications
- **notificationService**: System notifications
- **validationService**: Input validation

### API Design Principles
- RESTful endpoints
- Consistent error handling
- Input validation
- Proper HTTP status codes
- JWT authentication middleware

### Development Workflow
1. Create/Update Models
2. Implement Controllers
3. Define Routes
4. Add Middleware
5. Write Tests
6. Update Documentation

---

## Frontend Development

### Project Structure
```
frontend-web/
src/
    components/      # Reusable UI components
    pages/          # Page-level components
    services/       # API service functions
    context/        # React Context providers
    hooks/          # Custom React hooks
    utils/          # Helper functions
    theme/          # Material-UI theme
```

### Key Components

#### Pages
- **Login**: Authentication interface
- **Dashboard**: Main dashboard for each role
- **AdminDashboard**: System administration
- **HospitalDashboard**: Hospital-specific features
- **DonorDashboard**: Donor management
- **Inventory**: Blood inventory management
- **Requests**: Blood request management

#### Components
- **Layout**: App layout and navigation
- **Navbar**: Top navigation bar
- **Sidebar**: Side navigation menu
- **Charts**: Data visualization components
- **Forms**: Input forms and validation
- **Tables**: Data display components

#### Services
- **apiService**: HTTP client configuration
- **authService**: Authentication API calls
- **donorService**: Donor-related API calls
- **hospitalService**: Hospital API calls
- **inventoryService**: Inventory API calls
- **requestService**: Request API calls

### State Management
- **AuthContext**: User authentication state
- **NotificationContext**: Notification management
- **ThemeContext**: UI theme management

### UI/UX Guidelines
- Material-UI design system
- Responsive design principles
- Accessibility compliance
- Error boundary implementation
- Loading states and skeletons

---

## Database Development

### Schema Design

#### Core Tables
```sql
-- Users table for authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Donors table
CREATE TABLE donors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    full_name VARCHAR(255) NOT NULL,
    blood_type VARCHAR(10) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    last_donation_date DATE,
    is_eligible BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hospitals table
CREATE TABLE hospitals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) UNIQUE,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blood inventory table
CREATE TABLE blood_inventory (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER REFERENCES hospitals(id),
    donor_id INTEGER REFERENCES donors(id),
    blood_type VARCHAR(10) NOT NULL,
    quantity_ml INTEGER NOT NULL,
    collection_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blood requests table
CREATE TABLE requests (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER REFERENCES hospitals(id),
    blood_type VARCHAR(10) NOT NULL,
    quantity_ml INTEGER NOT NULL,
    urgency VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fulfillment_date TIMESTAMP,
    notes TEXT
);

-- Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    recipient_id INTEGER NOT NULL,
    recipient_type VARCHAR(20) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Database Best Practices
- Use foreign keys for data integrity
- Add indexes for frequently queried columns
- Use appropriate data types
- Implement soft deletes where needed
- Add audit fields (created_at, updated_at)

### Migration Strategy
- Use Sequelize migrations
- Version control schema changes
- Test migrations on development first
- Backup before production migrations

---

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "donor|hospital|admin",
  "fullName": "Full Name",
  "phone": "1234567890"
}
```

#### POST /api/auth/login
User login
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "donor",
    "fullName": "Full Name"
  }
}
```

### Donor Endpoints

#### GET /api/donors
Get all donors (admin only)
#### GET /api/donors/:id
Get donor by ID
#### PUT /api/donors/:id
Update donor profile
#### POST /api/donors
Register new donor

### Hospital Endpoints

#### GET /api/hospitals
Get all hospitals
#### GET /api/hospitals/:id
Get hospital by ID
#### PUT /api/hospitals/:id
Update hospital profile
#### POST /api/hospitals
Register new hospital

### Inventory Endpoints

#### GET /api/inventory
Get blood inventory
#### POST /api/inventory
Add blood unit
#### PUT /api/inventory/:id
Update blood unit
#### DELETE /api/inventory/:id
Remove blood unit

### Request Endpoints

#### GET /api/requests
Get blood requests
#### POST /api/requests
Create blood request
#### PUT /api/requests/:id
Update request status
#### GET /api/requests/:id
Get request details

### Notification Endpoints

#### GET /api/notifications
Get user notifications
#### PUT /api/notifications/:id/read
Mark notification as read
#### DELETE /api/notifications/:id
Delete notification

---

## Testing Guide

### Backend Testing

#### Unit Tests
```bash
cd backend
npm test
```

#### Integration Tests
- Test API endpoints
- Test database operations
- Test authentication flows

#### Test Coverage
- Aim for >80% code coverage
- Test all critical business logic
- Test error scenarios

### Frontend Testing

#### Component Tests
```bash
cd frontend-web
npm test
```

#### End-to-End Tests
- User flows
- Form submissions
- Navigation

### Testing Best Practices
- Write tests before code (TDD)
- Test edge cases
- Mock external dependencies
- Keep tests maintainable

---

## Deployment Guide

### Production Environment Setup

#### Backend Deployment
1. Set up production database
2. Configure environment variables
3. Install dependencies
4. Run database migrations
5. Start application with PM2

#### Frontend Deployment
1. Build the application
2. Deploy to static hosting
3. Configure routing
4. Set up SSL certificate

### Environment Variables (Production)
```env
NODE_ENV=production
DB_HOST=production_db_host
DB_PASSWORD=secure_password
JWT_SECRET=production_jwt_secret
EMAIL_HOST=production_email_host
```

### Deployment Checklist
- [ ] Database backups configured
- [ ] SSL certificates installed
- [ ] Monitoring set up
- [ ] Error logging configured
- [ ] Performance monitoring
- [ ] Security headers configured

---

## Contributing Guidelines

### Code Style
- Use ESLint for JavaScript
- Follow Prettier formatting
- Write descriptive commit messages
- Use conventional commits

### Git Workflow
1. Create feature branch
2. Make changes
3. Write tests
4. Submit pull request
5. Code review
6. Merge to main

### Pull Request Process
- Clear description of changes
- Screenshots for UI changes
- Test coverage for new features
- Documentation updates

### Code Review Guidelines
- Check for security issues
- Verify test coverage
- Ensure code quality
- Validate performance impact

---

## Support and Resources

### Documentation
- [API Reference](./API_REFERENCE.md)
- [Database Guide](./DATABASE_GUIDE.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)

### Getting Help
- Check existing issues
- Create new issue with details
- Join community discussions
- Contact maintainers

### Resources
- [React Documentation](https://reactjs.org/docs/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Material-UI Documentation](https://mui.com/)

---

*Last Updated: April 2026*
*Version: 1.0.0*
