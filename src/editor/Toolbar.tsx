import { useRef, type ChangeEvent } from 'react';
import type { SaveStatus } from '../cms/cmsStore';
import { useEditorStore } from './editorStore';
import { buttonClass, pill } from './ui';

interface ToolbarProps {
  siteName: string;
  pageLabel: string;
  changeCount: number;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
}

const STATUS_TEXT: Record<SaveStatus, string> = {
  saved: 'Saved locally',
  saving: 'Saving…',
  error: 'Could not save: browser storage is full',
};

const STATUS_DOT: Record<SaveStatus, string> = {
  saved: 'bg-secondary',
  saving: 'bg-secondary animate-pulse',
  error: 'bg-danger',
};

export function Toolbar({ siteName, pageLabel, changeCount, onExport, onImport, onReset }: ToolbarProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const saveStatus = useEditorStore((s) => s.saveStatus);
  const notice = useEditorStore((s) => s.notice);
  const previewing = useEditorStore((s) => s.previewing);
  const togglePreview = useEditorStore((s) => s.togglePreview);

  const pickFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) onImport(file);
  };

  return (
    <header className="grid h-14 grid-cols-[1fr_auto] items-center gap-4 border-b border-line bg-surface px-5 min-[1100px]:grid-cols-[1fr_auto_1fr]">
      <div className="flex min-w-0 items-center gap-5">
        <span className="flex items-center gap-1 text-h3 tracking-tight">
          <span className="flex size-6 items-center justify-center rounded-[2px] bg-primary font-mono text-code text-white" aria-hidden="true">
            /
          </span>
          CMSify
        </span>
        <span className={pill}>
          <span className="select-none text-faint">site:</span>
          <strong className="truncate font-medium text-ink">{siteName}</strong>
          <span className="select-none text-faint">/{pageLabel.toLowerCase()}</span>
        </span>
      </div>

      <div className={`${pill} max-[1099px]:hidden`} role="status">
        {notice ?? (
          <>
            <span className={`size-1.5 flex-none rounded-full ${STATUS_DOT[saveStatus]}`} />
            <span className="text-ink">{STATUS_TEXT[saveStatus]}</span>
            {changeCount > 0 && (
              <>
                <span className="select-none text-faint">|</span>
                <span className="text-secondary">
                  {changeCount} change{changeCount === 1 ? '' : 's'}
                </span>
              </>
            )}
          </>
        )}
      </div>

      <div className="flex items-center justify-end gap-1">
        <button type="button" className={buttonClass('quiet')} onClick={onReset} disabled={changeCount === 0}>
          Reset changes
        </button>
        <button type="button" className={buttonClass('quiet')} onClick={() => fileInput.current?.click()}>
          Import JSON
        </button>
        <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={pickFile} />
        <button type="button" className={buttonClass('quiet')} onClick={onExport}>
          Export JSON
        </button>
        <button type="button" className={buttonClass('primary')} onClick={togglePreview} aria-pressed={previewing}>
          {previewing ? 'Back to editing' : 'Preview'}
        </button>
      </div>
    </header>
  );
}
