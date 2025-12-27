import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ChevronLeft, ChevronRight, Play, LucideIcon } from 'lucide-react';

/**
 * Tour step configuration
 */
export interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight (use 'body' for centered modal)
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  icon?: LucideIcon; // Lucide icon component
  action?: {
    label: string;
    url?: string; // URL to open (optional)
    onClick?: () => void; // Custom action (optional)
  };
}

/**
 * Tour configuration
 */
export interface TourConfig {
  id: string; // Unique tour identifier (e.g., 'profile-welcome', 'calendar-setup')
  steps: TourStep[];
  variant?: 'default' | 'centered'; // UI variant
}

interface OnboardingTourProps {
  config: TourConfig;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void; // Called when tour finishes
}

/**
 * Unified OnboardingTour Component
 *
 * Combines features from ProfileTour and CalendarTour:
 * - Element highlighting with smart positioning
 * - Centered modals for general steps
 * - Action buttons for guided tasks
 * - Configurable steps via props
 * - State persistence support (via onComplete callback)
 */
export function OnboardingTour({ config, isOpen, onClose, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightPosition, setHighlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const variant = config.variant || 'default';
  const steps = config.steps;
  const currentStepData = steps[currentStep];

  useEffect(() => {
    if (!isOpen) return;

    // Lock scroll when tour is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const updatePositions = () => {
      const step = currentStepData;
      const targetElement = document.querySelector(step.target) as HTMLElement;

      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        // For body target or centered variant, center the highlight in viewport
        if (step.target === 'body' || step.position === 'center' || variant === 'centered') {
          setHighlightPosition({
            top: window.innerHeight / 2 - 100 + scrollTop,
            left: window.innerWidth / 2 - 200,
            width: 400,
            height: 200,
          });

          // Center tooltip in viewport
          const tooltipTop = Math.max(20, (window.innerHeight - 400) / 2 + scrollTop);
          const tooltipLeft = Math.max(20, (window.innerWidth - 400) / 2);
          setTooltipPosition({ top: tooltipTop, left: tooltipLeft });
        } else {
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

          // Scroll target into view gently
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
          });
        }
      }
    };

    updatePositions();
    window.addEventListener('resize', updatePositions);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('resize', updatePositions);
    };
  }, [currentStep, isOpen, currentStepData, variant]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
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

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
    onClose();
  };

  const handleAction = () => {
    const action = currentStepData.action;
    if (!action) return;

    if (action.onClick) {
      action.onClick();
    } else if (action.url) {
      window.open(action.url, '_blank');
    }
  };

  if (!isOpen || !currentStepData) return null;

  const isCentered = variant === 'centered' || currentStepData.target === 'body' || currentStepData.position === 'center';
  const tooltipWidth = variant === 'centered' ? 'w-[500px]' : 'w-96';

  return (
    <div className="fixed inset-0 z-[9999]">
      {isCentered ? (
        // Centered variant: Full dark overlay
        <div className="absolute inset-0 bg-black bg-opacity-60 pointer-events-none" />
      ) : (
        // Default variant: Four-sided dark overlay around highlighted element
        <>
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
        </>
      )}

      {/* Bright highlight area */}
      {!isCentered && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: highlightPosition.top - 4,
            left: highlightPosition.left - 4,
            width: highlightPosition.width + 8,
            height: highlightPosition.height + 8,
            border: '3px solid #3B82F6',
            borderRadius: 'calc(var(--radius) + 4px)',
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.4), 0 0 20px rgba(59, 130, 246, 0.8)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }}
        />
      )}

      {/* Tooltip */}
      <Card
        className={`absolute z-10 ${tooltipWidth} shadow-2xl border-2 border-blue-400 pointer-events-auto bg-white`}
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        <CardContent className={variant === 'centered' ? 'p-8' : 'p-6'}>
          {/* Icon (centered variant only) */}
          {variant === 'centered' && currentStepData.icon && (
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center">
                <currentStepData.icon className="h-12 w-12 text-blue-600" />
              </div>
            </div>
          )}

          {/* Header */}
          <div className={`flex items-start justify-between mb-4 ${variant === 'centered' ? 'flex-col items-center text-center' : ''}`}>
            <div className="flex-1">
              <h3 className={`font-semibold text-gray-900 mb-2 ${variant === 'centered' ? 'text-2xl mb-3' : 'text-lg'}`}>
                {currentStepData.title}
              </h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-500">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <div className="flex gap-1">
                  {steps.map((_, index) => (
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
            {variant !== 'centered' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={skipTour}
                className="text-gray-500 hover:text-gray-700 p-1 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Description */}
          <p className={`text-gray-700 mb-6 leading-relaxed ${variant === 'centered' ? 'text-center text-lg mb-8' : ''}`}>
            {currentStepData.description}
          </p>

          {/* Action Button (if step has one) */}
          {currentStepData.action && (
            <div className="mb-6">
              <Button
                onClick={handleAction}
                className={`bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white ${
                  variant === 'centered' ? 'w-full py-6 text-lg' : ''
                }`}
              >
                {currentStepData.action.label}
              </Button>
              {currentStepData.action.url && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Opens in new tab - complete the step, then come back to continue
                </p>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className={`flex items-center gap-4 ${variant === 'centered' ? 'justify-between pt-6 border-t border-gray-200' : 'gap-6'}`}>
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
              className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white ${variant === 'centered' ? '' : 'ml-auto'}`}
            >
              {currentStep === steps.length - 1 ? (
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

/**
 * Tour trigger button component
 */
interface TourTriggerProps {
  onStartTour: () => void;
  className?: string;
  label?: string;
}

export function TourTrigger({ onStartTour, className = '', label = 'Take Tour' }: TourTriggerProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onStartTour}
      className={`flex items-center gap-2 text-blue-600 border-blue-300 hover:bg-blue-50 ${className}`}
    >
      <Play className="h-4 w-4" />
      {label}
    </Button>
  );
}
