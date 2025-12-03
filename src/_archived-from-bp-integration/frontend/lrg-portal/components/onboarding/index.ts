/**
 * FRS Onboarding System
 *
 * Central export for all onboarding and tour components.
 * Import this in other plugins to use the unified tour system.
 *
 * @example
 * ```tsx
 * // In frs-wp-users or frs-partnership-portal:
 * import {
 *   OnboardingTour,
 *   TourTrigger,
 *   WelcomeOnboarding,
 *   useTourState,
 *   profileTourConfig
 * } from 'frs-lrg/src/frontend/portal/components/onboarding';
 * ```
 */

// Core tour components
export { OnboardingTour, TourTrigger } from '../OnboardingTour';
export type { TourConfig, TourStep } from '../OnboardingTour';

// Pre-built onboarding components
export { WelcomeOnboarding } from '../WelcomeOnboarding';
export { ProfileOnboarding } from '../ProfileOnboarding';
export { CalendarOnboarding } from '../CalendarOnboarding';

// Tour configurations
export {
  profileTourConfig,
  calendarTourConfig,
  biolinkTourConfig,
  partnershipTourConfig,
  welcomeTourConfig,
  getTourConfig,
} from '../tour-configs';

// State management hooks
export {
  useTourState,
  useFirstTimeTour,
  useActiveTour,
} from '../../hooks/useTourState';
export type { TourState } from '../../hooks/useTourState';
