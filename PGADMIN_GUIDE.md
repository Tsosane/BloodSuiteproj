# 🐘 pgAdmin Connection Guide for Blood Suite

## 📋 **Overview**
pgAdmin is a graphical user interface for PostgreSQL database management. This guide will help you connect to your Blood Suite database using pgAdmin.

---

## 🔧 **Step 1: Install pgAdmin**

### **Windows**
1. Download from: https://www.pgadmin.org/download/
2. Run the installer and follow the setup wizard
3. Launch pgAdmin from your Start Menu

### **macOS**
```bash
# Using Homebrew
brew install --cask pgadmin4

# Or download from official site
```

### **Linux (Ubuntu/Debian)**
```bash
# Add repository
curl -fsSL https://www.pgadmin.org/static/packages_pgadmin_org.pub | sudo gpg --dearmor -o /usr/share/keyrings/packages-pgadmin-org.gpg
echo "deb [signed-by=/usr/share/keyrings/packages-pgadmin-org.gpg] https://ftp.postgresql.org/pub/pgadmin/pgadmin4/apt/$(lsb_release -cs) pgadmin4 main" | sudo tee /etc/apt/sources.list.d/pgadmin4.list

# Install
sudo apt update
sudo apt install pgadmin4
```

---

## 🔗 **Step 2: Connect to Blood Suite Database**

### **Method 1: Using Connection Wizard**

1. **Open pgAdmin** and log in with your pgAdmin password
2. **Right-click** on "Servers" in the left panel
3. **Select "Create" → "Server"**
4. **Fill in the connection details:**

#### **General Tab**
```
Name: Blood Suite Database
```

#### **Connection Tab**
```
Host name/address: localhost
Port: 5432
Maintenance database: postgres
Username: postgres
Password: [your PostgreSQL password]
```

5. **Click "Save"** to establish the connection

### **Method 2: Quick Connection**

1. **Click the "Add Server" button** (🔌) in the toolbar
2. **Enter the same connection details** as above
3. **Save** the connection

---

## 🔑 **Step 3: Access Blood Suite Database**

Once connected, you'll see:

```
📁 Servers
  └── 🐘 localhost:5432
      └── 📁 Databases
          ├── 📄 postgres
          ├── 📄 template1
          └── 📄 blood_suite_db  ← YOUR DATABASE
```

**Click on `blood_suite_db`** to explore your Blood Suite data.

---

## 📊 **Step 4: Explore Database Structure**

### **View Tables**
1. **Expand `blood_suite_db`**
2. **Click on "Schemas" → "public" → "Tables"**
3. **You'll see all Blood Suite tables:**

```
📁 blood_suite_db
  └── 📁 Schemas
      └── 📁 public
          └── 📁 Tables
              ├── 📄 blood_inventory
              ├── 📄 donors
              ├── 📄 hospitals
              ├── 📄 notifications
              ├── 📄 requests
              └── 📄 users
```

### **View Table Data**
1. **Right-click on any table**
2. **Select "View/Edit Data" → "All Rows"**
3. **Data will appear in the data grid**

---

## 🛠️ **Step 5: Common Database Operations**

### **Query Tool**
1. **Right-click on `blood_suite_db`**
2. **Select "Query Tool"**
3. **Write SQL queries in the editor**

#### **Example Queries:**
```sql
-- View all users
SELECT * FROM users;

-- View blood inventory by type
SELECT blood_type, SUM(quantity_ml) as total_quantity
FROM blood_inventory
GROUP BY blood_type;

-- View recent notifications
SELECT * FROM notifications
ORDER BY created_at DESC
LIMIT 10;

-- View donor information
SELECT d.full_name, d.blood_type, d.phone, u.email
FROM donors d
JOIN users u ON d.user_id = u.id;
```

### **Add New Data**
```sql
-- Add a new notification
INSERT INTO notifications (type, title, message, recipient, read, created_at)
VALUES ('system', 'Welcome', 'Blood Suite system is running!', 'all', false, NOW());

-- Add a new blood inventory item
INSERT INTO blood_inventory (hospital_id, donor_id, blood_type, quantity_ml, collection_date, expiry_date, status)
VALUES (1, 1, 'O+', 450, CURRENT_DATE, CURRENT_DATE + INTERVAL '42 days', 'available');
```

