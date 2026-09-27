import type { CMSEntry } from './cmsTypes';

/**
 * Collects the metadata editable elements declare while rendering (id, type, default value).
 * It lets the editor know an element's defaults without parsing any React code.
 */
export interface CMSRegistry {
  register(entry: CMSEntry): void;
  get(id: string): CMSEntry | undefined;
  entries(): CMSEntry[];
  /** Entries nested under an id, e.g. all fields of one list item. */
  descendants(id: string): CMSEntry[];
}

export function createCMSRegistry(): CMSRegistry {
  const entries = new Map<string, CMSEntry>();

  return {
    register: (entry) => {
      entries.set(entry.id, entry);
    },
    get: (id) => entries.get(id),
    entries: () => [...entries.values()],
    descendants: (id) => [...entries.values()].filter((entry) => entry.id.startsWith(`${id}.`)),
  };
}
