import { createContext, useContext, useState, ReactNode } from 'react';

type EditSection = 'personal' | 'professional' | 'social' | 'links' | null;

interface ProfileEditContextType {
  activeSection: EditSection;
  handleCancel: (() => void) | null;
  handleSave: (() => Promise<void>) | null;
  isSaving: boolean;
  setActiveSection: (section: EditSection) => void;
  setHandleCancel: (handler: (() => void) | null) => void;
  setHandleSave: (handler: (() => Promise<void>) | null) => void;
  setIsSaving: (saving: boolean) => void;
}

const ProfileEditContext = createContext<ProfileEditContextType | undefined>(undefined);

export function ProfileEditProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSection] = useState<EditSection>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [handleSave, setHandleSave] = useState<(() => Promise<void>) | null>(null);
  const [handleCancel, setHandleCancel] = useState<(() => void) | null>(null);

  return (
    <ProfileEditContext.Provider
      value={{
        activeSection,
        handleCancel,
        handleSave,
        isSaving,
        setActiveSection,
        setHandleCancel,
        setHandleSave,
        setIsSaving,
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
