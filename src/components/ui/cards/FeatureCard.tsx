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
import { Card } from '../card';
import { ArrowRight } from 'lucide-react';

export interface FeatureCardProps {
  /** Accent color for accent variant */
  accentColor?: string;
  /** Action button label */
  actionLabel?: string;
  /** Additional className */
  className?: string;
  /** Card description */
  description?: string;
  /** Whether the card is disabled */
  disabled?: boolean;
  /** External link URL (renders as anchor instead of button) */
  href?: string;
  /** Icon to display (React element) */
  icon?: React.ReactNode;
  /** Action click handler */
  onAction?: () => void;
  /** Card size */
  size?: 'sm' | 'md' | 'lg';
  /** Card title */
  title: string;
  /** Card variant */
  variant?: 'default' | 'accent' | 'gradient';
}

export function FeatureCard({
  accentColor = 'var(--brand-electric-blue)',
  actionLabel = 'Explore',
  className,
  description,
  disabled = false,
  href,
  icon,
  onAction,
  size = 'md',
  title,
  variant = 'default',
}: FeatureCardProps) {
  const sizeClasses = {
    lg: 'p-8',
    md: 'p-6',
    sm: 'p-4',
  };

  const iconSizeClasses = {
    lg: 'w-14 h-14',
    md: 'w-12 h-12',
    sm: 'w-10 h-10',
  };

  const variantClasses = {
    accent: 'bg-card border-l-4',
    default: 'bg-card border-border hover:shadow-lg',
    gradient: 'border-0 text-white',
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    accent: { borderLeftColor: accentColor },
    default: {},
    gradient: { background: 'var(--gradient-hero)' },
  };

  const handleClick = () => {
    if (disabled) {return;}
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
            'mb-4 flex items-center justify-center rounded-xl',
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
            'mb-2 font-semibold',
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
        <div className="border-current/10 mt-4 border-t pt-4">
          <span
            className={cn(
              'inline-flex items-center gap-1 text-sm font-medium transition-all',
              variant === 'gradient'
                ? 'text-white hover:gap-2'
                : 'text-[var(--brand-electric-blue)] hover:gap-2'
            )}
          >
            {actionLabel}
            <ArrowRight className="size-4" />
          </span>
        </div>
      )}
    </>
  );

  return (
    <Card
      className={cn(
        'flex cursor-pointer flex-col transition-all duration-200',
        variantClasses[variant],
        sizeClasses[size],
        disabled && 'cursor-not-allowed opacity-50',
        !disabled && 'hover:scale-[1.02]',
        className
      )}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      role={href ? 'link' : 'button'}
      style={variantStyles[variant]}
      tabIndex={disabled ? -1 : 0}
    >
      {cardContent}
    </Card>
  );
}
