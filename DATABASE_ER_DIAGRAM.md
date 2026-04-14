# 🗄️ Blood Suite Database Schema for ER Diagram

## 📋 **Complete Database Information**

This document provides comprehensive database schema details for creating an Entity-Relationship (ER) diagram for the Blood Suite system.

---

## 🏗️ **Database Overview**

- **Database Name**: `blood_suite_db`
- **Database Type**: PostgreSQL 12+
- **ORM**: Sequelize.js
- **Total Tables**: 6 core tables
- **Relationships**: One-to-One, One-to-Many, Many-to-Many

---

## 📊 **Table Schemas**

### **1. users** (Primary Authentication Table)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('donor', 'hospital', 'admin') DEFAULT 'donor',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Constraints
CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
```

**Attributes:**
- `id` (UUID, PK) - Primary key
- `email` (VARCHAR, UNIQUE, NOT NULL) - User email address
- `password` (VARCHAR, NOT NULL) - Hashed password (bcrypt)
- `role` (ENUM, NOT NULL) - User role: donor/hospital/admin
- `is_active` (BOOLEAN) - Account status
- `last_login` (TIMESTAMP) - Last login timestamp
- `created_at` (TIMESTAMP) - Record creation time
- `updated_at` (TIMESTAMP) - Record update time

---

### **2. donors** (Donor Profile Table)

```sql
CREATE TABLE donors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    address TEXT NOT NULL,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    last_donation_date DATE,
    next_eligible_date DATE,
    is_available BOOLEAN DEFAULT true,
    health_status TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Constraints
CONSTRAINT donors_phone_check CHECK (phone ~* '^[\+]?[1-9][\d]{0,15}$')
CONSTRAINT donors_name_length CHECK (LENGTH(full_name) >= 2 AND LENGTH(full_name) <= 100)
```

**Attributes:**
- `id` (UUID, PK) - Primary key
- `user_id` (UUID, FK, UNIQUE, NOT NULL) - References users.id
- `full_name` (VARCHAR, NOT NULL) - Donor's full name
- `blood_type` (ENUM, NOT NULL) - ABO blood group with Rh factor
- `phone` (VARCHAR, NOT NULL) - Contact phone number
- `date_of_birth` (DATE, NOT NULL) - Date of birth
- `address` (TEXT, NOT NULL) - Physical address
- `location_lat` (DECIMAL) - GPS latitude
- `location_lng` (DECIMAL) - GPS longitude
- `last_donation_date` (DATE) - Last blood donation date
- `next_eligible_date` (DATE) - Next eligible donation date
- `is_available` (BOOLEAN) - Donation availability status
- `health_status` (TEXT) - Health status notes
- `emergency_contact_name` (VARCHAR) - Emergency contact
- `emergency_contact_phone` (VARCHAR) - Emergency contact phone
- `created_at` (TIMESTAMP) - Record creation time
- `updated_at` (TIMESTAMP) - Record update time

---

### **3. hospitals** (Hospital Profile Table)

```sql
CREATE TABLE hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    contact_person VARCHAR(255),
    contact_person_phone VARCHAR(20),
    is_approved BOOLEAN DEFAULT false,
    capacity_beds INTEGER,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Constraints
CONSTRAINT hospitals_name_length CHECK (LENGTH(name) >= 2 AND LENGTH(name) <= 200)
CONSTRAINT hospitals_email_check CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
```

**Attributes:**
- `id` (UUID, PK) - Primary key
- `user_id` (UUID, FK, UNIQUE, NOT NULL) - References users.id
- `name` (VARCHAR, NOT NULL) - Hospital name
- `license_number` (VARCHAR, UNIQUE, NOT NULL) - Medical license number
- `address` (TEXT, NOT NULL) - Hospital address
- `phone` (VARCHAR, NOT NULL) - Contact phone number
- `email` (VARCHAR) - Hospital email address
- `location_lat` (DECIMAL) - GPS latitude
- `location_lng` (DECIMAL) - GPS longitude
- `contact_person` (VARCHAR) - Primary contact person
- `contact_person_phone` (VARCHAR) - Contact person phone
- `is_approved` (BOOLEAN) - Approval status
- `capacity_beds` (INTEGER) - Hospital bed capacity
- `description` (TEXT) - Hospital description
- `created_at` (TIMESTAMP) - Record creation time
- `updated_at` (TIMESTAMP) - Record update time

---

### **4. blood_inventory** (Blood Units Table)

```sql
CREATE TABLE blood_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    donor_id UUID REFERENCES donors(id) ON DELETE SET NULL,
    blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    quantity_ml INTEGER NOT NULL CHECK (quantity_ml >= 1 AND quantity_ml <= 500),
    collection_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE NOT NULL,
    status ENUM('available', 'reserved', 'transfused', 'expired', 'discarded') DEFAULT 'available',
    blood_group VARCHAR(3),
    rh_factor ENUM('positive', 'negative'),
    storage_location VARCHAR(255),
    notes TEXT,
    tested_for TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_blood_inventory_type ON blood_inventory(blood_type);
