/**
 * Internal dependencies
 */
import BlockAlignmentUI from './ui';
import { jsx as _jsx } from "react/jsx-runtime";
const BlockAlignmentControl = props => {
  return /*#__PURE__*/_jsx(BlockAlignmentUI, {
    ...props,
    isToolbar: false
  });
};
const BlockAlignmentToolbar = props => {
  return /*#__PURE__*/_jsx(BlockAlignmentUI, {
    ...props,
    isToolbar: true
  });
};

/**
 * @see https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/block-alignment-control/README.md
 */
export { BlockAlignmentControl, BlockAlignmentToolbar };
//# sourceMappingURL=index.js.map