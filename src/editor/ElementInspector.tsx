import { useId, useState, type ChangeEvent } from 'react';
import { useCMSContent, useCMSOverride, useCMSRuntime } from '../cms/CMSProvider';
import {
  humanizeId,
  resolveValue,
  type CMSEntry,
  type CMSSelection,
  type CMSValue,
  type ImageValue,
  type LinkValue,
} from '../cms/cmsTypes';
import { addItem, duplicateItem, getListOrder, itemLabel, moveItem, removeItem } from '../cms/listActions';
import { useEditorStore } from './editorStore';
import { readAsDataUrl } from './fileTransfer';
import { badgeClass, buttonClass, code, fieldLabel, hint, iconButtonClass, stack, textAction } from './ui';

interface ElementInspectorProps {
  selection: CMSSelection;
}

/** Edits whichever element is selected. Field editors are chosen by CMS type, never by element id. */
export function ElementInspector({ selection }: ElementInspectorProps) {
  const { store, registry } = useCMSRuntime();
  const override = useCMSOverride(selection.id);
  const entry = registry.get(selection.id);

  if (!entry) return <p className={hint}>This element is no longer on the page.</p>;

  const { set, remove } = store.getState();
  const onChange = (value: CMSValue) => set(entry.id, value);

  return (
    <div className={stack}>
      <header className="flex flex-col gap-1.5 border-b border-line pb-4">
        <span className={badgeClass(entry.type)}>{entry.type}</span>
        <h2 className="mt-0.5 text-h3">{entry.options.label ?? humanizeId(entry.id)}</h2>
        <code className={`${code} break-all`}>{entry.id}</code>
      </header>

      <FieldEditor entry={entry} override={override} onChange={onChange} selection={selection} />

      {override !== undefined && entry.type !== 'list' && (
        <button type="button" className="self-start text-ui font-medium text-ink-variant hover:text-ink" onClick={() => remove(entry.id)}>
          Reset to original
        </button>
      )}

      {selection.item && <ItemControls selection={selection} />}
    </div>
  );
}

interface FieldEditorProps {
  entry: CMSEntry;
  override: CMSValue | undefined;
  onChange: (value: CMSValue) => void;
  selection: CMSSelection;
}

function FieldEditor({ entry, override, onChange, selection }: FieldEditorProps) {
  switch (entry.type) {
    case 'text':
      return (
        <TextField
          label="Text"
          value={resolveValue('text', override, entry.defaultValue)}
          multiline={entry.options.multiline}
          onChange={onChange}
          autoFocus
        />
      );
    case 'image':
      return <ImageEditor value={resolveValue('image', override, entry.defaultValue)} onChange={onChange} />;
    case 'link':
      return <LinkEditor value={resolveValue('link', override, entry.defaultValue)} onChange={onChange} />;
    case 'list':
      return <ListEditor listId={entry.id} activeKey={selection.item?.listId === entry.id ? selection.item.key : undefined} />;
  }
}

/* ---------- Field editors ---------- */

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
}

const field = 'flex flex-col gap-1.5';
const input =
  'w-full resize-y rounded-[12px] border border-line bg-surface px-3 py-[9px] transition placeholder:text-muted focus:border-secondary focus:ring-3 focus:ring-secondary/12 focus:outline-none';

function TextField({ label, value, onChange, multiline, autoFocus, placeholder }: TextFieldProps) {
  const id = useId();
  const handle = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value);
  return (
    <div className={field}>
      <label htmlFor={id} className={fieldLabel}>
        {label}
      </label>
      {multiline ? (
        <textarea id={id} className={input} value={value} onChange={handle} rows={Math.min(10, Math.max(3, value.split('\n').length + 1))} autoFocus={autoFocus} placeholder={placeholder} />
      ) : (
        <input id={id} className={input} value={value} onChange={handle} autoFocus={autoFocus} placeholder={placeholder} />
      )}
    </div>
  );
}

const LARGE_IMAGE_BYTES = 400 * 1024;

function ImageEditor({ value, onChange }: { value: ImageValue; onChange: (value: ImageValue) => void }) {
  const [warning, setWarning] = useState<string | null>(null);

  const upload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setWarning(
      file.size > LARGE_IMAGE_BYTES
        ? 'Large images are stored inline and can exceed browser storage. Prefer a URL for now.'
        : null,
    );
    onChange({ ...value, src: await readAsDataUrl(file) });
  };

  return (
    <>
      <div className="grid h-39 place-items-center overflow-hidden rounded-[14px] border border-line bg-[repeating-conic-gradient(var(--color-surface-low)_0_25%,#fff_0_50%)] bg-size-[16px_16px]">
        <img className="max-h-full max-w-full object-contain" src={value.src} alt="" />
      </div>
      <TextField
        label="Image URL"
        value={value.src.startsWith('data:') ? '' : value.src}
        placeholder="Uploaded file (paste a URL to replace)"
        onChange={(src) => onChange({ ...value, src })}
      />
      <label className={`${buttonClass()} self-start`}>
        Upload image…
        <input type="file" accept="image/*" onChange={upload} hidden />
      </label>
      {warning && <p className="leading-relaxed text-danger">{warning}</p>}
      <TextField label="Alt text" value={value.alt ?? ''} onChange={(alt) => onChange({ ...value, alt })} placeholder="Describe the image" />
    </>
  );
}

