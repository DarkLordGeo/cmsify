import { useRef, type ChangeEvent } from 'react';
import type { SaveStatus } from '../cms/cmsStore';

interface ToolbarProps {
  siteName: string;
  pageLabel: string;
  changeCount: number;
  saveStatus: SaveStatus;
  notice: string | null;
  previewing: boolean;
  onTogglePreview: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
}

const STATUS_TEXT: Record<SaveStatus, string> = {
  saved: 'Saved locally',
  saving: 'Saving…',
  error: 'Could not save: browser storage is full',
};

export function Toolbar(props: ToolbarProps) {
  const fileInput = useRef<HTMLInputElement>(null);

  const pickFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) props.onImport(file);
  };

  return (
    <header className="cms-toolbar">
      <div className="cms-toolbar-title">
        <span className="cms-logo">
          <span className="cms-logo-mark" aria-hidden="true">/</span>
          CMSify
        </span>
        <span className="cms-pill cms-toolbar-site">
          <span className="cms-faint">site:</span>
          <strong>{props.siteName}</strong>
          <span className="cms-faint">/{props.pageLabel.toLowerCase()}</span>
        </span>
      </div>

      <div className="cms-pill cms-toolbar-status" role="status">
        {props.notice ?? (
          <>
            <span className={`cms-dot cms-dot--${props.saveStatus}`} />
            <span className="cms-toolbar-status-text">{STATUS_TEXT[props.saveStatus]}</span>
            {props.changeCount > 0 && (
              <>
                <span className="cms-faint">|</span>
                <span className="cms-accent">
                  {props.changeCount} change{props.changeCount === 1 ? '' : 's'}
                </span>
              </>
            )}
          </>
        )}
      </div>

      <div className="cms-toolbar-actions">
        <button type="button" className="cms-button cms-button--quiet" onClick={props.onReset} disabled={props.changeCount === 0}>
          Reset changes
        </button>
        <button type="button" className="cms-button cms-button--quiet" onClick={() => fileInput.current?.click()}>
          Import JSON
        </button>
        <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={pickFile} />
        <button type="button" className="cms-button cms-button--quiet" onClick={props.onExport}>
          Export JSON
        </button>
        <button type="button" className="cms-button cms-button--primary" onClick={props.onTogglePreview} aria-pressed={props.previewing}>
          {props.previewing ? 'Back to editing' : 'Preview'}
        </button>
      </div>
    </header>
  );
}
