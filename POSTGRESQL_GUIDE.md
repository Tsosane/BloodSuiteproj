# PostgreSQL Database Connection Guide

## Your Database Status
✅ **Database Name**: blood_suite_db
✅ **PostgreSQL Version**: 17 (found at C:\Program Files\PostgreSQL\17\bin\psql.exe)
✅ **Connection**: localhost:5432

## How to Connect to Your Database

### Method 1: Using psql Command Line
```bash
# Navigate to PostgreSQL bin directory
cd "C:\Program Files\PostgreSQL\17\bin"

# Connect to your database (use your PostgreSQL password)
psql -h localhost -U postgres -d blood_suite_db

# When prompted, enter your PostgreSQL password (not the app password)
```

### Method 2: Using Environment Variables
```bash
# Set password in environment variable
set PGPASSWORD=your_postgres_password

# Then connect without password prompt
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -U postgres -d blood_suite_db
```

### Method 3: GUI Tools (Recommended)
- **pgAdmin**: Usually installed with PostgreSQL
- **DBeaver**: Free database manager
- **HeidiSQL**: Free SQL client

## Database Schema (Your Tables)
```sql
-- List all tables
\dt

-- View users
SELECT * FROM users;

-- View donors  
SELECT * FROM donors;

-- View hospitals
SELECT * FROM hospitals;

-- View blood inventory
SELECT * FROM blood_inventory;
```

## Add Your Own Data Examples

### Add New Donor
```sql
INSERT INTO donors (id, user_id, full_name, blood_type, phone, date_of_birth, address, is_available)
VALUES (
    gen_random_uuid(),  -- or provide a specific UUID
    (SELECT id FROM users WHERE email = 'donor@example.com'),
    'Jane Smith',
    'A+',
    '+26612345679',
    '1985-05-15',
    '123 Main St, Maseru, Lesotho',
    true
);
```

### Add New Hospital
```sql
INSERT INTO hospitals (id, user_id, name, license_number, address, phone, is_approved)
VALUES (
    gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'hospital@example.com'),
    'Maseru General Hospital',
    'HOSP-LS-002',
    'Kingsway, Maseru, Lesotho',
    '+26622354678',
    true
);
```

### Add Blood Inventory
```sql
INSERT INTO blood_inventory (id, hospital_id, donor_id, blood_type, quantity_ml, collection_date, expiry_date, status, storage_location)
VALUES (
    gen_random_uuid(),
    (SELECT id FROM hospitals WHERE name = 'Maseru General Hospital'),
    (SELECT id FROM donors WHERE full_name = 'Jane Smith'),
    'O+',
    450,
    '2026-02-08',
    '2026-05-08',
    'available',
    'Refrigerator A1'
);
```

## Next Steps
1. Connect using your PostgreSQL password
2. Browse existing data with SELECT queries
3. Add your own data with INSERT statements
4. Verify data in the web interface at http://localhost:3000

## Important Notes
- Use your **PostgreSQL user password**, not the app passwords
- The database name is `blood_suite_db`
- All relationships are handled automatically by the app
- Web interface will show your changes immediately
