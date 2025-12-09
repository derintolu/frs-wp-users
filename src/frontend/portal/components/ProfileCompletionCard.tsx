import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import {
  calculateProfileCompletion,
  type CompletionResult,
  PROFILE_SECTIONS,
} from '@/frontend/portal/utils/profileCompletion';

interface ProfileCompletionCardProps {
  onDismiss?: () => void;
  userData: Record<string, any>;
}

/**
 * Profile completion card with half-circle gauge and accordion checklist
 *
 * NOTE: This component is saved for future use in the bento widget area.
 * Currently replaced by a thin horizontal progress bar in the sidebar.
 * This full card with gauge and checklist will be reused in the bento dashboard.
 */
export function ProfileCompletionCard({ onDismiss, userData }: ProfileCompletionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const completion: CompletionResult = calculateProfileCompletion(userData);
  const { incompleteSections, percentage } = completion;

  // Calculate the stroke dash offset for the half circle
  // Half circle circumference = π * radius
  const radius = 80;
  const circumference = Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Determine which sections are complete
  const sectionStatus = PROFILE_SECTIONS.map((section) => {
    const isIncomplete = incompleteSections.some(
      (incomplete) => incomplete.section.id === section.id
    );
    return {
      ...section,
      isComplete: !isIncomplete,
    };
  });

  return (
    <div className="w-full p-4">
      <div className="relative">
        {/* Dismiss button - Top right corner */}
        {onDismiss && (
          <button
            aria-label="Dismiss profile completion card"
            className="absolute -right-2 -top-2 z-10 flex size-6 items-center justify-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300"
            onClick={onDismiss}
          >
            <X className="size-4 text-gray-600" />
          </button>
        )}

        {/* Half Circle Gauge */}
        <div className="relative mb-6 flex justify-center">
          <svg className="overflow-visible" height="120" viewBox="0 0 200 120" width="200">
            {/* Background arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#E5E7EB"
              strokeLinecap="round"
              strokeWidth="12"
            />
            {/* Progress arc with brand gradient */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="url(#brandGradient)"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              strokeWidth="12"
              style={{
                transition: 'stroke-dashoffset 1s ease-out',
              }}
            />
            {/* Brand gradient definition */}
            <defs>
              <linearGradient id="brandGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#2dd4da" />
              </linearGradient>
            </defs>
          </svg>

          {/* Percentage in center */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/4 text-center">
            <div
              className="text-4xl font-bold"
              style={{
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                backgroundClip: 'text',
              }}
            >
              {percentage}%
            </div>
            <div className="text-sm text-gray-500">Complete</div>
          </div>
        </div>

        {/* Accordion Drawer */}
        <div className="w-full">
          <button
            className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span className="text-sm font-medium text-gray-700">
              {isExpanded ? 'Hide Details' : 'Show Details'}
            </span>
            {isExpanded ? (
              <ChevronUp className="size-4 text-gray-500" />
            ) : (
              <ChevronDown className="size-4 text-gray-500" />
            )}
          </button>

          {/* Expandable Checklist */}
          <div
            className={`overflow-hidden transition-all duration-300 ${
              isExpanded ? 'mt-2 max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="space-y-3 px-3 pb-3">
              {sectionStatus.map((section) => (
                <div className="flex items-center gap-3" key={section.id}>
                  {/* Gradient dot indicator */}
                  <div className="relative">
                    <div
                      className={`size-5 rounded-full border-2 transition-all ${
                        section.isComplete
                          ? 'border-transparent'
                          : 'border-gray-300 bg-white'
                      }`}
                      style={
                        section.isComplete
                          ? {
                              background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                            }
                          : {}
                      }
                    >
                      {section.isComplete && (
                        <svg
                          className="size-full p-0.5"
                          fill="none"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M6 10L9 13L14 7"
                            stroke="white"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                          />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Section label */}
                  <span
                    className={`text-sm font-medium ${
                      section.isComplete ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {section.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
