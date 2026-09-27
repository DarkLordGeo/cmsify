import type { CMSPage } from '../cms/cmsTypes';
import { navigate } from './useHashPath';

export function PageNavigation({ pages, currentId }: { pages: CMSPage[]; currentId: string }) {
  return (
    <nav className="cms-sidebar cms-pages" aria-label="Pages">
      <div className="cms-panel-title">Pages</div>
      <ul>
        {pages.map((page) => (
          <li key={page.id}>
            <button
              type="button"
              className={page.id === currentId ? 'is-active' : undefined}
              aria-current={page.id === currentId ? 'page' : undefined}
              onClick={() => navigate(page.path)}
            >
              <span>{page.label}</span>
              <code>{page.path}</code>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
