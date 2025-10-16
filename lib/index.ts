// Utility exports for easy importing
export { cn } from './utils'

// API utilities
export { apiClient, default as ApiClient } from './api-client'

// Authentication utilities
export { 
  isTokenExpired, 
  getTokenPayload, 
  clearAuthStorage, 
  getValidToken, 
  requireAuth 
} from './auth-utils'

// Validation schemas
export { 
  commonSchemas,
  userValidation,
  hackathonValidation,
  paymentValidation,
  teamValidation,
  getValidationErrors,
  validateWithSchema
} from './validation-schemas'

// Status utilities
export {
  getHackathonStatus,
  getRegistrationStatus,
  getStatusBadgeColor,
  getStatusIcon,
  shouldUpdateHackathonStatuses,
  getBulkStatusUpdates,
  debugHackathonStatus,
  forceStatusCalculation
} from './status-utils'

// Participant utilities
export {
  refreshParticipantCounts,
  refreshHackathonParticipantCount
} from './participant-utils'

// Google configuration
export {
  GOOGLE_CONFIG,
  getGoogleRedirectUri,
  getAllRedirectUris
} from './google-config'

// Scheduling utilities
export {
  runScheduledStatusUpdate,
  handleScheduledWebhook,
  triggerManualUpdate,
  getSchedulingHealthCheck
} from './scheduling-utils'