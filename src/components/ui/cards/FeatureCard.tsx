/**
 * FeatureCard Component
 *
 * A card for displaying features/tools with icon, title, description, and action.
 * Used in Marketing Hub, tool grids, and feature showcases.
 *
 * @example
 * <FeatureCard
 *   icon={<Calendar className="h-6 w-6" />}
 *   title="Calendar"
 *   description="Manage your booking calendar and appointments"
 *   actionLabel="Explore"
 *   onAction={() => navigate('/calendar')}
 * />
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../card';
import { ArrowRight } from 'lucide-react';

export interface FeatureCardProps {
  /** Icon to display (React element) */
  icon?: React.ReactNode;
  /** Card title */
  title: string;
  /** Card description */
  description?: string;
  /** Action button label */
  actionLabel?: string;
  /** Action click handler */
  onAction?: () => void;
  /** External link URL (renders as anchor instead of button) */
  href?: string;
  /** Whether the card is disabled */
  disabled?: boolean;
  /** Card variant */
  variant?: 'default' | 'accent' | 'gradient';
  /** Accent color for accent variant */
  accentColor?: string;
  /** Additional className */
  className?: string;
  /** Card size */
  size?: 'sm' | 'md' | 'lg';
}

export function FeatureCard({
  icon,
  title,
  description,
  actionLabel = 'Explore',
  onAction,
  href,
  disabled = false,
  variant = 'default',
  accentColor = 'var(--brand-electric-blue)',
  className,
  size = 'md',
}: FeatureCardProps) {
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const iconSizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
  };

  const variantClasses = {
    default: 'bg-card border-border hover:shadow-lg',
    accent: 'bg-card border-l-4',
    gradient: 'border-0 text-white',
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    default: {},
    accent: { borderLeftColor: accentColor },
    gradient: { background: 'var(--gradient-hero)' },
  };

  const handleClick = () => {
    if (disabled) return;
    if (href) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else if (onAction) {
      onAction();
    }
  };

  const cardContent = (
    <>
      {/* Icon */}
      {icon && (
        <div
          className={cn(
            iconSizeClasses[size],
            'rounded-xl flex items-center justify-center mb-4',
            variant === 'gradient' ? 'bg-white/20' : 'bg-[var(--brand-pale-blue)]'
          )}
        >
          <div className={cn(
            variant === 'gradient' ? 'text-white' : 'text-[var(--brand-electric-blue)]'
          )}>
            {icon}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1">
        <h3
          className={cn(
            'font-semibold mb-2',
            size === 'sm' ? 'text-base' : 'text-lg',
            variant === 'gradient' ? 'text-white' : 'text-[var(--brand-dark-navy)]'
          )}
        >
          {title}
        </h3>
        {description && (
          <p
            className={cn(
              'text-sm',
              variant === 'gradient' ? 'text-white/80' : 'text-[var(--brand-slate)]'
            )}
          >
            {description}
          </p>
        )}
      </div>

      {/* Action */}
      {(actionLabel && (onAction || href)) && (
        <div className="mt-4 pt-4 border-t border-current/10">
          <span
            className={cn(
              'inline-flex items-center gap-1 text-sm font-medium transition-all',
              variant === 'gradient'
                ? 'text-white hover:gap-2'
                : 'text-[var(--brand-electric-blue)] hover:gap-2'
            )}
          >
            {actionLabel}
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      )}
    </>
  );

  return (
    <Card
      className={cn(
        'flex flex-col transition-all duration-200 cursor-pointer',
        variantClasses[variant],
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'hover:scale-[1.02]',
        className
      )}
      style={variantStyles[variant]}
      onClick={handleClick}
      role={href ? 'link' : 'button'}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {cardContent}
    </Card>
  );
}
