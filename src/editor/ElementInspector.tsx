import { useId, useState, useSyncExternalStore, type ChangeEvent } from 'react';
import { useCMSContent, useCMSRuntime } from '../cms/CMSProvider';
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
import { readAsDataUrl } from './fileTransfer';

interface ElementInspectorProps {
  selection: CMSSelection;
  /** Select something and scroll it into view. */
  onReveal: (selection: CMSSelection | null) => void;
}

/** Edits whichever element is selected. Field editors are chosen by CMS type, never by element id. */
export function ElementInspector({ selection, onReveal }: ElementInspectorProps) {
  const { store, registry } = useCMSRuntime();
  const override = useSyncExternalStore(store.subscribe, () => store.get(selection.id));
  const entry = registry.get(selection.id);

  if (!entry) return <p className="cms-empty">This element is no longer on the page.</p>;

  const onChange = (value: CMSValue) => store.set(entry.id, value);

  return (
    <div className="cms-stack">
      <header className="cms-element-header">
        <span className={`cms-badge cms-badge--${entry.type}`}>{entry.type}</span>
        <h2>{entry.options.label ?? humanizeId(entry.id)}</h2>
        <code>{entry.id}</code>
      </header>

      <FieldEditor entry={entry} override={override} onChange={onChange} selection={selection} onReveal={onReveal} />

      {override !== undefined && entry.type !== 'list' && (
        <button type="button" className="cms-button cms-button--quiet" onClick={() => store.remove(entry.id)}>
          Reset to original
        </button>
      )}

      {selection.item && <ItemControls selection={selection} onReveal={onReveal} />}
    </div>
  );
}

interface FieldEditorProps {
  entry: CMSEntry;
  override: CMSValue | undefined;
  onChange: (value: CMSValue) => void;
  selection: CMSSelection;
  onReveal: ElementInspectorProps['onReveal'];
}

function FieldEditor({ entry, override, onChange, selection, onReveal }: FieldEditorProps) {
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
      return <ListEditor listId={entry.id} activeKey={selection.item?.listId === entry.id ? selection.item.key : undefined} onReveal={onReveal} />;
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

function TextField({ label, value, onChange, multiline, autoFocus, placeholder }: TextFieldProps) {
  const id = useId();
  const handle = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value);
  return (
    <div className="cms-field">
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea id={id} value={value} onChange={handle} rows={Math.min(10, Math.max(3, value.split('\n').length + 1))} autoFocus={autoFocus} placeholder={placeholder} />
      ) : (
        <input id={id} value={value} onChange={handle} autoFocus={autoFocus} placeholder={placeholder} />
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
      <div className="cms-image-preview">
        <img src={value.src} alt="" />
      </div>
      <TextField
        label="Image URL"
        value={value.src.startsWith('data:') ? '' : value.src}
        placeholder="Uploaded file (paste a URL to replace)"
        onChange={(src) => onChange({ ...value, src })}
      />
      <label className="cms-button cms-button--quiet cms-upload">
        Upload image…
        <input type="file" accept="image/*" onChange={upload} hidden />
      </label>
      {warning && <p className="cms-hint cms-hint--warn">{warning}</p>}
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

function ListEditor({ listId, activeKey, onReveal }: { listId: string; activeKey?: string; onReveal: ElementInspectorProps['onReveal'] }) {
  const runtime = useCMSRuntime();
  useCMSContent(); // Re-render when order or item labels change.
  const order = getListOrder(runtime, listId);
  const reveal = (key: string) => onReveal({ id: listId, type: 'list', item: { listId, key } });

  return (
    <div className="cms-field">
      <label>Items ({order.length})</label>
      <ul className="cms-list">
        {order.map((key, index) => (
          <li key={key} className={key === activeKey ? 'is-active' : undefined}>
            <button type="button" className="cms-list-label" onClick={() => reveal(key)}>
              {itemLabel(runtime, listId, key)}
            </button>
            <button type="button" className="cms-icon" title="Move up" disabled={index === 0} onClick={() => moveItem(runtime, listId, key, -1)}>↑</button>
            <button type="button" className="cms-icon" title="Move down" disabled={index === order.length - 1} onClick={() => moveItem(runtime, listId, key, 1)}>↓</button>
            <button type="button" className="cms-icon cms-icon--danger" title="Remove" onClick={() => removeItem(runtime, listId, key)}>✕</button>
          </li>
        ))}
      </ul>
      <button type="button" className="cms-button" onClick={() => reveal(addItem(runtime, listId))}>
        + Add item
      </button>
    </div>
  );
}

/** Controls for the repeated item that contains the selected element. */
function ItemControls({ selection, onReveal }: ElementInspectorProps) {
  const runtime = useCMSRuntime();
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
    <section className="cms-item-controls">
      <h3>
        Item in <em>{runtime.registry.get(listId)?.options.label ?? humanizeId(listId)}</em>
      </h3>
      <p className="cms-hint">
        {itemLabel(runtime, listId, key)} · {index + 1} of {order.length}
      </p>
      <div className="cms-button-row">
        <button type="button" className="cms-button" disabled={index === 0} onClick={() => moveItem(runtime, listId, key, -1)}>↑ Up</button>
        <button type="button" className="cms-button" disabled={index === order.length - 1} onClick={() => moveItem(runtime, listId, key, 1)}>↓ Down</button>
        <button type="button" className="cms-button" onClick={duplicate}>Duplicate</button>
        <button type="button" className="cms-button cms-button--danger" onClick={remove}>Remove</button>
      </div>
      <button type="button" className="cms-link-button" onClick={() => onReveal({ id: listId, type: 'list', item: { listId, key } })}>
        Manage all items →
      </button>
    </section>
  );
}
