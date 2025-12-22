/**
 * Internal dependencies
 */
import JustifyContentUI from './ui';
import { jsx as _jsx } from "react/jsx-runtime";
const JustifyContentControl = props => {
  return /*#__PURE__*/_jsx(JustifyContentUI, {
    ...props,
    isToolbar: false
  });
};
const JustifyToolbar = props => {
  return /*#__PURE__*/_jsx(JustifyContentUI, {
    ...props,
    isToolbar: true
  });
};

/**
 * @see https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/justify-content-control/README.md
 */
export { JustifyContentControl, JustifyToolbar };
//# sourceMappingURL=index.js.map