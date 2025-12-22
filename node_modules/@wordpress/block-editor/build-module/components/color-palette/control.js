/**
 * Internal dependencies
 */
import ColorGradientControl from '../colors-gradients/control';
import { jsx as _jsx } from "react/jsx-runtime";
export default function ColorPaletteControl({
  onChange,
  value,
  ...otherProps
}) {
  return /*#__PURE__*/_jsx(ColorGradientControl, {
    ...otherProps,
    onColorChange: onChange,
    colorValue: value,
    gradients: [],
    disableCustomGradients: true
  });
}
//# sourceMappingURL=control.js.map