function LinkEditor({ value, onChange }: { value: LinkValue; onChange: (value: LinkValue) => void }) {
  return (
    <>
      <TextField label="Text" value={value.text} onChange={(text) => onChange({ ...value, text })} autoFocus />
      <TextField label="Link (URL or #/page)" value={value.href} onChange={(href) => onChange({ ...value, href })} />
    </>
  );
}

/* ---------- Repeated blocks ---------- */

function ListEditor({ listId, activeKey }: { listId: string; activeKey?: string }) {
  const runtime = useCMSRuntime();
  const onReveal = useEditorStore((s) => s.reveal);
  useCMSContent(); // Re-render when order or item labels change.
  const order = getListOrder(runtime, listId);
  const reveal = (key: string) => onReveal({ id: listId, type: 'list', item: { listId, key } });

  return (
    <div className={field}>
      <span className={fieldLabel}>Items ({order.length})</span>
      <ul className="overflow-hidden rounded-[14px] border border-line">
        {order.map((key, index) => {
          const active = key === activeKey;
          return (
            <li key={key} className={`flex items-center gap-0.5 border-t border-line py-1 pr-1.5 first:border-t-0 ${active ? 'bg-secondary-soft' : ''}`}>
              <button type="button" className={`min-w-0 flex-1 truncate px-3 py-1 text-left font-medium ${active ? 'text-secondary' : ''}`} onClick={() => reveal(key)}>
                {itemLabel(runtime, listId, key)}
              </button>
              <button type="button" className={iconButtonClass()} title="Move up" disabled={index === 0} onClick={() => moveItem(runtime, listId, key, -1)}>↑</button>
              <button type="button" className={iconButtonClass()} title="Move down" disabled={index === order.length - 1} onClick={() => moveItem(runtime, listId, key, 1)}>↓</button>
              <button type="button" className={iconButtonClass(true)} title="Remove" onClick={() => removeItem(runtime, listId, key)}>✕</button>
            </li>
          );
        })}
      </ul>
      <button type="button" className={buttonClass()} onClick={() => reveal(addItem(runtime, listId))}>
        + Add item
      </button>
    </div>
  );
}

/** Controls for the repeated item that contains the selected element. */
function ItemControls({ selection }: ElementInspectorProps) {
  const runtime = useCMSRuntime();
  const onReveal = useEditorStore((s) => s.reveal);
  useCMSContent();
  const { listId, key } = selection.item!;
  const order = getListOrder(runtime, listId);
  const index = order.indexOf(key);
  if (index < 0) return null;

  const duplicate = () => {
    const copy = duplicateItem(runtime, listId, key);
    const id = selection.id.replace(`${listId}.${key}.`, `${listId}.${copy}.`);
    onReveal({ ...selection, id, item: { listId, key: copy } });
  };
  const remove = () => {
    removeItem(runtime, listId, key);
    onReveal({ id: listId, type: 'list' });
  };

  return (
    <section className="flex flex-col gap-2.5 rounded-[18px] border border-line bg-surface-bright p-4">
      <h3 className={fieldLabel}>
        Item in <em className="text-secondary not-italic">{runtime.registry.get(listId)?.options.label ?? humanizeId(listId)}</em>
      </h3>
      <p className="text-[15px]/5 font-semibold text-ink">
        {itemLabel(runtime, listId, key)} · {index + 1} of {order.length}
      </p>
      <div className="flex flex-wrap gap-1.5">
        <button type="button" className={buttonClass()} disabled={index === 0} onClick={() => moveItem(runtime, listId, key, -1)}>↑ Up</button>
        <button type="button" className={buttonClass()} disabled={index === order.length - 1} onClick={() => moveItem(runtime, listId, key, 1)}>↓ Down</button>
        <button type="button" className={buttonClass()} onClick={duplicate}>Duplicate</button>
        <button type="button" className={buttonClass('danger')} onClick={remove}>Remove</button>
      </div>
      <button type="button" className={`${textAction} self-start`} onClick={() => onReveal({ id: listId, type: 'list', item: { listId, key } })}>
        Manage all items →
      </button>
    </section>
  );
}
