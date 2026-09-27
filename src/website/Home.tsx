import { EditableLink, EditableList, EditableText } from '../cms';
import { benefits, ctaNotes, demoNav, flow, steps } from './content';
import { button, code, container, Dot, eyebrow, GitHubIcon, narrowContainer, pill, separated } from './ui';

const section = 'border-b border-line py-24';
const card = 'flex flex-col rounded-[18px] border border-line bg-surface-bright p-5 transition-colors hover:border-secondary md:p-8';

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
    <section className="border-b border-line bg-surface py-20">
      <div className={`${narrowContainer} flex flex-col items-center text-center`}>
        <div className={`${pill} mb-5 gap-1 bg-surface-low px-3 py-1 text-ink-variant`}>
          <Dot pulse />
          <EditableText cmsId="home.hero.badge">In-place runtime content layer</EditableText>
        </div>
        <EditableText
          cmsId="home.hero.title"
          as="h1"
          className="mb-5 max-w-3xl text-[44px]/12 font-semibold tracking-tight md:text-[58px]/16"
        >
          Turn your website into a CMS.
        </EditableText>
        <EditableText cmsId="home.hero.description" as="p" className="mb-8 max-w-2xl text-body-lg text-ink-variant" multiline>
          Connect your GitHub repository and edit your existing website visually — without rebuilding it.
        </EditableText>
        <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <EditableLink cmsId="home.hero.primaryCta" href="#" className={`${button} w-full gap-1 sm:w-auto`} before={<GitHubIcon />}>
            Connect GitHub
          </EditableLink>
          <EditableLink
            cmsId="home.hero.secondaryCta"
            href="#how-it-works"
            className="group inline-flex h-11 items-center gap-1 px-5 font-medium transition-colors hover:text-secondary"
            after={<span className="transition-transform group-hover:translate-x-0.5">→</span>}
          >
            See how it works
          </EditableLink>
        </div>
        <div className={`${pill} mt-8 gap-2 bg-surface-low px-3 py-1.5 text-ink-variant`}>
          <span className="text-muted">$</span>
          <EditableText cmsId="home.hero.command" className="font-medium text-ink">
            npx @cmsify/scan ./my-app
          </EditableText>
          <span className="select-none text-faint">→</span>
          <EditableText cmsId="home.hero.commandResult" className="font-medium text-secondary">
            38 editable tokens detected
          </EditableText>
        </div>
      </div>
    </section>
  );
}

