import { useState } from 'react';
import {
  User,
  Briefcase,
  Mail,
  FileText,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  calculateProfileCompletion,
  type CompletionResult,
  PROFILE_SECTIONS,
} from '../../utils/profileCompletion';

interface ProfileCompletionSectionProps {
  userData: Record<string, any>;
}

const SECTION_ICONS = {
  User,
  Briefcase,
  Mail,
  FileText,
  Link: LinkIcon,
};

/**
 * Glassmorphism profile completion section for profile view
 * Shows when profile is open, with hover effects and expandable sections
 */
export function ProfileCompletionSection({ userData }: ProfileCompletionSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const completion: CompletionResult = calculateProfileCompletion(userData);
  const { percentage, completedFields, totalFields, incompleteSections } = completion;

  const isComplete = percentage === 100;

  if (isComplete) {
    return (
      <div
        className="relative overflow-hidden rounded-xl p-4 group hover:scale-[1.02] transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          boxShadow: '0 8px 32px 0 rgba(16, 185, 129, 0.1)',
        }}
      >
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-800">Profile Complete!</h3>
            <p className="text-xs text-green-600">All required information has been provided.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-lg group hover:scale-[1.01] transition-all duration-300"
      style={{
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(45, 212, 218, 0.08) 100%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(45, 212, 218, 0.15)',
        boxShadow: '0 4px 16px 0 rgba(37, 99, 235, 0.05)',
      }}
    >
      {/* Hover glow effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, var(--brand-electric-blue) 0%, var(--brand-rich-teal) 100%)',
        }}
      />

      {/* Compact content */}
      <div className="relative px-4 py-3">
        {/* Single row: icon, title, percentage, progress bar */}
        <div className="flex items-center gap-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--brand-electric-blue)' }} />

          <span className="text-sm font-semibold flex-shrink-0" style={{ color: 'var(--brand-dark-navy)' }}>
            Profile Completion
          </span>

          <div className="flex-1 flex items-center gap-2">
            {/* Progress bar */}
            <div className="relative flex-1 h-1.5 rounded-full overflow-hidden bg-white/40">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${percentage}%`,
                  background: 'linear-gradient(90deg, var(--brand-electric-blue) 0%, var(--brand-rich-teal) 100%)',
                }}
              >
                <div
                  className="absolute inset-0 animate-shimmer"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                    backgroundSize: '200% 100%',
                  }}
                />
              </div>
            </div>

            {/* Percentage */}
            <span
              className="text-sm font-bold flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, var(--brand-electric-blue) 0%, var(--brand-rich-teal) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {percentage}%
            </span>
          </div>

          {/* Expand button */}
          {incompleteSections.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded hover:bg-white/20 transition-colors flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-3.5 w-3.5" style={{ color: 'var(--brand-slate)' }} />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" style={{ color: 'var(--brand-slate)' }} />
              )}
            </button>
          )}
        </div>

        {/* Expandable incomplete sections */}
        {incompleteSections.length > 0 && (
          <div
            className={`
              overflow-hidden transition-all duration-300
              ${isExpanded ? 'max-h-[400px] mt-3 opacity-100' : 'max-h-0 opacity-0'}
            `}
          >
            <div className="space-y-2 pt-2 border-t border-white/20">
              {incompleteSections.map(({ section, missingFields }) => {
                const IconComponent =
                  SECTION_ICONS[section.icon as keyof typeof SECTION_ICONS] || User;

                return (
                  <div
                    key={section.id}
                    className="p-2 rounded-lg"
                    style={{
                      background: 'rgba(239, 68, 68, 0.05)',
                      border: '1px solid rgba(239, 68, 68, 0.1)',
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div className="p-1.5 bg-red-100 rounded">
                        <IconComponent className="h-3 w-3 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-xs text-gray-900 mb-1">
                          {section.label}
                        </h5>
                        <ul className="space-y-0.5">
                          {missingFields.map((field) => (
                            <li
                              key={field.key}
                              className="text-xs text-gray-600 flex items-center gap-1.5"
                            >
                              <span className="w-1 h-1 bg-red-400 rounded-full flex-shrink-0" />
                              <span className="truncate">{field.label}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
