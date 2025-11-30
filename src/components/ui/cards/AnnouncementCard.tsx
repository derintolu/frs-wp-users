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
import { Bell, AlertCircle, Info, Star } from 'lucide-react';

export type AnnouncementPriority = 'high' | 'medium' | 'low';
export type AnnouncementBadge = 'NEW' | 'IMPORTANT' | 'UPDATE' | 'FEATURED' | string;

export interface AnnouncementCardProps {
  /** Announcement title */
  title: string;
  /** Short excerpt or summary */
  excerpt?: string;
  /** Full content (shown in modal/expanded view) */
  content?: string;
  /** Date string or Date object */
  date?: string | Date;
  /** Badge text */
  badge?: AnnouncementBadge;
  /** Priority level affects visual indicator */
  priority?: AnnouncementPriority;
  /** Thumbnail image URL */
  thumbnail?: string;
  /** Click handler */
  onClick?: () => void;
  /** Whether the announcement has been read */
  isRead?: boolean;
  /** Additional className */
  className?: string;
}

export function AnnouncementCard({
  title,
  excerpt,
  date,
  badge,
  priority = 'medium',
  thumbnail,
  onClick,
  isRead = false,
  className,
}: AnnouncementCardProps) {
  const priorityColors = {
    high: '#ef4444', // red
    medium: 'var(--brand-electric-blue)',
    low: 'var(--brand-slate)',
  };

  const badgeStyles: Record<string, { bg: string; text: string }> = {
    NEW: { bg: 'var(--brand-electric-blue)', text: 'white' },
    IMPORTANT: { bg: '#ef4444', text: 'white' },
    UPDATE: { bg: 'var(--brand-cyan)', text: 'white' },
    FEATURED: { bg: 'var(--brand-navy)', text: 'white' },
  };

  const formatDate = (d: string | Date) => {
    const dateObj = typeof d === 'string' ? new Date(d) : d;
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const currentBadgeStyle = badge
    ? badgeStyles[badge.toUpperCase()] || { bg: 'var(--brand-slate)', text: 'white' }
    : null;

  return (
    <Card
      className={cn(
        'relative transition-all duration-200 cursor-pointer',
        'border-l-4 rounded-lg overflow-hidden',
        'hover:shadow-md',
        isRead ? 'opacity-75' : '',
        className
      )}
      style={{
        borderLeftColor: priorityColors[priority],
        backgroundColor: 'var(--brand-off-white)',
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
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
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Thumbnail */}
          {thumbnail && (
            <div className="flex-shrink-0">
              <img
                src={thumbnail}
                alt=""
                className="w-16 h-16 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title and Badge */}
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium text-[var(--brand-dark-navy)] text-sm truncate">
                {title}
              </h4>
              {badge && currentBadgeStyle && (
                <span
                  className="flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded"
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
              <p className="text-xs text-[var(--brand-slate)] mb-2 line-clamp-2">
                {excerpt}
              </p>
            )}

            {/* Footer with date and priority indicator */}
            <div className="flex items-center justify-between">
              {date && (
                <p className="text-xs text-[var(--brand-slate)]">{formatDate(date)}</p>
              )}
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
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
  /** Maximum items to show before "show more" */
  maxItems?: number;
  /** Whether to show empty state */
  showEmptyState?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Additional className */
  className?: string;
}

export function AnnouncementList({
  children,
  maxItems,
  showEmptyState = true,
  emptyMessage = 'No announcements at this time',
  className,
}: AnnouncementListProps) {
  const childArray = React.Children.toArray(children);
  const hasChildren = childArray.length > 0;
  const displayedChildren = maxItems ? childArray.slice(0, maxItems) : childArray;
  const remainingCount = maxItems && childArray.length > maxItems ? childArray.length - maxItems : 0;

  if (!hasChildren && showEmptyState) {
    return (
      <div className="text-center py-8">
        <Bell className="h-8 w-8 mx-auto mb-2 text-[var(--brand-pale-blue)]" />
        <p className="text-sm text-[var(--brand-slate)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {displayedChildren}
      {remainingCount > 0 && (
        <div className="text-center pt-2">
          <p className="text-xs text-[var(--brand-slate)]">
            +{remainingCount} more announcements
          </p>
        </div>
      )}
    </div>
  );
}
