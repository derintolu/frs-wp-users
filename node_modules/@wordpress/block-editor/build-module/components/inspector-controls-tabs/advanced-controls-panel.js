/**
 * WordPress dependencies
 */
import { PanelBody, __experimentalUseSlotFills as useSlotFills } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { default as InspectorControls, InspectorAdvancedControls } from '../inspector-controls';
import { jsx as _jsx } from "react/jsx-runtime";
const AdvancedControls = () => {
  const fills = useSlotFills(InspectorAdvancedControls.slotName);
  const hasFills = Boolean(fills && fills.length);
  if (!hasFills) {
    return null;
  }
  return /*#__PURE__*/_jsx(PanelBody, {
    className: "block-editor-block-inspector__advanced",
    title: __('Advanced'),
    initialOpen: false,
    children: /*#__PURE__*/_jsx(InspectorControls.Slot, {
      group: "advanced"
    })
  });
};
export default AdvancedControls;
//# sourceMappingURL=advanced-controls-panel.js.map