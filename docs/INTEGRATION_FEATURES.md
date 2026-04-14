# Blood Suite – Integration Features

This document describes the three integration features: **automated email/SMS notifications**, **hospital information systems (HIS) integration**, and **geolocation-based donor matching** for emergency requests.

---

## 1. Automated Email and SMS Notifications

### Setup

- **Email**: Set in `.env`:
  - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`
  - Optional: `EMAIL_FROM`, `EMAIL_SECURE=true` for port 465
- **SMS**: Set in `.env`:
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` (e.g. `+26612345678`)

If email or SMS is not configured, the server still runs; send attempts are skipped and logged.

### API

- **`GET /api/notifications/config`**  
  Returns `{ email: boolean, sms: boolean }` indicating whether each channel is configured.

- **`POST /api/notifications/send`**  
  Send a templated notification.

  Body:
  - `template` (required): `donation_reminder` | `low_stock` | `emergency_request` | `request_fulfilled`
  - `toEmail`, `toPhone` (optional)
  - Any extra fields needed by the template (e.g. `donorName`, `hospitalName`, `bloodType`, `quantity`)

  Example – emergency request:
  ```json
  {
    "template": "emergency_request",
    "toEmail": "donor@example.com",
    "toPhone": "+26612345678",
    "donorName": "John",
    "bloodType": "O+",
    "quantity": 2,
    "hospitalName": "Queen Elizabeth II",
    "requiredBy": "ASAP"
  }
  ```

### Templates

| Template             | Use case                    | Data fields (examples)                          |
|----------------------|-----------------------------|-------------------------------------------------|
| `donation_reminder`  | Donor eligible again        | `donorName`                                     |
| `low_stock`          | Low inventory alert         | `bloodType`, `hospitalName`, `level`            |
| `emergency_request`  | Urgent blood needed         | `donorName`, `bloodType`, `quantity`, `hospitalName`, `requiredBy` |
| `request_fulfilled`  | Request completed           | `bloodType`, `quantity`, `hospitalName`         |

---

## 2. Hospital Information Systems (HIS) Integration

Hospitals can register an integration so Blood Suite can exchange data with their HIS (e.g. receive blood requests via webhook).

### Register integration

- **`POST /api/integrations/register`**

  Body:
  - `hospital_id` (required): UUID of the hospital
  - `system_type` (optional): e.g. `REST`, `HL7_FHIR`, `CUSTOM`
  - `webhook_url` (optional): URL where Blood Suite can send alerts/updates
  - `metadata` (optional): JSON for facility IDs, auth headers, etc.

  Response includes a one-time `api_key`. Store it securely; it is used in the `X-API-Key` header for the webhook and for future API calls.

### Get integration

- **`GET /api/integrations?hospital_id=<uuid>`**  
  Returns the active integration for that hospital (no API key in response).

### Inbound webhook (HIS → Blood Suite)

- **`POST /api/integrations/webhook`**

  Headers:
  - `X-API-Key` or `X-Integration-Secret`: the API key returned at registration

  Body:
  - `hospital_id` (optional): must match the integration if present
  - `event`: e.g. `blood_request`
  - `payload`: event data

  Example – blood request from HIS:
  ```json
  {
    "event": "blood_request",
    "payload": {
      "blood_type": "O+",
      "quantity_ml": 2,
      "urgency": "critical",
      "notes": "Emergency surgery"
    }
  }
  ```

  The server responds with `202` and a summary of the received request. You can then use **emergency request** or **donors/nearby** to match donors.

---

## 3. Geolocation-Based Donor Matching (Emergency Requests)

Donors with `location_lat` and `location_lng` can be queried by proximity. Emergency requests can return nearby matched donors and optionally trigger email/SMS.

### Donor location

- Donor create/update APIs accept **`location_lat`** and **`location_lng`** (decimal degrees).
- Only donors with non-null coordinates and `is_available: true` are included in nearby/emergency matching.

### Nearby donors

- **`GET /api/donors/nearby`**

  Query:
  - `lat`, `lng` (required): center point
  - `blood_type` (optional): filter by type
  - `radius_km` (optional, default 50, max 200)
  - `limit` (optional, default 20, max 100)

  Response: list of donors with a **`distance_km`** field, sorted by distance (nearest first).

### Emergency request (create + match + optional notify)

- **`POST /api/requests/emergency`**

  Body:
  - `hospital_id`, `hospital_name` (optional)
  - `lat`, `lng` (optional): if provided, matching is by distance
  - `blood_type`, `quantity_ml` (required)
  - `urgency`, `notes`, `required_by` (optional)
  - `notify_donors` (optional, default `false`): if `true`, send `emergency_request` template to the first 10 matched donors (email and/or SMS when configured)

  Response:
  - `request`: summary of the request
  - `matched_donors`: list of donors (with `distance_km` when `lat`/`lng` provided)
  - `matched_count`
  - `notification_results`: present only if `notify_donors` was `true`

---

## Summary of New/Updated Endpoints

| Method | Path | Purpose |
|--------|------|--------|
| GET | `/api/notifications/config` | Check email/SMS configuration |
| POST | `/api/notifications/send` | Send templated email/SMS |
| GET | `/api/donors/nearby` | Donors near a point (geolocation) |
| POST | `/api/requests/emergency` | Emergency request + matched donors + optional notify |
| POST | `/api/integrations/register` | Register HIS integration (returns API key) |
| GET | `/api/integrations` | Get integration by `hospital_id` |
| POST | `/api/integrations/webhook` | Inbound webhook from HIS |

