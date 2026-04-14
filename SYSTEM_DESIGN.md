# 🏗️ Blood Suite System Design Documentation

## 📋 **System Overview**

Blood Suite is a comprehensive blood bank management system that connects donors, hospitals, and blood inventory through a modern web application with real-time capabilities.

---

## 🎯 **Use Case Diagrams**

### **1. Actor Identification**

#### **Primary Actors**
- **Donor**: Individuals who donate blood
- **Hospital Staff**: Medical professionals managing blood inventory
- **System Administrator**: System configuration and user management
- **Blood Bank Manager**: Overall blood bank operations

#### **Secondary Actors**
- **External API**: Third-party integrations
- **Notification System**: Email/SMS services
- **Database**: PostgreSQL data storage

---

### **2. Donor Use Cases**

```mermaid
graph TD
    A[Donor] --> B[Register Account]
    A --> C[Update Profile]
    A --> D[View Donation History]
    A --> E[Schedule Donation]
    A --> F[Check Eligibility]
    A --> G[View Notifications]
    A --> H[Update Availability]
    
    B --> B1[Provide Personal Info]
    B --> B2[Medical History]
    B --> B3[Blood Type Verification]
    
    C --> C1[Contact Information]
    C --> C2[Health Status]
    C --> C3[Emergency Contact]
    
    E --> E1[Select Donation Center]
    E --> E2[Choose Date/Time]
    E --> E3[Receive Confirmation]
```

#### **Donor Use Case Details**

| Use Case | Description | Precondition | Postcondition |
|-----------|-------------|---------------|----------------|
| **Register Account** | Create new donor account with medical profile | Valid email, 18+ years old | Account created, profile pending verification |
| **Update Profile** | Modify personal and medical information | Logged in donor | Profile updated, eligibility recalculated |
| **View Donation History** | Access past donation records | Logged in donor | Display donation dates, locations, amounts |
| **Schedule Donation** | Book future donation appointment | Eligible donor | Appointment scheduled, notification sent |
| **Check Eligibility** | Verify donation eligibility | Logged in donor | Display eligibility status and next eligible date |
| **View Notifications** | Access system alerts and updates | Logged in donor | Display unread notifications count and messages |

---

### **3. Hospital Staff Use Cases**

```mermaid
graph TD
    A[Hospital Staff] --> B[Manage Inventory]
    A --> C[Process Requests]
    A --> D[Generate Reports]
    A --> E[Manage Donors]
    A --> F[Send Notifications]
    A --> G[View Analytics]
    
    B --> B1[Add Blood Units]
    B --> B2[Update Status]
    B --> B3[Track Expiry]
    B --> B4[Search Inventory]
    
    C --> C1[Create Request]
    C --> C2[Match Donors]
    C --> C3[Fulfill Request]
    C --> C4[Track Status]
    
    D --> D1[Inventory Reports]
    D --> D2[Donation Statistics]
    D --> D3[Request Analytics]
    D --> D4[Compliance Reports]
```

#### **Hospital Staff Use Case Details**

| Use Case | Description | Precondition | Postcondition |
|-----------|-------------|---------------|----------------|
| **Manage Inventory** | Add, update, and track blood units | Logged in staff | Inventory updated, alerts for expiring units |
| **Process Requests** | Handle blood requests from patients | Logged in staff | Request processed, donors notified if needed |
| **Generate Reports** | Create various management reports | Logged in staff | Reports generated and exported |
| **Manage Donors** | View and manage donor information | Logged in staff | Donor records updated |
| **Send Notifications** | Send alerts to donors and staff | Logged in staff | Notifications queued and delivered |
| **View Analytics** | Access dashboard and metrics | Logged in staff | Analytics displayed with real-time data |

---

### **4. System Administrator Use Cases**

