import {
  cloneElement,
  createElement,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type ImgHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useCMSValue } from './CMSProvider';
import { CMS_ATTR, type CMSFieldType } from './cmsTypes';

/*
 * Thin wrappers that render a plain HTML element plus `data-cms-*` metadata.
 * The website keeps its own markup, classes and default content; CMSify only swaps in edited values.
 */

function cmsAttrs(id: string, type: CMSFieldType) {
  return { [CMS_ATTR.id]: id, [CMS_ATTR.type]: type };
}

function withLineBreaks(text: string): ReactNode[] {
  return text.split('\n').flatMap((line, i) => (i === 0 ? [line] : [createElement('br', { key: i }), line]));
}

type TextTag =
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'p' | 'span' | 'div' | 'strong' | 'em' | 'small'
  | 'li' | 'blockquote' | 'figcaption' | 'cite' | 'time' | 'label';

export interface EditableTextProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  cmsId: string;
  as?: TextTag;
  /** Default text, as written in the website's code. */
  children: string;
  multiline?: boolean;
  label?: string;
}

export function EditableText({ cmsId, as = 'span', children, multiline, label, ...rest }: EditableTextProps) {
  const text = useCMSValue(cmsId, 'text', children, { multiline, label });
  return createElement(as, { ...rest, ...cmsAttrs(cmsId, 'text') }, ...(multiline ? withLineBreaks(text) : [text]));
}

export interface EditableImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  cmsId: string;
  src: string;
  alt?: string;
  label?: string;
}

export function EditableImage({ cmsId, src, alt = '', label, ...rest }: EditableImageProps) {
  const image = useCMSValue(cmsId, 'image', { src, alt }, { label });
  return <img {...rest} {...cmsAttrs(cmsId, 'image')} src={image.src} alt={image.alt ?? ''} />;
}

export interface EditableLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'children'> {
  cmsId: string;
  href: string;
  children: string;
  label?: string;
  /** Decorative, non-editable content around the text, such as icons or arrows. */
  before?: ReactNode;
  after?: ReactNode;
}

export function EditableLink({ cmsId, href, children, label, before, after, ...rest }: EditableLinkProps) {
  const link = useCMSValue(cmsId, 'link', { text: children, href }, { label });
  return (
    <a {...rest} {...cmsAttrs(cmsId, 'link')} href={link.href}>
      {before}
      {link.text}
      {after}
    </a>
  );
}

export interface EditableListProps<T extends { id: string }> {
  cmsId: string;
  /** Default items from the website's own data. */
  items: readonly T[];
  /** Data used to render items added in the editor. */
  template: T;
  as?: 'div' | 'ul' | 'ol' | 'section' | 'nav';
  className?: string;
  label?: string;
  /**
   * Renders one item. Must return a DOM element (e.g. <li>, <article>) so CMSify can tag it.
   * `field(name)` gives the CMS id for a field of this item.
   */
  children: (item: T, field: (name: string) => string, key: string) => ReactElement<Record<string, unknown>>;
}

/** A repeated block (projects, skills, testimonials…) whose items can be added, removed and reordered. */
export function EditableList<T extends { id: string }>({
  cmsId,
  items,
  template,
  as = 'div',
  className,
  label,
  children,
}: EditableListProps<T>) {
  const byKey = new Map(items.map((item) => [item.id, item]));
  const order = useCMSValue(cmsId, 'list', [...byKey.keys()], { label });

  return createElement(
    as,
    { className, ...cmsAttrs(cmsId, 'list') },
    order.map((key) => {
      const element = children(byKey.get(key) ?? template, (name) => `${cmsId}.${key}.${name}`, key);
      return cloneElement(element, { key, [CMS_ATTR.list]: cmsId, [CMS_ATTR.key]: key });
    }),
  );
}
