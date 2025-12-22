/**
 * WordPress dependencies
 */
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { store as blockEditorStore } from '../../store';
import { jsx as _jsx } from "react/jsx-runtime";
export default function BlockEditVisuallyButton({
  clientIds
}) {
  // Edit visually only works for single block selection.
  const clientId = clientIds.length === 1 ? clientIds[0] : undefined;
  const canEditVisually = useSelect(select => !!clientId && select(blockEditorStore).getBlockMode(clientId) === 'html', [clientId]);
  const {
    toggleBlockMode
  } = useDispatch(blockEditorStore);
  if (!canEditVisually) {
    return null;
  }
  return /*#__PURE__*/_jsx(ToolbarGroup, {
    children: /*#__PURE__*/_jsx(ToolbarButton, {
      onClick: () => {
        toggleBlockMode(clientId);
      },
      children: __('Edit visually')
    })
  });
}
//# sourceMappingURL=index.js.map