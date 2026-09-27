import { useEffect, useState, type ReactNode } from 'react';
import { CMS_ATTR, humanizeId, isFieldType, type CMSSelection } from '../cms/cmsTypes';
import { useEditorStore } from './editorStore';
import { ElementInspector } from './ElementInspector';
import { badgeClass, code, hint, stack, textAction } from './ui';

export function PanelTitle({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 pt-[18px] pb-3 font-mono text-label uppercase tracking-[0.05em] text-secondary">
      {children}
    </div>
  );
}

export function Inspector({ pageId }: { pageId: string }) {
  const selection = useEditorStore((s) => s.selection);
  const select = useEditorStore((s) => s.select);

  return (
    <aside className="flex min-h-0 w-72 flex-col border-l border-line bg-surface min-[1100px]:w-82">
      <PanelTitle>
        Inspector
        {selection && (
          <button type="button" className={`${textAction} font-sans normal-case tracking-normal`} onClick={() => select(null)}>
            Done
          </button>
        )}
      </PanelTitle>
      <div className="flex-1 overflow-auto px-5 pt-1 pb-6">
        {selection ? <ElementInspector key={selection.id} selection={selection} /> : <PageOutline pageId={pageId} />}
      </div>
    </aside>
  );
}

/** Top-level editable elements on the current page, a fallback for anything hard to click. */
function PageOutline({ pageId }: { pageId: string }) {
  const frame = useEditorStore((s) => s.frame);
  const reveal = useEditorStore((s) => s.reveal);
  const [items, setItems] = useState<CMSSelection[]>([]);

  useEffect(() => {
    if (!frame) return;
    const elements = frame.querySelectorAll<HTMLElement>(`[${CMS_ATTR.id}]`);
    setItems(
      [...elements]
        .filter((el) => !el.closest(`[${CMS_ATTR.key}]`)) // Skip anything inside (or being) a list item.
        .map((el) => ({ id: el.getAttribute(CMS_ATTR.id)!, type: el.getAttribute(CMS_ATTR.type) }))
        .filter((item): item is CMSSelection => isFieldType(item.type)),
    );
  }, [frame, pageId]);

  return (
    <div className={stack}>
      <p className={hint}>Hover the page to see editable content, then click to edit it.</p>
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="grid w-full grid-cols-[auto_1fr] items-center gap-x-2.5 gap-y-0.5 rounded-[12px] border border-transparent px-2.5 py-2 text-left transition-colors hover:border-line hover:bg-surface-bright"
              onClick={() => reveal(item)}
            >
              <span className={`${badgeClass(item.type)} min-w-12 text-center`}>{item.type}</span>
              <span className="font-medium">{humanizeId(item.id)}</span>
              <code className={`${code} col-start-2 truncate`}>{item.id}</code>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
