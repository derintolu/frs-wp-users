import { createContext, useContext, useState, ReactNode } from 'react';

type EditSection = 'personal' | 'professional' | 'social' | 'links' | null;

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
  const [activeSection, setActiveSection] = useState<EditSection>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [handleSave, setHandleSave] = useState<(() => Promise<void>) | null>(null);
  const [handleCancel, setHandleCancel] = useState<(() => void) | null>(null);

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
