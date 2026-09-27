import { EditableLink, EditableList, EditableText } from '../cms';
import { benefits, ctaNotes, demoNav, flow, steps } from './content';

function GitHubIcon() {
  return (
    <svg aria-hidden="true" className="s-github" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function Home() {
  return (
    <>
      <Hero />
      <ProductVisual />
      <HowItWorks />
      <Architecture />
      <Benefits />
      <FinalCta />
    </>
  );
}

function Hero() {
  return (
    <section className="s-section s-hero">
      <div className="s-container s-container--narrow s-hero-inner">
        <div className="s-pill s-hero-badge">
          <span className="s-dot s-dot--pulse" />
          <EditableText cmsId="home.hero.badge">In-place runtime content layer</EditableText>
        </div>
        <EditableText cmsId="home.hero.title" as="h1" className="s-hero-title">
          Turn your website into a CMS.
        </EditableText>
        <EditableText cmsId="home.hero.description" as="p" className="s-hero-text" multiline>
          Connect your GitHub repository and edit your existing website visually — without rebuilding it.
        </EditableText>
        <div className="s-hero-actions">
          <EditableLink cmsId="home.hero.primaryCta" href="#" className="s-button" before={<GitHubIcon />}>
            Connect GitHub
          </EditableLink>
          <EditableLink cmsId="home.hero.secondaryCta" href="#how-it-works" className="s-text-link" after={<span className="s-arrow">→</span>}>
            See how it works
          </EditableLink>
        </div>
        <div className="s-pill s-terminal">
          <span className="s-muted-2">$</span>
          <EditableText cmsId="home.hero.command" className="s-strong">
            npx @cmsify/scan ./my-app
          </EditableText>
          <span className="s-faint">→</span>
          <EditableText cmsId="home.hero.commandResult" className="s-accent">
            38 editable tokens detected
          </EditableText>
        </div>
      </div>
    </section>
  );
}

function ProductVisual() {
  return (
    <section className="s-section s-section--bright">
      <div className="s-container">
        <div className="s-browser">
          <div className="s-browser-bar">
            <div className="s-browser-left">
              <div className="s-traffic" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <div className="s-pill s-url">
                <span className="s-icon s-icon--13 s-muted-2">lock</span>
                <span className="s-variant">https://</span>
                <EditableText cmsId="home.demo.domain" className="s-strong">
                  acme-site.com
                </EditableText>
                <span className="s-faint">/preview</span>
              </div>
            </div>
            <div className="s-pill s-live">
              <span className="s-dot s-dot--small s-dot--pulse" />
              <span className="s-label-mono s-strong">CMSify</span>
              <span className="s-faint">|</span>
              <span className="s-accent">live-edit</span>
            </div>
          </div>

          <div className="s-demo">
            <div className="s-demo-header">
              <div className="s-demo-brand">
                <span className="s-demo-mark">A</span>
                <EditableText cmsId="home.demo.brand">Acme Studio</EditableText>
              </div>
              <EditableList cmsId="home.demo.nav" className="s-demo-nav" items={demoNav} template={{ id: 'new', text: 'Link' }}>
                {(item, field) => <EditableText cmsId={field('text')}>{item.text}</EditableText>}
              </EditableList>
              <div className="s-code s-muted-2">
                branch: <EditableText cmsId="home.demo.branch" className="s-strong">main</EditableText>
              </div>
            </div>

            <div className="s-demo-body">
              <div className="s-demo-highlight">
                <div className="s-demo-outline" aria-hidden="true" />
                <div className="s-demo-tag" aria-hidden="true">
                  <span className="s-dot s-dot--small" />
                  <span>hero.title</span>
                  <span className="s-icon s-icon--12">edit</span>
                </div>
                <h2 className="s-demo-title">
                  <EditableText cmsId="home.demo.title">Build better software.</EditableText>
                  <span className="s-caret" aria-hidden="true" />
                </h2>
              </div>
              <EditableText cmsId="home.demo.description" as="p" className="s-demo-text">
                We help teams build modern digital products.
              </EditableText>
              <div className="s-demo-actions">
                <EditableText cmsId="home.demo.button" className="s-demo-button">
                  Get started
                </EditableText>
                <EditableText cmsId="home.demo.caption" className="s-code s-muted-2">
                  ← Visual edits sync directly to Git commits
                </EditableText>
              </div>
            </div>

            <div className="s-demo-footer">
              <EditableText cmsId="home.demo.copyright" className="s-code">
                © 2026 Acme Corp.
              </EditableText>
              <EditableText cmsId="home.demo.status" className="s-code s-accent s-medium">
                Auto-sync ready
              </EditableText>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ id, eyebrow, heading, large }: { id: string; eyebrow: string; heading: string; large?: boolean }) {
  return (
    <>
      <EditableText cmsId={`${id}.eyebrow`} className="s-eyebrow">
        {eyebrow}
      </EditableText>
      <EditableText cmsId={`${id}.heading`} as="h2" className={large ? 's-h2 s-h2--xl' : 's-h2'}>
        {heading}
      </EditableText>
    </>
  );
}

function HowItWorks() {
  return (
    <section className="s-section" id="how-it-works">
      <div className="s-container">
        <div className="s-section-head">
          <SectionHeading id="home.howItWorks" eyebrow="WORKFLOW" heading="How it works" />
        </div>
        <EditableList
          cmsId="home.howItWorks.steps"
          className="s-grid s-grid--3"
          items={steps}
          template={{ id: 'new', label: 'STEP', icon: 'bolt', title: 'New step', description: 'Describe this step.' }}
        >
          {(step, field) => (
            <div className="s-card">
              <div className="s-card-top">
                <EditableText cmsId={field('label')} className="s-label-mono s-accent s-semibold">
                  {step.label}
                </EditableText>
                <EditableText cmsId={field('icon')} className={`s-icon s-icon--20 ${step.accent ? 's-accent' : 's-muted-2'}`} label="Icon (Material Symbols name)">
                  {step.icon}
                </EditableText>
              </div>
              <EditableText cmsId={field('title')} as="h3" className="s-h3">
                {step.title}
              </EditableText>
              <EditableText cmsId={field('description')} as="p" className="s-card-text" multiline>
                {step.description}
              </EditableText>
            </div>
          )}
        </EditableList>
      </div>
    </section>
  );
}

function Architecture() {
  return (
    <section className="s-section s-section--bright">
      <div className="s-container">
        <div className="s-section-head s-section-head--intro">
          <SectionHeading id="home.architecture" eyebrow="ARCHITECTURE & DATA FLOW" heading="Your website stays yours." large />
          <EditableText cmsId="home.architecture.description" as="p" className="s-body-lg s-variant" multiline>
            CMSify works with your existing codebase. Your content stays versioned in Git while your existing deployment continues to work.
          </EditableText>
        </div>
        <div className="s-panel">
          <EditableList
            cmsId="home.architecture.flow"
            className="s-flow"
            items={flow}
            template={{ id: 'new', label: '05 / STEP', icon: 'bolt', title: 'New stage', detail: 'details' }}
          >
            {(node, field) => (
              <div className="s-flow-item">
                <div className="s-flow-node">
                  <div className="s-flow-top">
                    <EditableText cmsId={field('label')} className="s-label-mono s-flow-label">
                      {node.label}
                    </EditableText>
                    <EditableText cmsId={field('icon')} className="s-icon s-icon--18 s-flow-icon" label="Icon (Material Symbols name)">
                      {node.icon}
                    </EditableText>
                  </div>
                  <EditableText cmsId={field('title')} className="s-flow-title">
                    {node.title}
                  </EditableText>
                  <EditableText cmsId={field('detail')} className="s-code s-flow-detail">
                    {node.detail}
                  </EditableText>
                </div>
                <div className="s-flow-arrow" aria-hidden="true">
                  <span className="s-flow-line" />
                  <span className="s-flow-head">→</span>
                </div>
              </div>
            )}
          </EditableList>
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  return (
    <section className="s-section">
      <div className="s-container">
        <div className="s-section-head">
          <SectionHeading id="home.benefits" eyebrow="BENEFITS" heading="Key benefits" />
        </div>
        <EditableList
          cmsId="home.benefits.items"
          className="s-grid s-grid--2"
          items={benefits}
          template={{ id: 'new', label: '05 / NEW', title: 'New benefit', description: 'Describe the benefit.' }}
        >
          {(benefit, field) => (
            <div className="s-card">
              <EditableText cmsId={field('label')} className={`s-label-mono s-card-label ${benefit.accent ? 's-accent' : 's-muted-2'}`}>
                {benefit.label}
              </EditableText>
              <EditableText cmsId={field('title')} as="h3" className="s-h3 s-h3--tight">
                {benefit.title}
              </EditableText>
              <EditableText cmsId={field('description')} as="p" className="s-card-text" multiline>
                {benefit.description}
              </EditableText>
            </div>
          )}
        </EditableList>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="s-section s-section--last">
      <div className="s-container s-container--narrow">
        <div className="s-cta">
          <EditableText cmsId="home.cta.eyebrow" className="s-eyebrow">
            INITIALIZE REPOSITORY
          </EditableText>
          <EditableText cmsId="home.cta.heading" as="h2" className="s-cta-title">
            Your website is already built. Now make it editable.
          </EditableText>
          <EditableText cmsId="home.cta.description" as="p" className="s-cta-text" multiline>
            Connect a GitHub repository and start turning your website into a CMS.
          </EditableText>
          <EditableLink cmsId="home.cta.button" href="#" className="s-button" before={<GitHubIcon />}>
            Connect GitHub
          </EditableLink>
          <EditableList cmsId="home.cta.notes" className="s-cta-notes" items={ctaNotes} template={{ id: 'new', text: 'New note' }}>
            {(note, field) => <EditableText cmsId={field('text')}>{note.text}</EditableText>}
          </EditableList>
        </div>
      </div>
    </section>
  );
}
