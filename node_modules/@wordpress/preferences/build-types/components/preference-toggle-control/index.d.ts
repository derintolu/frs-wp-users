import type { BaseOptionProps } from '../preference-base-option/types';
export type PreferenceToggleControlProps = {
    scope: string;
    featureName: string;
    onToggle: () => void;
} & Omit<BaseOptionProps, 'onChange' | 'isChecked'>;
declare function PreferenceToggleControl(props: PreferenceToggleControlProps): import("react").JSX.Element;
export default PreferenceToggleControl;
//# sourceMappingURL=index.d.ts.map