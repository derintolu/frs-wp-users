/**
 * WordPress dependencies
 */
import { ToolbarGroup } from '@wordpress/components';
import warning from '@wordpress/warning';

/**
 * Internal dependencies
 */
import groups from './groups';
import { jsx as _jsx } from "react/jsx-runtime";
export default function BlockControlsSlot({
  group = 'default',
  ...props
}) {
  const Slot = groups[group]?.Slot;
  if (!Slot) {
    globalThis.SCRIPT_DEBUG === true ? warning(`Unknown BlockControls group "${group}" provided.`) : void 0;
    return null;
  }
  if (group === 'default') {
    return /*#__PURE__*/_jsx(Slot, {
      ...props
    });
  }
  return /*#__PURE__*/_jsx(Slot, {
    ...props,
    children: fills => {
      if (!fills.length) {
        return null;
      }
      return /*#__PURE__*/_jsx(ToolbarGroup, {
        children: fills
      });
    }
  });
}
//# sourceMappingURL=slot.native.js.map