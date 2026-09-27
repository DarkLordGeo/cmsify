import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CMSProvider } from './CMSProvider';
import { createCMSRegistry } from './cmsRegistry';
import { createCMSStore, type CMSStore } from './cmsStore';
import {
  isRecord,
  resolveValue,
  type CMSContent,
  type CMSResolvedEntry,
  type CMSSiteConfig,
  type CMSValue,
} from './cmsTypes';

export type ContentTree = { [key: string]: ContentNode };
type ContentNode = string | ContentTree | ContentNode[];

/**
 * Renders every page (off-screen, to a string) and records each editable element with its
 * current value. This yields exactly the content the site shows, across all pages,
 * including items added in the editor and excluding removed ones.
 */
export function collectContent(config: CMSSiteConfig, source: CMSStore): CMSResolvedEntry[] {
  const registry = createCMSRegistry();
  // A server render reads each store's initial state, so render from a snapshot of the current content.
  const { content } = source.getState();
  const store = createCMSStore(content);
  const pages = config.pages.map((page) => createElement(page.component, { key: page.id }));

  renderToStaticMarkup(
    createElement(CMSProvider, {
      store,
      registry,
      children: createElement(config.layout, null, createElement(Fragment, null, ...pages)),
    }),
  );

  return registry
    .entries()
    .map((entry) => ({ id: entry.id, type: entry.type, value: resolveValue(entry.type, content[entry.id], entry.defaultValue) }) as CMSResolvedEntry)
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
}

/* ---------- Flat ids → hierarchical JSON ---------- */

/**
 * `home.hero.title` → `{ home: { hero: { title } } }`.
 * Lists become arrays in their stored order: `[{ id: key, ...fields }]`.
 */
export function toHierarchical(entries: CMSResolvedEntry[]): ContentTree {
  const root: ContentTree = {};

  for (const entry of entries) {
    if (entry.type === 'list') continue;
    const value: ContentNode = typeof entry.value === 'string' ? entry.value : { ...entry.value };
    setPath(root, entry.id.split('.'), value);
  }

  // Deepest lists first, so nested lists become arrays before their parent item is moved into an array.
  const lists = entries
    .filter((entry): entry is Extract<CMSResolvedEntry, { type: 'list' }> => entry.type === 'list')
    .sort((a, b) => b.id.split('.').length - a.id.split('.').length);

  for (const list of lists) {
    const path = list.id.split('.');
    const node = getPath(root, path);
    const items = isRecord(node) ? (node as ContentTree) : {};
    setPath(
      root,
      path,
      list.value.map((key) => {
        const fields = items[key];
        return { id: key, ...(isRecord(fields) ? (fields as ContentTree) : {}) };
      }),
    );
  }

  return root;
}

function getPath(root: ContentTree, path: string[]): ContentNode | undefined {
  let node: ContentNode | undefined = root;
  for (const segment of path) {
    if (!isRecord(node)) return undefined;
    node = (node as ContentTree)[segment];
  }
  return node;
}

function setPath(root: ContentTree, path: string[], value: ContentNode) {
  let node = root;
  for (const segment of path.slice(0, -1)) {
    const next = node[segment];
    if (next !== undefined && !isRecord(next)) {
      console.warn(`[CMSify] "${path.join('.')}" conflicts with a value at "${segment}"; skipped.`);
      return;
    }
    node = (next as ContentTree | undefined) ?? (node[segment] = {});
  }
  node[path[path.length - 1]] = value;
}

/* ---------- Hierarchical JSON → flat ids ---------- */

function isImageNode(node: Record<string, unknown>) {
  return typeof node.src === 'string' && Object.keys(node).every((k) => k === 'src' || (k === 'alt' && typeof node.alt === 'string'));
}

function isLinkNode(node: Record<string, unknown>) {
  const keys = Object.keys(node);
  return keys.length === 2 && typeof node.text === 'string' && typeof node.href === 'string';
}

export function fromHierarchical(tree: unknown): CMSContent {
  if (!isRecord(tree)) throw new Error('Expected a JSON object at the top level.');
  const content: CMSContent = {};

  const walk = (node: unknown, id: string) => {
    if (typeof node === 'string') {
      content[id] = node;
    } else if (Array.isArray(node)) {
      const keys: string[] = [];
      node.forEach((item, index) => {
        if (!isRecord(item)) throw new Error(`"${id}[${index}]" must be an object.`);
        const { id: key, ...fields } = item;
        const itemKey = typeof key === 'string' && key ? key : `item-${index}`;
        keys.push(itemKey);
        walk(fields, `${id}.${itemKey}`);
      });
      content[id] = keys;
    } else if (isRecord(node)) {
      if (isImageNode(node)) content[id] = { src: node.src as string, ...(node.alt !== undefined && { alt: node.alt as string }) };
      else if (isLinkNode(node)) content[id] = { text: node.text as string, href: node.href as string };
      else for (const [key, child] of Object.entries(node)) walk(child, id ? `${id}.${key}` : key);
    } else {
      throw new Error(`Unsupported value at "${id}".`);
    }
  };

  walk(tree, '');
  return content;
}

/* ---------- Public API used by the editor ---------- */

export function exportContent(config: CMSSiteConfig, store: CMSStore): ContentTree {
  return toHierarchical(collectContent(config, store));
}

/** Converts exported JSON back into overrides, keeping only values that differ from the site's defaults. */
export function importContent(config: CMSSiteConfig, tree: unknown): CMSContent {
  const imported = fromHierarchical(tree);
  const lists = Object.fromEntries(Object.entries(imported).filter(([, value]) => Array.isArray(value)));

  // List orders compare against the site as coded; fields compare against a render with the imported
  // item order applied, so fields of added items are compared with their template values.
  const siteDefaults = valuesById(collectContent(config, createCMSStore()));
  const fieldDefaults = valuesById(collectContent(config, createCMSStore(lists)));

  const content: CMSContent = {};
  for (const [id, value] of Object.entries(imported)) {
    const defaults = Array.isArray(value) ? siteDefaults : fieldDefaults;
    if (!sameValue(defaults.get(id), value)) content[id] = value;
  }
  return content;
}

function valuesById(entries: CMSResolvedEntry[]) {
  return new Map(entries.map((entry) => [entry.id, entry.value]));
}

function sameValue(a: CMSValue | undefined, b: CMSValue) {
  return JSON.stringify(a) === JSON.stringify(b);
}
