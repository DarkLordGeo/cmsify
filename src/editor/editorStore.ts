import { create } from 'zustand';
import { findById, findItem } from '../cms/CMSOverlay';
import type { SaveStatus } from '../cms/cmsStore';
import type { CMSSelection } from '../cms/cmsTypes';

/** Editor UI state. Content lives in the CMS store; this is only about the editing session. */
interface EditorState {
  selection: CMSSelection | null;
  previewing: boolean;
  /** Short-lived message shown in the toolbar. */
  notice: string | null;
  saveStatus: SaveStatus;
  /** Body of the preview iframe, where the website renders. */
  frame: HTMLElement | null;

  select(selection: CMSSelection | null): void;
  /** Select and scroll the element into view once the preview has re-rendered. */
  reveal(selection: CMSSelection | null): void;
  togglePreview(): void;
  notify(notice: string | null): void;
  setSaveStatus(status: SaveStatus): void;
  setFrame(frame: HTMLElement | null): void;
}

export const useEditorStore = create<EditorState>()((set, get) => ({
  selection: null,
  previewing: false,
  notice: null,
  saveStatus: 'saved',
  frame: null,

  select: (selection) => set({ selection }),
  reveal: (selection) => {
    set({ selection });
    const { frame } = get();
    if (!selection || !frame) return;
    requestAnimationFrame(() => {
      const target = selection.type === 'list' && selection.item ? findItem(frame, selection.item) : findById(frame, selection.id);
      target?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  },
  togglePreview: () => set((s) => ({ previewing: !s.previewing })),
  notify: (notice) => set({ notice }),
  setSaveStatus: (saveStatus) => set({ saveStatus }),
  setFrame: (frame) => set({ frame }),
}));
