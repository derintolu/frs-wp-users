/**
 * WordPress dependencies
 */
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import groups from '../inspector-controls/groups';
import { jsx as _jsx } from "react/jsx-runtime";
export default function AdvancedControls(props) {
  const Slot = groups.advanced?.Slot;
  if (!Slot) {
    return null;
  }
  return /*#__PURE__*/_jsx(Slot, {
    ...props,
    children: fills => {
      if (!fills.length) {
        return null;
      }
      return /*#__PURE__*/_jsx(PanelBody, {
        title: __('Advanced'),
        children: fills
      });
    }
  });
}
//# sourceMappingURL=advanced-controls-panel.native.js.map