function ProductVisual() {
  const divider = 'border-line/60';
  return (
    <section className={`${section} bg-surface-bright`}>
      <div className={container}>
        <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-xs">
          <div className="flex h-12 items-center justify-between border-b border-line bg-surface-low px-5">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="size-3 rounded-full bg-zinc-300" />
                <span className="size-3 rounded-full bg-zinc-300" />
                <span className="size-3 rounded-full bg-zinc-300" />
              </div>
              <div className={`${pill} min-w-[280px] gap-1 bg-surface px-3 py-1 text-ink`}>
                <span className="icon text-[13px] text-muted">lock</span>
                <span className="text-ink-variant">https://</span>
                <EditableText cmsId="home.demo.domain" className="font-medium">
                  acme-site.com
                </EditableText>
                <span className="select-none text-faint">/preview</span>
              </div>
            </div>
            <div className={`${pill} gap-1 bg-surface px-2 py-1 text-ink-variant`}>
              <Dot small pulse />
              <span className="text-label font-medium text-ink">CMSify</span>
              <span className="select-none text-faint">|</span>
              <span className="text-secondary">live-edit</span>
            </div>
          </div>

          <div className="flex min-h-[460px] select-none flex-col justify-between bg-surface p-8 md:p-14">
            <div className={`mb-8 flex items-center justify-between border-b pb-5 ${divider}`}>
              <div className="flex items-center gap-2 text-h3">
                <span className="flex size-6 items-center justify-center rounded-[2px] bg-ink font-mono text-[11px]/[14px] font-bold text-surface">A</span>
                <EditableText cmsId="home.demo.brand">Acme Studio</EditableText>
              </div>
              <EditableList cmsId="home.demo.nav" className="hidden items-center gap-5 text-ink-variant md:flex" items={demoNav} template={{ id: 'new', text: 'Link' }}>
                {(item, field) => <EditableText cmsId={field('text')}>{item.text}</EditableText>}
              </EditableList>
              <div className={`${code} text-muted`}>
                branch: <EditableText cmsId="home.demo.branch" className="text-ink">main</EditableText>
              </div>
            </div>

            <div className="my-auto max-w-2xl py-3">
              <div className="relative my-2 inline-block">
                <div className="pointer-events-none absolute -inset-2.5 rounded-[10px] border-2 border-secondary bg-secondary/5" aria-hidden="true" />
                <div
                  className={`absolute -top-7 left-0 flex items-center gap-1.5 rounded-[12px] border border-secondary bg-surface px-2 py-0.5 ${code} text-secondary shadow-xs`}
                  aria-hidden="true"
                >
                  <Dot small />
                  <span>hero.title</span>
                  <span className="icon ml-0.5 text-[12px]">edit</span>
                </div>
                <h2 className="relative text-[30px]/9 font-semibold tracking-tight md:text-[48px]/none">
                  <EditableText cmsId="home.demo.title">Build better software.</EditableText>
                  <span className="ml-0.5 inline-block h-8 w-0.5 animate-pulse bg-secondary align-middle md:h-11" aria-hidden="true" />
                </h2>
              </div>
              <EditableText cmsId="home.demo.description" as="p" className="mt-3 mb-5 max-w-lg text-body-lg text-ink-variant">
                We help teams build modern digital products.
              </EditableText>
              <div className="flex items-center gap-3">
                <EditableText cmsId="home.demo.button" className="inline-flex h-10 items-center rounded-[12px] bg-ink px-5 font-medium text-surface shadow-xs">
                  Get started
                </EditableText>
                <EditableText cmsId="home.demo.caption" className={`${code} text-muted`}>
                  ← Visual edits sync directly to Git commits
                </EditableText>
              </div>
            </div>

            <div className={`flex items-center justify-between border-t pt-5 text-muted ${divider}`}>
              <EditableText cmsId="home.demo.copyright" className={code}>
                © 2026 Acme Corp.
              </EditableText>
              <EditableText cmsId="home.demo.status" className={`${code} font-medium text-secondary`}>
                Auto-sync ready
              </EditableText>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ id, eyebrow: label, heading, large }: { id: string; eyebrow: string; heading: string; large?: boolean }) {
  return (
    <>
      <EditableText cmsId={`${id}.eyebrow`} className={eyebrow}>
        {label}
      </EditableText>
      <EditableText cmsId={`${id}.heading`} as="h2" className={large ? 'mt-1 mb-2 text-[32px]/10 font-semibold tracking-tight' : 'mt-1 text-h2'}>
        {heading}
      </EditableText>
    </>
  );
}

