import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { calculateProfileCompletion } from '../../utils/profileCompletion';

interface ProfileCompletionNotificationProps {
  userData: Record<string, any>;
  onNavigate?: (view: string) => void;
  onDismiss?: () => void;
}

/**
 * Glassmorphism notification for sidebar
 * Dismissable, with smooth animations and gradient progress bar
 */
export function ProfileCompletionNotification({
  userData,
  onNavigate,
  onDismiss,
}: ProfileCompletionNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if user previously dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('frs_profile_completion_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      setIsVisible(false);
    }
  }, []);

  const completion = calculateProfileCompletion(userData);
  const { percentage, incompleteSections } = completion;

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('frs_profile_completion_dismissed', 'true');
    setTimeout(() => {
      setIsDismissed(true);
      onDismiss?.();
    }, 300);
  };

  const handleClick = () => {
    onNavigate?.('profile');
  };

  // Don't render if dismissed or profile is complete
  if (isDismissed || percentage === 100) {
    return null;
  }

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl cursor-pointer
        transition-all duration-300 ease-out
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
      `}
      style={{
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(45, 212, 218, 0.1) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(45, 212, 218, 0.2)',
        boxShadow: '0 8px 32px 0 rgba(37, 99, 235, 0.1)',
      }}
      onClick={handleClick}
    >
      {/* Animated gradient border glow */}
      <div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(45, 212, 218, 0.2) 100%)',
        }}
      />

      {/* Content - Compact & Clear */}
      <div className="relative p-3 space-y-2.5">
        {/* Header with dismiss button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--brand-electric-blue)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--brand-dark-navy)' }}>
              Complete Profile
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className="p-0.5 rounded hover:bg-white/20 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-3 w-3 text-gray-400" />
          </button>
        </div>

        {/* Percentage and Progress */}
        <div className="flex items-center gap-2">
          <span
            className="text-lg font-bold flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--brand-electric-blue) 0%, var(--brand-rich-teal) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {percentage}%
          </span>

          {/* Progress bar */}
          <div className="relative flex-1 h-1.5 rounded-full overflow-hidden bg-white/30">
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
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                  backgroundSize: '200% 100%',
                }}
              />
            </div>
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-xs" style={{ color: 'var(--brand-slate)' }}>
          {incompleteSections.length} section{incompleteSections.length !== 1 ? 's' : ''} remaining
        </p>
      </div>

      {/* Hover glow effect */}
      <div
        className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10"
        style={{
          background: 'linear-gradient(135deg, var(--brand-electric-blue) 0%, var(--brand-rich-teal) 100%)',
        }}
      />
    </div>
  );
}

// Add shimmer animation to global styles if not already present
const style = document.createElement('style');
style.textContent = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .animate-shimmer {
    animation: shimmer 2s infinite linear;
  }
`;
if (!document.getElementById('profile-completion-styles')) {
  style.id = 'profile-completion-styles';
  document.head.appendChild(style);
}
