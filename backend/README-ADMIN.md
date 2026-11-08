# SJBU Voting System - Complete Backend
# Zero dependencies - Node.js built-in modules only
# Database: JSON file (persists automatically)

# Admin credentials:
#   superadmin / admin123
#   admin1     / admin123
#   moderator1 / admin123

# Test vouchers:
#   VOUCHER-001 through VOUCHER-005

# Admin API endpoints:
#   GET    /api/app/admin/positions        - List all positions
#   POST   /api/app/admin/positions        - Create position
#   PUT    /api/app/admin/positions/:id    - Update position
#   DELETE /api/app/admin/positions/:id    - Delete position (+ candidates)
#   GET    /api/app/admin/candidates       - List all candidates
#   POST   /api/app/admin/candidate        - Create candidate
#   PUT    /api/app/admin/candidate/:id    - Update candidate
#   DELETE /api/app/admin/candidate/:id    - Delete candidate
#   GET    /api/app/admin/candidate-gallery - Candidate gallery with vote counts
#   POST   /api/app/admin/login            - Admin login
#   GET    /api/app/admin/all              - List admin users
