import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

const SRC_DOC = '<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>';

interface PreviewFrameProps {
  children: ReactNode;
  title: string;
  className?: string;
  /** Receives the frame's <body> once it is ready. */
  onBody?: (body: HTMLElement | null) => void;
}

/**
 * Renders the website inside an iframe through a React portal. The site gets a real viewport
 * (its media queries respond to the preview width) while staying in the same React tree,
 * so context and state keep flowing from the editor without any messaging layer.
 */
export function PreviewFrame({ children, title, className, onBody }: PreviewFrameProps) {
  const [iframe, setIframe] = useState<HTMLIFrameElement | null>(null);
  const [body, setBody] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!iframe) return;
    let observer: MutationObserver | undefined;

    const setup = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;
      // Resolve relative URLs against the app, and let hash links drive the app's router.
      const base = doc.createElement('base');
      base.href = window.location.origin + window.location.pathname + window.location.search;
      base.target = '_parent';
      doc.head.append(base);

      syncStyles(doc);
      observer = new MutationObserver(() => syncStyles(doc)); // Picks up Vite HMR style updates.
      observer.observe(document.head, { childList: true, subtree: true, characterData: true });
      setBody(doc.body);
    };

    iframe.addEventListener('load', setup);
    return () => {
      iframe.removeEventListener('load', setup);
      observer?.disconnect();
      setBody(null);
    };
  }, [iframe]);

  useEffect(() => onBody?.(body), [body, onBody]);

  return (
    <>
      <iframe ref={setIframe} srcDoc={SRC_DOC} title={title} className={className} />
      {body && createPortal(children, body)}
    </>
  );
}

const STYLE_SELECTOR = 'style, link[rel="stylesheet"]';

function syncStyles(doc: Document) {
  doc.head.querySelectorAll('[data-cms-copied]').forEach((node) => node.remove());
  document.head.querySelectorAll(STYLE_SELECTOR).forEach((node) => {
    const copy = node.cloneNode(true) as Element;
    copy.setAttribute('data-cms-copied', '');
    doc.head.append(copy);
  });
}
