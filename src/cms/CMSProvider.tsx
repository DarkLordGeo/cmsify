import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useStore } from 'zustand';
import type { CMSRegistry } from './cmsRegistry';
import { createCMSStore, type CMSStore } from './cmsStore';
import {
  resolveValue,
  type CMSEntry,
  type CMSFieldOptions,
  type CMSFieldType,
  type CMSValue,
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

/** Used when there is no provider: never changes, so every element shows its default. */
const emptyStore = createCMSStore();

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

  const override = useStore(runtime?.store ?? emptyStore, (s) => s.content[id]);
  return resolveValue(type, override, defaultValue);
}

/** The override stored for one id, if any. */
export function useCMSOverride(id: string): CMSValue | undefined {
  return useStore(useCMSRuntime().store, (s) => s.content[id]);
}

/** All current overrides. */
export function useCMSContent() {
  return useStore(useCMSRuntime().store, (s) => s.content);
}