### **Update Data**
```sql
-- Mark notification as read
UPDATE notifications 
SET read = true 
WHERE id = 1;

-- Update blood quantity
UPDATE blood_inventory 
SET quantity_ml = 500 
WHERE id = 1;
```

---

## 🔍 **Step 6: Database Diagnostics**

### **Check Database Health**
```sql
-- Check table counts
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes
FROM pg_stat_user_tables;

-- Check database size
SELECT pg_size_pretty(pg_database_size('blood_suite_db'));

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public';
```

### **Monitor Connections**
```sql
-- View active connections
SELECT 
  pid,
  datname,
  usename,
  application_name,
  state,
  query
FROM pg_stat_activity
WHERE datname = 'blood_suite_db';
```

---

## 🚨 **Step 7: Troubleshooting Connection Issues**

### **Common Errors & Solutions**

#### **"Connection refused"**
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Start PostgreSQL service
# Windows: Start PostgreSQL service from Services
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

#### **"Password authentication failed"**
1. **Verify PostgreSQL password** in pgAdmin connection
2. **Reset PostgreSQL password** if needed:
```bash
# Connect to PostgreSQL
psql -U postgres

# Change password
ALTER USER postgres PASSWORD 'new_password';
```

#### **"Database does not exist"**
```sql
-- Create the database
CREATE DATABASE blood_suite_db;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE blood_suite_db TO postgres;
```

#### **"Connection timeout"**
1. **Check firewall settings**
2. **Verify PostgreSQL configuration** (`postgresql.conf`)
3. **Ensure port 5432 is open**

---

## 💾 **Step 8: Backup & Restore**

### **Backup Database**
1. **Right-click on `blood_suite_db`**
2. **Select "Backup"**
3. **Choose backup options:**
   - **Format**: Custom or tar
   - **Compression**: gzip
   - **Filename**: `blood_suite_backup.sql`

### **Restore Database**
1. **Right-click on `blood_suite_db`**
2. **Select "Restore"**
3. **Choose your backup file**
4. **Click "Restore"**

---

## 📋 **Step 9: pgAdmin Tips & Tricks**

### **Useful Features**
- **Object Browser**: Navigate database structure
- **SQL Editor**: Write and execute queries
- **Dashboard**: Monitor database performance
- **ERD Tool**: Visualize table relationships
- **Query History**: Reuse previous queries

### **Keyboard Shortcuts**
- **F5**: Execute query
- **Ctrl+N**: New query tab
- **Ctrl+S**: Save query
- **Ctrl+R**: Refresh object browser

### **Custom Settings**
1. **File → Preferences**
2. **Configure:**
   - **Query editor** settings
   - **Display options**
   - **Connection timeouts**
   - **Auto-save settings**

---

## 🔗 **Connection Summary**

### **Connection Details**
```
Host: localhost
Port: 5432
Database: blood_suite_db
Username: postgres
Password: [your PostgreSQL password]
```

### **Alternative Connection Methods**
If pgAdmin doesn't work, try:

#### **DBeaver**
- Download: https://dbeaver.io/
- Same connection details as above

#### **psql (Command Line)**
```bash
psql -h localhost -U postgres -d blood_suite_db
```

---

## 🎯 **Next Steps**

Once connected to pgAdmin, you can:

1. **Explore Data**: Browse all tables and records
2. **Run Queries**: Execute custom SQL queries
3. **Monitor Performance**: Check database health
4. **Manage Data**: Add, edit, delete records
5. **Create Reports**: Export data for analysis
6. **Backup Data**: Regular database backups

---

## 📞 **Need Help?**

- **pgAdmin Documentation**: https://www.pgadmin.org/docs/
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Blood Suite Documentation**: Check other guides in `/docs/`

---

*Last Updated: February 2026*
