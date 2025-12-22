/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { MenuGroup } from '@wordpress/components';

/**
 * Internal dependencies
 */
import BlockStylesMenuItems from '../block-styles/menu-items';
import { jsx as _jsx } from "react/jsx-runtime";
export default function BlockStylesMenu({
  hoveredBlock,
  onSwitch
}) {
  const {
    clientId
  } = hoveredBlock;
  return /*#__PURE__*/_jsx(MenuGroup, {
    label: __('Styles'),
    className: "block-editor-block-switcher__styles__menugroup",
    children: /*#__PURE__*/_jsx(BlockStylesMenuItems, {
      clientId: clientId,
      onSwitch: onSwitch
    })
  });
}
//# sourceMappingURL=block-styles-menu.js.map