/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { createInterpolateElement, useState } from '@wordpress/element';
import { Tip } from '@wordpress/components';
import { jsx as _jsx } from "react/jsx-runtime";
const globalTips = [createInterpolateElement(__('While writing, you can press <kbd>/</kbd> to quickly insert new blocks.'), {
  kbd: /*#__PURE__*/_jsx("kbd", {})
}), createInterpolateElement(__('Indent a list by pressing <kbd>space</kbd> at the beginning of a line.'), {
  kbd: /*#__PURE__*/_jsx("kbd", {})
}), createInterpolateElement(__('Outdent a list by pressing <kbd>backspace</kbd> at the beginning of a line.'), {
  kbd: /*#__PURE__*/_jsx("kbd", {})
}), __('Drag files into the editor to automatically insert media blocks.'), __("Change a block's type by pressing the block icon on the toolbar.")];
function Tips() {
  const [randomIndex] = useState(
  // Disable Reason: I'm not generating an HTML id.
  // eslint-disable-next-line no-restricted-syntax
  Math.floor(Math.random() * globalTips.length));
  return /*#__PURE__*/_jsx(Tip, {
    children: globalTips[randomIndex]
  });
}
export default Tips;
//# sourceMappingURL=tips.js.map