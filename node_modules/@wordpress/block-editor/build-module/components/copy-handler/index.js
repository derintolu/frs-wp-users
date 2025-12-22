/**
 * WordPress dependencies
 */
import deprecated from '@wordpress/deprecated';

/**
 * Internal dependencies
 */
import useClipboardHandler from '../writing-flow/use-clipboard-handler';

/**
 * @deprecated
 */
import { jsx as _jsx } from "react/jsx-runtime";
export const __unstableUseClipboardHandler = () => {
  deprecated('__unstableUseClipboardHandler', {
    alternative: 'BlockCanvas or WritingFlow',
    since: '6.4',
    version: '6.7'
  });
  return useClipboardHandler();
};

/**
 * @deprecated
 * @param {Object} props
 */
export default function CopyHandler(props) {
  deprecated('CopyHandler', {
    alternative: 'BlockCanvas or WritingFlow',
    since: '6.4',
    version: '6.7'
  });
  return /*#__PURE__*/_jsx("div", {
    ...props,
    ref: useClipboardHandler()
  });
}
//# sourceMappingURL=index.js.map