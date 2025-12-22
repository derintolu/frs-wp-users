/**
 * Internal dependencies
 */
import { __experimentalUseGradient } from './use-gradient';
import { jsx as _jsx } from "react/jsx-runtime";
export const withGradient = WrappedComponent => props => {
  const {
    gradientValue
  } = __experimentalUseGradient();
  return /*#__PURE__*/_jsx(WrappedComponent, {
    ...props,
    gradientValue: gradientValue
  });
};
//# sourceMappingURL=with-gradient.js.map