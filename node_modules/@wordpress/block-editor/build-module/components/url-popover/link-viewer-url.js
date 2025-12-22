/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import { ExternalLink } from '@wordpress/components';
import { safeDecodeURI, filterURLForDisplay } from '@wordpress/url';
import { jsx as _jsx } from "react/jsx-runtime";
export default function LinkViewerURL({
  url,
  urlLabel,
  className
}) {
  const linkClassName = clsx(className, 'block-editor-url-popover__link-viewer-url');
  if (!url) {
    return /*#__PURE__*/_jsx("span", {
      className: linkClassName
    });
  }
  return /*#__PURE__*/_jsx(ExternalLink, {
    className: linkClassName,
    href: url,
    children: urlLabel || filterURLForDisplay(safeDecodeURI(url))
  });
}
//# sourceMappingURL=link-viewer-url.js.map