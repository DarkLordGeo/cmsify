import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { WebsiteApp } from './website/WebsiteApp';

// Entry for the public website build (GitHub Pages): the site alone, without the CMSify editor.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WebsiteApp />
  </StrictMode>,
);
