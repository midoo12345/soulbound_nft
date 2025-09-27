import React from 'react';

/**
 * Dashboard Actions Configuration
 * Centralized configuration for all dashboard actions
 * Includes role-based permissions and styling
 */

// Action Icons
export const ActionIcons = {
  ViewCertificates: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  IssueCertificate: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  VerifyCertificate: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ManageInstitutions: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Analytics: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  ManageCourses: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  BurnApprovals: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
  )
};

// Role-based permissions
export const RolePermissions = {
  ALL: 'all',
  ADMIN: 'isAdmin',
  INSTITUTION: 'isInstitution'
};

// Action definitions with role-based permissions
export const DASHBOARD_ACTIONS = [
  {
    id: 'view-certificates',
    title: 'View Certificates',
    description: 'Access all certificates',
    to: '/dashboard/certificates',
    icon: <ActionIcons.ViewCertificates />,
    color: 'indigo',
    requiredRoles: [RolePermissions.ALL],
    priority: 1
  },
  {
    id: 'issue-certificate',
    title: 'Issue Certificate',
    description: 'Create new certificate',
    to: '/dashboard/issue',
    icon: <ActionIcons.IssueCertificate />,
    color: 'teal',
    requiredRoles: [RolePermissions.INSTITUTION, RolePermissions.ADMIN],
    priority: 2
  },
  {
    id: 'update-certificate',
    title: 'Update Certificate',
    description: 'Modify existing certificate',
    to: '/dashboard/update',
    icon: <ActionIcons.VerifyCertificate />,
    color: 'blue',
    requiredRoles: [RolePermissions.INSTITUTION, RolePermissions.ADMIN],
    priority: 3
  },
  {
    id: 'manage-institutions',
    title: 'Manage Institutions',
    description: 'Control authorization',
    to: '/dashboard/institutions',
    icon: <ActionIcons.ManageInstitutions />,
    color: 'fuchsia',
    requiredRoles: [RolePermissions.ADMIN],
    priority: 4
  },
  {
    id: 'manage-courses',
    title: 'Manage Courses',
    description: 'Control course data',
    to: '/dashboard/courses',
    icon: <ActionIcons.ManageCourses />,
    color: 'blue',
    requiredRoles: [RolePermissions.INSTITUTION, RolePermissions.ADMIN],
    priority: 5
  },
  {
    id: 'burn-approvals',
    title: 'Burn Approvals',
    description: 'Approve certificate burns',
    to: '/dashboard/burn-approvals',
    icon: <ActionIcons.BurnApprovals />,
    color: 'amber',
    requiredRoles: [RolePermissions.ADMIN],
    priority: 6
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'View detailed metrics',
    to: '/dashboard/analytics',
    icon: <ActionIcons.Analytics />,
    color: 'teal',
    requiredRoles: [RolePermissions.ADMIN, RolePermissions.INSTITUTION],
    priority: 7
  }
];

/**
 * Filter actions based on user roles
 * @param {Object} userRoles - User role object from useWalletRoles hook
 * @param {Array} actions - Array of action configurations
 * @returns {Array} Filtered actions that user has permission to access
 */
export const filterActionsByRole = (userRoles = {}, actions = DASHBOARD_ACTIONS) => {
  return actions
    .filter(action => {
      // Check if user has any of the required roles for this action
      return action.requiredRoles.some(requiredRole => {
        if (requiredRole === RolePermissions.ALL) return true;
        return userRoles[requiredRole] === true;
      });
    })
    .sort((a, b) => a.priority - b.priority); // Sort by priority
};

/**
 * Get action by ID
 * @param {string} actionId - Action identifier
 * @param {Array} actions - Array of action configurations
 * @returns {Object|null} Action configuration or null if not found
 */
export const getActionById = (actionId, actions = DASHBOARD_ACTIONS) => {
  return actions.find(action => action.id === actionId) || null;
};

/**
 * Check if user has permission for specific action
 * @param {string} actionId - Action identifier
 * @param {Object} userRoles - User role object
 * @param {Array} actions - Array of action configurations
 * @returns {boolean} Whether user has permission
 */
export const hasPermissionForAction = (actionId, userRoles = {}, actions = DASHBOARD_ACTIONS) => {
  const action = getActionById(actionId, actions);
  if (!action) return false;
  
  return action.requiredRoles.some(requiredRole => {
    if (requiredRole === RolePermissions.ALL) return true;
    return userRoles[requiredRole] === true;
  });
};

/**
 * Get actions by role
 * @param {string} role - Role name (isAdmin, isInstitution, or 'all')
 * @param {Array} actions - Array of action configurations
 * @returns {Array} Actions available to the specified role
 */
export const getActionsByRole = (role, actions = DASHBOARD_ACTIONS) => {
  return actions.filter(action => 
    action.requiredRoles.includes(role) || 
    action.requiredRoles.includes(RolePermissions.ALL)
  );
};
