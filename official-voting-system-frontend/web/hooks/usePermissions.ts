// web/hooks/usePermissions.ts

import { AdminUser, AdminRole } from '../types';

export interface Permissions {
  canViewDashboard: boolean;
  canViewPositions: boolean;
  canManagePositions: boolean;
  canViewCandidates: boolean;
  canManageCandidates: boolean;
  canViewUsers: boolean;
  canManageUsers: boolean;
  canViewAuditLog: boolean;
  canEditSettings: boolean;
}

export const usePermissions = (user: AdminUser | null): Permissions => {
  const role: AdminRole | null = user?.role || null;

  const isSuperAdmin = role === 'super_admin';
  const isAdmin = role === 'admin';
  const isModerator = role === 'moderator';

  const isAdminOrHigher = isSuperAdmin || isAdmin;
  const isModeratorOrHigher = isAdminOrHigher || isModerator;

  return {
    canViewDashboard: isModeratorOrHigher,
    canViewPositions: isModeratorOrHigher,
    canManagePositions: isAdminOrHigher,
    canViewCandidates: isModeratorOrHigher,
    canManageCandidates: isAdminOrHigher,
    canViewUsers: isSuperAdmin,
    canManageUsers: isSuperAdmin,
    canViewAuditLog: isModeratorOrHigher,
    canEditSettings: isSuperAdmin, // Only super admins can change critical settings
  };
};