```mermaid
graph TD
    A[System Admin] --> B[User Management]
    A --> C[System Configuration]
    A --> D[Database Management]
    A --> E[Security Management]
    A --> F[System Monitoring]
    A --> G[Backup & Recovery]
    
    B --> B1[Create Users]
    B --> B2[Approve Hospitals]
    B --> B3[Manage Permissions]
    B --> B4[Reset Passwords]
    
    C --> C1[Configure Settings]
    C --> C2[Manage Blood Types]
    C --> C3[Set Policies]
    C --> C4[Customize Notifications]
```

---

## 🏛️ **System Architecture**

### **1. High-Level Architecture**

```mermaid
graph TB
    subgraph "Presentation Layer"
        A[React Frontend]
        B[Material-UI Components]
        C[Mobile Responsive]
    end
    
    subgraph "Application Layer"
        D[Express.js API]
        E[Authentication Service]
        F[Business Logic]
        G[Validation Service]
    end
    
    subgraph "Data Layer"
        H[PostgreSQL Database]
        I[Sequelize ORM]
        J[Connection Pool]
    end
    
    subgraph "External Services"
        K[Email Service]
        L[SMS Gateway]
        M[File Storage]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    D --> F
    D --> G
    F --> I
    I --> H
    I --> J
    D --> K
    D --> L
    D --> M
```

---

### **2. Component Architecture**

```mermaid
graph LR
    subgraph "Frontend Components"
        A[App.js]
        B[Dashboard]
        C[Inventory]
        D[Donors]
        E[Requests]
        F[Notifications]
        G[Authentication]
    end
    
    subgraph "Services"
        H[API Service]
        I[Auth Service]
        J[Inventory Service]
        K[Donor Service]
        L[Request Service]
        M[Notification Service]
    end
    
    subgraph "Backend Controllers"
        N[Auth Controller]
        O[User Controller]
        P[Inventory Controller]
        Q[Donor Controller]
        R[Request Controller]
        S[Notification Controller]
    end
    
    A --> H
    B --> J
    C --> J
    D --> K
    E --> L
    F --> M
    G --> I
    
    H --> N
    J --> P
    K --> Q
    L --> R
    M --> S
    I --> N
```

---

### **3. Database Architecture**

```mermaid
erDiagram
    users ||--o{ donors : "has"
    users ||--o{ hospitals : "has"
    hospitals ||--o{ blood_inventory : "owns"
    donors ||--o{ blood_inventory : "donates"
    hospitals ||--o{ requests : "makes"
    users ||--o{ notifications : "receives"
    
    users {
        uuid id PK
        string email UK
        string password
        enum role
        boolean is_active
        timestamp last_login
        timestamp created_at
        timestamp updated_at
    }
    
    donors {
        uuid id PK
        uuid user_id FK
        string full_name
        enum blood_type
        string phone
        date date_of_birth
        text address
        decimal location_lat
        decimal location_lng
        date last_donation_date
        date next_eligible_date
        boolean is_available
        text health_status
        string emergency_contact_name
        string emergency_contact_phone
        timestamp created_at
        timestamp updated_at
    }
    
    hospitals {
        uuid id PK
        uuid user_id FK
        string name
        string license_number UK
        text address
        string phone
        string email
        decimal location_lat
        decimal location_lng
        string contact_person
        string contact_person_phone
        boolean is_approved
        integer capacity_beds
        text description
        timestamp created_at
        timestamp updated_at
    }
    
    blood_inventory {
        uuid id PK
        uuid hospital_id FK
        uuid donor_id FK
        enum blood_type
        integer quantity_ml
        date collection_date
        date expiry_date
        enum status
        string blood_group
        enum rh_factor
        string storage_location
        text notes
        array tested_for
        timestamp created_at
        timestamp updated_at
    }
    
    requests {
        uuid id PK
        uuid hospital_id FK
        enum blood_type
        integer quantity_ml
        enum urgency
        enum status
        string patient_name
        integer patient_age
        enum patient_gender
        text medical_condition
        date required_date
        timestamp fulfilled_date
        text notes
        timestamp created_at
        timestamp updated_at
    }
    
    notifications {
        uuid id PK
        enum type
        string title
        text message
        string recipient
        boolean read
        enum priority
        boolean action_required
        string action_url
        timestamp expires_at
        timestamp created_at
        timestamp updated_at
    }
```

