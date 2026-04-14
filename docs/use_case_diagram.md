# Blood Suite System - Use Case Diagram

## 🎯 System Overview
The Blood Suite Management System is a comprehensive blood bank management platform that connects donors, hospitals, blood bank managers, and system administrators in a seamless digital ecosystem.

## 👥 Actors (User Types)

### Primary Actors
1. **Hospital Staff** 🏥 - Medical personnel at hospitals
2. **Blood Bank Manager** 🏢 - Central blood bank operations managers
3. **System Administrator** ⚙️ - IT system administrators

## 🎭 Use Case Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           BLOOD SUITE MANAGEMENT SYSTEM                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                      │
│  │HOSPITAL STAFF│    │BLOOD BANK   │    │SYSTEM ADMIN │                      │
│  │     🏥      │    │   MANAGER   │    │      ⚙️      │                      │
│  └─────────────┘    └─────────────┘    └─────────────┘                      │
│         │                   │                   │                               │
│  ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐                         │
│  │  LOGIN       │    │  LOGIN       │    │  LOGIN       │                         │
│  │  SYSTEM      │    │  SYSTEM      │    │  SYSTEM      │                         │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                         │
│         │                   │                   │                               │
│  ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐                         │
│  │  MANAGE     │    │  MANAGE     │    │  MANAGE     │                         │
│  │  PATIENTS   │    │  INVENTORY  │    │  USERS       │                         │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                         │
│         │                   │                   │                               │
│  ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐                         │
│  │  REQUEST     │    │  PROCESS     │    │  MONITOR     │                         │
│  │  BLOOD       │    │  REQUESTS   │    │  HEALTH      │                         │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                         │
│         │                   │                   │                               │
│  ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐                         │
│  │  MANAGE      │    │  GENERATE    │    │  GENERATE    │                         │
│  │  EMERGENCIES │    │  REPORTS    │    │  REPORTS     │                         │
│  └─────────────┘    └─────────────┘    └─────────────┘                         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 📋 Detailed Use Cases by Actor

Note: Donors are not web-suite end-users; they interact with the **mobile app**. In the web suite, donor information is used internally for **availability tracking and emergency matching/notifications**.

### 🏥 Hospital Staff Use Cases

#### 1. **Login to System** (UC-H01)
- **Description**: Hospital staff authenticates with hospital code
- **Input**: Email, Password, Hospital Code
- **Output**: Access to hospital dashboard

#### 2. **Manage Patients** (UC-H02)
- **Description**: Handle patient information and blood requirements
- **Includes**:
  - Register new patients
  - Update patient medical records
  - Record blood transfusion history
  - Manage patient blood type information

#### 3. **Request Blood** (UC-H03)
- **Description**: Submit blood requests to central blood bank
- **Includes**:
  - Specify blood type and quantity
  - Set urgency level (critical/high/medium/low)
  - Provide patient information
  - Track request status

#### 4. **View Inventory** (UC-H04)
- **Description**: Check available blood inventory
- **Includes**:
  - View real-time blood availability
  - Check blood type compatibility
  - Monitor reservation status
  - View delivery schedules

#### 5. **Manage Emergencies** (UC-H05)
- **Description**: Handle emergency blood requests
- **Includes**:
  - Submit urgent blood requests
  - Receive priority processing
  - Track emergency delivery
  - Update emergency status

### 🏢 Blood Bank Manager Use Cases

#### 1. **Login to System** (UC-B01)
- **Description**: Manager authenticates with employee ID
- **Input**: Email, Password, Employee ID
- **Output**: Access to blood bank management dashboard

#### 2. **Manage Inventory** (UC-B02)
- **Description**: Oversee blood stock levels across all types
- **Includes**:
  - Monitor real-time inventory levels
  - Set minimum/maximum stock thresholds
  - Track blood expiration dates
  - Manage blood distribution

#### 3. **Process Requests** (UC-B03)
- **Description**: Handle and fulfill hospital blood requests
- **Includes**:
  - Review incoming requests
  - Approve/deny requests based on availability
  - Coordinate blood delivery
  - Update request status

