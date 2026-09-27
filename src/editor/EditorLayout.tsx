import { useEffect, useState } from 'react';
import { useStore } from 'zustand';
import { CMSOverlay } from '../cms/CMSOverlay';
import { CMSProvider } from '../cms/CMSProvider';
import { createCMSRegistry } from '../cms/cmsRegistry';
import { PreviewFrame } from '../cms/PreviewFrame';
import { createPersistentCMSStore, type CMSStore } from '../cms/cmsStore';
import type { CMSSiteConfig } from '../cms/cmsTypes';
import { useEditorStore } from './editorStore';
import { downloadJson, readJsonFile } from './fileTransfer';
import { Inspector } from './Inspector';
import { PageNavigation } from './PageNavigation';
import { Toolbar } from './Toolbar';
import { useHashPath } from './useHashPath';

export function EditorLayout({ config }: { config: CMSSiteConfig }) {
  const [store] = useState(() => createPersistentCMSStore(config.storageKey, useEditorStore.getState().setSaveStatus));
  const [registry] = useState(createCMSRegistry);

  return (
    <CMSProvider store={store} registry={registry}>
      <Editor config={config} store={store} />
    </CMSProvider>
  );
}

function Editor({ config, store }: { config: CMSSiteConfig; store: CMSStore }) {
  const path = useHashPath();
  const page = config.pages.find((p) => p.path === path) ?? config.pages[0];

  const selection = useEditorStore((s) => s.selection);
  const previewing = useEditorStore((s) => s.previewing);
  const notice = useEditorStore((s) => s.notice);
  const frame = useEditorStore((s) => s.frame);
  const { select, notify, setFrame } = useEditorStore.getState();
  const changeCount = useStore(store, (s) => Object.keys(s.content).length);

  // A new page starts at the top with nothing selected.
  useEffect(() => {
    select(null);
    frame?.ownerDocument.defaultView?.scrollTo({ top: 0 });
  }, [page.id, frame, select]);

  // Escape clears the selection, whether focus is in the editor or inside the preview frame.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && select(null);
    const targets: Window[] = [window];
    const frameWindow = frame?.ownerDocument.defaultView;
    if (frameWindow) targets.push(frameWindow);
    targets.forEach((t) => t.addEventListener('keydown', onKey));
    return () => targets.forEach((t) => t.removeEventListener('keydown', onKey));
  }, [frame, select]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => notify(null), 4000);
    return () => clearTimeout(timer);
  }, [notice, notify]);

  // The exporter renders pages to strings with react-dom/server, so it is loaded on demand.
  const onExport = async () => {
    const { exportContent } = await import('../cms/exporters');
    downloadJson(`${config.storageKey.replace(/\W+/g, '-')}-content.json`, exportContent(config, store));
  };

  const onImport = async (file: File) => {
    try {
      const { importContent } = await import('../cms/exporters');
      store.getState().replace(importContent(config, await readJsonFile(file)));
      select(null);
      notify(`Imported ${file.name}`);
    } catch (error) {
      notify(`Import failed: ${error instanceof Error ? error.message : 'invalid file'}`);
    }
  };

  const onReset = () => {
    if (!window.confirm('Discard all changes and restore the website’s original content?')) return;
    store.getState().replace({});
    select(null);
    notify('All changes discarded');
  };

  const Layout = config.layout;
  const Page = page.component;

  return (
    <div className="flex h-screen flex-col bg-surface">
      <Toolbar siteName={config.name} pageLabel={page.label} changeCount={changeCount} onExport={onExport} onImport={onImport} onReset={onReset} />
      <div className="flex min-h-0 flex-1">
        {!previewing && <PageNavigation pages={config.pages} currentId={page.id} />}

        <main className={`min-w-0 flex-1 bg-surface-bright ${previewing ? '' : 'p-5'}`}>
          <PreviewFrame
            className={`block size-full bg-white ${previewing ? '' : 'rounded-[18px] border border-line shadow-xs'}`}
            title={`${config.name} preview`}
            onBody={setFrame}
          >
            <CMSOverlay enabled={!previewing} selection={selection} onSelect={select}>
              <Layout>
                <Page />
              </Layout>
            </CMSOverlay>
          </PreviewFrame>
        </main>

        {!previewing && <Inspector pageId={page.id} />}
      </div>
    </div>
  );
}
