import { useEffect, useState } from 'react';
import { CMS_ATTR, humanizeId, isFieldType, type CMSSelection } from '../cms/cmsTypes';
import { ElementInspector } from './ElementInspector';

interface InspectorProps {
  selection: CMSSelection | null;
  onReveal: (selection: CMSSelection | null) => void;
  /** Root of the rendered website, used to list the page's editable content. */
  previewRoot: HTMLElement | null;
  pageId: string;
}

export function Inspector({ selection, onReveal, previewRoot, pageId }: InspectorProps) {
  return (
    <aside className="cms-sidebar cms-inspector">
      <div className="cms-panel-title">
        Inspector
        {selection && (
          <button type="button" className="cms-link-button" onClick={() => onReveal(null)}>
            Done
          </button>
        )}
      </div>
      <div className="cms-panel-body">
        {selection ? (
          <ElementInspector key={selection.id} selection={selection} onReveal={onReveal} />
        ) : (
          <PageOutline previewRoot={previewRoot} pageId={pageId} onReveal={onReveal} />
        )}
      </div>
    </aside>
  );
}

/** Top-level editable elements on the current page, a fallback for anything hard to click. */
function PageOutline({ previewRoot, pageId, onReveal }: Omit<InspectorProps, 'selection'>) {
  const [items, setItems] = useState<CMSSelection[]>([]);

  useEffect(() => {
    if (!previewRoot) return;
    const elements = previewRoot.querySelectorAll<HTMLElement>(`[${CMS_ATTR.id}]`);
    setItems(
      [...elements]
        .filter((el) => !el.closest(`[${CMS_ATTR.key}]`)) // Skip anything inside (or being) a list item.
        .map((el) => ({ id: el.getAttribute(CMS_ATTR.id)!, type: el.getAttribute(CMS_ATTR.type) }))
        .filter((item): item is CMSSelection => isFieldType(item.type)),
    );
  }, [previewRoot, pageId]);

  return (
    <div className="cms-stack">
      <p className="cms-hint">Hover the page to see editable content, then click to edit it.</p>
      <ul className="cms-outline">
        {items.map((item) => (
          <li key={item.id}>
            <button type="button" onClick={() => onReveal(item)}>
              <span className={`cms-badge cms-badge--${item.type}`}>{item.type}</span>
              <span className="cms-outline-label">{humanizeId(item.id)}</span>
              <code>{item.id}</code>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
