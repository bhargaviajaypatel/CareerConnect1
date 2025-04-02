/**
 * Role constants for the application
 * Keep in sync with backend security configuration
 */
export const ROLES = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  STUDENT: 'STUDENT',
  RECRUITER: 'RECRUITER',
  GUEST: 'GUEST'
};

/**
 * Role display names for UI rendering
 */
export const ROLE_NAMES = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.STAFF]: 'Staff Member',
  [ROLES.STUDENT]: 'Student',
  [ROLES.RECRUITER]: 'Recruiter',
  [ROLES.GUEST]: 'Guest'
};

/**
 * Role hierarchy - higher index means higher privileges
 * Used for comparing role levels
 */
export const ROLE_LEVELS = {
  [ROLES.GUEST]: 0,
  [ROLES.STUDENT]: 1,
  [ROLES.RECRUITER]: 2,
  [ROLES.STAFF]: 3,
  [ROLES.ADMIN]: 4
};

/**
 * Check if a user has minimum required role level
 * @param {string} userRole - Current user's role
 * @param {string} requiredRole - Minimum required role
 * @returns {boolean} True if user has required role level
 */
export const hasMinimumRole = (userRole, requiredRole) => {
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[requiredRole];
};

export default ROLES; 