import { useState, useEffect } from 'react';

/**
 * Tour state stored in localStorage and user meta
 */
export interface TourState {
  tourId: string;
  completed: boolean;
  completedAt?: string;
  skipped: boolean;
  currentStep?: number;
}

/**
 * Hook to manage tour state with localStorage and optional API persistence
 */
export function useTourState(tourId: string, userId?: string | number) {
  const [completed, setCompleted] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [loading, setLoading] = useState(true);

  const storageKey = `frs_tour_${tourId}_${userId || 'guest'}`;

  // Load state from localStorage on mount
  useEffect(() => {
    const loadState = () => {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const state: TourState = JSON.parse(stored);
          setCompleted(state.completed);
          setSkipped(state.skipped);
        }
      } catch (error) {
        console.error('Failed to load tour state:', error);
      } finally {
        setLoading(false);
      }
    };

    loadState();
  }, [storageKey]);

  // Save state to localStorage
  const saveState = (newState: Partial<TourState>) => {
    try {
      const currentState: TourState = {
        tourId,
        completed: newState.completed ?? completed,
        skipped: newState.skipped ?? skipped,
        completedAt: newState.completed ? new Date().toISOString() : undefined,
      };

      localStorage.setItem(storageKey, JSON.stringify(currentState));

      if (newState.completed !== undefined) setCompleted(newState.completed);
      if (newState.skipped !== undefined) setSkipped(newState.skipped);

      // Optionally persist to server via REST API
      if (userId) {
        persistToServer(currentState);
      }
    } catch (error) {
      console.error('Failed to save tour state:', error);
    }
  };

  // Persist to WordPress user meta via REST API
  const persistToServer = async (state: TourState) => {
    try {
      const response = await fetch('/wp-json/frs-lrg/v1/tour-state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': (window as any).frsLRGData?.restNonce || '',
        },
        body: JSON.stringify({
          user_id: userId,
          tour_id: tourId,
          state,
        }),
      });

      if (!response.ok) {
        console.warn('Failed to persist tour state to server');
      }
    } catch (error) {
      console.error('Error persisting tour state:', error);
    }
  };

  const markCompleted = () => saveState({ completed: true, skipped: false });
  const markSkipped = () => saveState({ skipped: true, completed: false });
  const reset = () => saveState({ completed: false, skipped: false });

  return {
    completed,
    skipped,
    loading,
    markCompleted,
    markSkipped,
    reset,
    shouldShow: !completed && !skipped,
  };
}

/**
 * Hook to manage auto-show logic for first-time tours
 */
export function useFirstTimeTour(tourId: string, userId?: string | number, delay = 1000) {
  const [shouldAutoShow, setShouldAutoShow] = useState(false);
  const tourState = useTourState(tourId, userId);

  useEffect(() => {
    if (tourState.loading) return;

    // Auto-show tour if not completed/skipped and this is first visit
    if (tourState.shouldShow) {
      const timer = setTimeout(() => {
        setShouldAutoShow(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [tourState.loading, tourState.shouldShow, delay]);

  return {
    ...tourState,
    shouldAutoShow,
    dismissAutoShow: () => setShouldAutoShow(false),
  };
}

/**
 * Hook to check if any tour is currently active
 */
export function useActiveTour() {
  const [activeTourId, setActiveTourId] = useState<string | null>(null);

  return {
    activeTourId,
    setActiveTour: setActiveTourId,
    clearActiveTour: () => setActiveTourId(null),
    hasActiveTour: activeTourId !== null,
  };
}