#### 4. **Manage Donors** (UC-B04)
- **Description**: Oversee donor data used for availability, eligibility, and emergency matching
- **Includes**:
  - View donor statistics and trends
  - Manage donor eligibility
  - Track donor retention rates

#### 5. **Generate Reports** (UC-B05)
- **Description**: Create operational and analytical reports
- **Includes**:
  - Inventory status reports
  - Donor activity reports
  - Request fulfillment statistics
  - Performance metrics

### ⚙️ System Administrator Use Cases

#### 1. **Login to System** (UC-A01)
- **Description**: Admin authenticates with admin access code
- **Input**: Email, Password, Admin Access Code
- **Output**: Access to system administration dashboard

#### 2. **Manage Users** (UC-A02)
- **Description**: Oversee all system user accounts
- **Includes**:
  - Create new user accounts
  - Manage user permissions
  - Reset user passwords
  - Suspend/activate user accounts
  - Monitor user activity

#### 3. **Monitor System Health** (UC-A03)
- **Description**: Track system performance and status
- **Includes**:
  - Monitor database performance
  - Track API response times
  - Monitor storage capacity
  - Check system uptime
  - Review security logs

#### 4. **Manage System Settings** (UC-A04)
- **Description**: Configure system-wide settings
- **Includes**:
  - Configure backup schedules
  - Manage security settings
  - Update system configurations
  - Manage notification preferences
  - Control system maintenance

#### 5. **Generate Reports** (UC-A05)
- **Description**: Create system-wide analytical reports
- **Includes**:
  - User activity reports
  - System performance reports
  - Security audit reports
  - Usage statistics
  - Compliance reports

##  Interactions Between Use Cases

### Critical Workflows

#### **Emergency Blood Request Workflow**
```
Hospital Staff → Submit Emergency Request → Blood Bank Manager → Priority Processing → Arrange Delivery → Hospital Staff → Receive Blood
```

#### **System Maintenance Workflow**
```
System Admin → Monitor Health → Detect Issues → Schedule Maintenance → Notify Users → Perform Updates → Verify System Health
```

## 🎯 System Boundaries

### **Within System**
- User authentication and authorization
- Blood inventory management
- Request processing and fulfillment
- Donor data availability for emergency matching/notifications (internal)
- System administration and monitoring

### **External Systems**
- Hospital Management Systems (HIS)
- Laboratory Information Systems (LIS)
- National Blood Bank Database
- Emergency Medical Services
- Government Health Agencies

## 📊 Use Case Priority Matrix

| Use Case | Priority | Frequency | Complexity |
|----------|----------|-----------|------------|
| Login System | Critical | Very High | Low |
| Request Blood | Critical | High | Medium |
| Manage Inventory | Critical | High | High |
| Manage Donor Data | High | Medium | Medium |
| Process Requests | Critical | High | High |
| Manage Users | High | Low | Medium |
| Monitor System | Medium | High | Medium |
| Generate Reports | Medium | Low | High |

## 🎨 Implementation Status

### ✅ **Completed Frontend Components**
- **Login System** (`Login.js`) - Multi-role authentication
- **Hospital Dashboard** (`Dashboard.js`) - Hospital staff interface  
- **Blood Bank Manager Dashboard** (`BloodBankManagerDashboard.js`) - Management interface
- **System Admin Dashboard** (`SystemAdminDashboard.js`) - Administration interface

### 🔄 **Ready for Backend Integration**
- All user interfaces are complete
- Role-based access control implemented
- Authentication flow established
- Navigation structure defined

### 📋 **Next Development Steps**
1. API endpoint creation
2. Database schema implementation
3. Role-based permissions enforcement
4. Real-time data integration
5. System testing and validation

---

**This use case diagram provides a comprehensive overview of the Blood Suite system's functionality, covering all user interactions and workflows necessary for a complete blood bank management solution.**
