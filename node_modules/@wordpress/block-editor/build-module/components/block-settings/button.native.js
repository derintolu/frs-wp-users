/**
 * WordPress dependencies
 */
import { createSlotFill, ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { withDispatch } from '@wordpress/data';
import { cog } from '@wordpress/icons';
import { jsx as _jsx } from "react/jsx-runtime";
const {
  Fill,
  Slot
} = createSlotFill('SettingsToolbarButton');
const SettingsButton = ({
  openGeneralSidebar
}) => /*#__PURE__*/_jsx(ToolbarGroup, {
  children: /*#__PURE__*/_jsx(ToolbarButton, {
    title: __('Open Settings'),
    icon: cog,
    onClick: openGeneralSidebar
  })
});
const SettingsButtonFill = props => /*#__PURE__*/_jsx(Fill, {
  children: /*#__PURE__*/_jsx(SettingsButton, {
    ...props
  })
});
const SettingsToolbarButton = withDispatch(dispatch => {
  const {
    openGeneralSidebar
  } = dispatch('core/edit-post');
  return {
    openGeneralSidebar: () => openGeneralSidebar('edit-post/block')
  };
})(SettingsButtonFill);
SettingsToolbarButton.Slot = Slot;
export default SettingsToolbarButton;
//# sourceMappingURL=button.native.js.map