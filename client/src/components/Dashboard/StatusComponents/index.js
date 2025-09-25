/**
 * Status & Info Components - Enhanced Dashboard Status Indicators
 * 
 * This module provides a comprehensive set of reusable status components
 * for displaying real-time system information in the dashboard.
 */

// Individual components
export { default as NetworkStatus } from './NetworkStatus';
export { default as UserRoleDisplay } from './UserRoleDisplay';
export { default as LastUpdated } from './LastUpdated';
export { default as ConnectionHealth } from './ConnectionHealth';

// Main container component
export { default as StatusInfoPanel } from './StatusInfoPanel';

// Re-export for backwards compatibility and convenience
export { default } from './StatusInfoPanel';
