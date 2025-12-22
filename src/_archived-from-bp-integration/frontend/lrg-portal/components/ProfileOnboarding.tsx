import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Info } from 'lucide-react';
import { OnboardingTour, TourTrigger } from './OnboardingTour';
import { profileTourConfig } from './tour-configs';
import { useTourState } from '../hooks/useTourState';

interface ProfileOnboardingProps {
  userId: string;
  showTourButton?: boolean;
}

/**
 * Profile Onboarding Component
 * Provides inline help and tour trigger for profile management
 */
export function ProfileOnboarding({ userId, showTourButton = true }: ProfileOnboardingProps) {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const tourState = useTourState('profile-welcome', userId);

  const handleCloseTour = () => {
    setIsTourOpen(false);
    tourState.markSkipped();
  };

  const handleCompleteTour = () => {
    setIsTourOpen(false);
    tourState.markCompleted();
  };

  // Don't show if tour was completed
  if (tourState.completed) return null;

  return (
    <>
      <Alert className="bg-blue-50 border-blue-200 mb-6">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-blue-900">
            <strong>New to your portal?</strong> Take a quick tour to learn how to manage your profile and biolink.
          </span>
          {showTourButton && (
            <TourTrigger
              onStartTour={() => setIsTourOpen(true)}
              label="Start Tour"
              className="ml-4"
            />
          )}
        </AlertDescription>
      </Alert>

      <OnboardingTour
        config={profileTourConfig}
        isOpen={isTourOpen}
        onClose={handleCloseTour}
        onComplete={handleCompleteTour}
      />
    </>
  );
}
