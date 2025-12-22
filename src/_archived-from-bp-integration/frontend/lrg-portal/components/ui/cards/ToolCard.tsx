/**
 * ToolCard Component
 *
 * A compact card for app launchers and tool grids.
 * Displays an icon, title, and optional badge.
 */

import * as React from 'react';
import { cn } from '../utils';
import { Card } from '../card';
import { ExternalLink } from 'lucide-react';

export interface ToolCardProps {
  /** Icon to display (React element) */
  icon?: React.ReactNode;
  /** Image URL (alternative to icon) */
  image?: string;
  /** Tool name */
  title: string;
  /** Optional description */
  description?: string;
  /** External link URL */
  href?: string;
  /** Click handler (alternative to href) */
  onClick?: () => void;
  /** Badge text (e.g., "New", "Beta") */
  badge?: string;
  /** Badge variant */
  badgeVariant?: 'default' | 'new' | 'popular' | 'premium';
  /** Whether to show external link indicator */
  showExternalIcon?: boolean;
  /** Icon background color */
  iconBgColor?: string;
  /** Icon color */
  iconColor?: string;
  /** Card is disabled */
  disabled?: boolean;
  /** Additional className */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

export function ToolCard({
  icon,
  image,
  title,
  description,
  href,
  onClick,
  badge,
  badgeVariant = 'default',
  showExternalIcon = false,
  iconBgColor,
  iconColor,
  disabled = false,
  className,
  size = 'md',
}: ToolCardProps) {
  const sizeClasses = {
    sm: { card: 'p-3', icon: 'w-10 h-10', image: 'w-10 h-10', title: 'text-sm', desc: 'text-xs' },
    md: { card: 'p-4', icon: 'w-12 h-12', image: 'w-12 h-12', title: 'text-sm', desc: 'text-xs' },
    lg: { card: 'p-5', icon: 'w-14 h-14', image: 'w-14 h-14', title: 'text-base', desc: 'text-sm' },
  };

  const badgeStyles: Record<string, React.CSSProperties> = {
    default: { backgroundColor: 'var(--brand-slate)', color: 'white' },
    new: { background: 'var(--gradient-brand-blue)', color: 'white' },
    popular: { background: 'var(--gradient-brand-teal)', color: 'white' },
    premium: { background: 'var(--gradient-hero)', color: 'white' },
  };

  const handleClick = () => {
    if (disabled) return;
    if (href) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else if (onClick) {
      onClick();
    }
  };

  const isExternal = href && !href.startsWith('/') && !href.startsWith('#');

  return (
    <Card
      className={cn(
        'relative flex flex-col items-center text-center',
        sizeClasses[size].card,
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
        className
      )}
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
      {/* Badge */}
      {badge && (
        <span
          className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-medium rounded-full z-10"
          style={badgeStyles[badgeVariant]}
        >
          {badge}
        </span>
      )}

      {/* Icon or Image */}
      {image ? (
        <img
          src={image}
          alt={title}
          className={cn(
            'object-contain mb-2',
            sizeClasses[size].image
          )}
        />
      ) : icon ? (
        <div
          className={cn(
            sizeClasses[size].icon,
            'rounded-xl flex items-center justify-center mb-2'
          )}
          style={{
            backgroundColor: iconBgColor || 'transparent',
          }}
        >
          <div
            className={sizeClasses[size].icon}
            style={{
              color: iconColor || 'var(--brand-electric-blue)',
            }}
          >
            {icon}
          </div>
        </div>
      ) : null}

      {/* Title */}
      <span
        className={cn(
          sizeClasses[size].title,
          'font-semibold text-gray-900 text-center flex items-center gap-1'
        )}
      >
        {title}
        {isExternal && showExternalIcon && (
          <ExternalLink className="h-3 w-3 text-gray-400" />
        )}
      </span>

      {/* Description */}
      {description && (
        <p className={cn(sizeClasses[size].desc, 'text-[var(--brand-slate)] mt-1')}>
          {description}
        </p>
      )}
    </Card>
  );
}

/**
 * ToolCardGrid Component
 *
 * A responsive grid layout for ToolCards.
 */
export interface ToolCardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ToolCardGrid({
  children,
  columns = 4,
  gap = 'md',
  className,
}: ToolCardGridProps) {
  const gapClasses = {
    sm: '8px',
    md: '12px',
    lg: '16px',
  };

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(120px, 1fr))`,
        gap: gapClasses[gap],
      }}
    >
      {children}
    </div>
  );
}
