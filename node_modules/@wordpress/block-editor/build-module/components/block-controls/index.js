/**
 * Internal dependencies
 */
import BlockControlsFill from './fill';
import BlockControlsSlot from './slot';
import { jsx as _jsx } from "react/jsx-runtime";
const BlockControls = BlockControlsFill;
BlockControls.Slot = BlockControlsSlot;

// This is just here for backward compatibility.
export const BlockFormatControls = props => {
  return /*#__PURE__*/_jsx(BlockControlsFill, {
    group: "inline",
    ...props
  });
};
BlockFormatControls.Slot = props => {
  return /*#__PURE__*/_jsx(BlockControlsSlot, {
    group: "inline",
    ...props
  });
};
export default BlockControls;
//# sourceMappingURL=index.js.map