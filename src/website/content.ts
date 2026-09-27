// The site's own data, as a normal website would keep it. CMSify treats it as defaults.

export interface NavLink {
  id: string;
  text: string;
  href: string;
}

export interface Step {
  id: string;
  label: string;
  icon: string;
  title: string;
  description: string;
  accent?: boolean;
}

export interface FlowNode {
  id: string;
  label: string;
  icon: string;
  title: string;
  detail: string;
}

export interface Benefit {
  id: string;
  label: string;
  title: string;
  description: string;
  accent?: boolean;
}

export interface Note {
  id: string;
  text: string;
}

export const navLinks: NavLink[] = [
  { id: 'how-it-works', text: 'How it works', href: '#how-it-works' },
  { id: 'docs', text: 'Docs', href: '#' },
  { id: 'github', text: 'GitHub', href: '#' },
];

export const demoNav: Note[] = [
  { id: 'work', text: 'Work' },
  { id: 'capabilities', text: 'Capabilities' },
  { id: 'company', text: 'Company' },
  { id: 'contact', text: 'Contact' },
];

export const steps: Step[] = [
  {
    id: 'connect',
    label: 'STEP 01',
    icon: 'account_tree',
    title: '01 — Connect GitHub',
    description: 'Connect your GitHub account and choose an existing website repository.',
  },
  {
    id: 'cmsify',
    label: 'STEP 02',
    icon: 'auto_fix_high',
    title: '02 — CMSify your site',
    description: "CMSify prepares the site's content for visual editing automatically.",
  },
  {
    id: 'edit',
    label: 'STEP 03',
    icon: 'edit_note',
    title: '03 — Edit your website',
    description: 'Change text, images, links, and other content directly on the page.',
    accent: true,
  },
];

export const flow: FlowNode[] = [
  { id: 'source', label: '01 / SOURCE', icon: 'folder_zip', title: 'GitHub Repository', detail: 'repo: acme/web-v2' },
  { id: 'runner', label: '02 / RUNNER', icon: 'sync_alt', title: 'CMSify Engine', detail: 'parse AST & schemas' },
  { id: 'preview', label: '03 / PREVIEW', icon: 'draw', title: 'Editable Content', detail: 'inline DOM binding' },
  { id: 'sync', label: '04 / SYNC', icon: 'commit', title: 'Git commit', detail: 'sha: 8df29a1 [passed]' },
];

export const benefits: Benefit[] = [
  {
    id: 'code',
    label: '01 / STACK',
    title: 'Your code',
    description: 'Keep your existing React or Next.js website. No proprietary database to set up or proprietary APIs to rewrite around.',
  },
  {
    id: 'git',
    label: '02 / STORAGE',
    title: 'Git-native',
    description: 'Keep content alongside your code and version history. Every change generates clean PRs and traceable commits.',
    accent: true,
  },
  {
    id: 'visual',
    label: '03 / INTERACTION',
    title: 'Visual editing',
    description: 'Edit content directly on the rendered page. Non-technical teammates get a true live preview while developers retain control.',
    accent: true,
  },
  {
    id: 'rebuild',
    label: '04 / MIGRATION',
    title: 'No rebuild',
    description: 'Add a content layer without replacing the existing website. Keep your current design system, build steps, and hosting intact.',
  },
];

export const ctaNotes: Note[] = [
  { id: 'card', text: 'No credit card' },
  { id: 'repos', text: 'Public or private repos' },
  { id: 'lock-in', text: 'Zero lock-in' },
];
