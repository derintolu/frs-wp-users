import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type EditSection = 'personal' | 'professional' | 'social' | 'links' | 'directory' | null;

interface ProfileEditContextType {
  activeSection: EditSection;
  setActiveSection: (section: EditSection) => void;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
  handleSave: (() => Promise<void>) | null;
  setHandleSave: (handler: (() => Promise<void>) | null) => void;
  handleCancel: (() => void) | null;
  setHandleCancel: (handler: (() => void) | null) => void;
}

const ProfileEditContext = createContext<ProfileEditContextType | undefined>(undefined);

export function ProfileEditProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSectionState] = useState<EditSection>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [handleSave, setHandleSave] = useState<(() => Promise<void>) | null>(null);
  const [handleCancel, setHandleCancel] = useState<(() => void) | null>(null);

  // Wrapper to also dispatch events when section changes (for cross-tree communication)
  const setActiveSection = (section: EditSection) => {
    setActiveSectionState(section);
    // Dispatch event so sidebar (in other React tree) knows about the change
    window.dispatchEvent(new CustomEvent('frsEditSectionChanged', {
      detail: { section }
    }));
  };

  // Listen for edit section events from sidebar (separate React tree)
  useEffect(() => {
    const handleEditSection = (event: CustomEvent) => {
      const section = event.detail?.section as EditSection;
      console.log('[ProfileEditContext] Received frsEditSection event:', section);
      setActiveSectionState(section);
    };

    const handleEditMode = (event: CustomEvent) => {
      const isEditMode = event.detail?.isEditMode;
      console.log('[ProfileEditContext] Received frsEditMode event:', isEditMode);
      // If edit mode is turned off, clear the active section
      if (!isEditMode) {
        setActiveSectionState(null);
      }
    };

    window.addEventListener('frsEditSection', handleEditSection as EventListener);
    window.addEventListener('frsEditMode', handleEditMode as EventListener);

    return () => {
      window.removeEventListener('frsEditSection', handleEditSection as EventListener);
      window.removeEventListener('frsEditMode', handleEditMode as EventListener);
    };
  }, []);

  return (
    <ProfileEditContext.Provider
      value={{
        activeSection,
        setActiveSection,
        isSaving,
        setIsSaving,
        handleSave,
        setHandleSave,
        handleCancel,
        setHandleCancel,
      }}
    >
      {children}
    </ProfileEditContext.Provider>
  );
}

export function useProfileEdit() {
  const context = useContext(ProfileEditContext);
  if (context === undefined) {
    throw new Error('useProfileEdit must be used within a ProfileEditProvider');
  }
  return context;
}
