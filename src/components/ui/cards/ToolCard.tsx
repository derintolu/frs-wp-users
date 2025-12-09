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
  /** Badge text (e.g., "New", "Beta") */
  badge?: string;
  /** Badge variant */
  badgeVariant?: 'default' | 'new' | 'popular' | 'premium';
  /** Additional className */
  className?: string;
  /** Optional description */
  description?: string;
  /** Card is disabled */
  disabled?: boolean;
  /** External link URL */
  href?: string;
  /** Icon to display (React element) */
  icon: React.ReactNode;
  /** Icon background color */
  iconBgColor?: string;
  /** Icon color */
  iconColor?: string;
  /** Click handler (alternative to href) */
  onClick?: () => void;
  /** Whether to show external link indicator */
  showExternalIcon?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Tool name */
  title: string;
}

export function ToolCard({
  badge,
  badgeVariant = 'default',
  className,
  description,
  disabled = false,
  href,
  icon,
  iconBgColor,
  iconColor,
  onClick,
  showExternalIcon = true,
  size = 'md',
  title,
}: ToolCardProps) {
  const sizeClasses = {
    lg: { card: 'p-5', desc: 'text-sm', icon: 'w-14 h-14', title: 'text-lg' },
    md: { card: 'p-4', desc: 'text-sm', icon: 'w-12 h-12', title: 'text-base' },
    sm: { card: 'p-3', desc: 'text-xs', icon: 'w-10 h-10', title: 'text-sm' },
  };

  const badgeStyles: Record<string, React.CSSProperties> = {
    default: { backgroundColor: 'var(--brand-slate)', color: 'white' },
    new: { background: 'var(--gradient-brand-blue)', color: 'white' },
    popular: { background: 'var(--gradient-brand-teal)', color: 'white' },
    premium: { background: 'var(--gradient-hero)', color: 'white' },
  };

  const handleClick = () => {
    if (disabled) {return;}
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
          ? 'cursor-not-allowed opacity-50'
          : 'cursor-pointer hover:scale-[1.02] hover:border-[var(--brand-electric-blue)] hover:shadow-lg',
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
      tabIndex={disabled ? -1 : 0}
    >
      {/* Badge */}
      {badge && (
        <span
          className="absolute -right-2 -top-2 rounded-full px-2 py-0.5 text-xs font-medium"
          style={badgeStyles[badgeVariant]}
        >
          {badge}
        </span>
      )}

      {/* Icon Container */}
      <div
        className={cn(
          sizeClasses[size].icon,
          'mb-3 flex items-center justify-center rounded-xl transition-transform group-hover:scale-110'
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
          'flex items-center gap-1 font-medium text-[var(--brand-dark-navy)]'
        )}
      >
        {title}
        {isExternal && showExternalIcon && (
          <ExternalLink className="size-3 text-[var(--brand-slate)] opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </h4>

      {/* Description */}
      {description && (
        <p className={cn(sizeClasses[size].desc, 'mt-1 text-[var(--brand-slate)]')}>
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
  className?: string;
  columns?: 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
}

export function ToolCardGrid({
  children,
  className,
  columns = 4,
  gap = 'md',
}: ToolCardGridProps) {
  const columnClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  };

  const gapClasses = {
    lg: 'gap-6',
    md: 'gap-4',
    sm: 'gap-2',
  };

  return (
    <div className={cn('grid', columnClasses[columns], gapClasses[gap], className)}>
      {children}
    </div>
  );
}
