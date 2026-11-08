# SJBU Voting System - PostgreSQL + Backend Setup Guide

## What was created
- `backend/database.sql`  - PostgreSQL schema + seed data
- `backend/server.js`     - Express backend implementing all frontend API endpoints
- `backend/package.json`  - Node.js dependencies
- `backend/.env.example`  - Backend environment variables

---

## Step 1: Install PostgreSQL

If you don't have PostgreSQL installed:

**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Or use the installer: https://enterprisedb.com/downloads/postgres-postgresql-downloads
- During setup, set a password for the `postgres` user (remember it!)

**Verify installation:**
```bash
psql --version
```

---

## Step 2: Create the database

Open pgAdmin or run in PowerShell/CMD:

```powershell
# Log in as postgres
psql -U postgres

# Inside psql:
CREATE DATABASE sjbu_voting_test;
\q
```

---

## Step 3: Load the schema and seed data

```powershell
psql -U postgres -d sjbu_voting_test -f "C:\Users\banda\OneDrive\Desktop\New folder (2)\backend\database.sql"
```

This creates tables and seeds:
- 2 positions (President, Vice President)
- 6 candidates (3 per position)
- 5 test vouchers: `VOUCHER-001` through `VOUCHER-005`
- Admin users (password: `admin123`)

---

## Step 4: Configure the backend

```powershell
cd "C:\Users\banda\OneDrive\Desktop\New folder (2)\backend"
copy .env.example .env
```

Edit `.env` and set `DB_PASSWORD` to the password you chose during PostgreSQL install.

---

## Step 5: Install and start the backend

```powershell
cd "C:\Users\banda\OneDrive\Desktop\New folder (2)\backend"
npm install
npm start
```

You should see:
```
[DB] Connected to PostgreSQL
[SERVER] Running on http://localhost:3005
[SERVER] API base: http://localhost:3005/api/app
```

Test it: open http://localhost:3005/api/app/health in your browser.

---

## Step 6: Configure the frontend to point to the backend

Create this file:
  `C:\Users\banda\OneDrive\Desktop\New folder (2)\official-voting-system-frontend\web\.env`

```
REACT_APP_API_URL=http://localhost:3005/api/app
```

Then restart the frontend:
```powershell
cd "C:\Users\banda\OneDrive\Desktop\New folder (2)\official-voting-system-frontend\web"
npm install   # if not already installed
npm run dev
```

---

## Step 7: Test the full flow

1. Open the frontend (usually http://localhost:5173)
2. Go to Authentication page
3. Enter a test voucher: `VOUCHER-001`
4. Click "Verify & Proceed"
5. Vote for President and Vice President
6. Submit — you'll get a verification code
7. Try voting again with the same voucher — should get "already used" error

**Admin login** (for dashboard):
- username: `superadmin`, password: `admin123`
- username: `admin1`, password: `admin123`
- username: `moderator1`, password: `admin123`

---

## Useful SQL for testing

```sql
-- See all votes cast
SELECT * FROM votes ORDER BY created_at DESC;

-- Reset all votes to re-test
DELETE FROM votes;
UPDATE voters SET is_used = FALSE, voted_president = FALSE, voted_vice = FALSE;

-- See audit logs
SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 20;

-- Check election schedule
SELECT * FROM election_schedule;
```
