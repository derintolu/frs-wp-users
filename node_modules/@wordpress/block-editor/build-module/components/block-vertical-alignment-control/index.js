/**
 * Internal dependencies
 */
import BlockVerticalAlignmentUI from './ui';
import { jsx as _jsx } from "react/jsx-runtime";
const BlockVerticalAlignmentControl = props => {
  return /*#__PURE__*/_jsx(BlockVerticalAlignmentUI, {
    ...props,
    isToolbar: false
  });
};
const BlockVerticalAlignmentToolbar = props => {
  return /*#__PURE__*/_jsx(BlockVerticalAlignmentUI, {
    ...props,
    isToolbar: true
  });
};

/**
 * @see https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/block-vertical-alignment-control/README.md
 */
export { BlockVerticalAlignmentControl, BlockVerticalAlignmentToolbar };
//# sourceMappingURL=index.js.map