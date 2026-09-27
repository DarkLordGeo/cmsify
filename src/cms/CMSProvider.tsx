import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import type { CMSRegistry } from './cmsRegistry';
import type { CMSStore } from './cmsStore';
import {
  resolveValue,
  type CMSEntry,
  type CMSFieldOptions,
  type CMSFieldType,
  type CMSValueMap,
} from './cmsTypes';

export interface CMSRuntime {
  store: CMSStore;
  registry: CMSRegistry;
}

const CMSRuntimeContext = createContext<CMSRuntime | null>(null);

export function CMSProvider({ store, registry, children }: CMSRuntime & { children: ReactNode }) {
  const runtime = useMemo(() => ({ store, registry }), [store, registry]);
  return <CMSRuntimeContext.Provider value={runtime}>{children}</CMSRuntimeContext.Provider>;
}

export function useCMSRuntime(): CMSRuntime {
  const runtime = useContext(CMSRuntimeContext);
  if (!runtime) throw new Error('useCMSRuntime must be used inside <CMSProvider>');
  return runtime;
}

const noopSubscribe = () => () => {};

/**
 * Binds an element to the CMS: registers its metadata and returns the current value.
 * Without a <CMSProvider> it simply returns the default, so the website runs unchanged without CMSify.
 */
export function useCMSValue<T extends CMSFieldType>(
  id: string,
  type: T,
  defaultValue: CMSValueMap[T],
  options: CMSFieldOptions = {},
): CMSValueMap[T] {
  const runtime = useContext(CMSRuntimeContext);
  runtime?.registry.register({ id, type, defaultValue, options } as CMSEntry);

  const getSnapshot = () => runtime?.store.get(id);
  const override = useSyncExternalStore(runtime?.store.subscribe ?? noopSubscribe, getSnapshot, getSnapshot);
  return resolveValue(type, override, defaultValue);
}

/** All current overrides. */
export function useCMSContent() {
  const { store } = useCMSRuntime();
  return useSyncExternalStore(store.subscribe, store.getContent, store.getContent);
}
