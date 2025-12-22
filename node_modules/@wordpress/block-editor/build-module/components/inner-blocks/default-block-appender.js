/**
 * Internal dependencies
 */
import BaseDefaultBlockAppender from '../default-block-appender';
import { useBlockEditContext } from '../block-edit/context';
import { jsx as _jsx } from "react/jsx-runtime";
export default function DefaultBlockAppender() {
  const {
    clientId
  } = useBlockEditContext();
  return /*#__PURE__*/_jsx(BaseDefaultBlockAppender, {
    rootClientId: clientId
  });
}
//# sourceMappingURL=default-block-appender.js.map