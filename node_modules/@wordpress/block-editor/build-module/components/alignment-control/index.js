/**
 * Internal dependencies
 */
import AlignmentUI from './ui';
import { jsx as _jsx } from "react/jsx-runtime";
const AlignmentControl = props => {
  return /*#__PURE__*/_jsx(AlignmentUI, {
    ...props,
    isToolbar: false
  });
};
const AlignmentToolbar = props => {
  return /*#__PURE__*/_jsx(AlignmentUI, {
    ...props,
    isToolbar: true
  });
};

/**
 * @see https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/alignment-control/README.md
 */
export { AlignmentControl, AlignmentToolbar };
//# sourceMappingURL=index.js.map