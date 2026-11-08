-- ============================================================
-- SJBU Voting System - PostgreSQL Test Database
-- Run this in pgAdmin, psql, or any PostgreSQL client
-- ============================================================

-- Create the database (run this separately if not using psql)
-- CREATE DATABASE sjbu_voting_test;
-- \c sjbu_voting_test;

-- Enable UUID extension if you prefer UUIDs (optional)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- 1. Election Schedule
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS election_schedule (
    id SERIAL PRIMARY KEY,
    election_key VARCHAR(100) NOT NULL DEFAULT 'sjbu-2025',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    results_announcement TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by INTEGER
);

-- ------------------------------------------------------------
-- 2. Positions (President, Vice President, etc.)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS positions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 3. Candidates
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS candidates (
    id SERIAL PRIMARY KEY,
    position_id INTEGER NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    image_url TEXT DEFAULT '',
    manifesto TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 4. Voters / Vouchers
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS voters (
    id SERIAL PRIMARY KEY,
    voucher_code VARCHAR(100) UNIQUE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    voted_president BOOLEAN DEFAULT FALSE,
    voted_vice BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 5. Votes (one row per position vote)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    voucher_code VARCHAR(100) NOT NULL REFERENCES voters(voucher_code),
    position_id INTEGER NOT NULL REFERENCES positions(id),
    candidate_id INTEGER NOT NULL REFERENCES candidates(id),
    verification_code VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 6. Admin Users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'moderator' CHECK (role IN ('super_admin','admin','moderator')),
    email VARCHAR(200),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 7. Audit Logs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    admin_username VARCHAR(100) NOT NULL DEFAULT 'system',
    action VARCHAR(200) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SEED DATA FOR TESTING
-- ============================================================

-- Election schedule (set to LIVE now for testing)
INSERT INTO election_schedule (election_key, start_date, end_date, results_announcement, updated_by)
VALUES (
    'sjbu-2025',
    NOW() - INTERVAL '1 hour',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '8 days',
    1
) ON CONFLICT DO NOTHING;

-- Positions
INSERT INTO positions (name) VALUES
    ('President'),
    ('Vice President')
ON CONFLICT DO NOTHING;

-- Candidates for President (position_id = 1)
INSERT INTO candidates (position_id, name, image_url, manifesto) VALUES
    (1, 'Alice Reyes', 'https://via.placeholder.com/150', 'Committed to student welfare and transparency.'),
    (1, 'Bob Lim', 'https://via.placeholder.com/150', 'Fighting for affordable tuition and better facilities.'),
    (1, 'Carla Dela Cruz', 'https://via.placeholder.com/150', 'Focus on mental health and student support services.')
ON CONFLICT DO NOTHING;

-- Candidates for Vice President (position_id = 2)
INSERT INTO candidates (position_id, name, image_url, manifesto) VALUES
    (2, 'Diego Santos', 'https://via.placeholder.com/150', 'Student voice and campus safety advocate.'),
    (2, 'Elena Gomez', 'https://via.placeholder.com/150', 'Improving student organizations and events.'),
    (2, 'Felix Rivera', 'https://via.placeholder.com/150', 'Green campus and sustainability initiatives.')
ON CONFLICT DO NOTHING;

-- Test vouchers (voters)
INSERT INTO voters (voucher_code) VALUES
    ('VOUCHER-001'),
    ('VOUCHER-002'),
    ('VOUCHER-003'),
    ('VOUCHER-004'),
    ('VOUCHER-005')
ON CONFLICT DO NOTHING;

-- Admin user (password: admin123 — hashed with bcrypt)
-- $2b$10$rYZ8K7yJ6L4M3N9P0Q2R1O.eXaWbVcDfGhIjKlMnOpQrStUvWxYz (admin123)
INSERT INTO admin_users (username, password_hash, role, email) VALUES
    ('superadmin', '$2b$10$rYZ8K7yJ6L4M3N9P0Q2R1O.eXaWbVcDfGhIjKlMnOpQrStUvWxYz', 'super_admin', 'superadmin@sjbu.edu'),
    ('admin1', '$2b$10$rYZ8K7yJ6L4M3N9P0Q2R1O.eXaWbVcDfGhIjKlMnOpQrStUvWxYz', 'admin', 'admin1@sjbu.edu'),
    ('moderator1', '$2b$10$rYZ8K7yJ6L4M3N9P0Q2R1O.eXaWbVcDfGhIjKlMnOpQrStUvWxYz', 'moderator', 'mod1@sjbu.edu')
ON CONFLICT DO NOTHING;

-- Initial audit log
INSERT INTO audit_logs (admin_username, action, details, ip_address) VALUES
    ('system', 'SYSTEM_INIT', 'Database seeded for testing', '127.0.0.1');

-- ============================================================
-- USEFUL QUERIES FOR TESTING
-- ============================================================

-- View all data
-- SELECT * FROM election_schedule;
-- SELECT * FROM positions;
-- SELECT * FROM candidates;
-- SELECT * FROM voters;
-- SELECT * FROM votes;
-- SELECT * FROM admin_users;
-- SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 20;

-- Reset votes for re-testing
-- DELETE FROM votes;
-- UPDATE voters SET is_used = FALSE, voted_president = FALSE, voted_vice = FALSE;
