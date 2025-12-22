/**
 * WordPress dependencies
 */
import { ResizableBox } from '@wordpress/components';

/**
 * Internal dependencies
 */
import BlockPopoverCover from '../block-popover/cover';
import { jsx as _jsx } from "react/jsx-runtime";
export default function ResizableBoxPopover({
  clientId,
  resizableBoxProps,
  ...props
}) {
  return /*#__PURE__*/_jsx(BlockPopoverCover, {
    clientId: clientId,
    __unstablePopoverSlot: "block-toolbar",
    ...props,
    children: /*#__PURE__*/_jsx(ResizableBox, {
      ...resizableBoxProps
    })
  });
}
//# sourceMappingURL=index.js.map