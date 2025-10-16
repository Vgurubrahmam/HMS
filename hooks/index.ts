// Common hooks
export { useApiData, useMutation } from './use-api-data'
export { useToast, toast } from './use-toast'
export { useIsMobile } from './use-mobile'

// Authentication hooks
export { useCurrentUser } from './use-current-user'
export { useTokenExpiration } from './use-token-expiration'
export { useAuthRedirect, useRequireAuth, useRequireLogin } from './use-auth-redirect'

// Data hooks
export { useUsers } from './use-users'
export { useHackathons } from './use-hackathons'
export { useRegistrations } from './use-registrations'
export { usePayments } from './use-payments'
export { useTeams } from './use-teams'
export { useCertificates } from './use-certificates'
export { useMessages } from './use-messages'
export { useAnalytics } from './use-analytics'

// Feature-specific hooks
export { 
  useHackathonStatus, 
  useRegistrationStatus,
  useHackathonStatuses,
  useRegistrationStatuses,
  useLiveDashboardStats,
  useDeadlineAlerts
} from './use-live-status'

export { useTeamGuidance } from './use-team-guidance'
export { useMentorHackathons } from './use-mentor-hackathons'