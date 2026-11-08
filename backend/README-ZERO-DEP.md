# SJBU Voting System - Zero-Dependency Backend

## No installation needed!

This backend uses **only Node.js built-in modules** — no `npm install` required.

## Data Storage
Data is stored in JSON files in `backend\data\database.json`

## Setup

### 1. Start the backend
```powershell
cd "C:\Users\banda\OneDrive\Desktop\New folder (2)\backend"
node server.js
```

You should see:
```
[SERVER] Running on http://localhost:3005
[SERVER] API base: http://localhost:3005/api/app
[SERVER] Database: C:\...\backend\data\database.json
```

### 2. Start the frontend
In a **new** PowerShell window:
```powershell
cd "C:\Users\banda\OneDrive\Desktop\New folder (2)\official-voting-system-frontend\web"
npm run dev
```

### 3. Test it
Open **http://localhost:5173** in your browser:
1. Authentication page → enter voucher: `VOUCHER-001`
2. Click "Verify & Proceed"
3. Vote for President and Vice President
4. Submit — you'll get a verification code

**Admin login:** `superadmin` / `admin123`

---

## Test Vouchers
- `VOUCHER-001` through `VOUCHER-005`

## When you install PostgreSQL later
You can switch back to the PostgreSQL version. The JSON database is separate and won't interfere.
