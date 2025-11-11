import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { CalendarTour } from './CalendarTour';

interface FluentBookingCalendarProps {
  userId: string;
}

interface SetupStatus {
  setup_complete: boolean;
  has_calendar: boolean;
  needs_setup: boolean;
}

export function FluentBookingCalendar({ userId }: FluentBookingCalendarProps) {
  const [loading, setLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const nonce = (window as any).frsPortalConfig?.restNonce;
      const response = await fetch('/wp-json/frs/v1/calendar/setup-status', {
        headers: {
          'X-WP-Nonce': nonce,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSetupStatus(data);

        // Show tour if needs setup
        if (data.needs_setup) {
          // First ensure calendar exists
          await ensureCalendarExists();
          // Then show tour
          setShowTour(true);
        }
      }
    } catch (error) {
      console.error('Failed to check calendar setup status:', error);
    } finally {
      setLoading(false);
    }
  };

  const ensureCalendarExists = async () => {
    try {
      const nonce = (window as any).frsPortalConfig?.restNonce;
      await fetch('/wp-json/frs/v1/calendar/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce,
        },
        body: JSON.stringify({ user_id: userId }),
      });
    } catch (error) {
      console.error('Failed to ensure calendar exists:', error);
    }
  };

  const handleTourComplete = async () => {
    setShowTour(false);

    // Mark setup as complete
    try {
      const nonce = (window as any).frsPortalConfig?.restNonce;
      await fetch('/wp-json/frs/v1/calendar/complete-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce,
        },
        body: JSON.stringify({ user_id: userId }),
      });
    } catch (error) {
      console.error('Failed to mark setup complete:', error);
    }

    // Refresh iframe
    setIframeKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading calendar...</span>
      </div>
    );
  }

  return (
    <div className="h-full relative" style={{ marginTop: '-32px' }}>
      {/* Calendar Tour Overlay */}
      {showTour && (
        <CalendarTour
          isOpen={showTour}
          onClose={handleTourComplete}
        />
      )}

      {/* FluentBooking Calendar */}
      <div className="h-full">
        <iframe
          key={iframeKey}
          src="/my-bookings#/"
          className="w-full h-full border-0"
          style={{
            minHeight: '800px',
            height: '100vh'
          }}
          title="FluentBooking Calendar"
        />
      </div>
    </div>
  );
}
