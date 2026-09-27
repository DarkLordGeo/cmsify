import type { CMSSiteConfig } from './cms';
import { Layout } from './website/Layout';
import { routes } from './website/WebsiteApp';

/** Connects the website to CMSify: which layout wraps the pages, and which pages exist. */
export const cmsConfig: CMSSiteConfig = {
  name: 'CMSify website',
  storageKey: 'cmsify:website',
  layout: Layout,
  pages: routes.map((route) => ({
    id: route.path === '/' ? 'home' : route.path.slice(1),
    label: route.label,
    path: route.path,
    component: route.component,
  })),
};
