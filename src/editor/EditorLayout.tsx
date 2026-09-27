import { useCallback, useEffect, useState } from 'react';
import { CMSOverlay, findById, findItem } from '../cms/CMSOverlay';
import { CMSProvider, useCMSContent } from '../cms/CMSProvider';
import { createCMSRegistry } from '../cms/cmsRegistry';
import { PreviewFrame } from '../cms/PreviewFrame';
import { createCMSStore, loadContent, persistStore, type CMSStore, type SaveStatus } from '../cms/cmsStore';
import type { CMSSelection, CMSSiteConfig } from '../cms/cmsTypes';
import { downloadJson, readJsonFile } from './fileTransfer';
import { Inspector } from './Inspector';
import { PageNavigation } from './PageNavigation';
import { Toolbar } from './Toolbar';
import { useHashPath } from './useHashPath';
import './editor.css';

export function EditorLayout({ config }: { config: CMSSiteConfig }) {
  const [store] = useState(() => createCMSStore(loadContent(config.storageKey)));
  const [registry] = useState(createCMSRegistry);

  return (
    <CMSProvider store={store} registry={registry}>
      <Editor config={config} store={store} />
    </CMSProvider>
  );
}

function Editor({ config, store }: { config: CMSSiteConfig; store: CMSStore }) {
  const content = useCMSContent();
  const saveStatus = usePersistence(store, config.storageKey);
  const path = useHashPath();
  const page = config.pages.find((p) => p.path === path) ?? config.pages[0];

  const [selection, setSelection] = useState<CMSSelection | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [frame, setFrame] = useState<HTMLElement | null>(null);

  // A new page starts at the top with nothing selected.
  useEffect(() => {
    setSelection(null);
    frame?.ownerDocument.defaultView?.scrollTo({ top: 0 });
  }, [page.id, frame]);

  // Escape clears the selection, whether focus is in the editor or inside the preview frame.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSelection(null);
    const targets: Window[] = [window];
    const frameWindow = frame?.ownerDocument.defaultView;
    if (frameWindow) targets.push(frameWindow);
    targets.forEach((t) => t.addEventListener('keydown', onKey));
    return () => targets.forEach((t) => t.removeEventListener('keydown', onKey));
  }, [frame]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  /** Select from the inspector and bring the element into view once the preview has re-rendered. */
  const reveal = useCallback(
    (next: CMSSelection | null) => {
      setSelection(next);
      if (!next || !frame) return;
      requestAnimationFrame(() => {
        const target = next.type === 'list' && next.item ? findItem(frame, next.item) : findById(frame, next.id);
        target?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      });
    },
    [frame],
  );

  // The exporter renders pages to strings with react-dom/server, so it is loaded on demand.
  const onExport = async () => {
    const { exportContent } = await import('../cms/exporters');
    downloadJson(`${config.storageKey.replace(/\W+/g, '-')}-content.json`, exportContent(config, store));
  };

  const onImport = async (file: File) => {
    try {
      const { importContent } = await import('../cms/exporters');
      store.replace(importContent(config, await readJsonFile(file)));
      setSelection(null);
      setNotice(`Imported ${file.name}`);
    } catch (error) {
      setNotice(`Import failed: ${error instanceof Error ? error.message : 'invalid file'}`);
    }
  };

  const onReset = () => {
    if (!window.confirm('Discard all changes and restore the website’s original content?')) return;
    store.replace({});
    setSelection(null);
    setNotice('All changes discarded');
  };

  const Layout = config.layout;
  const Page = page.component;

  return (
    <div className={`cms-app${previewing ? ' is-previewing' : ''}`}>
      <Toolbar
        siteName={config.name}
        pageLabel={page.label}
        changeCount={Object.keys(content).length}
        saveStatus={saveStatus}
        notice={notice}
        previewing={previewing}
        onTogglePreview={() => setPreviewing((p) => !p)}
        onExport={onExport}
        onImport={onImport}
        onReset={onReset}
      />
      <div className="cms-workspace">
        {!previewing && <PageNavigation pages={config.pages} currentId={page.id} />}

        <main className="cms-canvas">
          <PreviewFrame className="cms-frame" title={`${config.name} preview`} onBody={setFrame}>
            <CMSOverlay enabled={!previewing} selection={selection} onSelect={setSelection}>
              <Layout>
                <Page />
              </Layout>
            </CMSOverlay>
          </PreviewFrame>
        </main>

        {!previewing && <Inspector selection={selection} onReveal={reveal} previewRoot={frame} pageId={page.id} />}
      </div>
    </div>
  );
}

function usePersistence(store: CMSStore, storageKey: string) {
  const [status, setStatus] = useState<SaveStatus>('saved');
  useEffect(() => persistStore(store, storageKey, setStatus), [store, storageKey]);
  return status;
}
