# CMSify

A Git-native CMS concept: make an existing React website visually editable by adding small metadata to it.
This is the first MVP: local editing only (no GitHub, backend or auth yet).

```bash
npm install
npm run dev        # editor at http://localhost:5173, the plain site at /?site
```

## Making content editable

Wrap content in the site with the CMS components. They render the same HTML element, plus `data-cms-*` attributes:

```tsx
import { EditableImage, EditableLink, EditableList, EditableText } from '../cms';

<EditableText cmsId="home.hero.title" as="h1">Lasha — Full Stack Developer</EditableText>
<EditableImage cmsId="home.hero.image" src="/hero.png" alt="Developer" className="hero-img" />
<EditableLink cmsId="home.hero.cta" href="#/projects" className="button">View projects</EditableLink>

<EditableList cmsId="projects.items" items={projects} template={emptyProject} className="grid">
  {(project, field) => (
    <article>
      <EditableText cmsId={field('title')} as="h3">{project.title}</EditableText>
    </article>
  )}
</EditableList>
```

The values in the code are the defaults. Without a `CMSProvider` the components just render them, so the site keeps working without CMSify.
Register the site's layout and pages in [`src/cms.config.ts`](src/cms.config.ts).

## How it works

```
src/cms/        runtime, independent of the website
  cmsTypes.ts      content value types, metadata, DOM attribute contract
  cmsStore.ts      content overrides (flat id → value) + localStorage persistence
  cmsRegistry.ts   metadata that elements declare while rendering (type, default value)
  CMSProvider.tsx  context + useCMSValue(): the binding between an element and the store
  EditableElement.tsx  EditableText / Image / Link / List
  CMSOverlay.tsx   hover outlines, labels, click-to-select (drawn in a separate layer)
  PreviewFrame.tsx renders the site in an iframe (real viewport) through a React portal
  listActions.ts   add / remove / duplicate / reorder repeated items
  exporters.ts     flat ids ⇄ hierarchical JSON
src/editor/     editor UI (toolbar, page list, inspector)
src/website/    the website being edited (CMSify landing page)
```

- The store keeps only the values you changed; everything else comes from the site's code.
- Repeated blocks store an ordered list of item keys. Item fields live under `listId.key.field`.
- Export renders every page off-screen and collects the values of all editable elements, so the JSON contains all pages' current content. Import takes the same format.
