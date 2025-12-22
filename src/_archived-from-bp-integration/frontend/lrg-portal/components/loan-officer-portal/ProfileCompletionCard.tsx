import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '../ui/button';
import {
  calculateProfileCompletion,
  type CompletionResult,
  PROFILE_SECTIONS,
} from '../../utils/profileCompletion';

interface ProfileCompletionCardProps {
  userData: Record<string, any>;
  onDismiss?: () => void;
}

/**
 * Profile completion card with half-circle gauge and accordion checklist
 */
export function ProfileCompletionCard({ userData, onDismiss }: ProfileCompletionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const completion: CompletionResult = calculateProfileCompletion(userData);
  const { percentage, incompleteSections } = completion;

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
            onClick={onDismiss}
            className="absolute -top-2 -right-2 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
            aria-label="Dismiss profile completion card"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        )}

        {/* Half Circle Gauge */}
        <div className="relative mb-6 flex justify-center">
          <svg width="200" height="120" viewBox="0 0 200 120" className="overflow-visible">
            {/* Background arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Progress arc with brand gradient */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="url(#brandGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{
                transition: 'stroke-dashoffset 1s ease-out',
              }}
            />
            {/* Brand gradient definition */}
            <defs>
              <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#2dd4da" />
              </linearGradient>
            </defs>
          </svg>

          {/* Percentage in center */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/4 text-center">
            <div
              className="text-4xl font-bold"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
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
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">
              {isExpanded ? 'Hide Details' : 'Show Details'}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>

          {/* Expandable Checklist */}
          <div
            className={`overflow-hidden transition-all duration-300 ${
              isExpanded ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="space-y-3 px-3 pb-3">
              {sectionStatus.map((section) => (
                <div key={section.id} className="flex items-center gap-3">
                  {/* Gradient dot indicator */}
                  <div className="relative">
                    <div
                      className={`w-5 h-5 rounded-full border-2 transition-all ${
                        section.isComplete
                          ? 'border-transparent'
                          : 'bg-white border-gray-300'
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
                          className="w-full h-full p-0.5"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M6 10L9 13L14 7"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
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
