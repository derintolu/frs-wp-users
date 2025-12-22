/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { getDefaultBlockName } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import DefaultBlockAppender from '../default-block-appender';
import styles from './style.scss';
import { store as blockEditorStore } from '../../store';
import { jsx as _jsx } from "react/jsx-runtime";
function DefaultAppender({
  rootClientId,
  showSeparator
}) {
  const {
    blockClientIds,
    canInsertDefaultBlock
  } = useSelect(select => {
    const {
      getBlockOrder,
      canInsertBlockType
    } = select(blockEditorStore);
    return {
      blockClientIds: getBlockOrder(rootClientId),
      canInsertDefaultBlock: canInsertBlockType(getDefaultBlockName(), rootClientId)
    };
  }, [rootClientId]);
  if (!canInsertDefaultBlock) {
    return null;
  }
  return /*#__PURE__*/_jsx(DefaultBlockAppender, {
    rootClientId: rootClientId,
    lastBlockClientId: blockClientIds[blockClientIds.length - 1],
    containerStyle: styles.blockListAppender,
    placeholder: blockClientIds.length > 0 ? '' : null,
    showSeparator: showSeparator
  });
}
export default function BlockListAppender({
  rootClientId,
  renderAppender: CustomAppender,
  showSeparator
}) {
  const isLocked = useSelect(select => !!select(blockEditorStore).getTemplateLock(rootClientId), [rootClientId]);
  if (isLocked) {
    return null;
  }
  if (CustomAppender) {
    return /*#__PURE__*/_jsx(CustomAppender, {
      showSeparator: showSeparator
    });
  }
  return /*#__PURE__*/_jsx(DefaultAppender, {
    rootClientId: rootClientId,
    showSeparator: showSeparator
  });
}
//# sourceMappingURL=index.native.js.map