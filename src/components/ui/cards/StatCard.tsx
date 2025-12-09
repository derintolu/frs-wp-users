/**
 * StatCard Component
 *
 * A card for displaying KPI metrics with value, label, and optional change indicator.
 * Used in dashboards and analytics sections.
 *
 * @example
 * <StatCard
 *   title="Total Leads"
 *   value="1,270"
 *   change="+12%"
 *   changeType="positive"
 *   icon={<Users className="h-5 w-5" />}
 *   variant="gradient-blue"
 * />
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '../card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type StatCardVariant =
  | 'default'
  | 'gradient-blue'
  | 'gradient-teal'
  | 'gradient-navy'
  | 'gradient-hero'
  | 'accent';

export interface StatCardProps {
  /** Change indicator (e.g., "+12%", "-5%") */
  change?: string;
  /** Change type for styling */
  changeType?: 'positive' | 'negative' | 'neutral';
  /** Additional className */
  className?: string;
  /** Additional description */
  description?: string;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Metric title/label */
  title: string;
  /** Metric value (formatted string) */
  value: string | number;
  /** Card variant */
  variant?: StatCardVariant;
}

export function StatCard({
  change,
  changeType = 'neutral',
  className,
  description,
  icon,
  onClick,
  size = 'md',
  title,
  value,
  variant = 'default',
}: StatCardProps) {
  const isGradient = variant.startsWith('gradient');
  const isInteractive = !!onClick;

  const sizeClasses = {
    lg: { change: 'text-sm', padding: 'p-6', title: 'text-base', value: 'text-3xl' },
    md: { change: 'text-sm', padding: 'p-4', title: 'text-sm', value: 'text-2xl' },
    sm: { change: 'text-xs', padding: 'p-3', title: 'text-xs', value: 'text-xl' },
  };

  const gradientStyles: Record<string, React.CSSProperties> = {
    'gradient-blue': { background: 'var(--gradient-brand-blue)' },
    'gradient-hero': { background: 'var(--gradient-hero)' },
    'gradient-navy': { background: 'var(--gradient-brand-navy)' },
    'gradient-teal': { background: 'var(--gradient-brand-teal)' },
  };

  const changeColors = {
    negative: isGradient ? 'text-white/90' : 'text-red-600',
    neutral: isGradient ? 'text-white/70' : 'text-[var(--brand-slate)]',
    positive: isGradient ? 'text-white/90' : 'text-green-600',
  };

  const ChangeIcon = {
    negative: TrendingDown,
    neutral: Minus,
    positive: TrendingUp,
  }[changeType];

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        sizeClasses[size].padding,
        isGradient && 'border-0 text-white',
        variant === 'accent' && 'border-l-4 border-l-[var(--brand-electric-blue)]',
        variant === 'default' && 'border-[var(--brand-powder-blue)]',
        isInteractive && 'cursor-pointer hover:scale-[1.02] hover:shadow-lg',
        className
      )}
      onClick={onClick}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      role={isInteractive ? 'button' : undefined}
      style={gradientStyles[variant] || {}}
      tabIndex={isInteractive ? 0 : undefined}
    >
      <CardContent className="p-0">
        {/* Header with title and icon */}
        <div className="mb-2 flex items-start justify-between">
          <p
            className={cn(
              sizeClasses[size].title,
              'truncate font-medium',
              isGradient ? 'text-white/90' : 'text-[var(--brand-slate)]'
            )}
          >
            {title}
          </p>
          {icon && (
            <div className={cn(isGradient ? 'text-white/70' : 'text-[var(--brand-electric-blue)]')}>
              {icon}
            </div>
          )}
        </div>

        {/* Value */}
        <p
          className={cn(
            sizeClasses[size].value,
            'font-bold',
            isGradient ? 'text-white' : 'text-[var(--brand-dark-navy)]'
          )}
        >
          {value}
        </p>

        {/* Change indicator */}
        {change && (
          <div className={cn('mt-1 flex items-center gap-1', changeColors[changeType])}>
            <ChangeIcon className="size-3" />
            <span className={sizeClasses[size].change}>{change}</span>
          </div>
        )}

        {/* Optional description */}
        {description && (
          <p
            className={cn(
              'mt-2 text-xs',
              isGradient ? 'text-white/70' : 'text-[var(--brand-slate)]'
            )}
          >
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
