/**
 * WordPress dependencies
 */
import { Composite } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { MediaPreview } from './media-preview';
import { jsx as _jsx } from "react/jsx-runtime";
function MediaList({
  mediaList,
  category,
  onClick,
  label = __('Media List')
}) {
  return /*#__PURE__*/_jsx(Composite, {
    role: "listbox",
    className: "block-editor-inserter__media-list",
    "aria-label": label,
    children: mediaList.map((media, index) => /*#__PURE__*/_jsx(MediaPreview, {
      media: media,
      category: category,
      onClick: onClick
    }, media.id || media.sourceId || index))
  });
}
export default MediaList;
//# sourceMappingURL=media-list.js.map