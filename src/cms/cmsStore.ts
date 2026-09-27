import { isCMSContent, type CMSContent, type CMSValue } from './cmsTypes';

type Listener = () => void;

/**
 * Holds content overrides: only values the user changed. Anything absent falls back to
 * the default hardcoded in the website, so the site stays the source of truth for structure.
 */
export interface CMSStore {
  getContent(): CMSContent;
  get(id: string): CMSValue | undefined;
  set(id: string, value: CMSValue): void;
  /** Drop an override so the element falls back to its default. */
  remove(id: string): void;
  /** Apply several changes as one update. */
  transaction(recipe: (draft: CMSContent) => void): void;
  replace(content: CMSContent): void;
  subscribe(listener: Listener): () => void;
}

export function createCMSStore(initial: CMSContent = {}): CMSStore {
  let content = initial;
  const listeners = new Set<Listener>();

  const commit = (next: CMSContent) => {
    content = next;
    listeners.forEach((listener) => listener());
  };

  return {
    getContent: () => content,
    get: (id) => content[id],
    set: (id, value) => commit({ ...content, [id]: value }),
    remove: (id) => {
      if (!(id in content)) return;
      const next = { ...content };
      delete next[id];
      commit(next);
    },
    transaction: (recipe) => {
      const draft = { ...content };
      recipe(draft);
      commit(draft);
    },
    replace: (next) => commit({ ...next }),
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/* ---------- localStorage persistence ---------- */

const STORAGE_VERSION = 1;

export function loadContent(storageKey: string): CMSContent {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' && parsed !== null &&
      'version' in parsed && parsed.version === STORAGE_VERSION &&
      'content' in parsed && isCMSContent(parsed.content)
    ) {
      return parsed.content;
    }
  } catch {
    // Corrupt or inaccessible storage: start from the site's defaults.
  }
  return {};
}

export type SaveStatus = 'saved' | 'saving' | 'error';

/** Writes the store to localStorage (debounced) on every change. Returns a cleanup that flushes pending writes. */
export function persistStore(store: CMSStore, storageKey: string, onStatus?: (status: SaveStatus) => void, delay = 250) {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const save = () => {
    timer = undefined;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ version: STORAGE_VERSION, content: store.getContent() }));
      onStatus?.('saved');
    } catch {
      onStatus?.('error'); // Usually the quota, e.g. after uploading large images.
    }
  };
  const flush = () => {
    if (timer !== undefined) {
      clearTimeout(timer);
      save();
    }
  };

  const unsubscribe = store.subscribe(() => {
    onStatus?.('saving');
    clearTimeout(timer);
    timer = setTimeout(save, delay);
  });
  window.addEventListener('beforeunload', flush);

  return () => {
    unsubscribe();
    window.removeEventListener('beforeunload', flush);
    flush();
  };
}