CREATE INDEX idx_blood_inventory_expiry ON blood_inventory(expiry_date);
CREATE INDEX idx_blood_inventory_status ON blood_inventory(status);
```

**Attributes:**
- `id` (UUID, PK) - Primary key
- `hospital_id` (UUID, FK, NOT NULL) - References hospitals.id
- `donor_id` (UUID, FK) - References donors.id (nullable)
- `blood_type` (ENUM, NOT NULL) - ABO blood group with Rh factor
- `quantity_ml` (INTEGER, NOT NULL) - Blood quantity in milliliters
- `collection_date` (DATE) - Blood collection date
- `expiry_date` (DATE, NOT NULL) - Blood expiry date
- `status` (ENUM, NOT NULL) - Blood unit status
- `blood_group` (VARCHAR) - ABO blood group (derived)
- `rh_factor` (ENUM) - Rh factor (derived)
- `storage_location` (VARCHAR) - Storage location details
- `notes` (TEXT) - Additional notes
- `tested_for` (TEXT[]) - Tests performed array
- `created_at` (TIMESTAMP) - Record creation time
- `updated_at` (TIMESTAMP) - Record update time

---

### **5. requests** (Blood Request Table)

```sql
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    quantity_ml INTEGER NOT NULL CHECK (quantity_ml >= 1),
    urgency ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('pending', 'approved', 'fulfilled', 'cancelled', 'expired') DEFAULT 'pending',
    patient_name VARCHAR(255),
    patient_age INTEGER,
    patient_gender ENUM('male', 'female', 'other'),
    medical_condition TEXT,
    required_date DATE,
    fulfilled_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_requests_hospital ON requests(hospital_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_urgency ON requests(urgency);
```

**Attributes:**
- `id` (UUID, PK) - Primary key
- `hospital_id` (UUID, FK, NOT NULL) - References hospitals.id
- `blood_type` (ENUM, NOT NULL) - Required blood type
- `quantity_ml` (INTEGER, NOT NULL) - Required quantity in milliliters
- `urgency` (ENUM, NOT NULL) - Request urgency level
- `status` (ENUM, NOT NULL) - Request status
- `patient_name` (VARCHAR) - Patient name
- `patient_age` (INTEGER) - Patient age
- `patient_gender` (ENUM) - Patient gender
- `medical_condition` (TEXT) - Medical condition details
- `required_date` (DATE) - Required by date
- `fulfilled_date` (TIMESTAMP) - Fulfillment timestamp
- `notes` (TEXT) - Additional notes
- `created_at` (TIMESTAMP) - Record creation time
- `updated_at` (TIMESTAMP) - Record update time

---

### **6. notifications** (Notification Table)

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type ENUM('system', 'critical', 'emergency', 'donor_match', 'expiring_soon', 'donation_reminder', 'request_update') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    read BOOLEAN DEFAULT false,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    action_required BOOLEAN DEFAULT false,
    action_url VARCHAR(500),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_recipient ON notifications(recipient);
```

**Attributes:**
- `id` (UUID, PK) - Primary key
- `type` (ENUM, NOT NULL) - Notification type
- `title` (VARCHAR, NOT NULL) - Notification title
- `message` (TEXT, NOT NULL) - Notification message
- `recipient` (VARCHAR, NOT NULL) - Recipient identifier
- `read` (BOOLEAN) - Read status
- `priority` (ENUM, NOT NULL) - Priority level
- `action_required` (BOOLEAN) - Action required flag
- `action_url` (VARCHAR) - Action URL
- `expires_at` (TIMESTAMP) - Expiration timestamp
- `created_at` (TIMESTAMP) - Record creation time
- `updated_at` (TIMESTAMP) - Record update time

---

## 🔗 **Relationships Summary**

### **One-to-One Relationships**
- `users (1) ↔ (1) donors` - Each donor has exactly one user account
- `users (1) ↔ (1) hospitals` - Each hospital has exactly one user account

### **One-to-Many Relationships**
- `hospitals (1) → (*) blood_inventory` - Hospital can have many blood units
- `donors (1) → (*) blood_inventory` - Donor can donate many blood units
- `hospitals (1) → (*) requests` - Hospital can make many requests
- `users (1) → (*) notifications` - User can receive many notifications

### **Many-to-Many Relationships** (Potential Future)
- `donors ↔ requests` (Through fulfillment table)
- `hospitals ↔ hospitals` (Through transfer table)

---

## 📐 **ER Diagram Notation Guide**

### **Entity Representation**
```
[Table Name]
├── PK: Primary Key (🔑)
├── FK: Foreign Key (🔗)
├── NN: Not Null (❗)
├── UQ: Unique (🔒)
└── DF: Default Value (📋)
```

### **Relationship Cardinality**
- `1` - One
- `*` - Many
- `0..1` - Zero or One
- `1..*` - One or More

### **Data Types**
- `UUID` - Universally Unique Identifier
- `VARCHAR(n)` - Variable character string
- `TEXT` - Long text
- `INTEGER` - Whole number
- `DECIMAL(p,s)` - Decimal number with precision
- `DATE` - Date only
- `TIMESTAMP` - Date and time
- `BOOLEAN` - True/False
- `ENUM(...)` - Enumeration
- `ARRAY[]` - Array of values

---

## 🎨 **ER Diagram Creation Tools**

### **Recommended Tools**
1. **draw.io** (Free) - https://app.diagrams.net/
2. **Lucidchart** (Freemium) - https://www.lucidchart.com/
3. **dbdiagram.io** (Free) - https://dbdiagram.io/
4. **pgAdmin ERD Tool** (Built-in)
5. **MySQL Workbench** (Free)
6. **Microsoft Visio** (Paid)

### **ER Diagram Syntax (dbdiagram.io)**
```
Table users {
  id uuid PK
  email varchar(255) UQ NN
  password varchar(255) NN
  role enum NN
  is_active boolean
  last_login timestamp
  created_at timestamp
  updated_at timestamp
}

Table donors {
  id uuid PK
  user_id uuid FK UQ NN
  full_name varchar(100) NN
  blood_type enum NN
  phone varchar(20) NN
  date_of_birth date NN
  address text NN
  // ... other fields
}

Table hospitals {
  id uuid PK
  user_id uuid FK UQ NN
  name varchar(200) NN
  license_number varchar(50) UQ NN
  // ... other fields
}

Table blood_inventory {
  id uuid PK
  hospital_id uuid FK NN
  donor_id uuid FK
  blood_type enum NN
  quantity_ml integer NN
  // ... other fields
}

Table requests {
  id uuid PK
  hospital_id uuid FK NN
  blood_type enum NN
  quantity_ml integer NN
  // ... other fields
}

Table notifications {
  id uuid PK
  type enum NN
  title varchar(255) NN
  message text NN
  // ... other fields
}

// Relationships
users ||--o{ donors : "has"
users ||--o{ hospitals : "has"
hospitals ||--o{ blood_inventory : "owns"
donors ||--o{ blood_inventory : "donates"
hospitals ||--o{ requests : "makes"
```

---

## 📊 **Database Statistics**

### **Table Sizes (Estimated)**
- `users`: ~1KB per record
- `donors`: ~500B per record
- `hospitals`: ~800B per record
- `blood_inventory`: ~1KB per record
- `requests`: ~1KB per record
- `notifications`: ~800B per record

### **Indexes**
- **Primary Keys**: All tables (UUID)
- **Foreign Keys**: 5 foreign key indexes
- **Performance Indexes**: 6 additional indexes
- **Total Indexes**: 11 indexes

### **Constraints**
- **Primary Keys**: 6 (one per table)
- **Foreign Keys**: 5
- **Unique Constraints**: 4
- **Check Constraints**: 8
- **Not Null Constraints**: 25+

---

## 🔧 **Database Creation Script**

```sql
-- Create database
CREATE DATABASE blood_suite_db;

-- Connect to database
\c blood_suite_db;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create all tables (see individual table schemas above)

-- Create relationships
ALTER TABLE donors ADD CONSTRAINT fk_donor_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE hospitals ADD CONSTRAINT fk_hospital_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE blood_inventory ADD CONSTRAINT fk_inventory_hospital 
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE;

ALTER TABLE blood_inventory ADD CONSTRAINT fk_inventory_donor 
  FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE SET NULL;

ALTER TABLE requests ADD CONSTRAINT fk_request_hospital 
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE;
```

---

## 🎯 **ER Diagram Best Practices**

### **Layout Suggestions**
1. **Central Entity**: Place `users` table in center
2. **Left Side**: `donors` and related entities
3. **Right Side**: `hospitals` and related entities
4. **Bottom**: Transactional tables (`blood_inventory`, `requests`)
5. **Top**: System tables (`notifications`)

### **Color Coding**
- **Blue**: User authentication tables
- **Green**: Profile tables (donors, hospitals)
- **Orange**: Transaction tables (inventory, requests)
- **Purple**: System tables (notifications)

### **Relationship Lines**
- **Solid lines**: Mandatory relationships
- **Dashed lines**: Optional relationships
- **Crow's foot**: Many side
- **Single line**: One side

---

## 📝 **Notes for ER Diagram**

1. **UUID Primary Keys**: All tables use UUID for better scalability
2. **Soft Deletes**: No physical delete, use status fields instead
3. **Audit Fields**: All tables have `created_at` and `updated_at`
4. **Data Validation**: Extensive constraints and validations
5. **Indexing Strategy**: Optimized for common query patterns
6. **Security**: Passwords are hashed, sensitive data protected

---

*Last Updated: February 2026*
*Database Version: 1.0.0*