function HowItWorks() {
  return (
    <section className={`${section} bg-surface`} id="how-it-works">
      <div className={container}>
        <div className="mb-8">
          <SectionHeading id="home.howItWorks" eyebrow="WORKFLOW" heading="How it works" />
        </div>
        <EditableList
          cmsId="home.howItWorks.steps"
          className="grid grid-cols-1 gap-5 md:grid-cols-3"
          items={steps}
          template={{ id: 'new', label: 'STEP', icon: 'bolt', title: 'New step', description: 'Describe this step.' }}
        >
          {(step, field) => (
            <div className={card}>
              <div className="mb-5 flex items-center justify-between">
                <EditableText cmsId={field('label')} className="font-mono text-label font-semibold text-secondary">
                  {step.label}
                </EditableText>
                <EditableText
                  cmsId={field('icon')}
                  className={`icon text-[20px] ${step.accent ? 'text-secondary' : 'text-muted'}`}
                  label="Icon (Material Symbols name)"
                >
                  {step.icon}
                </EditableText>
              </div>
              <EditableText cmsId={field('title')} as="h3" className="mb-2 text-h3">
                {step.title}
              </EditableText>
              <EditableText cmsId={field('description')} as="p" className="leading-relaxed text-ink-variant" multiline>
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
  // Each item is a node plus the arrow to the next one. Position-based accents mirror the design:
  // the second stage and the final stage are highlighted, as is the arrow leading into the final stage.
  const accent = 'group-nth-2/flow:text-secondary group-last/flow:text-secondary';
  return (
    <section className={`${section} bg-surface-bright`}>
      <div className={container}>
        <div className="mb-8 max-w-2xl">
          <SectionHeading id="home.architecture" eyebrow="ARCHITECTURE & DATA FLOW" heading="Your website stays yours." large />
          <EditableText cmsId="home.architecture.description" as="p" className="text-body-lg text-ink-variant" multiline>
            CMSify works with your existing codebase. Your content stays versioned in Git while your existing deployment continues to work.
          </EditableText>
        </div>
        <div className="rounded-[20px] border border-line bg-surface p-5 shadow-xs md:p-10">
          <EditableList
            cmsId="home.architecture.flow"
            className="grid grid-cols-1 gap-3 md:grid-cols-2"
            items={flow}
            template={{ id: 'new', label: '05 / STEP', icon: 'bolt', title: 'New stage', detail: 'details' }}
          >
            {(node, field) => (
              <div className="group/flow grid grid-cols-1 items-center gap-3 md:grid-cols-2">
                <div className="flex min-w-0 flex-col gap-1 rounded-[14px] border border-line bg-surface-low p-3 group-last/flow:border-secondary group-last/flow:bg-secondary-soft">
                  <div className="mb-1 flex items-center justify-between">
                    <EditableText cmsId={field('label')} className={`font-mono text-label text-muted group-last/flow:font-semibold ${accent}`}>
                      {node.label}
                    </EditableText>
                    <EditableText cmsId={field('icon')} className={`icon text-[18px] text-ink-variant ${accent}`} label="Icon (Material Symbols name)">
                      {node.icon}
                    </EditableText>
                  </div>
                  <EditableText cmsId={field('title')} className="text-[15px]/5 font-semibold">
                    {node.title}
                  </EditableText>
                  <EditableText cmsId={field('detail')} className={`truncate ${code} text-ink-variant group-last/flow:text-secondary`}>
                    {node.detail}
                  </EditableText>
                </div>
                <div className="hidden items-center md:flex md:group-last/flow:invisible" aria-hidden="true">
                  <span className="h-px flex-1 bg-line group-nth-last-2/flow:bg-secondary" />
                  <span className="-mx-1 font-mono text-[13px]/4 font-medium text-muted group-nth-last-2/flow:text-secondary">→</span>
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
    <section className={`${section} bg-surface`}>
      <div className={container}>
        <div className="mb-8">
          <SectionHeading id="home.benefits" eyebrow="BENEFITS" heading="Key benefits" />
        </div>
        <EditableList
          cmsId="home.benefits.items"
          className="grid grid-cols-1 gap-5 md:grid-cols-2"
          items={benefits}
          template={{ id: 'new', label: '05 / NEW', title: 'New benefit', description: 'Describe the benefit.' }}
        >
          {(benefit, field) => (
            <div className={card}>
              <EditableText cmsId={field('label')} className={`mb-2 block font-mono text-label ${benefit.accent ? 'text-secondary' : 'text-muted'}`}>
                {benefit.label}
              </EditableText>
              <EditableText cmsId={field('title')} as="h3" className="mb-1 text-h3">
                {benefit.title}
              </EditableText>
              <EditableText cmsId={field('description')} as="p" className="leading-relaxed text-ink-variant" multiline>
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
    <section className="bg-surface py-24">
      <div className={narrowContainer}>
        <div className="flex flex-col items-center rounded-3xl border border-line bg-surface-bright p-8 text-center shadow-xs md:p-14">
          <EditableText cmsId="home.cta.eyebrow" className={`${eyebrow} mb-2 block`}>
            INITIALIZE REPOSITORY
          </EditableText>
          <EditableText cmsId="home.cta.heading" as="h2" className="mb-2 max-w-xl text-h2 tracking-tight md:text-[36px]/10">
            Your website is already built. Now make it editable.
          </EditableText>
          <EditableText cmsId="home.cta.description" as="p" className="mb-8 max-w-md leading-relaxed text-ink-variant" multiline>
            Connect a GitHub repository and start turning your website into a CMS.
          </EditableText>
          <EditableLink cmsId="home.cta.button" href="#" className={`${button} gap-2`} before={<GitHubIcon />}>
            Connect GitHub
          </EditableLink>
          <EditableList
            cmsId="home.cta.notes"
            className={`mt-5 flex items-center justify-center gap-3 whitespace-nowrap ${code} text-muted ${separated} [&>*+*]:before:mr-3`}
            items={ctaNotes}
            template={{ id: 'new', text: 'New note' }}
          >
            {(note, field) => <EditableText cmsId={field('text')}>{note.text}</EditableText>}
          </EditableList>
        </div>
      </div>
    </section>
  );
}
