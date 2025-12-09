/**
 * AnnouncementCard Component
 *
 * A card for displaying announcements, news, or updates with optional badge and timestamp.
 * Used in Welcome page and notification areas.
 *
 * @example
 * <AnnouncementCard
 *   title="New Feature Released"
 *   excerpt="Check out our latest marketing automation tools..."
 *   date="2024-01-15"
 *   badge="NEW"
 *   priority="high"
 *   onClick={() => openAnnouncement(id)}
 * />
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '../card';
import { Bell } from 'lucide-react';

export type AnnouncementPriority = 'high' | 'medium' | 'low';
export type AnnouncementBadge = 'NEW' | 'IMPORTANT' | 'UPDATE' | 'FEATURED' | string;

export interface AnnouncementCardProps {
  /** Badge text */
  badge?: AnnouncementBadge;
  /** Additional className */
  className?: string;
  /** Full content (shown in modal/expanded view) */
  content?: string;
  /** Date string or Date object */
  date?: string | Date;
  /** Short excerpt or summary */
  excerpt?: string;
  /** Whether the announcement has been read */
  isRead?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Priority level affects visual indicator */
  priority?: AnnouncementPriority;
  /** Thumbnail image URL */
  thumbnail?: string;
  /** Announcement title */
  title: string;
}

export function AnnouncementCard({
  badge,
  className,
  date,
  excerpt,
  isRead = false,
  onClick,
  priority = 'medium',
  thumbnail,
  title,
}: AnnouncementCardProps) {
  const priorityColors = {
    high: '#ef4444', 
    low: 'var(--brand-slate)',
    // red
medium: 'var(--brand-electric-blue)',
  };

  const badgeStyles: Record<string, { bg: string; text: string }> = {
    FEATURED: { bg: 'var(--brand-navy)', text: 'white' },
    IMPORTANT: { bg: '#ef4444', text: 'white' },
    NEW: { bg: 'var(--brand-electric-blue)', text: 'white' },
    UPDATE: { bg: 'var(--brand-cyan)', text: 'white' },
  };

  const formatDate = (d: string | Date) => {
    const dateObj = typeof d === 'string' ? new Date(d) : d;
    return dateObj.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const currentBadgeStyle = badge
    ? badgeStyles[badge.toUpperCase()] || { bg: 'var(--brand-slate)', text: 'white' }
    : null;

  return (
    <Card
      className={cn(
        'relative cursor-pointer transition-all duration-200',
        'overflow-hidden rounded-lg border-l-4',
        'hover:shadow-md',
        isRead ? 'opacity-75' : '',
        className
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--brand-pale-blue)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--brand-off-white)';
      }}
      role="button"
      style={{
        backgroundColor: 'var(--brand-off-white)',
        borderLeftColor: priorityColors[priority],
      }}
      tabIndex={0}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Thumbnail */}
          {thumbnail && (
            <div className="shrink-0">
              <img
                alt=""
                className="size-16 rounded-lg object-cover"
                src={thumbnail}
              />
            </div>
          )}

          {/* Content */}
          <div className="min-w-0 flex-1">
            {/* Title and Badge */}
            <div className="mb-2 flex items-center gap-2">
              <h4 className="truncate text-sm font-medium text-[var(--brand-dark-navy)]">
                {title}
              </h4>
              {badge && currentBadgeStyle && (
                <span
                  className="shrink-0 rounded px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: currentBadgeStyle.bg,
                    color: currentBadgeStyle.text,
                  }}
                >
                  {badge}
                </span>
              )}
            </div>

            {/* Excerpt */}
            {excerpt && (
              <p className="mb-2 line-clamp-2 text-xs text-[var(--brand-slate)]">
                {excerpt}
              </p>
            )}

            {/* Footer with date and priority indicator */}
            <div className="flex items-center justify-between">
              {date && (
                <p className="text-xs text-[var(--brand-slate)]">{formatDate(date)}</p>
              )}
              <div
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: priorityColors[priority] }}
                title={`${priority} priority`}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * AnnouncementList Component
 *
 * A container for displaying multiple announcements with consistent spacing.
 */
export interface AnnouncementListProps {
  children: React.ReactNode;
  /** Additional className */
  className?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Maximum items to show before "show more" */
  maxItems?: number;
  /** Whether to show empty state */
  showEmptyState?: boolean;
}

export function AnnouncementList({
  children,
  className,
  emptyMessage = 'No announcements at this time',
  maxItems,
  showEmptyState = true,
}: AnnouncementListProps) {
  const childArray = React.Children.toArray(children);
  const hasChildren = childArray.length > 0;
  const displayedChildren = maxItems ? childArray.slice(0, maxItems) : childArray;
  const remainingCount = maxItems && childArray.length > maxItems ? childArray.length - maxItems : 0;

  if (!hasChildren && showEmptyState) {
    return (
      <div className="py-8 text-center">
        <Bell className="mx-auto mb-2 size-8 text-[var(--brand-pale-blue)]" />
        <p className="text-sm text-[var(--brand-slate)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {displayedChildren}
      {remainingCount > 0 && (
        <div className="pt-2 text-center">
          <p className="text-xs text-[var(--brand-slate)]">
            +{remainingCount} more announcements
          </p>
        </div>
      )}
    </div>
  );
}
