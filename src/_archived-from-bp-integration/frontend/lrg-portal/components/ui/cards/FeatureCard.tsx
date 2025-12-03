/**
 * FeatureCard Component
 *
 * A card for displaying features/tools with icon, title, description, and action.
 */

import * as React from 'react';
import { cn } from '../utils';
import { Card } from '../card';
import { ArrowRight, ExternalLink } from 'lucide-react';

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
  /** Icon background color */
  iconBgColor?: string;
  /** Additional className */
  className?: string;
  /** Card size */
  size?: 'sm' | 'md' | 'lg';
}

export function FeatureCard({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  href,
  disabled = false,
  variant = 'default',
  accentColor = 'var(--brand-electric-blue)',
  iconBgColor,
  className,
  size = 'md',
}: FeatureCardProps) {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const iconSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const handleClick = () => {
    if (disabled) return;
    if (href) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else if (onAction) {
      onAction();
    }
  };

  const isExternal = href && !href.startsWith('/') && !href.startsWith('#');

  return (
    <Card
      className={cn(
        'flex cursor-pointer group',
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={{
        borderColor: accentColor + '20',
        backgroundColor: accentColor + '05',
      }}
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
      <div className="flex items-start space-x-3">
        {/* Icon */}
        {icon && (
          <div
            className={cn(
              iconSizeClasses[size],
              'rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0'
            )}
            style={{
              backgroundColor: iconBgColor || accentColor + '15',
            }}
          >
            <div style={{ color: accentColor }}>
              {icon}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-[var(--brand-dark-navy)] text-sm truncate flex items-center gap-1">
            {title}
            {isExternal && (
              <ExternalLink className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </h4>
          {description && (
            <p className="text-xs text-[var(--brand-slate)] mt-1 line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
