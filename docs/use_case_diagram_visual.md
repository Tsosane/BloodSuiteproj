# Blood Suite System - Visual Use Case Diagram

## 🎭 ASCII Use Case Diagram

```
                    ┌─────────────────────────────────────────────────────────────────────┐
                    │                     BLOOD SUITE SYSTEM                             │
                    └─────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
        ┌───────────────────────┐              ┌──────────────────────────────┐
        │   HOSPITAL STAFF      │              │  BLOOD BANK MANAGER         │
        │        🏥              │              │            🏢                │
        └─────────┬─────────────┘              └──────────┬──────────────────┘
                  │                                              │
                  ▼                                              ▼
        ┌───────────────────────┐              ┌──────────────────────────────┐
        │ REQUEST BLOOD / EMERGENCIES │      │ MANAGE INVENTORY & PROCESS REQUESTS │
        └─────────────┬─────────┘              └───────────┬──────────────────┘
                      │                                         │
                      ▼                                         ▼
             ┌───────────────────────┐              ┌──────────────────────────────┐
             │      FULFILLMENT      │              │       GENERATE REPORTS      │
             └───────────────────────┘              └───────────┬──────────────────┘
                                                                  │
                                                                  ▼
                                                     ┌──────────────────────────────┐
                                                     │     SYSTEM ADMINISTRATOR     │
                                                     │             ⚙️               │
                                                     └──────────────────────────────┘
```

## 🎯 Detailed Component Breakdown

### **🧑‍⚕️ Donors (Mobile App; Not Web Actor)**
```
Note: Donor actions (profile, scheduling, certificates, and donor notifications) are handled in the mobile app.
The web suite uses donor data internally for availability and emergency matching/notifications.
```

### **🏥 Hospital Staff Actor**
```
🏥 HOSPITAL STAFF
├── 🔐 LOGIN SYSTEM
│   └── Email/Password + Hospital Code
├── 👥 MANAGE PATIENTS
│   ├── Patient Registration
│   ├── Medical Records
│   └── Blood Type Information
├── 🩸 REQUEST BLOOD
│   ├── Specify Blood Type
│   ├── Set Urgency Level
│   └── Patient Information
├── 📦 VIEW INVENTORY
│   ├── Available Blood Types
│   ├── Stock Levels
│   └── Delivery Status
└── 🚨 MANAGE EMERGENCIES
    ├── Submit Urgent Requests
    ├── Track Priority Status
    └── Emergency Protocols
```

### **🏢 Blood Bank Manager Actor**
```
🏢 BLOOD BANK MANAGER
├── 🔐 LOGIN SYSTEM
│   └── Email/Password + Employee ID
├── 📦 MANAGE INVENTORY
│   ├── Monitor Stock Levels
│   ├── Set Thresholds
│   └── Track Expiration
├── 📋 PROCESS REQUESTS
│   ├── Review Hospital Requests
│   ├── Approve/Deny Based on Availability
│   └── Coordinate Delivery
├── 👥 MANAGE DONOR DATA
│   ├── Donor Database & Availability
│   ├── Eligibility/Status Tracking
│   └── Retention & Activity Analytics
└── 📊 GENERATE REPORTS
    ├── Inventory Status
    ├── Donor Activity (Internal)
    └── Performance Metrics
```

### **⚙️ System Administrator Actor**
```
⚙️ SYSTEM ADMINISTRATOR
├── 🔐 LOGIN SYSTEM
│   └── Email/Password + Admin Code
├── 🛠️ MANAGE SYSTEM
│   ├── System Configuration
│   ├── Security Settings
│   └── Maintenance Scheduling
├── 👥 MANAGE USERS
│   ├── Create User Accounts
│   ├── Manage Permissions
│   └── Monitor Activity
├── 💊 MONITOR HEALTH
│   ├── Database Performance
│   ├── API Response Times
│   └── Storage Capacity
└── 📊 GENERATE REPORTS
    ├── System Performance
    ├── User Activity
    └── Security Audits
```

## 🔄 System Interaction Flow

### **Primary User Journey**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   HOSPITAL  │───▶│  BLOOD BANK │───▶│   HOSPITAL  │
│   STAFF     │    │   MANAGER   │    │   STAFF     │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ REQUEST     │    │ PROCESS     │    │ RECEIVE     │
│ BLOOD       │    │ REQUESTS    │    │ TRANSFUSION │
└─────────────┘    └─────────────┘    └─────────────┘
```

### **System Administration Flow**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   SYSTEM    │◀───│   SYSTEM    │◀───│   SYSTEM    │
│   ADMIN     │    │   HEALTH    │    │   MONITOR   │
│             │    │   ISSUES    │    │   ALERTS    │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ MAINTENANCE │    │ USER        │    │ PERFORMANCE │
│ SCHEDULE    │    │ MANAGEMENT  │    │ OPTIMIZATION│
└─────────────┘    └─────────────┘    └─────────────┘
```

## 🎨 Visual Legend

| Symbol | Meaning |
|---------|---------|
| 🏥 | Hospital Staff Actor |
| 🏢 | Blood Bank Manager Actor |
| ⚙️ | System Administrator Actor |
| 🔐 | Authentication |
| 👤 | Profile/User Management |
| 📅 | Scheduling |
| 📊 | Reporting/Analytics |
| 📦 | Inventory Management |
| 🩸 | Blood Requests |
| 🚨 | Emergency Management |
| 🛠️ | System Configuration |
| 💊 | Health Monitoring |
| ───▶ | Primary Flow Direction |
| ◀─── | Feedback/Monitoring Flow |

## 📋 Use Case Summary

| Actor | Total Use Cases | Critical | High | Medium | Low |
|--------|----------------|-----------|-------|--------|------|
| Hospital Staff | 5 | 2 | 2 | 1 | 0 |
| Blood Bank Manager | 5 | 2 | 2 | 1 | 0 |
| System Administrator | 5 | 1 | 2 | 1 | 1 |
| **TOTAL** | **15** | **5** | **6** | **3** | **1** |
        
---

**This visual use case diagram provides a clear, comprehensive overview of all user interactions within the Blood Suite management system, showing the relationships between actors, their use cases, and system workflows.**
