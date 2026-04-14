# Blood Suite API Guide - Adding Your Own Data

## Database Status
✅ Database: blood_suite_db (PostgreSQL)
✅ Status: Connected and Healthy
✅ Tables: 8 tables created

## Current Test Data
- Users: 3 (admin, hospital, donor)
- Donors: 1 (John Doe - O+)
- Hospitals: 1 (Queen Elizabeth II Hospital)
- Blood Units: 2 (O+, A+)

## Add Your Own Data

### Method 1: Web Interface (Recommended)
1. Visit: http://localhost:3000
2. Login with: admin@bloodsuite.org / Admin123!
3. Use the UI to add:
   - New donors via "Donor Management"
   - Blood inventory via "Blood Inventory"
   - Hospitals via "Settings"

### Method 2: API Endpoints

#### Register New Users
```bash
# Register Hospital User
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"your@hospital.com","password":"YourPassword123!","role":"hospital"}'

# Register Donor User  
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"donor@email.com","password":"DonorPassword123!","role":"donor"}'
```

#### Direct Database Access (Advanced)
If you have PostgreSQL installed, you can connect directly:

```bash
# Connect to database
psql -h localhost -U postgres -d blood_suite_db

# View tables
\dt

# View users
SELECT * FROM users;

# Add donor manually
INSERT INTO donors (user_id, full_name, blood_type, phone, date_of_birth, address)
VALUES ('user-uuid-here', 'Jane Smith', 'A+', '+26612345679', '1985-05-15', '123 Main St, Maseru');
```

## Database Schema
- **users**: Authentication and user roles
- **donors**: Donor profiles and medical info
- **hospitals**: Hospital information
- **blood_inventory**: Blood units and tracking
- **donations**: Donation records
- **requests**: Blood requests
- **notifications**: System notifications

## Next Steps
1. Add your own hospitals and donors
2. Input real blood inventory data
3. Create blood requests
4. Test the full workflow

The system will automatically handle relationships between users, donors, hospitals, and blood inventory.
