import type { ComponentType, ReactNode } from 'react';

/* ---------- Content values ---------- */

export type CMSFieldType = 'text' | 'image' | 'link' | 'list';

export interface ImageValue {
  src: string;
  alt?: string;
}

export interface LinkValue {
  text: string;
  href: string;
}

/** Ordered keys of the items in a repeated block. Item fields live under `${listId}.${key}.*`. */
export type ListValue = string[];

export interface CMSValueMap {
  text: string;
  image: ImageValue;
  link: LinkValue;
  list: ListValue;
}

export type CMSValue = CMSValueMap[CMSFieldType];

/** Flat map of CMS id → value. Holds content only — never components. */
export type CMSContent = Record<string, CMSValue>;

/* ---------- Metadata ---------- */

export interface CMSFieldOptions {
  /** Human-readable name shown in the inspector. Derived from the id when omitted. */
  label?: string;
  /** Text fields: edit with a textarea and render line breaks. */
  multiline?: boolean;
}

/** What an editable element declares about itself: its id, type and the value hardcoded in the site. */
export type CMSEntry = {
  [T in CMSFieldType]: { id: string; type: T; defaultValue: CMSValueMap[T]; options: CMSFieldOptions };
}[CMSFieldType];

export type CMSResolvedEntry = {
  [T in CMSFieldType]: { id: string; type: T; value: CMSValueMap[T] };
}[CMSFieldType];

/** DOM attributes forming the contract between the website and the editor. */
export const CMS_ATTR = {
  id: 'data-cms-id',
  type: 'data-cms-type',
  list: 'data-cms-list',
  key: 'data-cms-key',
} as const;

export interface CMSItemRef {
  listId: string;
  key: string;
}

export interface CMSSelection {
  id: string;
  type: CMSFieldType;
  /** The repeated item the element sits in, if any. */
  item?: CMSItemRef;
}

/* ---------- Site integration ---------- */

export interface CMSPage {
  id: string;
  label: string;
  /** Hash path, e.g. "/" or "/about". */
  path: string;
  component: ComponentType;
}

export interface CMSSiteConfig {
  name: string;
  storageKey: string;
  layout: ComponentType<{ children: ReactNode }>;
  pages: CMSPage[];
}

/* ---------- Guards ---------- */

const FIELD_TYPES: readonly CMSFieldType[] = ['text', 'image', 'link', 'list'];

export function isFieldType(value: unknown): value is CMSFieldType {
  return FIELD_TYPES.includes(value as CMSFieldType);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isValueOfType<T extends CMSFieldType>(type: T, value: unknown): value is CMSValueMap[T] {
  switch (type) {
    case 'text':
      return typeof value === 'string';
    case 'image':
      return isRecord(value) && typeof value.src === 'string' && (value.alt === undefined || typeof value.alt === 'string');
    case 'link':
      return isRecord(value) && typeof value.text === 'string' && typeof value.href === 'string';
    case 'list':
      return Array.isArray(value) && value.every((key) => typeof key === 'string');
    default:
      return false;
  }
}

export function isCMSValue(value: unknown): value is CMSValue {
  return FIELD_TYPES.some((type) => isValueOfType(type, value));
}

export function isCMSContent(value: unknown): value is CMSContent {
  return isRecord(value) && Object.values(value).every(isCMSValue);
}

/** The stored override if it matches the field's type, otherwise the site's default. */
export function resolveValue<T extends CMSFieldType>(type: T, override: unknown, fallback: CMSValueMap[T]): CMSValueMap[T] {
  return isValueOfType(type, override) ? override : fallback;
}

export function humanizeId(id: string): string {
  const last = id.slice(id.lastIndexOf('.') + 1);
  const words = last.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}
