import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CMS_ATTR, isFieldType, type CMSItemRef, type CMSSelection } from './cmsTypes';

/*
 * Editing layer over the rendered website. It finds elements through their `data-cms-*`
 * attributes and draws outlines in a separate layer, so the website's own DOM and styles are never modified.
 */

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface Boxes {
  hover: Box | null;
  selected: Box | null;
  item: Box | null;
}

const EMPTY: Boxes = { hover: null, selected: null, item: null };

export interface CMSOverlayProps {
  /** When false the website behaves normally (links navigate, no outlines). */
  enabled: boolean;
  selection: CMSSelection | null;
  onSelect: (selection: CMSSelection | null) => void;
  children: ReactNode;
}

export function CMSOverlay({ enabled, selection, onSelect, children }: CMSOverlayProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<HTMLElement | null>(null);
  const [boxes, setBoxes] = useState<Boxes>(EMPTY);

  // Re-measure every frame: content edits, reordering, scrolling and images loading all move elements.
  useEffect(() => {
    if (!enabled) {
      setBoxes(EMPTY);
      return;
    }
    let frame = 0;
    const tick = () => {
      const root = rootRef.current;
      if (root) {
        const origin = root.getBoundingClientRect();
        const selected = selection ? findById(root, selection.id) : null;
        const next: Boxes = {
          hover: hovered && hovered !== selected && root.contains(hovered) ? measure(hovered, origin) : null,
          selected: selected && measure(selected, origin),
          item: selection?.item ? measureOrNull(findItem(root, selection.item), origin) : null,
        };
        setBoxes((prev) => (sameBoxes(prev, next) ? prev : next));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [enabled, hovered, selection]);

  // Duck-typed rather than `instanceof Element`: the site may live in an iframe with its own globals.
  const targetOf = (target: EventTarget) =>
    'closest' in target ? (target as Element).closest<HTMLElement>(`[${CMS_ATTR.id}]`) : null;

  return (
    <div
      ref={rootRef}
      className="cms-overlay-root"
      onPointerMove={enabled ? (e) => setHovered(targetOf(e.target)) : undefined}
      onPointerLeave={() => setHovered(null)}
      onClickCapture={
        enabled
          ? (e) => {
              // In edit mode clicks select content instead of triggering the website's links and handlers.
              e.preventDefault();
              e.stopPropagation();
              onSelect(toSelection(targetOf(e.target)));
            }
          : undefined
      }
      onSubmitCapture={enabled ? (e) => e.preventDefault() : undefined}
    >
      {children}
      {enabled && (
        <div className="cms-overlay-layer" aria-hidden="true">
          {boxes.item && <div className="cms-box cms-box--item" style={boxes.item} />}
          {boxes.hover && hovered && (
            <div className={boxClass('hover', boxes.hover)} style={boxes.hover}>
              <span className="cms-box-label">
                <span className="cms-box-dot" />
                {hovered.getAttribute(CMS_ATTR.id)}
              </span>
            </div>
          )}
          {boxes.selected && selection && (
            <div className={boxClass('selected', boxes.selected)} style={boxes.selected}>
              <span className="cms-box-label">
                <span className="cms-box-dot" />
                {selection.id}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const LABEL_SPACE = 24;

/** Labels sit above the element, or below it when there is no room at the top of the page. */
function boxClass(kind: 'hover' | 'selected', box: Box) {
  return `cms-box cms-box--${kind}${box.top < LABEL_SPACE ? ' cms-box--label-below' : ''}`;
}

function toSelection(element: HTMLElement | null): CMSSelection | null {
  const id = element?.getAttribute(CMS_ATTR.id);
  const type = element?.getAttribute(CMS_ATTR.type);
  if (!element || !id || !isFieldType(type)) return null;

  const itemElement = element.closest(`[${CMS_ATTR.key}]`);
  const listId = itemElement?.getAttribute(CMS_ATTR.list);
  const key = itemElement?.getAttribute(CMS_ATTR.key);
  const item: CMSItemRef | undefined = listId && key ? { listId, key } : undefined;
  return { id, type, item };
}

export function findById(root: ParentNode, id: string) {
  return root.querySelector<HTMLElement>(`[${CMS_ATTR.id}="${CSS.escape(id)}"]`);
}

export function findItem(root: ParentNode, { listId, key }: CMSItemRef) {
  return root.querySelector<HTMLElement>(
    `[${CMS_ATTR.list}="${CSS.escape(listId)}"][${CMS_ATTR.key}="${CSS.escape(key)}"]`,
  );
}

function measure(element: Element, origin: DOMRect): Box {
  const rect = element.getBoundingClientRect();
  return { top: rect.top - origin.top, left: rect.left - origin.left, width: rect.width, height: rect.height };
}

function measureOrNull(element: Element | null, origin: DOMRect) {
  return element ? measure(element, origin) : null;
}

function sameBox(a: Box | null, b: Box | null) {
  if (!a || !b) return a === b;
  return a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height;
}

function sameBoxes(a: Boxes, b: Boxes) {
  return sameBox(a.hover, b.hover) && sameBox(a.selected, b.selected) && sameBox(a.item, b.item);
}
