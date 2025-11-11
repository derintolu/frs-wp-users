import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right';
  offset?: { x: number; y: number };
}

const profileTourSteps: TourStep[] = [
  {
    id: 'profile-summary',
    title: 'Your Profile Info',
    description: 'This shows your current contact details and bio. You can see how your profile appears to others.',
    target: '[data-tour="profile-summary"]',
    position: 'right',
  },
  {
    id: 'announcements',
    title: 'Company Updates',
    description: 'Important announcements from your company appear here. Click any announcement to read more.',
    target: '[data-tour="announcements"]',
    position: 'right',
  },
  {
    id: 'biolink-tab',
    title: 'Manage Your Biolink',
    description: 'This tab shows your personal biolink page and any leads you receive.',
    target: '[data-tour="biolink-tab"]',
    position: 'bottom',
  },
  {
    id: 'edit-profile-tab',
    title: 'Edit Your Profile',
    description: 'Click this tab to update your personal information, contact details, and bio.',
    target: '[data-tour="edit-profile-tab"]',
    position: 'bottom',
  },
];

interface ProfileTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileTour({ isOpen, onClose }: ProfileTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightPosition, setHighlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen) return;

    // Lock scroll when tour is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const updatePositions = () => {
      const step = profileTourSteps[currentStep];
      const targetElement = document.querySelector(step.target) as HTMLElement;

      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        // Highlight position (absolute to page)
        setHighlightPosition({
          top: rect.top + scrollTop,
          left: rect.left + scrollLeft,
          width: rect.width,
          height: rect.height,
        });

        // Tooltip position - smart positioning to avoid covering highlighted element
        let tooltipTop = rect.top + scrollTop;
        let tooltipLeft = rect.right + scrollLeft + 30;

        // If tooltip would go off right edge, place it on the left
        if (tooltipLeft + 400 > window.innerWidth) {
          tooltipLeft = rect.left + scrollLeft - 430;
        }

        // If tooltip would go off left edge, center it above/below
        if (tooltipLeft < 20) {
          tooltipLeft = Math.max(20, (window.innerWidth - 400) / 2);
          // Place above or below based on available space
          if (rect.top > window.innerHeight / 2) {
            tooltipTop = rect.top + scrollTop - 200; // Above
          } else {
            tooltipTop = rect.bottom + scrollTop + 20; // Below
          }
        }

        // Ensure tooltip stays on screen vertically
        tooltipTop = Math.max(20, Math.min(tooltipTop, window.innerHeight - 300));

        setTooltipPosition({ top: tooltipTop, left: tooltipLeft });

        // Scroll target into view gently (only on step change, not initial open)
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }
    };

    updatePositions();
    window.addEventListener('resize', updatePositions);

    return () => {
      // Restore scroll when tour closes or step changes
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('resize', updatePositions);
    };
  }, [currentStep, isOpen]);

  const nextStep = () => {
    if (currentStep < profileTourSteps.length - 1) {
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

  if (!isOpen) return null;

  const currentStepData = profileTourSteps[currentStep];

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Dark backdrop overlay - top */}
      <div
        className="absolute bg-black bg-opacity-50 pointer-events-none"
        style={{
          top: 0,
          left: 0,
          right: 0,
          height: highlightPosition.top - 10,
        }}
      />

      {/* Dark backdrop overlay - bottom */}
      <div
        className="absolute bg-black bg-opacity-50 pointer-events-none"
        style={{
          top: highlightPosition.top + highlightPosition.height + 10,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {/* Dark backdrop overlay - left */}
      <div
        className="absolute bg-black bg-opacity-50 pointer-events-none"
        style={{
          top: highlightPosition.top - 10,
          left: 0,
          width: highlightPosition.left - 10,
          height: highlightPosition.height + 20,
        }}
      />

      {/* Dark backdrop overlay - right */}
      <div
        className="absolute bg-black bg-opacity-50 pointer-events-none"
        style={{
          top: highlightPosition.top - 10,
          left: highlightPosition.left + highlightPosition.width + 10,
          right: 0,
          height: highlightPosition.height + 20,
        }}
      />

      {/* Bright highlight area with enhanced border */}
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

      {/* Tooltip */}
      <Card
        className="absolute z-10 w-96 shadow-xl border-2 border-blue-400 pointer-events-auto bg-white"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {currentStepData.title}
              </h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-500">
                  Step {currentStep + 1} of {profileTourSteps.length}
                </span>
                <div className="flex gap-1">
                  {profileTourSteps.map((_, index) => (
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
            <Button
              variant="ghost"
              size="sm"
              onClick={skipTour}
              className="text-gray-500 hover:text-gray-700 p-1 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-6 leading-relaxed">
            {currentStepData.description}
          </p>

          {/* Navigation */}
          <div className="flex items-center gap-6">
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
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white ml-auto"
            >
              {currentStep === profileTourSteps.length - 1 ? (
                'Finish'
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

// Tour trigger button component
interface TourTriggerProps {
  onStartTour: () => void;
  className?: string;
}

export function TourTrigger({ onStartTour, className = '' }: TourTriggerProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onStartTour}
      className={`flex items-center gap-2 text-blue-600 border-blue-300 hover:bg-blue-50 ${className}`}
    >
      <Play className="h-4 w-4" />
      Take Tour
    </Button>
  );
}