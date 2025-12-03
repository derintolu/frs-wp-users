import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { X, ChevronLeft, ChevronRight, Calendar, Mail, Video, Clock, FileText } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    url: string;
  };
}

const calendarTourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Your Calendar',
    description: 'Your FluentBooking calendar is ready! Let\'s set it up so clients can book appointments with you. This will only take a few minutes.',
    target: 'body', // Target the whole page for welcome step
    position: 'right',
  },
  {
    id: 'integrations',
    title: 'Connect Your Email Calendar',
    description: 'Sync with Google Calendar or Outlook so your availability stays up-to-date automatically. This prevents double bookings.',
    target: 'body',
    position: 'right',
    action: {
      label: 'Open Integrations',
      url: '/wp-admin/admin.php?page=fluent-booking#/settings/integrations',
    },
  },
  {
    id: 'video-conferencing',
    title: 'Set Up Video Meetings',
    description: 'Connect Zoom or Google Meet to automatically create meeting links for your appointments.',
    target: 'body',
    position: 'right',
    action: {
      label: 'Connect Video',
      url: '/wp-admin/admin.php?page=fluent-booking#/settings/integrations',
    },
  },
  {
    id: 'availability',
    title: 'Set Your Availability',
    description: 'Tell FluentBooking when you\'re available for appointments. Set your working hours, breaks, and time off.',
    target: 'body',
    position: 'right',
    action: {
      label: 'Set Availability',
      url: '/wp-admin/admin.php?page=fluent-booking#/settings/availability',
    },
  },
  {
    id: 'event-types',
    title: 'Create Appointment Types',
    description: 'Set up different types of appointments (15-min call, 30-min consultation, etc.) with custom durations and settings.',
    target: 'body',
    position: 'right',
    action: {
      label: 'Create Events',
      url: '/wp-admin/admin.php?page=fluent-booking#/calendars',
    },
  },
  {
    id: 'done',
    title: 'You\'re All Set!',
    description: 'Your calendar is configured! Clients can now book appointments with you. Visit the calendar dashboard to manage bookings and settings anytime.',
    target: 'body',
    position: 'right',
  },
];

interface CalendarTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalendarTour({ isOpen, onClose }: CalendarTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightPosition, setHighlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen) return;

    // Lock scroll when tour is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const updatePositions = () => {
      const step = calendarTourSteps[currentStep];
      const targetElement = document.querySelector(step.target) as HTMLElement;

      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        // For body target, center the highlight in viewport
        if (step.target === 'body') {
          setHighlightPosition({
            top: window.innerHeight / 2 - 100 + scrollTop,
            left: window.innerWidth / 2 - 200,
            width: 400,
            height: 200,
          });
        } else {
          setHighlightPosition({
            top: rect.top + scrollTop,
            left: rect.left + scrollLeft,
            width: rect.width,
            height: rect.height,
          });
        }

        // Center tooltip in viewport
        const tooltipTop = Math.max(20, (window.innerHeight - 400) / 2 + scrollTop);
        const tooltipLeft = Math.max(20, (window.innerWidth - 400) / 2);

        setTooltipPosition({ top: tooltipTop, left: tooltipLeft });
      }
    };

    updatePositions();
    window.addEventListener('resize', updatePositions);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('resize', updatePositions);
    };
  }, [currentStep, isOpen]);

  const nextStep = () => {
    if (currentStep < calendarTourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    onClose();
  };

  const handleAction = (url: string) => {
    // Open in new tab
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  const currentStepData = calendarTourSteps[currentStep];

  // Get icon for current step
  const getStepIcon = () => {
    switch (currentStepData.id) {
      case 'welcome':
        return <Calendar className="h-12 w-12 text-blue-600" />;
      case 'integrations':
        return <Mail className="h-12 w-12 text-blue-600" />;
      case 'video-conferencing':
        return <Video className="h-12 w-12 text-blue-600" />;
      case 'availability':
        return <Clock className="h-12 w-12 text-blue-600" />;
      case 'event-types':
        return <FileText className="h-12 w-12 text-blue-600" />;
      default:
        return <Calendar className="h-12 w-12 text-green-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Dark backdrop overlay - full screen with reduced opacity for centered tooltip */}
      <div className="absolute inset-0 bg-black bg-opacity-60 pointer-events-none" />

      {/* Bright highlight area (subtle for welcome/body steps) */}
      {currentStepData.target !== 'body' && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: highlightPosition.top - 4,
            left: highlightPosition.left - 4,
            width: highlightPosition.width + 8,
            height: highlightPosition.height + 8,
            border: '3px solid #3B82F6',
            borderRadius: 'calc(var(--radius) - 4px)',
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.4), 0 0 20px rgba(59, 130, 246, 0.8)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }}
        />
      )}

      {/* Tooltip */}
      <Card
        className="absolute z-10 w-[500px] shadow-2xl border-2 border-blue-400 pointer-events-auto bg-white"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        <CardContent className="p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center">
              {getStepIcon()}
            </div>
          </div>

          {/* Header */}
          <div className="mb-6 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {currentStepData.title}
            </h3>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-sm text-gray-500">
                Step {currentStep + 1} of {calendarTourSteps.length}
              </span>
              <div className="flex gap-1">
                {calendarTourSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentStep ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-8 text-center leading-relaxed text-lg">
            {currentStepData.description}
          </p>

          {/* Action Button (if step has one) */}
          {currentStepData.action && (
            <div className="mb-6">
              <Button
                onClick={() => handleAction(currentStepData.action!.url)}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white py-6 text-lg"
              >
                {currentStepData.action.label}
              </Button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Opens in new tab - complete the step, then come back to continue
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <Button
              onClick={skipTour}
              variant="ghost"
              className="text-gray-500 hover:text-gray-700"
            >
              Skip Tour
            </Button>

            <Button
              onClick={nextStep}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {currentStep === calendarTourSteps.length - 1 ? (
                'Finish Tour'
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
