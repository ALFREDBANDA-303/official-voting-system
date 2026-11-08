/**
 * SJBU Voting System - Complete Working Backend with Admin CRUD
 * Zero dependencies - Node.js built-in modules only
 * SQL-style JSON database (persists between restarts)
 * Admin can: add/modify/delete positions, candidates, view gallery
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 3005;
const API_PREFIX = '/api/app';
const dataDir = path.join(__dirname, 'data');
const dbFile = path.join(dataDir, 'database.json');

// ============================================================
// UUID & Hash helpers
// ============================================================
function generateUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateVerificationCode() {
  return 'VOTE-' + generateUuid().substring(0, 8).toUpperCase();
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// ============================================================
// Database (JSON file - persists automatically)
// ============================================================
function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function loadDb() {
  ensureDataDir();
  if (!fs.existsSync(dbFile)) return getEmptyDb();
  try {
    return JSON.parse(fs.readFileSync(dbFile, 'utf8'));
  } catch (e) { return getEmptyDb(); }
}

function saveDb(db) {
  ensureDataDir();
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
}

function getEmptyDb() {
  return {
    election_schedule: [],
    positions: [],
    candidates: [],
    voters: [],
    votes: [],
    admin_users: [],
    audit_logs: [],
  };
}

let db = loadDb();
let dirty = false;
setInterval(() => { if (dirty) { saveDb(db); dirty = false; console.log('[DB] Auto-saved'); } }, 5000);

function seedData() {
  let changed = false;
  if (db.election_schedule.length === 0) {
    const now = new Date();
    db.election_schedule.push({ id: 1, election_key: 'sjbu-2025', start_date: new Date(now.getTime() - 3600000).toISOString(), end_date: new Date(now.getTime() + 7 * 86400000).toISOString(), results_announcement: new Date(now.getTime() + 8 * 86400000).toISOString(), updated_at: new Date().toISOString(), updated_by: 1 });
    changed = true;
  }
  if (db.positions.length === 0) {
    db.positions.push({ id: 1, name: 'President', created_at: new Date().toISOString() }, { id: 2, name: 'Vice President', created_at: new Date().toISOString() });
    changed = true;
  }
  if (db.candidates.length === 0) {
    const cands = [
      { id: 1, position_id: 1, name: 'Alice Reyes', image_url: 'https://via.placeholder.com/150', manifesto: 'Committed to student welfare.', created_at: new Date().toISOString() },
      { id: 2, position_id: 1, name: 'Bob Lim', image_url: 'https://via.placeholder.com/150', manifesto: 'Fighting for affordable tuition.', created_at: new Date().toISOString() },
      { id: 3, position_id: 1, name: 'Carla Dela Cruz', image_url: 'https://via.placeholder.com/150', manifesto: 'Focus on mental health.', created_at: new Date().toISOString() },
      { id: 4, position_id: 2, name: 'Diego Santos', image_url: 'https://via.placeholder.com/150', manifesto: 'Student voice advocate.', created_at: new Date().toISOString() },
      { id: 5, position_id: 2, name: 'Elena Gomez', image_url: 'https://via.placeholder.com/150', manifesto: 'Improving student organizations.', created_at: new Date().toISOString() },
      { id: 6, position_id: 2, name: 'Felix Rivera', image_url: 'https://via.placeholder.com/150', manifesto: 'Green campus initiatives.', created_at: new Date().toISOString() },
    ];
    db.candidates.push(...cands);
    changed = true;
  }
  if (db.voters.length === 0) {
    for (let i = 1; i <= 5; i++) db.voters.push({ id: i, voucher_code: 'VOUCHER-0' + i, is_used: 0, voted_president: 0, voted_vice: 0, created_at: new Date().toISOString() });
    changed = true;
  }
  if (db.admin_users.length === 0) {
    const h = hashPassword('admin123');
    db.admin_users.push(
      { id: 1, username: 'superadmin', password_hash: h, role: 'super_admin', email: 'superadmin@sjbu.edu', is_active: 1, last_login: null, created_at: new Date().toISOString() },
      { id: 2, username: 'admin1', password_hash: h, role: 'admin', email: 'admin1@sjbu.edu', is_active: 1, last_login: null, created_at: new Date().toISOString() },
      { id: 3, username: 'moderator1', password_hash: h, role: 'moderator', email: 'mod1@sjbu.edu', is_active: 1, last_login: null, created_at: new Date().toISOString() }
    );
    changed = true;
  }
  if (db.audit_logs.length === 0) {
    db.audit_logs.push({ id: 1, admin_username: 'system', action: 'SYSTEM_INIT', details: 'Database seeded', ip_address: '127.0.0.1', timestamp: new Date().toISOString() });
    changed = true;
  }
  if (changed) { dirty = true; saveDb(db); console.log('[DB] Seeded and saved'); } else { console.log('[DB] Already has data'); }
}
seedData();

// ============================================================
// HTTP helpers
// ============================================================
let currentOrigin = '*';

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': currentOrigin || '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => { try { resolve(body ? JSON.parse(body) : {}); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}

let reqUrl = '';
function match(p) { return reqUrl === p || reqUrl === p + '/'; }
function matchId(p) { const m = reqUrl.match(new RegExp('^' + p + '/([^/]+)/?$')); return m ? m[1] : null; }

// ============================================================
// HTTP Server
// ============================================================
const server = http.createServer(async (req, res) => {
  reqUrl = req.url;
  currentOrigin = req.headers.origin || '*';

  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': currentOrigin, 'Access-Control-Allow-Credentials': 'true', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
    res.end();
    return;
  }

  console.log('[API] ' + req.method + ' ' + reqUrl);

  try {
    // ===== HEALTH =====
    if (match(API_PREFIX + '/health') && req.method === 'GET') return sendJson(res, 200, { status: 'ok', database: 'connected', type: 'sql-json-file' });

    // ===== ELECTION SCHEDULE =====
    if (match(API_PREFIX + '/election/schedule') && req.method === 'GET') {
      const s = db.election_schedule[db.election_schedule.length - 1];
      if (!s) return sendJson(res, 404, { error: 'No election schedule found' });
      return sendJson(res, 200, { electionKey: s.election_key, startDate: s.start_date, endDate: s.end_date, resultsAnnouncement: s.results_announcement, updatedAt: s.updated_at, updatedBy: s.updated_by });
    }
    if (match(API_PREFIX + '/election/schedule') && req.method === 'POST') {
      const b = await readBody(req);
      const id = db.election_schedule.length > 0 ? Math.max(...db.election_schedule.map(x => x.id)) + 1 : 1;
      db.election_schedule.push({ id, election_key: 'sjbu-2025', start_date: b.startDate, end_date: b.endDate, results_announcement: b.resultsAnnouncement || null, updated_at: new Date().toISOString(), updated_by: 1 });
      dirty = true;
      return sendJson(res, 200, db.election_schedule[db.election_schedule.length - 1]);
    }

    // ===== POSITIONS & CANDIDATES (Public) =====
    if (match(API_PREFIX + '/election/positions') && req.method === 'GET') {
      const result = db.positions.map(p => ({ id: p.id, name: p.name, candidates: db.candidates.filter(c => c.position_id === p.id).map(c => ({ id: c.id, name: c.name, positionId: c.position_id, manifesto: c.manifesto || '', imageUrl: c.image_url || '' })) }));
      return sendJson(res, 200, { positions: result });
    }

    // ===== VOTER LOGIN =====
    if (match(API_PREFIX + '/login') && req.method === 'POST') {
      const b = await readBody(req);
      if (!b.voucher) return sendJson(res, 400, { error: 'Voucher code required' });
      const v = db.voters.find(x => x.voucher_code === b.voucher);
      if (!v) return sendJson(res, 401, { error: 'Invalid voucher code' });
      if (v.is_used && v.voted_president && v.voted_vice) return sendJson(res, 409, { error: 'Voucher already used for both positions' });
      return sendJson(res, 200, { success: true, voucher: b.voucher });
    }

    // ===== VOTE =====
    if (match(API_PREFIX + '/vote') && req.method === 'POST') {
      const b = await readBody(req);
      if (!b.voucher || !b.presidentCandidateId || !b.vicePresidentCandidateId) return sendJson(res, 400, { error: 'Missing fields' });
      const v = db.voters.find(x => x.voucher_code === b.voucher);
      if (!v) return sendJson(res, 401, { error: 'Invalid voucher code' });
      if (v.voted_president || v.voted_vice) return sendJson(res, 409, { error: 'Already voted for a position' });
      if (v.voted_president && v.voted_vice) return sendJson(res, 409, { error: 'Voucher fully used' });

      const pp = db.positions.find(p => p.name === 'President');
      const vp = db.positions.find(p => p.name === 'Vice President');
      const pc = db.candidates.find(c => c.id == b.presidentCandidateId && c.position_id === pp.id);
      const vc = db.candidates.find(c => c.id == b.vicePresidentCandidateId && c.position_id === vp.id);
      if (!pc) return sendJson(res, 400, { error: 'Invalid president candidate' });
      if (!vc) return sendJson(res, 400, { error: 'Invalid vice president candidate' });

      const code = generateVerificationCode();
      const now = new Date().toISOString();
      db.votes.push({ id: db.votes.length + 1, voucher_code: b.voucher, position_id: pp.id, candidate_id: parseInt(b.presidentCandidateId), verification_code: code, created_at: now });
      db.votes.push({ id: db.votes.length + 1, voucher_code: b.voucher, position_id: vp.id, candidate_id: parseInt(b.vicePresidentCandidateId), verification_code: code, created_at: now });
      v.is_used = 1; v.voted_president = 1; v.voted_vice = 1;
      dirty = true;
      return sendJson(res, 200, { data: { verificationCode: code, message: 'Vote recorded', presidentVote: { verification_code: code }, vicePresidentVote: { verification_code: code } } });
    }

    // ===== ADMIN SIGN-UP (mock) =====
    if (match(API_PREFIX + '/admin/sign-upload') && req.method === 'POST') return sendJson(res, 200, { signature: 'mock', timestamp: Math.floor(Date.now() / 1000), cloudName: 'sjbu', apiKey: 'mock', folder: 'sjbu' });

    // ===== ADMIN LOGIN =====
    if (match(API_PREFIX + '/admin/login') && req.method === 'POST') {
      const b = await readBody(req);
      if (!b.email || !b.password) return sendJson(res, 400, { error: 'Email and password required' });
      const a = db.admin_users.find(u => u.email === b.email || u.username === b.email);
      if (!a || !a.is_active) return sendJson(res, 401, { error: 'Invalid username or password' });
      if (hashPassword(b.password) !== a.password_hash) return sendJson(res, 401, { error: 'Invalid username or password' });
      a.last_login = new Date().toISOString();
      dirty = true;
      return sendJson(res, 200, { admin: { id: a.id, username: a.username, role: a.role, email: a.email, isActive: a.is_active, lastLogin: a.last_login, createdAt: a.created_at } });
    }

    // ===== ADMIN - POSITIONS CRUD =====
    // GET all positions
    if (match(API_PREFIX + '/admin/positions') && req.method === 'GET') {
      const result = db.positions.map(p => ({ id: p.id, name: p.name, created_at: p.created_at, candidate_count: db.candidates.filter(c => c.position_id === p.id).length }));
      return sendJson(res, 200, { positions: result });
    }

    // CREATE position
    if (match(API_PREFIX + '/admin/positions') && req.method === 'POST') {
      const b = await readBody(req);
      if (!b.name) return sendJson(res, 400, { error: 'Position name required' });
      const id = db.positions.length > 0 ? Math.max(...db.positions.map(p => p.id)) + 1 : 1;
      db.positions.push({ id, name: b.name, created_at: new Date().toISOString() });
      dirty = true;
      return sendJson(res, 201, { position: db.positions[db.positions.length - 1] });
    }

    // UPDATE position
    if (matchId(API_PREFIX + '/admin/positions') && req.method === 'PUT') {
      const id = parseInt(matchId(API_PREFIX + '/admin/positions'));
      const b = await readBody(req);
      const p = db.positions.find(x => x.id === id);
      if (!p) return sendJson(res, 404, { error: 'Position not found' });
      if (b.name !== undefined) p.name = b.name;
      dirty = true;
      return sendJson(res, 200, { position: p });
    }

    // DELETE position (and its candidates)
    if (matchId(API_PREFIX + '/admin/positions') && req.method === 'DELETE') {
      const id = parseInt(matchId(API_PREFIX + '/admin/positions'));
      const pIdx = db.positions.findIndex(x => x.id === id);
      if (pIdx === -1) return sendJson(res, 404, { error: 'Position not found' });
      db.positions.splice(pIdx, 1);
      db.candidates = db.candidates.filter(c => c.position_id !== id);
      dirty = true;
      return sendJson(res, 200, { success: true, message: 'Position and its candidates deleted' });
    }

    // ===== ADMIN - CANDIDATES CRUD =====
    // GET all candidates (with position info)
    if (match(API_PREFIX + '/admin/candidates') && req.method === 'GET') {
      const result = db.candidates.map(c => {
        const p = db.positions.find(x => x.id === c.position_id);
        return { id: c.id, position_id: c.position_id, position_name: p ? p.name : 'Unknown', name: c.name, image_url: c.image_url, manifesto: c.manifesto || '', created_at: c.created_at };
      });
      return sendJson(res, 200, { candidates: result });
    }

    // CREATE candidate
    if (match(API_PREFIX + '/admin/candidate') && req.method === 'POST') {
      const b = await readBody(req);
      if (!b.name || !b.positionId) return sendJson(res, 400, { error: 'Name and positionId required' });
      const id = db.candidates.length > 0 ? Math.max(...db.candidates.map(c => c.id)) + 1 : 1;
      db.candidates.push({ id, position_id: parseInt(b.positionId), name: b.name, image_url: b.imageUrl || '', manifesto: b.manifesto || '', created_at: new Date().toISOString() });
      dirty = true;
      return sendJson(res, 201, { candidate: db.candidates[db.candidates.length - 1] });
    }

    // UPDATE candidate
    if (matchId(API_PREFIX + '/admin/candidate') && req.method === 'PUT') {
      const id = parseInt(matchId(API_PREFIX + '/admin/candidate'));
      const b = await readBody(req);
      const c = db.candidates.find(x => x.id === id);
      if (!c) return sendJson(res, 404, { error: 'Candidate not found' });
      if (b.name !== undefined) c.name = b.name;
      if (b.positionId !== undefined) c.position_id = parseInt(b.positionId);
      if (b.imageUrl !== undefined) c.image_url = b.imageUrl;
      if (b.manifesto !== undefined) c.manifesto = b.manifesto;
      dirty = true;
      return sendJson(res, 200, { candidate: c });
    }

    // DELETE candidate
    if (matchId(API_PREFIX + '/admin/candidate') && req.method === 'DELETE') {
      const id = parseInt(matchId(API_PREFIX + '/admin/candidate'));
      const cIdx = db.candidates.findIndex(x => x.id === id);
      if (cIdx === -1) return sendJson(res, 404, { error: 'Candidate not found' });
      db.candidates.splice(cIdx, 1);
      dirty = true;
      return sendJson(res, 200, { success: true, message: 'Candidate deleted' });
    }

    // ===== ADMIN - CANDIDATE GALLERY =====
    if (match(API_PREFIX + '/admin/candidate-gallery') && req.method === 'GET') {
      const gallery = db.positions.map(p => ({
        position_id: p.id,
        position_name: p.name,
        candidates: db.candidates.filter(c => c.position_id === p.id).map(c => ({
          id: c.id,
          name: c.name,
          image_url: c.image_url || '',
          manifesto: c.manifesto || '',
          vote_count: db.votes.filter(v => v.candidate_id === c.id).length,
        }))
      }));
      return sendJson(res, 200, { gallery });
    }

    // ===== ADMIN USERS =====
    if (match(API_PREFIX + '/admin/all') && req.method === 'GET') return sendJson(res, 200, { admins: db.admin_users.map(u => ({ id: u.id, username: u.username, role: u.role, email: u.email, isActive: u.is_active, lastLogin: u.last_login, createdAt: u.created_at })) });

    // ===== AUDIT LOGS =====
    if (match(API_PREFIX + '/audit/logs') && req.method === 'GET') {
      const limit = parseInt(reqUrl.split('limit=')[1]?.split('&')[0]) || 50;
      const offset = parseInt(reqUrl.split('offset=')[1]?.split('&')[0]) || 0;
      const logs = [...db.audit_logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(offset, offset + limit).map(l => ({ id: l.id, adminUsername: l.admin_username, action: l.action, details: l.details, ipAddress: l.ip_address, timestamp: l.timestamp }));
      return sendJson(res, 200, { success: true, data: { logs } });
    }

    // ===== STATS =====
    if (match(API_PREFIX + '/stats/overall') && req.method === 'GET') {
      const tv = db.voters.length, vc = db.votes.length, tp = db.positions.length, tc = db.candidates.length;
      const pws = db.positions.map(p => {
        const cs = db.candidates.filter(c => c.position_id === p.id);
        const tot = db.votes.filter(v => { const c = db.candidates.find(cd => cd.id === v.candidate_id); return c && c.position_id === p.id; }).length;
        return { positionId: p.id, positionName: p.name, totalCandidates: cs.length, totalVotes: tot, voterTurnout: tv > 0 ? (tot / 2 / tv) * 100 : 0, candidates: cs.map(c => { const vc2 = db.votes.filter(v => v.candidate_id === c.id).length; return { candidateId: c.id, candidateName: c.name, manifesto: c.manifesto, voteCount: vc2, votePercentage: tot > 0 ? ((vc2 / tot) * 100).toFixed(2) : '0.00' }; }).sort((a, b) => b.voteCount - a.voteCount) };
      });
      let mv = null, lv = null;
      if (pws.length > 0) { const s = [...pws].sort((a, b) => b.totalVotes - a.totalVotes); mv = s[0].positionName; lv = s[s.length - 1].positionName; }
      return sendJson(res, 200, { data: { totalVoters: tv, totalVotesCast: vc, voterTurnout: tv > 0 ? (vc / 2 / tv) * 100 : 0, positionsWithStats: pws, overallStats: { totalPositions: tp, totalCandidates: tc, averageVotesPerPosition: tp > 0 ? vc / tp : 0, mostVotedPosition: mv, leastVotedPosition: lv } } });
    }
    if (match(API_PREFIX + '/stats/trends') && req.method === 'GET') {
      const t = {};
      db.votes.forEach(v => { const h = new Date(v.created_at).getHours(); t[h] = (t[h] || 0) + 1; });
      return sendJson(res, 200, { data: { hourlyPattern: Object.entries(t).sort(([a],[b]) => a - b).map(([h, c]) => ({ hour: parseInt(h), votes_count: c })) } });
    }

    return sendJson(res, 404, { error: 'Not found: ' + reqUrl });
  } catch (e) {
    console.error(e);
    sendJson(res, 500, { error: e.message });
  }
});

server.listen(PORT, () => {
  console.log('');
  console.log('===========================================');
  console.log(' SJBU Voting System - BACKEND RUNNING');
  console.log('===========================================');
  console.log(' Server:   http://localhost:' + PORT);
  console.log(' API base: http://localhost:' + PORT + API_PREFIX);
  console.log(' Database: ' + dbFile + ' (JSON file - persists data)');
  console.log(' Voters:   ' + db.voters.length + ' (' + db.voters.map(v => v.voucher_code).join(', ') + ')');
  console.log(' Admin:    superadmin / admin123');
  console.log('           admin1     / admin123');
  console.log('           moderator1 / admin123');
  console.log('===========================================');
  console.log('');
});

module.exports = server;
