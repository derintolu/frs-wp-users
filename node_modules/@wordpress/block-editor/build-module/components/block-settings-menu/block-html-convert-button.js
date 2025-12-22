/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { MenuItem } from '@wordpress/components';
import { rawHandler, getBlockContent } from '@wordpress/blocks';
import { useDispatch, useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { store as blockEditorStore } from '../../store';
import { jsx as _jsx } from "react/jsx-runtime";
function BlockHTMLConvertButton({
  clientId
}) {
  const block = useSelect(select => select(blockEditorStore).getBlock(clientId), [clientId]);
  const {
    replaceBlocks
  } = useDispatch(blockEditorStore);
  if (!block || block.name !== 'core/html') {
    return null;
  }
  return /*#__PURE__*/_jsx(MenuItem, {
    onClick: () => replaceBlocks(clientId, rawHandler({
      HTML: getBlockContent(block)
    })),
    children: __('Convert to Blocks')
  });
}
export default BlockHTMLConvertButton;
//# sourceMappingURL=block-html-convert-button.js.map