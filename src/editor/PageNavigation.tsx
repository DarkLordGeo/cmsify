import type { CMSPage } from '../cms/cmsTypes';
import { PanelTitle } from './Inspector';
import { navigate } from './useHashPath';

export function PageNavigation({ pages, currentId }: { pages: CMSPage[]; currentId: string }) {
  return (
    <nav className="flex min-h-0 w-40 flex-col border-r border-line bg-surface min-[1100px]:w-52" aria-label="Pages">
      <PanelTitle>Pages</PanelTitle>
      <ul className="px-3">
        {pages.map((page) => {
          const active = page.id === currentId;
          return (
            <li key={page.id}>
              <button
                type="button"
                className={`flex w-full items-center justify-between rounded-[12px] border px-2.5 py-2 text-left font-medium transition-colors ${
                  active ? 'border-line bg-surface-low text-ink' : 'border-transparent text-ink-variant hover:bg-surface-bright'
                }`}
                aria-current={active ? 'page' : undefined}
                onClick={() => navigate(page.path)}
              >
                <span>{page.label}</span>
                <code className={`font-mono text-code ${active ? 'text-secondary' : 'text-muted'}`}>{page.path}</code>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