---

## 🔧 **Technical Architecture**

### **1. Technology Stack**

#### **Frontend Stack**
- **React 18**: Modern UI framework with hooks
- **Material-UI v5**: Component library and design system
- **React Router v6**: Client-side routing
- **Axios**: HTTP client for API calls
- **date-fns**: Date manipulation library
- **Recharts**: Data visualization

#### **Backend Stack**
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **Sequelize**: ORM for PostgreSQL
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **Helmet.js**: Security middleware
- **CORS**: Cross-origin resource sharing

#### **Database Stack**
- **PostgreSQL 12+**: Primary database
- **UUID**: Primary key generation
- **Indexes**: Performance optimization
- **Constraints**: Data integrity

---

### **2. Security Architecture**

```mermaid
graph TD
    A[User Request] --> B[Authentication Middleware]
    B --> C[JWT Verification]
    C --> D[Role-Based Access]
    D --> E[Authorization Check]
    E --> F[Resource Access]
    
    G[Password Security] --> H[bcrypt Hashing]
    H --> I[Salt Rounds]
    
    J[API Security] --> K[Helmet.js Headers]
    K --> L[CORS Configuration]
    L --> M[Rate Limiting]
    
    N[Data Security] --> O[Input Validation]
    O --> P[SQL Injection Prevention]
    P --> Q[XSS Protection]
```

#### **Security Layers**
1. **Authentication Layer**: JWT-based authentication
2. **Authorization Layer**: Role-based access control
3. **Input Validation**: Comprehensive data validation
4. **Transport Security**: HTTPS, CORS configuration
5. **Password Security**: bcrypt with salt rounds
6. **API Security**: Rate limiting, helmet headers

---

### **3. Data Flow Architecture**

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API Gateway
    participant S as Service Layer
    participant D as Database
    participant N as Notification Service
    
    U->>F: Login Request
    F->>A: POST /api/auth/login
    A->>S: Validate Credentials
    S->>D: Query User
    D-->>S: User Data
    S-->>A: JWT Token
    A-->>F: Authentication Response
    F-->>U: Login Success
    
    U->>F: View Inventory
    F->>A: GET /api/inventory
    A->>S: Get Inventory Data
    S->>D: Query Blood Inventory
    D-->>S: Inventory Records
    S-->>A: Processed Data
    A-->>F: JSON Response
    F-->>U: Display Inventory
    
    Note over N: Background Process
    S->>N: Send Notification
    N-->>U: Email/SMS Alert
```

---

## 📊 **Performance Architecture**

### **1. Caching Strategy**

```mermaid
graph LR
    A[Client Request] --> B[Browser Cache]
    B --> C[CDN Cache]
    C --> D[Application Cache]
    D --> E[Database Cache]
    E --> F[PostgreSQL]
    
    G[Cache Layers]
    G --> G1[Static Assets]
    G --> G2[API Responses]
    G --> G3[Database Queries]
    G --> G4[Session Data]
```

#### **Cache Implementation**
- **Browser Cache**: Static assets, CSS, JS
- **Application Cache**: API responses, user sessions
- **Database Cache**: Query results, connection pooling
- **CDN**: Static asset delivery

---

### **2. Scalability Architecture**

```mermaid
graph TB
    subgraph "Load Balancer"
        LB[Nginx/HAProxy]
    end
    
    subgraph "Application Servers"
        AS1[Node.js Server 1]
        AS2[Node.js Server 2]
        AS3[Node.js Server N]
    end
    
    subgraph "Database Cluster"
        DB1[Primary PostgreSQL]
        DB2[Read Replica 1]
        DB3[Read Replica 2]
    end
    
    subgraph "External Services"
        Redis[Redis Cache]
        S3[File Storage]
        SES[Email Service]
    end
    
    LB --> AS1
    LB --> AS2
    LB --> AS3
    
    AS1 --> DB1
    AS2 --> DB1
    AS3 --> DB1
    
    AS1 --> DB2
    AS2 --> DB2
    AS3 --> DB2
    
    AS1 --> Redis
    AS2 --> Redis
    AS3 --> Redis
    
    AS1 --> S3
    AS2 --> S3
    AS3 --> S3
