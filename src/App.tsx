import { cmsConfig } from './cms.config';
import { EditorLayout } from './editor/EditorLayout';
import { WebsiteApp } from './website/WebsiteApp';

// "?site" shows the website on its own, without CMSify, to prove it still works as a normal website.
const standalone = new URLSearchParams(window.location.search).has('site');

export default function App() {
  return standalone ? <WebsiteApp /> : <EditorLayout config={cmsConfig} />;
}
