/**
 * WordPress dependencies
 */
import { Fill, ToolbarButton } from '@wordpress/components';
import { displayShortcut } from '@wordpress/keycodes';
import { jsx as _jsx } from "react/jsx-runtime";
export function RichTextToolbarButton({
  name,
  shortcutType,
  shortcutCharacter,
  ...props
}) {
  let shortcut;
  let fillName = 'RichText.ToolbarControls';
  if (name) {
    fillName += `.${name}`;
  }
  if (shortcutType && shortcutCharacter) {
    shortcut = displayShortcut[shortcutType](shortcutCharacter);
  }
  return /*#__PURE__*/_jsx(Fill, {
    name: fillName,
    children: /*#__PURE__*/_jsx(ToolbarButton, {
      ...props,
      shortcut: shortcut
    })
  });
}
//# sourceMappingURL=toolbar-button.js.map