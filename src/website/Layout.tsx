import { useEffect, useRef, type ReactNode, type RefObject } from 'react';
import { EditableLink, EditableList, EditableText } from '../cms';
import { navLinks } from './content';
import { code, separated } from './ui';

const navLink = 'text-ui font-medium text-ink-variant transition-colors hover:text-ink';

export function Layout({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  useAnchorScrolling(rootRef);

  return (
    <div className="min-h-full bg-surface font-sans text-body text-ink antialiased" ref={rootRef}>
      <header className="sticky top-0 z-50 border-b border-line bg-surface">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-8">
          <div className="flex items-center gap-5">
            <a className="flex items-center gap-1 text-h3 tracking-tight" href="#">
              <span className="flex size-6 items-center justify-center rounded-[2px] bg-primary font-mono text-code text-white">/</span>
              <EditableText cmsId="site.brand">CMSify</EditableText>
            </a>
            <EditableList cmsId="site.nav" as="nav" className="ml-3 hidden items-center gap-6 md:flex" items={navLinks} template={{ id: 'new', text: 'New link', href: '#' }}>
              {(link, field) => (
                <EditableLink cmsId={field('link')} href={link.href} className={navLink}>
                  {link.text}
                </EditableLink>
              )}
            </EditableList>
          </div>
          <div className="flex items-center gap-3">
            <EditableLink cmsId="site.signIn" href="#" className={`${navLink} px-2 py-1`}>
              Sign in
            </EditableLink>
            <EditableLink
              cmsId="site.connect"
              href="#"
              className="flex items-center rounded-[12px] border border-primary bg-primary px-3 py-1 text-ui font-medium text-white transition-colors hover:bg-line hover:text-ink"
            >
              Connect GitHub
            </EditableLink>
            <div className="flex size-8 items-center justify-center rounded-[12px] bg-primary text-white" aria-hidden="true">
              <span className="icon text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-line bg-surface py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-8 sm:flex-row">
          <div className="flex items-center gap-3">
            <EditableText cmsId="site.footer.brand" className="text-h3">
              CMSify
            </EditableText>
            <EditableText cmsId="site.footer.copyright" className={`${code} text-ink-variant`}>
              © 2026 CMSify
            </EditableText>
          </div>
          <EditableList
            cmsId="site.footer.links"
            as="nav"
            className={`flex items-center gap-4 ${code} ${separated} [&>*+*]:before:mr-4 [&>*+*]:before:text-faint`}
            items={navLinks}
            template={{ id: 'new', text: 'New link', href: '#' }}
          >
            {(link, field) => (
              <EditableLink cmsId={field('link')} href={link.href} className="text-ink-variant transition-colors hover:text-ink">
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
