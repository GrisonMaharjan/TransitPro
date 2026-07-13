/**
 * @deprecated This file is deprecated. Use the following instead:
 * - Import apiClient from './api/apiClient'
 * - Import auth functions from './api/authservice'
 * - Import specific services from './api/*service'
 * - All API endpoints are now organized in separate files under ./api/
 */

console.warn('[DEPRECATED] src/services/api.js is deprecated. Use individual service files instead.');

// For backward compatibility, re-export from the new locations
export { default as default } from './api/apiClient';
export { login, register } from './api/authservice';