/**
 * WordPress dependencies
 */
import { useEffect, useState, useMemo, forwardRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { useBlockElement } from '../block-list/use-block-props/use-block-refs';
import { PrivateBlockPopover } from '.';
import { jsx as _jsx } from "react/jsx-runtime";
function BlockPopoverCover({
  clientId,
  bottomClientId,
  children,
  shift = false,
  additionalStyles,
  ...props
}, ref) {
  var _bottomClientId;
  (_bottomClientId = bottomClientId) !== null && _bottomClientId !== void 0 ? _bottomClientId : bottomClientId = clientId;
  const selectedElement = useBlockElement(clientId);
  return /*#__PURE__*/_jsx(PrivateBlockPopover, {
    ref: ref,
    clientId: clientId,
    bottomClientId: bottomClientId,
    shift: shift,
    ...props,
    children: selectedElement && clientId === bottomClientId ? /*#__PURE__*/_jsx(CoverContainer, {
      selectedElement: selectedElement,
      additionalStyles: additionalStyles,
      children: children
    }) : children
  });
}
function CoverContainer({
  selectedElement,
  additionalStyles = {},
  children
}) {
  const [width, setWidth] = useState(selectedElement.offsetWidth);
  const [height, setHeight] = useState(selectedElement.offsetHeight);
  useEffect(() => {
    const observer = new window.ResizeObserver(() => {
      setWidth(selectedElement.offsetWidth);
      setHeight(selectedElement.offsetHeight);
    });
    observer.observe(selectedElement, {
      box: 'border-box'
    });
    return () => observer.disconnect();
  }, [selectedElement]);
  const style = useMemo(() => {
    return {
      position: 'absolute',
      width,
      height,
      ...additionalStyles
    };
  }, [width, height, additionalStyles]);
  return /*#__PURE__*/_jsx("div", {
    style: style,
    children: children
  });
}
export default forwardRef(BlockPopoverCover);
//# sourceMappingURL=cover.js.map