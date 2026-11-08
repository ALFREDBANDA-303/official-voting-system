# SJBU Voting System - SQLite Backend Setup (No PostgreSQL needed!)

## What changed
- Backend now uses **SQLite** instead of PostgreSQL
- Zero installation required for the database
- Data stored in: `backend\sjbu_voting.db`
- Same API endpoints - frontend needs no changes

## Setup Steps

### 1. Install backend dependencies
```powershell
cd "C:\Users\banda\OneDrive\Desktop\New folder (2)\backend"
npm install
```

### 2. Initialize the database (creates the .db file + seed data)
```powershell
npm run init-db
```

### 3. Start the backend
```powershell
npm start
```

You should see:
```
[SERVER] Running on http://localhost:3005
[SERVER] API base: http://localhost:3005/api/app
[SERVER] Database: C:\...\backend\sjbu_voting.db
```

### 4. Start the frontend
In a **new** PowerShell window:
```powershell
cd "C:\Users\banda\OneDrive\Desktop\New folder (2)\official-voting-system-frontend\web"
npm run dev
```

### 5. Test it
Open **http://localhost:5173** in your browser:
1. Authentication page → enter voucher: `VOUCHER-001`
2. Click "Verify & Proceed"
3. Vote for President and Vice President
4. Submit — you'll get a verification code

**Admin login:** `superadmin` / `admin123`

---

## When you install PostgreSQL later

You can switch back to the PostgreSQL version by:
1. Restoring the original `server.js` and `package.json` (PostgreSQL version)
2. Running `database.sql` against PostgreSQL
3. Updating `backend\.env` with your PostgreSQL credentials

The SQLite database file (`sjbu_voting.db`) is separate and won't interfere.