Donor **POST/PUT** now accept **`location_lat`** and **`location_lng`** for geolocation matching.

---

## How to use and test

### Prerequisites

1. **Backend running**  
   From the project root:
   ```bash
   cd backend
   npm run dev
   ```
   Server should be at `http://localhost:5000` (or your `PORT` in `.env`).

2. **Optional: email/SMS**  
   - Email: set `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS` (and optionally `EMAIL_PORT`, `EMAIL_FROM`) in `backend/.env`.  
   - SMS: set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` in `backend/.env`.  
   If you don’t set these, the APIs still work; send attempts will be skipped and you’ll see `success: false` for that channel in responses.

3. **Get a hospital ID** (for HIS integration tests)  
   After the backend has run at least once (with test data), call **`GET /api/hospitals`** and use the `id` of the first hospital. Or in PostgreSQL: `SELECT id, name FROM hospitals LIMIT 1;`

---

### 1. Notifications

**Check if email/SMS are configured**
```bash
curl http://localhost:5000/api/notifications/config
```
Expected: `{ "success": true, "data": { "email": true/false, "sms": true/false } }`.

**Send a test notification (no real send if not configured)**
```bash
curl -X POST http://localhost:5000/api/notifications/send ^
  -H "Content-Type: application/json" ^
  -d "{\"template\":\"donation_reminder\",\"toEmail\":\"your@email.com\",\"toPhone\":\"+26612345678\",\"donorName\":\"Test Donor\"}"
```
Use your real email/phone if you want to receive it. Replace `^` with `\` on Linux/macOS.

**PowerShell**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/notifications/send" -Method Post -ContentType "application/json" -Body '{"template":"donation_reminder","toEmail":"your@email.com","donorName":"Test Donor"}'
```

---

### 2. Geolocation donor matching

**Register a donor with location** (so “nearby” has data)
```bash
curl -X POST http://localhost:5000/api/donors ^
  -H "Content-Type: application/json" ^
  -d "{\"full_name\":\"Nearby Donor\",\"blood_type\":\"O+\",\"phone\":\"+26612345678\",\"email\":\"nearby@test.com\",\"location_lat\":-29.31,\"location_lng\":27.48}"
```

**Get donors near a point** (Maseru area: lat -29.31, lng 27.48)
```bash
curl "http://localhost:5000/api/donors/nearby?lat=-29.31&lng=27.48&blood_type=O%2B&radius_km=50"
```
You should see donors with `distance_km` in the response.

**Emergency request (match donors, no notification)**
```bash
curl -X POST http://localhost:5000/api/requests/emergency ^
  -H "Content-Type: application/json" ^
  -d "{\"hospital_name\":\"Test Hospital\",\"lat\":-29.31,\"lng\":27.48,\"blood_type\":\"O+\",\"quantity_ml\":2,\"urgency\":\"critical\"}"
```
Response includes `matched_donors` and `matched_count`.

**Emergency request and notify donors** (sends email/SMS if configured)
```bash
curl -X POST http://localhost:5000/api/requests/emergency ^
  -H "Content-Type: application/json" ^
  -d "{\"hospital_name\":\"Test Hospital\",\"lat\":-29.31,\"lng\":27.48,\"blood_type\":\"O+\",\"quantity_ml\":2,\"notify_donors\":true}"
```

---

### 3. Hospital integration (HIS)

**Get a hospital ID**
```bash
curl http://localhost:5000/api/hospitals
```
Use the `id` of any hospital in the response (e.g. the first one). With test data you’ll see “Queen Elizabeth II Hospital”.

**Register an integration** (replace `YOUR_HOSPITAL_UUID` with the real UUID)
```bash
curl -X POST http://localhost:5000/api/integrations/register ^
  -H "Content-Type: application/json" ^
  -d "{\"hospital_id\":\"YOUR_HOSPITAL_UUID\",\"system_type\":\"REST\",\"webhook_url\":\"https://your-his.example.com/webhook\"}"
```
Copy the `api_key` from the response; it’s only shown once.

**Get integration**
```bash
curl "http://localhost:5000/api/integrations?hospital_id=YOUR_HOSPITAL_UUID"
```

**Simulate HIS sending a blood request (webhook)**  
Replace `YOUR_API_KEY` with the key from the register response.
```bash
curl -X POST http://localhost:5000/api/integrations/webhook ^
  -H "Content-Type: application/json" ^
  -H "X-API-Key: YOUR_API_KEY" ^
  -d "{\"event\":\"blood_request\",\"payload\":{\"blood_type\":\"O+\",\"quantity_ml\":2,\"urgency\":\"critical\"}}"
```
Expected: `202` and a body with `received: true` and request summary.

---

### Run the test script (all features)

A script is provided that calls the APIs and prints results. It does **not** require email/SMS to be configured.

1. Backend must be running (`npm run dev` in `backend`).
2. From project root:
   ```bash
   node backend/scripts/test-integration-features.js
   ```
   Or from `backend`: `node scripts/test-integration-features.js`.

The script will:
- Check notification config.
- Try sending a templated notification (may report “not configured”).
- Get or create a hospital ID, register an integration, and call the webhook.
- Call donors/nearby and requests/emergency and print matched donors.

You can open `backend/scripts/test-integration-features.js` and change `BASE_URL` if your server uses a different port or host.
