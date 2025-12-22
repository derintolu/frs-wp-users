/**
 * WordPress dependencies
 */
import { __experimentalStyleProvider as StyleProvider, __experimentalToolsPanelContext as ToolsPanelContext } from '@wordpress/components';
import warning from '@wordpress/warning';
import deprecated from '@wordpress/deprecated';
import { useEffect, useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { useBlockEditContext, mayDisplayControlsKey } from '../block-edit/context';
import groups from './groups';
import { jsx as _jsx } from "react/jsx-runtime";
export default function InspectorControlsFill({
  children,
  group = 'default',
  __experimentalGroup,
  resetAllFilter
}) {
  if (__experimentalGroup) {
    deprecated('`__experimentalGroup` property in `InspectorControlsFill`', {
      since: '6.2',
      version: '6.4',
      alternative: '`group`'
    });
    group = __experimentalGroup;
  }
  const context = useBlockEditContext();
  const Fill = groups[group]?.Fill;
  if (!Fill) {
    globalThis.SCRIPT_DEBUG === true ? warning(`Unknown InspectorControls group "${group}" provided.`) : void 0;
    return null;
  }
  if (!context[mayDisplayControlsKey]) {
    return null;
  }
  return /*#__PURE__*/_jsx(StyleProvider, {
    document: document,
    children: /*#__PURE__*/_jsx(Fill, {
      children: fillProps => {
        return /*#__PURE__*/_jsx(ToolsPanelInspectorControl, {
          fillProps: fillProps,
          children: children,
          resetAllFilter: resetAllFilter
        });
      }
    })
  });
}
function RegisterResetAll({
  resetAllFilter,
  children
}) {
  const {
    registerResetAllFilter,
    deregisterResetAllFilter
  } = useContext(ToolsPanelContext);
  useEffect(() => {
    if (resetAllFilter && registerResetAllFilter && deregisterResetAllFilter) {
      registerResetAllFilter(resetAllFilter);
      return () => {
        deregisterResetAllFilter(resetAllFilter);
      };
    }
  }, [resetAllFilter, registerResetAllFilter, deregisterResetAllFilter]);
  return children;
}
function ToolsPanelInspectorControl({
  children,
  resetAllFilter,
  fillProps
}) {
  // `fillProps.forwardedContext` is an array of context provider entries, provided by slot,
  // that should wrap the fill markup.
  const {
    forwardedContext = []
  } = fillProps;

  // Children passed to InspectorControlsFill will not have
  // access to any React Context whose Provider is part of
  // the InspectorControlsSlot tree. So we re-create the
  // Provider in this subtree.
  const innerMarkup = /*#__PURE__*/_jsx(RegisterResetAll, {
    resetAllFilter: resetAllFilter,
    children: children
  });
  return forwardedContext.reduce((inner, [Provider, props]) => /*#__PURE__*/_jsx(Provider, {
    ...props,
    children: inner
  }), innerMarkup);
}
//# sourceMappingURL=fill.js.map