/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Popover, ToolbarGroup } from '@wordpress/components';

/**
 * Internal dependencies
 */
import BlockControls from '../block-controls';
import FormatToolbar from './format-toolbar';
import NavigableToolbar from '../navigable-toolbar';
import { jsx as _jsx } from "react/jsx-runtime";
function InlineToolbar({
  popoverAnchor
}) {
  return /*#__PURE__*/_jsx(Popover, {
    placement: "top",
    focusOnMount: false,
    anchor: popoverAnchor,
    className: "block-editor-rich-text__inline-format-toolbar",
    __unstableSlotName: "block-toolbar",
    children: /*#__PURE__*/_jsx(NavigableToolbar, {
      className: "block-editor-rich-text__inline-format-toolbar-group"
      /* translators: accessibility text for the inline format toolbar */,
      "aria-label": __('Format tools'),
      children: /*#__PURE__*/_jsx(ToolbarGroup, {
        children: /*#__PURE__*/_jsx(FormatToolbar, {})
      })
    })
  });
}
const FormatToolbarContainer = ({
  inline,
  editableContentElement
}) => {
  if (inline) {
    return /*#__PURE__*/_jsx(InlineToolbar, {
      popoverAnchor: editableContentElement
    });
  }

  // Render regular toolbar.
  return /*#__PURE__*/_jsx(BlockControls, {
    group: "inline",
    children: /*#__PURE__*/_jsx(FormatToolbar, {})
  });
};
export default FormatToolbarContainer;
//# sourceMappingURL=format-toolbar-container.js.map