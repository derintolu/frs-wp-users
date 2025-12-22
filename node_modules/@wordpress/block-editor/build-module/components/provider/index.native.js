/**
 * WordPress dependencies
 */
import { useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import withRegistryProvider from './with-registry-provider';
import useBlockSync from './use-block-sync';
import { store as blockEditorStore } from '../../store';
import { BlockRefsProvider } from './block-refs-provider';

/** @typedef {import('@wordpress/data').WPDataRegistry} WPDataRegistry */
import { jsx as _jsx } from "react/jsx-runtime";
const BlockEditorProvider = withRegistryProvider(function (props) {
  const {
    children,
    settings
  } = props;
  const {
    updateSettings
  } = useDispatch(blockEditorStore);
  useEffect(() => {
    updateSettings(settings);
  }, [settings]);

  // Syncs the entity provider with changes in the block-editor store.
  useBlockSync(props);
  return /*#__PURE__*/_jsx(BlockRefsProvider, {
    children: children
  });
});
export default BlockEditorProvider;
export { BlockEditorProvider as ExperimentalBlockEditorProvider };
//# sourceMappingURL=index.native.js.map