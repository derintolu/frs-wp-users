/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { store as blockEditorStore } from '../../store';
export function useGetNumberOfBlocksBeforeCell(gridClientId, numColumns) {
  const {
    getBlockOrder,
    getBlockAttributes
  } = useSelect(blockEditorStore);
  const getNumberOfBlocksBeforeCell = (column, row) => {
    const targetIndex = (row - 1) * numColumns + column - 1;
    let count = 0;
    for (const clientId of getBlockOrder(gridClientId)) {
      var _getBlockAttributes$s;
      const {
        columnStart,
        rowStart
      } = (_getBlockAttributes$s = getBlockAttributes(clientId).style?.layout) !== null && _getBlockAttributes$s !== void 0 ? _getBlockAttributes$s : {};
      const cellIndex = (rowStart - 1) * numColumns + columnStart - 1;
      if (cellIndex < targetIndex) {
        count++;
      }
    }
    return count;
  };
  return getNumberOfBlocksBeforeCell;
}
//# sourceMappingURL=use-get-number-of-blocks-before-cell.js.map