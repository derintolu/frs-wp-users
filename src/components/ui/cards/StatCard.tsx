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
import { Card, CardContent, CardHeader, CardTitle } from '../card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type StatCardVariant =
  | 'default'
  | 'gradient-blue'
  | 'gradient-teal'
  | 'gradient-navy'
  | 'gradient-hero'
  | 'accent';

export interface StatCardProps {
  /** Metric title/label */
  title: string;
  /** Metric value (formatted string) */
  value: string | number;
  /** Change indicator (e.g., "+12%", "-5%") */
  change?: string;
  /** Change type for styling */
  changeType?: 'positive' | 'negative' | 'neutral';
  /** Icon to display */
  icon?: React.ReactNode;
  /** Card variant */
  variant?: StatCardVariant;
  /** Additional description */
  description?: string;
  /** Click handler */
  onClick?: () => void;
  /** Additional className */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  variant = 'default',
  description,
  onClick,
  className,
  size = 'md',
}: StatCardProps) {
  const isGradient = variant.startsWith('gradient');
  const isInteractive = !!onClick;

  const sizeClasses = {
    sm: { padding: 'p-3', value: 'text-xl', title: 'text-xs', change: 'text-xs' },
    md: { padding: 'p-4', value: 'text-2xl', title: 'text-sm', change: 'text-sm' },
    lg: { padding: 'p-6', value: 'text-3xl', title: 'text-base', change: 'text-sm' },
  };

  const gradientStyles: Record<string, React.CSSProperties> = {
    'gradient-blue': { background: 'var(--gradient-brand-blue)' },
    'gradient-teal': { background: 'var(--gradient-brand-teal)' },
    'gradient-navy': { background: 'var(--gradient-brand-navy)' },
    'gradient-hero': { background: 'var(--gradient-hero)' },
  };

  const changeColors = {
    positive: isGradient ? 'text-white/90' : 'text-green-600',
    negative: isGradient ? 'text-white/90' : 'text-red-600',
    neutral: isGradient ? 'text-white/70' : 'text-[var(--brand-slate)]',
  };

  const ChangeIcon = {
    positive: TrendingUp,
    negative: TrendingDown,
    neutral: Minus,
  }[changeType];

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        sizeClasses[size].padding,
        isGradient && 'border-0 text-white',
        variant === 'accent' && 'border-l-4 border-l-[var(--brand-electric-blue)]',
        variant === 'default' && 'border-[var(--brand-powder-blue)]',
        isInteractive && 'cursor-pointer hover:shadow-lg hover:scale-[1.02]',
        className
      )}
      style={gradientStyles[variant] || {}}
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
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
    >
      <CardContent className="p-0">
        {/* Header with title and icon */}
        <div className="flex items-start justify-between mb-2">
          <p
            className={cn(
              sizeClasses[size].title,
              'font-medium truncate',
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
          <div className={cn('flex items-center gap-1 mt-1', changeColors[changeType])}>
            <ChangeIcon className="h-3 w-3" />
            <span className={sizeClasses[size].change}>{change}</span>
          </div>
        )}

        {/* Optional description */}
        {description && (
          <p
            className={cn(
              'text-xs mt-2',
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
