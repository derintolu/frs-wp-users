/**
 * Internal dependencies
 */
import PanelColorGradientSettings from '../colors-gradients/panel-color-gradient-settings';
import { jsx as _jsx } from "react/jsx-runtime";
const PanelColorSettings = ({
  colorSettings,
  ...props
}) => {
  const settings = colorSettings.map(setting => {
    if (!setting) {
      return setting;
    }
    const {
      value,
      onChange,
      ...otherSettings
    } = setting;
    return {
      ...otherSettings,
      colorValue: value,
      onColorChange: onChange
    };
  });
  return /*#__PURE__*/_jsx(PanelColorGradientSettings, {
    settings: settings,
    gradients: [],
    disableCustomGradients: true,
    ...props
  });
};
export default PanelColorSettings;
//# sourceMappingURL=index.js.map