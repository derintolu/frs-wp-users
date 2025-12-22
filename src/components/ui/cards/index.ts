/**
 * Unified Card Component System
 *
 * A collection of consistently styled card components for the portal.
 *
 * Components:
 * - FeatureCard: For features/tools with icon, title, description, and action
 * - StatCard: For KPI metrics with value, label, and change indicator
 * - ToolCard: For app launchers and tool grids (compact)
 * - AnnouncementCard: For news/updates with badges and timestamps
 *
 * @example
 * import { FeatureCard, StatCard, ToolCard, AnnouncementCard } from '@/components/ui/cards';
 *
 * // Feature card for Marketing Hub
 * <FeatureCard
 *   icon={<Calendar />}
 *   title="Calendar"
 *   description="Manage your appointments"
 *   actionLabel="Explore"
 *   onAction={() => navigate('/calendar')}
 * />
 *
 * // Stat card for KPIs
 * <StatCard
 *   title="Total Leads"
 *   value="1,270"
 *   change="+12%"
 *   changeType="positive"
 *   variant="gradient-blue"
 * />
 *
 * // Tool card for app launcher
 * <ToolCard
 *   icon={<Calculator />}
 *   title="Mortgage Calculator"
 *   href="https://calculator.example.com"
 *   badge="New"
 * />
 *
 * // Announcement card
 * <AnnouncementCard
 *   title="New Feature Released"
 *   excerpt="Check out our latest tools..."
 *   date="2024-01-15"
 *   badge="NEW"
 *   priority="high"
 * />
 */

export { FeatureCard, type FeatureCardProps } from './FeatureCard';
export { StatCard, type StatCardProps, type StatCardVariant } from './StatCard';
export { ToolCard, ToolCardGrid, type ToolCardProps, type ToolCardGridProps } from './ToolCard';
export {
  AnnouncementCard,
  AnnouncementList,
  type AnnouncementCardProps,
  type AnnouncementListProps,
  type AnnouncementPriority,
  type AnnouncementBadge,
} from './AnnouncementCard';
