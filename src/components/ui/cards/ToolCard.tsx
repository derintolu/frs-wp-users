/**
 * ToolCard Component
 *
 * A compact card for app launchers and tool grids.
 * Displays an icon, title, and optional badge.
 *
 * @example
 * <ToolCard
 *   icon={<Calculator className="h-6 w-6" />}
 *   title="Mortgage Calculator"
 *   href="https://calculator.example.com"
 *   badge="New"
 * />
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '../card';
import { ExternalLink } from 'lucide-react';

export interface ToolCardProps {
  /** Icon to display (React element) */
  icon: React.ReactNode;
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
  title,
  description,
  href,
  onClick,
  badge,
  badgeVariant = 'default',
  showExternalIcon = true,
  iconBgColor,
  iconColor,
  disabled = false,
  className,
  size = 'md',
}: ToolCardProps) {
  const sizeClasses = {
    sm: { card: 'p-3', icon: 'w-10 h-10', title: 'text-sm', desc: 'text-xs' },
    md: { card: 'p-4', icon: 'w-12 h-12', title: 'text-base', desc: 'text-sm' },
    lg: { card: 'p-5', icon: 'w-14 h-14', title: 'text-lg', desc: 'text-sm' },
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
        'relative flex flex-col items-center text-center transition-all duration-200',
        'border-[var(--brand-powder-blue)] bg-white',
        sizeClasses[size].card,
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer hover:shadow-lg hover:scale-[1.02] hover:border-[var(--brand-electric-blue)]',
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
          className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-medium rounded-full"
          style={badgeStyles[badgeVariant]}
        >
          {badge}
        </span>
      )}

      {/* Icon Container */}
      <div
        className={cn(
          sizeClasses[size].icon,
          'rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110'
        )}
        style={{
          backgroundColor: iconBgColor || 'var(--brand-pale-blue)',
        }}
      >
        <div
          style={{
            color: iconColor || 'var(--brand-electric-blue)',
          }}
        >
          {icon}
        </div>
      </div>

      {/* Title */}
      <h4
        className={cn(
          sizeClasses[size].title,
          'font-medium text-[var(--brand-dark-navy)] flex items-center gap-1'
        )}
      >
        {title}
        {isExternal && showExternalIcon && (
          <ExternalLink className="h-3 w-3 text-[var(--brand-slate)] opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </h4>

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
  const columnClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  };

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  return (
    <div className={cn('grid', columnClasses[columns], gapClasses[gap], className)}>
      {children}
    </div>
  );
}
