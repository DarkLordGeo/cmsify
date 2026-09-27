import { useEffect, useRef, type ReactNode, type RefObject } from 'react';
import { EditableLink, EditableList, EditableText } from '../cms';
import { navLinks } from './content';
import './site.css';

export function Layout({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  useAnchorScrolling(rootRef);

  return (
    <div className="site" ref={rootRef}>
      <header className="s-header">
        <div className="s-header-inner">
          <div className="s-header-left">
            <a className="s-brand" href="#">
              <span className="s-brand-mark">/</span>
              <EditableText cmsId="site.brand">CMSify</EditableText>
            </a>
            <EditableList cmsId="site.nav" as="nav" className="s-nav" items={navLinks} template={{ id: 'new', text: 'New link', href: '#' }}>
              {(link, field) => (
                <EditableLink cmsId={field('link')} href={link.href}>
                  {link.text}
                </EditableLink>
              )}
            </EditableList>
          </div>
          <div className="s-header-right">
            <EditableLink cmsId="site.signIn" href="#" className="s-signin">
              Sign in
            </EditableLink>
            <EditableLink cmsId="site.connect" href="#" className="s-header-cta">
              Connect GitHub
            </EditableLink>
            <div className="s-avatar" aria-hidden="true">
              <span className="s-icon">person</span>
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="s-footer">
        <div className="s-footer-inner">
          <div className="s-footer-brand">
            <EditableText cmsId="site.footer.brand" className="s-footer-name">
              CMSify
            </EditableText>
            <EditableText cmsId="site.footer.copyright" className="s-code">
              © 2026 CMSify
            </EditableText>
          </div>
          <EditableList cmsId="site.footer.links" as="nav" className="s-footer-links" items={navLinks} template={{ id: 'new', text: 'New link', href: '#' }}>
            {(link, field) => (
              <EditableLink cmsId={field('link')} href={link.href}>
                {link.text}
              </EditableLink>
            )}
          </EditableList>
        </div>
      </footer>
    </div>
  );
}

/**
 * Scrolls to in-page anchors like "#how-it-works". Looks the target up in the site's own document
 * (not the global one), so it also works when the site is rendered inside the editor's preview frame.
 */
function useAnchorScrolling(rootRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const scroll = () => {
      const id = window.location.hash.slice(1);
      if (!id || id.startsWith('/')) return;
      rootRef.current?.ownerDocument.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };
    window.addEventListener('hashchange', scroll);
    return () => window.removeEventListener('hashchange', scroll);
  }, [rootRef]);
}
