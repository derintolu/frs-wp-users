import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { CheckCircle2, Circle, ArrowRight, Sparkles } from 'lucide-react';
import { OnboardingTour, TourTrigger } from './OnboardingTour';
import { welcomeTourConfig } from './tour-configs';
import { useFirstTimeTour } from '../hooks/useTourState';

interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface WelcomeOnboardingProps {
  userId: string;
  userRole: 'loan-officer' | 'realtor';
  profileComplete?: boolean;
  biolinkCreated?: boolean;
  hasPartnerships?: boolean;
  calendarSetup?: boolean;
}

/**
 * Welcome Onboarding Component
 * Shows onboarding checklist and auto-triggers welcome tour on first visit
 */
export function WelcomeOnboarding({
  userId,
  userRole,
  profileComplete = false,
  biolinkCreated = false,
  hasPartnerships = false,
  calendarSetup = false,
}: WelcomeOnboardingProps) {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const tourState = useFirstTimeTour('first-time-welcome', userId, 2000);

  // Auto-show tour on first visit
  if (tourState.shouldAutoShow && !isTourOpen) {
    setIsTourOpen(true);
    tourState.dismissAutoShow();
  }

  const tasks: OnboardingTask[] = [
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Add your photo, bio, and contact information',
      completed: profileComplete,
      action: {
        label: 'Edit Profile',
        onClick: () => {
          // Navigate to profile edit
          window.location.hash = '#/profile/edit';
        },
      },
    },
    {
      id: 'biolink',
      title: 'Create Your Biolink',
      description: 'Build a mobile-friendly page for your social media',
      completed: biolinkCreated,
      action: {
        label: 'Create Biolink',
        onClick: () => {
          window.location.hash = '#/biolink';
        },
      },
    },
    {
      id: 'partnerships',
      title: 'Find Partners',
      description: userRole === 'loan-officer'
        ? 'Connect with realtors to grow your network'
        : 'Connect with loan officers for referrals',
      completed: hasPartnerships,
      action: {
        label: 'Browse Partners',
        onClick: () => {
          window.location.hash = '#/partnerships';
        },
      },
    },
    {
      id: 'calendar',
      title: 'Set Up Calendar',
      description: 'Enable appointment booking for clients',
      completed: calendarSetup,
      action: {
        label: 'Configure Calendar',
        onClick: () => {
          window.location.hash = '#/calendar';
        },
      },
    },
  ];

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = (completedCount / tasks.length) * 100;

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
      <Card className="bg-gradient-to-br from-blue-50 to-teal-50 border-blue-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl mb-2">
                  Welcome to Your Portal!
                </CardTitle>
                <CardDescription className="text-base">
                  Let's get you set up. Complete these steps to unlock the full potential of your profile.
                </CardDescription>
              </div>
            </div>
            {!tourState.completed && (
              <TourTrigger
                onStartTour={() => setIsTourOpen(true)}
                label="Watch Tour"
                className="ml-4"
              />
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {completedCount} of {tasks.length} completed
              </span>
              <span className="text-sm font-bold text-blue-600">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Onboarding Tasks */}
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                  task.completed
                    ? 'bg-white border-green-200'
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  {task.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h4 className={`font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      {task.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {task.description}
                    </p>
                  </div>
                </div>

                {!task.completed && task.action && (
                  <Button
                    size="sm"
                    onClick={task.action.onClick}
                    className="ml-4 flex items-center gap-1"
                  >
                    {task.action.label}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Completion Message */}
          {completedCount === tasks.length && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium text-green-900">
                  Great job! You've completed your onboarding. You're all set to start generating leads!
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Welcome Tour */}
      <OnboardingTour
        config={welcomeTourConfig}
        isOpen={isTourOpen}
        onClose={handleCloseTour}
        onComplete={handleCompleteTour}
      />
    </>
  );
}