```

---

## 🔌 **Integration Architecture**

### **1. API Architecture**

```mermaid
graph TD
    subgraph "API Gateway"
        A[Express.js Router]
        B[Middleware Stack]
        C[Error Handling]
    end
    
    subgraph "API Layers"
        D[Authentication API]
        E[User Management API]
        F[Inventory API]
        G[Donor API]
        H[Request API]
        I[Notification API]
    end
    
    subgraph "External APIs"
        J[Email Gateway]
        K[SMS Gateway]
        L[Payment Gateway]
        M[Analytics API]
    end
    
    A --> D
    A --> E
    A --> F
    A --> G
    A --> H
    A --> I
    
    I --> J
    I --> K
    F --> L
    A --> M
```

#### **API Design Principles**
- **RESTful Design**: Standard HTTP methods
- **JSON Format**: Consistent data exchange
- **Version Control**: API versioning strategy
- **Documentation**: OpenAPI/Swagger specs
- **Error Handling**: Standardized error responses

---

### **2. Microservices Architecture (Future)**

```mermaid
graph TB
    subgraph "API Gateway"
        GW[Kong/Nginx Gateway]
    end
    
    subgraph "Core Services"
        AUTH[Authentication Service]
        USER[User Service]
        DONOR[Donor Service]
        HOSP[Hospital Service]
        INV[Inventory Service]
        REQ[Request Service]
        NOTIF[Notification Service]
    end
    
    subgraph "Support Services"
        LOG[Logging Service]
        MON[Monitoring Service]
        CACHE[Cache Service]
        QUEUE[Message Queue]
    end
    
    subgraph "Data Layer"
        USER_DB[(User DB)]
        DONOR_DB[(Donor DB)]
        INV_DB[(Inventory DB)]
        REQ_DB[(Request DB)]
        NOTIF_DB[(Notification DB)]
    end
    
    GW --> AUTH
    GW --> USER
    GW --> DONOR
    GW --> HOSP
    GW --> INV
    GW --> REQ
    GW --> NOTIF
    
    AUTH --> USER_DB
    USER --> USER_DB
    DONOR --> DONOR_DB
    HOSP --> USER_DB
    INV --> INV_DB
    REQ --> REQ_DB
    NOTIF --> NOTIF_DB
    
    AUTH --> LOG
    USER --> LOG
    DONOR --> LOG
    HOSP --> LOG
    INV --> LOG
    REQ --> LOG
    NOTIF --> LOG
```

---

## 📱 **Mobile Architecture**

### **1. Responsive Design**

```mermaid
graph LR
    subgraph "Device Breakpoints"
        A[Mobile: 320-768px]
        B[Tablet: 768-1024px]
        C[Desktop: 1024px+]
    end
    
    subgraph "UI Adaptations"
        D[Touch-Friendly]
        E[Simplified Navigation]
        F[Collapsible Menus]
        G[Optimized Forms]
    end
    
    A --> D
    A --> E
    B --> F
    C --> G
```

---

## 🔄 **Deployment Architecture**

### **1. Development Environment**

```mermaid
graph TB
    subgraph "Local Development"
        A[React Dev Server:3000]
        B[Node.js Server:5000]
        C[PostgreSQL:5432]
        D[Redis:6379]
    end
    
    subgraph "Development Tools"
        E[Hot Reload]
        F[Source Maps]
        G[Debug Mode]
        H[Mock Data]
    end
    
    A --> E
    B --> F
    C --> G
    D --> H
