import { createStore, type StoreApi } from 'zustand/vanilla';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { isCMSContent, isRecord, type CMSContent, type CMSValue } from './cmsTypes';

/**
 * Holds content overrides: only values the user changed. Anything absent falls back to
 * the default hardcoded in the website, so the site stays the source of truth for structure.
 */
export interface CMSState {
  content: CMSContent;
  set(id: string, value: CMSValue): void;
  /** Drop an override so the element falls back to its default. */
  remove(id: string): void;
  /** Apply several changes as one update. */
  transaction(recipe: (draft: CMSContent) => void): void;
  replace(content: CMSContent): void;
}

export type CMSStore = StoreApi<CMSState>;

type SetState = CMSStore['setState'];

const contentSlice = (set: SetState, initial: CMSContent): CMSState => ({
  content: initial,
  set: (id, value) => set((s) => ({ content: { ...s.content, [id]: value } })),
  remove: (id) =>
    set((s) => {
      if (!(id in s.content)) return s;
      const content = { ...s.content };
      delete content[id];
      return { content };
    }),
  transaction: (recipe) =>
    set((s) => {
      const draft = { ...s.content };
      recipe(draft);
      return { content: draft };
    }),
  replace: (content) => set({ content: { ...content } }),
});

/** An in-memory store, e.g. for off-screen renders. */
export function createCMSStore(initial: CMSContent = {}): CMSStore {
  return createStore<CMSState>()((set) => contentSlice(set, initial));
}

/* ---------- localStorage persistence ---------- */

export type SaveStatus = 'saved' | 'saving' | 'error';

/** A store that restores from and saves to localStorage under `storageKey`. */
export function createPersistentCMSStore(storageKey: string, onStatus?: (status: SaveStatus) => void): CMSStore {
  return createStore<CMSState>()(
    persist((set) => contentSlice(set, {}), {
      name: storageKey,
      version: 2,
      storage: createJSONStorage(() => debouncedLocalStorage(onStatus)),
      partialize: (state) => ({ content: state.content }),
      // Stored data is untrusted: anything malformed falls back to the site's defaults.
      merge: (persisted, current) => ({
        ...current,
        content: isRecord(persisted) && isCMSContent(persisted.content) ? persisted.content : current.content,
      }),
    }),
  );
}

/** localStorage with debounced writes (image data URLs can be large) that reports save status. */
function debouncedLocalStorage(onStatus?: (status: SaveStatus) => void, delay = 250): StateStorage {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: [string, string] | undefined;

  const flush = () => {
    clearTimeout(timer);
    if (!pending) return;
    const [key, value] = pending;
    pending = undefined;
    try {
      localStorage.setItem(key, value);
      onStatus?.('saved');
    } catch {
      onStatus?.('error'); // Usually the quota, e.g. after uploading large images.
    }
  };
  window.addEventListener('beforeunload', flush);

  return {
    getItem: (key) => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null; // Inaccessible storage: start from the site's defaults.
      }
    },
    setItem: (key, value) => {
      pending = [key, value];
      onStatus?.('saving');
      clearTimeout(timer);
      timer = setTimeout(flush, delay);
    },
    removeItem: (key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // Nothing to clean up.
      }
    },
  };
}
