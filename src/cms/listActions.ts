import type { CMSRuntime } from './CMSProvider';
import { resolveValue, type CMSContent, type CMSEntry, type CMSValue } from './cmsTypes';

/* Structural edits on repeated blocks. They only touch content: item order plus field overrides. */

export function resolveEntry({ store }: CMSRuntime, entry: CMSEntry): CMSValue {
  return resolveValue(entry.type, store.getState().content[entry.id], entry.defaultValue);
}

export function getListOrder(runtime: CMSRuntime, listId: string): string[] {
  const entry = runtime.registry.get(listId);
  return entry?.type === 'list' ? resolveValue('list', runtime.store.getState().content[listId], entry.defaultValue) : [];
}

function newKey() {
  return `item-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function withoutItemOverrides(draft: CMSContent, listId: string, key: string) {
  const prefix = `${listId}.${key}.`;
  for (const id of Object.keys(draft)) {
    if (id.startsWith(prefix)) delete draft[id];
  }
}

export function moveItem(runtime: CMSRuntime, listId: string, key: string, delta: -1 | 1) {
  const order = getListOrder(runtime, listId);
  const from = order.indexOf(key);
  const to = from + delta;
  if (from < 0 || to < 0 || to >= order.length) return;
  const next = [...order];
  [next[from], next[to]] = [next[to], next[from]];
  runtime.store.getState().set(listId, next);
}

export function removeItem(runtime: CMSRuntime, listId: string, key: string) {
  const order = getListOrder(runtime, listId);
  runtime.store.getState().transaction((draft) => {
    draft[listId] = order.filter((k) => k !== key);
    withoutItemOverrides(draft, listId, key);
  });
}

/** Inserts an item rendered from the list's template, after `afterKey` or at the end. */
export function addItem(runtime: CMSRuntime, listId: string, afterKey?: string): string {
  const order = getListOrder(runtime, listId);
  const key = newKey();
  const index = afterKey && order.includes(afterKey) ? order.indexOf(afterKey) + 1 : order.length;
  runtime.store.getState().set(listId, [...order.slice(0, index), key, ...order.slice(index)]);
  return key;
}

/** Copies an item's current field values (including nested lists) into a new item right after it. */
export function duplicateItem(runtime: CMSRuntime, listId: string, key: string): string {
  const order = getListOrder(runtime, listId);
  const copy = newKey();
  const source = `${listId}.${key}`;
  const target = `${listId}.${copy}`;
  const index = order.indexOf(key) + 1;

  runtime.store.getState().transaction((draft) => {
    draft[listId] = [...order.slice(0, index), copy, ...order.slice(index)];
    for (const entry of runtime.registry.descendants(source)) {
      draft[target + entry.id.slice(source.length)] = resolveEntry(runtime, entry);
    }
  });
  return copy;
}

/** A readable name for an item: the value of its first text field. */
export function itemLabel(runtime: CMSRuntime, listId: string, key: string): string {
  const prefix = `${listId}.${key}.`;
  const firstText = runtime.registry
    .descendants(`${listId}.${key}`)
    .find((entry) => entry.type === 'text' && !entry.id.slice(prefix.length).includes('.'));
  const text = firstText ? (resolveEntry(runtime, firstText) as string) : '';
  return text.trim() || key;
}
