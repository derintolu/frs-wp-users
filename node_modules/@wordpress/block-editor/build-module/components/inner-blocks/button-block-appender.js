/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * Internal dependencies
 */
import BaseButtonBlockAppender from '../button-block-appender';
import { useBlockEditContext } from '../block-edit/context';
import { jsx as _jsx } from "react/jsx-runtime";
export default function ButtonBlockAppender({
  showSeparator,
  isFloating,
  onAddBlock,
  isToggle
}) {
  const {
    clientId
  } = useBlockEditContext();
  return /*#__PURE__*/_jsx(BaseButtonBlockAppender, {
    className: clsx({
      'block-list-appender__toggle': isToggle
    }),
    rootClientId: clientId,
    showSeparator: showSeparator,
    isFloating: isFloating,
    onAddBlock: onAddBlock
  });
}
//# sourceMappingURL=button-block-appender.js.map