```

### **2. Production Environment**

```mermaid
graph TB
    subgraph "Web Server"
        A[Nginx Reverse Proxy]
        B[SSL Termination]
        C[Static File Serving]
    end
    
    subgraph "Application Servers"
        D[PM2 Process Manager]
        E[Node.js Cluster]
        F[Health Checks]
    end
    
    subgraph "Database"
        G[PostgreSQL Primary]
        H[Read Replicas]
        I[Backup Storage]
    end
    
    subgraph "Monitoring"
        J[Application Metrics]
        K[Database Monitoring]
        L[Error Tracking]
    end
    
    A --> D
    D --> G
    E --> H
    F --> I
    D --> J
    G --> K
    E --> L
```

---

## 📈 **Monitoring & Analytics Architecture**

### **1. Application Monitoring**

```mermaid
graph TD
    A[Application Metrics] --> B[Performance Monitoring]
    A --> C[Error Tracking]
    A --> D[User Analytics]
    
    B --> E[Response Times]
    B --> F[Throughput]
    B --> G[Resource Usage]
    
    C --> H[Exception Logs]
    C --> I[Error Rates]
    C --> J[Stack Traces]
    
    D --> K[User Sessions]
    D --> L[Feature Usage]
    D --> M[Conversion Rates]
```

---

## 🔮 **Future Architecture Enhancements**

### **1. AI/ML Integration**

```mermaid
graph LR
    subgraph "AI/ML Services"
        A[Demand Forecasting]
        B[Donor Matching]
        C[Inventory Optimization]
        D[Risk Assessment]
    end
    
    subgraph "Data Pipeline"
        E[Data Collection]
        F[Feature Engineering]
        G[Model Training]
        H[Prediction API]
    end
    
    A --> E
    B --> F
    C --> G
    D --> H
```

### **2. Real-time Features**

```mermaid
graph TB
    subgraph "Real-time Infrastructure"
        A[WebSocket Server]
        B[Message Queue]
        C[Event Bus]
        D[Push Notifications]
    end
    
    subgraph "Real-time Features"
        E[Live Inventory Updates]
        F[Real-time Notifications]
        G[Live Chat Support]
        H[Emergency Alerts]
    end
    
    A --> E
    B --> F
    C --> G
    D --> H
```

---

## 📋 **Architecture Decision Records**

### **Key Decisions**

| Decision | Rationale | Alternatives Considered |
|-----------|-----------|----------------------|
| **React + Material-UI** | Rapid development, component-based, good ecosystem | Angular, Vue.js, Custom CSS |
| **PostgreSQL** | ACID compliance, JSON support, scalability | MySQL, MongoDB, NoSQL |
| **JWT Authentication** | Stateless, scalable, mobile-friendly | Session-based, OAuth 2.0 |
| **RESTful API** | Standard, well-understood, tooling support | GraphQL, gRPC |
| **UUID Primary Keys** | Distributed, secure, non-sequential | Auto-increment integers |
| **Sequelize ORM** | Type safety, migrations, relationships | Raw SQL, TypeORM |

---

## 🎯 **System Quality Attributes**

### **Non-Functional Requirements**

| Attribute | Target | Measurement |
|-----------|---------|--------------|
| **Performance** | <200ms response time | API response monitoring |
| **Availability** | 99.9% uptime | Health checks, monitoring |
| **Scalability** | 1000+ concurrent users | Load testing |
| **Security** | Zero data breaches | Security audits |
| **Usability** | 90% user satisfaction | User feedback |
| **Maintainability** | <2 days for bug fixes | Code metrics |
| **Portability** | Cloud-agnostic | Containerization |

---

*Last Updated: February 2026*
*Architecture Version: 1.0.0*
