/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * Internal dependencies
 */
import BlockPopoverCover from '../block-popover/cover';
import useBlockToolbarPopoverProps from './use-block-toolbar-popover-props';
import Inserter from '../inserter';
import useSelectedBlockToolProps from './use-selected-block-tool-props';
import { jsx as _jsx } from "react/jsx-runtime";
export default function EmptyBlockInserter({
  clientId,
  __unstableContentRef
}) {
  const {
    capturingClientId,
    isInsertionPointVisible,
    lastClientId,
    rootClientId
  } = useSelectedBlockToolProps(clientId);
  const popoverProps = useBlockToolbarPopoverProps({
    contentElement: __unstableContentRef?.current,
    clientId
  });
  return /*#__PURE__*/_jsx(BlockPopoverCover, {
    clientId: capturingClientId || clientId,
    bottomClientId: lastClientId,
    className: clsx('block-editor-block-list__block-side-inserter-popover', {
      'is-insertion-point-visible': isInsertionPointVisible
    }),
    __unstableContentRef: __unstableContentRef,
    ...popoverProps,
    children: /*#__PURE__*/_jsx("div", {
      className: "block-editor-block-list__empty-block-inserter",
      children: /*#__PURE__*/_jsx(Inserter, {
        position: "bottom right",
        rootClientId: rootClientId,
        clientId: clientId,
        __experimentalIsQuick: true
      })
    })
  });
}
//# sourceMappingURL=empty-block-inserter.js.map