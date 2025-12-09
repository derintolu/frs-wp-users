import { motion } from 'framer-motion';
import { Loader2, Users } from 'lucide-react';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ className = '', size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    lg: 'h-8 w-8',
    md: 'h-6 w-6', 
    sm: 'h-4 w-4'
  };

  return (
    <Loader2 
      className={`animate-spin text-[var(--brand-electric-blue)] ${sizeClasses[size]} ${className}`} 
    />
  );
}

interface LoadingSkeletonProps {
  className?: string;
  rows?: number;
}

export function LoadingSkeleton({ className = '', rows = 1 }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          className="h-4 animate-pulse rounded bg-[var(--brand-pale-blue)]"
          initial={{ opacity: 0.6 }}
          key={i}
          transition={{ delay: i * 0.1, duration: 1.5, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

interface LoadingCardProps {
  count?: number;
  type?: 'stats' | 'table' | 'grid' | 'partnership' | 'profile';
}

export function LoadingCard({ count = 1, type = 'stats' }: LoadingCardProps) {
  const renderStatsCard = () => (
    <div className="rounded-lg border border-[var(--brand-powder-blue)] bg-[var(--brand-pure-white)] p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <LoadingSkeleton className="w-24" />
          <LoadingSkeleton className="w-16" />
          <LoadingSkeleton className="w-12" />
        </div>
        <div className="size-8 animate-pulse rounded bg-[var(--brand-pale-blue)]" />
      </div>
    </div>
  );

  const renderTableCard = () => (
    <div className="rounded-lg border border-[var(--brand-powder-blue)] bg-[var(--brand-pure-white)] p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <LoadingSkeleton className="w-48" />
          <LoadingSkeleton className="w-32" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div className="flex space-x-4" key={i}>
              <LoadingSkeleton className="w-40" />
              <LoadingSkeleton className="w-48" />
              <LoadingSkeleton className="w-24" />
              <LoadingSkeleton className="w-32" />
              <LoadingSkeleton className="w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGridCard = () => (
    <div className="rounded-lg border border-[var(--brand-powder-blue)] bg-[var(--brand-pure-white)] p-4">
      <div className="space-y-3">
        <div className="h-32 animate-pulse rounded bg-[var(--brand-pale-blue)]" />
        <LoadingSkeleton rows={2} />
        <div className="flex space-x-2">
          <LoadingSkeleton className="flex-1" />
          <LoadingSkeleton className="flex-1" />
        </div>
      </div>
    </div>
  );

  const renderPartnershipCard = () => (
    <div className="rounded-lg border border-[var(--brand-powder-blue)] bg-[var(--brand-pure-white)] p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="size-12 animate-pulse rounded-full bg-[var(--brand-pale-blue)]" />
          <div className="flex-1 space-y-2">
            <LoadingSkeleton className="w-64" />
            <LoadingSkeleton className="w-48" />
          </div>
        </div>
        
        {/* Notification settings */}
        <div className="space-y-3 rounded-lg bg-[var(--brand-pale-blue)] p-4">
          <LoadingSkeleton className="w-32" />
          <div className="space-y-2">
            <LoadingSkeleton className="w-full" />
            <LoadingSkeleton className="w-full" />
          </div>
        </div>

        {/* Pages grid */}
        <div className="space-y-4">
          <LoadingSkeleton className="w-48" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div className="rounded-lg border border-[var(--brand-powder-blue)] p-4" key={i}>
                <div className="space-y-3">
                  <div className="h-32 animate-pulse rounded bg-[var(--brand-pale-blue)]" />
                  <LoadingSkeleton rows={2} />
                  <div className="flex space-x-2">
                    <LoadingSkeleton className="flex-1" />
                    <LoadingSkeleton className="flex-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfileCard = () => (
    <div className="rounded-lg border border-[var(--brand-powder-blue)] bg-[var(--brand-pure-white)] p-4">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="size-12 shrink-0 animate-pulse rounded-full bg-[var(--brand-pale-blue)]" />
        
        {/* Content */}
        <div className="flex-1 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <LoadingSkeleton className="w-32" />
            <LoadingSkeleton className="w-20" />
          </div>
          
          {/* Details */}
          <div className="space-y-2">
            <LoadingSkeleton className="w-48" />
            <LoadingSkeleton className="w-40" />
            <LoadingSkeleton className="w-36" />
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <LoadingSkeleton className="w-16" />
              <LoadingSkeleton className="w-20" />
            </div>
            <div className="flex space-x-1">
              <div className="size-8 animate-pulse rounded bg-[var(--brand-pale-blue)]" />
              <div className="size-8 animate-pulse rounded bg-[var(--brand-pale-blue)]" />
              <div className="size-8 animate-pulse rounded bg-[var(--brand-pale-blue)]" />
            </div>
          </div>
          
          {/* Resources preview */}
          <div className="space-y-2 rounded-lg bg-[var(--brand-pale-blue)] p-3">
            <LoadingSkeleton className="w-28" />
            <div className="flex items-center justify-between">
              <div className="flex space-x-3">
                <LoadingSkeleton className="w-16" />
                <LoadingSkeleton className="w-20" />
              </div>
              <LoadingSkeleton className="w-16" />
            </div>
            <div className="flex items-center justify-between">
              <LoadingSkeleton className="w-32" />
              <LoadingSkeleton className="w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (type) {
      case 'stats':
        return renderStatsCard();
      case 'table':
        return renderTableCard();
      case 'grid':
        return renderGridCard();
      case 'partnership':
        return renderPartnershipCard();
      case 'profile':
        return renderProfileCard();
      default:
        return renderStatsCard();
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          key={i}
          transition={{ delay: i * 0.1 }}
        >
          {renderContent()}
        </motion.div>
      ))}
    </>
  );
}

interface LoadingPageProps {
  description?: string;
  title?: string;
}

export function LoadingPage({ description = 'Please wait while we load your data.', title = 'Loading...' }: LoadingPageProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4 text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          <LoadingSpinner size="lg" />
          <motion.div
            animate={{ scale: [0, 1.2, 1] }}
            className="absolute -right-2 -top-2"
            initial={{ scale: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Users className="size-4 text-[var(--brand-cyan)]" />
          </motion.div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-[var(--brand-dark-navy)]">{title}</h3>
          <p className="text-sm text-[var(--brand-slate)]">{description}</p>
        </div>
      </motion.div>
    </div>
  );
}

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export function LoadingOverlay({ isVisible, message = 'Loading...' }: LoadingOverlayProps) {
  if (!isVisible) {return null;}

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
    >
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-lg border border-[var(--brand-powder-blue)] bg-[var(--brand-pure-white)] p-6 shadow-lg"
        exit={{ opacity: 0, scale: 0.9 }}
        initial={{ opacity: 0, scale: 0.9 }}
      >
        <div className="flex items-center space-x-3">
          <LoadingSpinner />
          <span className="text-[var(--brand-dark-navy)]">{message}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}