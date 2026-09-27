/* Class names for the editor chrome, in the CMSify design language. */

type ButtonVariant = 'default' | 'primary' | 'quiet' | 'danger';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  default: 'border-line bg-surface enabled:hover:border-secondary',
  primary: 'border-primary bg-primary text-white shadow-xs enabled:hover:border-primary-hover enabled:hover:bg-primary-hover',
  quiet: 'border-transparent bg-transparent text-ink-variant enabled:hover:text-ink',
  danger: 'border-line bg-surface text-danger enabled:hover:border-danger enabled:hover:bg-danger-soft',
};

export function buttonClass(variant: ButtonVariant = 'default') {
  return `inline-flex h-8 items-center justify-center gap-1 whitespace-nowrap rounded-[12px] border px-3 text-ui font-medium transition-colors disabled:opacity-40 ${BUTTON_VARIANTS[variant]}`;
}

export function iconButtonClass(danger = false) {
  const hover = danger ? 'enabled:hover:bg-danger-soft enabled:hover:text-danger' : 'enabled:hover:bg-surface-low enabled:hover:text-ink';
  return `size-[26px] rounded-lg font-mono text-muted disabled:opacity-30 ${hover}`;
}

export function badgeClass(type: string) {
  const tone = type === 'list' ? 'border-secondary bg-secondary-soft text-secondary' : 'border-line bg-surface-low text-ink-variant';
  return `self-start rounded-[12px] border px-2 py-0.5 font-mono text-[10px]/[14px] font-medium uppercase tracking-[0.04em] ${tone}`;
}

export const pill = 'inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap rounded-[12px] border border-line bg-surface px-3 py-1 font-mono text-code text-ink-variant';
export const textAction = 'text-ui font-medium text-secondary hover:underline';
export const fieldLabel = 'font-mono text-label uppercase text-muted';
export const code = 'font-mono text-code text-muted';
export const hint = 'leading-relaxed text-ink-variant';
export const stack = 'flex flex-col gap-4';
