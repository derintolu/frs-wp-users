import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle2, Circle } from 'lucide-react';
import { OnboardingTour } from './OnboardingTour';
import { calendarTourConfig } from './tour-configs';
import { useFirstTimeTour } from '../../hooks/useTourState';

interface CalendarOnboardingProps {
  userId: string;
  hasIntegration?: boolean;
  hasVideoConferencing?: boolean;
  hasAvailability?: boolean;
  hasEventTypes?: boolean;
}

/**
 * Calendar Onboarding Component
 * Shows calendar setup checklist and auto-triggers tour on first visit
 */
export function CalendarOnboarding({
  userId,
  hasIntegration = false,
  hasVideoConferencing = false,
  hasAvailability = false,
  hasEventTypes = false,
}: CalendarOnboardingProps) {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const tourState = useFirstTimeTour('calendar-setup', userId, 1000);

  // Auto-show tour on first visit
  if (tourState.shouldAutoShow && !isTourOpen) {
    setIsTourOpen(true);
    tourState.dismissAutoShow();
  }

  const setupSteps = [
    { id: 'integration', label: 'Email Calendar Sync', completed: hasIntegration },
    { id: 'video', label: 'Video Conferencing', completed: hasVideoConferencing },
    { id: 'availability', label: 'Availability Set', completed: hasAvailability },
    { id: 'events', label: 'Event Types Created', completed: hasEventTypes },
  ];

  const completedCount = setupSteps.filter(s => s.completed).length;
  const isFullySetup = completedCount === setupSteps.length;

  const handleCloseTour = () => {
    setIsTourOpen(false);
    tourState.markSkipped();
  };

  const handleCompleteTour = () => {
    setIsTourOpen(false);
    tourState.markCompleted();
  };

  return (
    <>
      {!isFullySetup && (
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Complete Your Calendar Setup</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {completedCount} of {setupSteps.length} steps completed
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-2 mb-4">
              {setupSteps.map((step) => (
                <div key={step.id} className="flex items-center gap-2 text-sm">
                  {step.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Circle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className={step.completed ? 'text-gray-500 line-through' : 'text-gray-900'}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => setIsTourOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Continue Setup
            </Button>
          </CardContent>
        </Card>
      )}

      <OnboardingTour
        config={calendarTourConfig}
        isOpen={isTourOpen}
        onClose={handleCloseTour}
        onComplete={handleCompleteTour}
      />
    </>
  );
}
