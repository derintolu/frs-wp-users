import { motion } from 'framer-motion';
import { Loader2, Users, FileText } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
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
          key={i}
          className="h-4 bg-[var(--brand-pale-blue)] rounded animate-pulse"
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
        />
      ))}
    </div>
  );
}

interface LoadingCardProps {
  type?: 'stats' | 'table' | 'grid' | 'partnership' | 'profile';
  count?: number;
}

export function LoadingCard({ type = 'stats', count = 1 }: LoadingCardProps) {
  const renderStatsCard = () => (
    <div className="bg-[var(--brand-pure-white)] border border-[var(--brand-powder-blue)] rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <LoadingSkeleton className="w-24" />
          <LoadingSkeleton className="w-16" />
          <LoadingSkeleton className="w-12" />
        </div>
        <div className="h-8 w-8 bg-[var(--brand-pale-blue)] rounded animate-pulse" />
      </div>
    </div>
  );

  const renderTableCard = () => (
    <div className="bg-[var(--brand-pure-white)] border border-[var(--brand-powder-blue)] rounded-lg p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <LoadingSkeleton className="w-48" />
          <LoadingSkeleton className="w-32" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex space-x-4">
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
    <div className="bg-[var(--brand-pure-white)] border border-[var(--brand-powder-blue)] rounded-lg p-4">
      <div className="space-y-3">
        <div className="h-32 bg-[var(--brand-pale-blue)] rounded animate-pulse" />
        <LoadingSkeleton rows={2} />
        <div className="flex space-x-2">
          <LoadingSkeleton className="flex-1" />
          <LoadingSkeleton className="flex-1" />
        </div>
      </div>
    </div>
  );

  const renderPartnershipCard = () => (
    <div className="bg-[var(--brand-pure-white)] border border-[var(--brand-powder-blue)] rounded-lg p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-[var(--brand-pale-blue)] rounded-full animate-pulse" />
          <div className="space-y-2 flex-1">
            <LoadingSkeleton className="w-64" />
            <LoadingSkeleton className="w-48" />
          </div>
        </div>
        
        {/* Notification settings */}
        <div className="bg-[var(--brand-pale-blue)] p-4 rounded-lg space-y-3">
          <LoadingSkeleton className="w-32" />
          <div className="space-y-2">
            <LoadingSkeleton className="w-full" />
            <LoadingSkeleton className="w-full" />
          </div>
        </div>

        {/* Pages grid */}
        <div className="space-y-4">
          <LoadingSkeleton className="w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-[var(--brand-powder-blue)] rounded-lg p-4">
                <div className="space-y-3">
                  <div className="h-32 bg-[var(--brand-pale-blue)] rounded animate-pulse" />
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
    <div className="bg-[var(--brand-pure-white)] border border-[var(--brand-powder-blue)] rounded-lg p-4">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="w-12 h-12 bg-[var(--brand-pale-blue)] rounded-full animate-pulse flex-shrink-0" />
        
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
              <div className="w-8 h-8 bg-[var(--brand-pale-blue)] rounded animate-pulse" />
              <div className="w-8 h-8 bg-[var(--brand-pale-blue)] rounded animate-pulse" />
              <div className="w-8 h-8 bg-[var(--brand-pale-blue)] rounded animate-pulse" />
            </div>
          </div>
          
          {/* Resources preview */}
          <div className="bg-[var(--brand-pale-blue)] p-3 rounded-lg space-y-2">
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
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
        >
          {renderContent()}
        </motion.div>
      ))}
    </>
  );
}

interface LoadingPageProps {
  title?: string;
  description?: string;
}

export function LoadingPage({ title = 'Loading...', description = 'Please wait while we load your data.' }: LoadingPageProps) {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <div className="relative">
          <LoadingSpinner size="lg" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="absolute -top-2 -right-2"
          >
            <Users className="h-4 w-4 text-[var(--brand-cyan)]" />
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
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[var(--brand-pure-white)] rounded-lg p-6 shadow-lg border border-[var(--brand-powder-blue)]"
      >
        <div className="flex items-center space-x-3">
          <LoadingSpinner />
          <span className="text-[var(--brand-dark-navy)]">{message}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}