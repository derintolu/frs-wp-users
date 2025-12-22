/**
 * WordPress dependencies
 */
import warning from '@wordpress/warning';
import deprecated from '@wordpress/deprecated';

/**
 * Internal dependencies
 */
import groups from './groups';
import { jsx as _jsx } from "react/jsx-runtime";
export default function InspectorControlsSlot({
  __experimentalGroup,
  group = 'default',
  ...props
}) {
  if (__experimentalGroup) {
    deprecated('`__experimentalGroup` property in `InspectorControlsSlot`', {
      since: '6.2',
      version: '6.4',
      alternative: '`group`'
    });
    group = __experimentalGroup;
  }
  const Slot = groups[group]?.Slot;
  if (!Slot) {
    globalThis.SCRIPT_DEBUG === true ? warning(`Unknown InspectorControls group "${group}" provided.`) : void 0;
    return null;
  }
  return /*#__PURE__*/_jsx(Slot, {
    ...props
  });
}
//# sourceMappingURL=slot.native.js.map