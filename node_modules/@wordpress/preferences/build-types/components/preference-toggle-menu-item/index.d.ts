type PreferenceToggleMenuItemProps = {
    scope: string;
    name: string;
    label: string;
    info?: string;
    messageActivated?: string;
    messageDeactivated?: string;
    shortcut?: string | {
        display: string;
        ariaLabel: string;
    };
    handleToggling?: boolean;
    onToggle?: () => void;
    disabled?: boolean;
};
export default function PreferenceToggleMenuItem({ scope, name, label, info, messageActivated, messageDeactivated, shortcut, handleToggling, onToggle, disabled, }: PreferenceToggleMenuItemProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=index.d.ts.map