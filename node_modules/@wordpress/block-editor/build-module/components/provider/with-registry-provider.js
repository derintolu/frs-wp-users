/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { useRegistry, createRegistry, RegistryProvider } from '@wordpress/data';
import { createHigherOrderComponent } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { storeConfig } from '../../store';
import { STORE_NAME as blockEditorStoreName } from '../../store/constants';
import { jsx as _jsx } from "react/jsx-runtime";
function getSubRegistry(subRegistries, registry, useSubRegistry) {
  if (!useSubRegistry) {
    return registry;
  }
  let subRegistry = subRegistries.get(registry);
  if (!subRegistry) {
    subRegistry = createRegistry({}, registry);
    subRegistry.registerStore(blockEditorStoreName, storeConfig);
    subRegistries.set(registry, subRegistry);
  }
  return subRegistry;
}
const withRegistryProvider = createHigherOrderComponent(WrappedComponent => ({
  useSubRegistry = true,
  ...props
}) => {
  const registry = useRegistry();
  const [subRegistries] = useState(() => new WeakMap());
  const subRegistry = getSubRegistry(subRegistries, registry, useSubRegistry);
  if (subRegistry === registry) {
    return /*#__PURE__*/_jsx(WrappedComponent, {
      registry: registry,
      ...props
    });
  }
  return /*#__PURE__*/_jsx(RegistryProvider, {
    value: subRegistry,
    children: /*#__PURE__*/_jsx(WrappedComponent, {
      registry: subRegistry,
      ...props
    })
  });
}, 'withRegistryProvider');
export default withRegistryProvider;
//# sourceMappingURL=with-registry-provider.js.map