import { useEffect, useCallback, useRef, useState } from 'react';

/**
 * Vim/tmux-style keyboard navigation for Flowcore apps.
 *
 * Uses a VISUAL CURSOR (border highlight) instead of DOM focus.
 * Navigation keys move the cursor; Space activates the cursored element.
 *
 * NAVIGATION:
 *   j/k        move cursor down/up within current scope
 *   { / }      move cursor between cards (top-level containers)
 *   g g        scroll to top, cursor on first element
 *   G          scroll to bottom, cursor on last element
 *   Space      activate cursored element (focus inputs, click buttons)
 *   Enter      activate cursored element
 *   Esc        exit scope / clear cursor / close modal / blur input
 *   /          cursor to search input
 *   ?          toggle keyboard help overlay
 *
 * SELECTION (Gmail-style):
 *   x          toggle select on cursored row
 *   * a        select all rows in scope
 *   * n        select none (clear selection)
 *   ]          preview cursored row (opens detail panel)
 *   e          archive selected/cursored rows (where archive button exists)
 *   #          delete selected/cursored rows (where delete button exists)
 *   Esc        clear selection (before exiting scope)
 *
 * CLIPBOARD:
 *   c          copy (clicks nearest copy button on cursored element)
 *   y          yank whole record text to clipboard
 *
 * SIDEBARS:
 *   [          toggle left sidebar
 *   Ctrl+h     move cursor scope to left sidebar
 *   Ctrl+l     move cursor scope to right sidebar
 *
 * GLOBAL:
 *   Ctrl/Cmd+K open spotlight search
 *
 * TMUX LAYER (Ctrl+b prefix):
 *   Ctrl+b t   cycle theme
 *   Ctrl+b a   open app launcher
 *   Ctrl+b b   open bug report
 *   Ctrl+b 1-9 jump to nav item
 *   Ctrl+b s   cursor to search
 *   Ctrl+b ?   show all shortcuts
 */

export interface VimNavCallbacks {
  /** Called when theme cycle is requested (Ctrl+b t) */
  onCycleTheme?: () => void;
  /** Called when app launcher toggle is requested (Ctrl+b a) */
  onToggleLauncher?: () => void;
  /** Called when help overlay toggle is requested (?) */
  onToggleHelp?: () => void;
  /** @deprecated Use onToggleLeftSidebar */
  onToggleSidebar?: () => void;
  /** Called when left sidebar toggle is requested ([) */
  onToggleLeftSidebar?: () => void;
  /** Called when right sidebar toggle is requested (]) — fallback if no row is cursored */
  onToggleRightSidebar?: () => void;
  /** Called when nav item jump is requested (Ctrl+b 1-9) */
  onNavJump?: (index: number) => void;
  /** Called when bug report toggle is requested (Ctrl+b b) */
  onToggleBugReport?: () => void;
  /** Called when spotlight search is requested (Ctrl/Cmd+K) */
  onOpenSpotlight?: () => void;
  /** Called when ] is pressed on a table row — open preview panel */
  onPreviewRow?: (rowEl: HTMLElement) => void;
  /** Called when e is pressed — archive selected/cursored rows */
  onArchiveRows?: (rowEls: HTMLElement[]) => void;
  /** Called when # is pressed — delete selected/cursored rows (only if delete action exists) */
  onDeleteRows?: (rowEls: HTMLElement[]) => void;
}

export interface VimNavState {
  /** Whether the tmux prefix (Ctrl+b) is active and awaiting next key */
  prefixActive: boolean;
  /** Whether the * (star) prefix is waiting for a second key */
  starPrefixActive: boolean;
  /** Whether the help overlay is showing */
  helpOpen: boolean;
  /** Toggle help overlay */
  toggleHelp: () => void;
  /** Set of currently selected row elements */
  selectedRows: Set<HTMLElement>;
  /** Clear all selected rows */
  clearSelection: () => void;
}

/* ─── Cursor style injection ───────────────────────────────────────── */

const CURSOR_STYLE_ID = 'vim-nav-cursor-styles';
const CURSOR_CSS = `
.vim-cursor {
  outline: 2px solid #3794EA !important;
  outline-offset: 2px;
}
.vim-cursor[data-vim-row] {
  outline: none !important;
  position: relative;
}
.vim-cursor[data-vim-row] > td:first-child,
.vim-cursor[data-vim-row] > th:first-child {
  box-shadow: inset 3px 0 0 #3794EA;
}
.vim-selected {
  background: rgba(55, 148, 234, 0.08) !important;
}
.vim-selected > td:first-child,
.vim-selected > th:first-child {
  box-shadow: inset 3px 0 0 rgba(55, 148, 234, 0.4);
}
.vim-cursor.vim-selected > td:first-child,
.vim-cursor.vim-selected > th:first-child {
  box-shadow: inset 3px 0 0 #3794EA;
}
.vim-scope {
  outline: 1px dashed rgba(55, 148, 234, 0.35) !important;
  outline-offset: 4px;
}
`;

function ensureCursorStyles(): void {
  if (document.getElementById(CURSOR_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = CURSOR_STYLE_ID;
  style.textContent = CURSOR_CSS;
  document.head.appendChild(style);
}

/* ─── DOM helpers ──────────────────────────────────────────────────── */

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[role="button"]:not([disabled])',
  '[role="link"]',
  '[role="menuitem"]',
  '[role="tab"]',
  '[role="row"]',
  'tr[style*="cursor"]',
].join(',');

function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if ((el as HTMLElement).isContentEditable) return true;
  return false;
}

function isVisible(el: HTMLElement): boolean {
  if (el.offsetParent === null && el.tagName !== 'BODY') return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function getFocusableElements(container?: HTMLElement | null): HTMLElement[] {
  const root = container || document.querySelector('main') || document.body;
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(isVisible);
}

const CARD_SELECTOR = [
  '[data-vim-card]',
  '[class*="rounded-xl"][class*="border"]',
  '[class*="rounded-lg"][class*="border"]',
  '[style*="borderRadius"]',
  '[role="article"]',
  '[role="listitem"]',
].join(',');

function getCardElements(): HTMLElement[] {
  const root = document.querySelector('main') || document.body;
  return Array.from(root.querySelectorAll<HTMLElement>(CARD_SELECTOR)).filter((el) => {
    const rect = el.getBoundingClientRect();
    return rect.width > 100 && rect.height > 40;
  });
}

function findSearchInput(): HTMLInputElement | null {
  const candidates = document.querySelectorAll<HTMLInputElement>(
    'input[type="search"], input[placeholder*="earch"], input[placeholder*="ilter"], input[aria-label*="earch"]',
  );
  return candidates[0] || null;
}

/** Returns true when the element contains enough focusable children to drill into. */
function hasSubElements(el: HTMLElement): boolean {
  return getFocusableElements(el).length > 2;
}

function findCopyButton(el: HTMLElement): HTMLButtonElement | null {
  const selectors = 'button[aria-label*="opy"], button[title*="opy"], [data-copy-button]';
  const direct = el.querySelectorAll<HTMLButtonElement>(selectors);
  if (direct.length > 0) return direct[0];
  const row = el.closest('tr, [role="row"], [data-vim-card]');
  if (row) {
    const rowBtns = row.querySelectorAll<HTMLButtonElement>(selectors);
    if (rowBtns.length > 0) return rowBtns[0];
  }
  return null;
}

function yankRecord(el: HTMLElement): string {
  const row = el.closest('tr, [role="row"], [data-vim-card]') || el;
  const cells = row.querySelectorAll('td, th, [role="cell"], [role="gridcell"]');
  if (cells.length > 0) {
    return Array.from(cells)
      .map((c) => c.textContent?.trim())
      .filter(Boolean)
      .join('\t');
  }
  return row.textContent?.trim() || '';
}

/* ─── Selection helpers ────────────────────────────────────────────── */

/** Find the closest table row from an element */
function findRow(el: HTMLElement): HTMLElement | null {
  return el.closest<HTMLElement>('tr[data-vim-row], [role="row"][data-vim-row]');
}

/** Get all selectable rows in the current scope or page */
function getSelectableRows(scope?: HTMLElement | null): HTMLElement[] {
  const root = scope || document.querySelector('main') || document.body;
  return Array.from(root.querySelectorAll<HTMLElement>('tr[data-vim-row], [role="row"][data-vim-row]')).filter(isVisible);
}

/** Check if a delete action exists for the given row */
function hasDeleteAction(el: HTMLElement): boolean {
  return !!el.querySelector<HTMLElement>(
    'button[aria-label*="elete"], button[title*="elete"], [data-delete-action], button[aria-label*="emove"], button[title*="emove"]',
  );
}

/** Check if an archive action exists for the given row */
function hasArchiveAction(el: HTMLElement): boolean {
  return !!el.querySelector<HTMLElement>(
    'button[aria-label*="rchive"], button[title*="rchive"], [data-archive-action]',
  );
}

/* ─── Hook ─────────────────────────────────────────────────────────── */

export function useVimNav(callbacks: VimNavCallbacks = {}): VimNavState {
  const prefixRef = useRef(false);
  const prefixTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const gPendingRef = useRef(false);
  const gTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const starPrefixRef = useRef(false);
  const starTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [prefixActive, setPrefixActive] = useState(false);
  const [starPrefixActive, setStarPrefixActive] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<HTMLElement>>(new Set());
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  // Visual cursor and scope tracking
  const cursorRef = useRef<HTMLElement | null>(null);
  const scopeRef = useRef<HTMLElement | null>(null);

  const toggleHelp = useCallback(() => setHelpOpen((v) => !v), []);

  const clearSelection = useCallback(() => {
    setSelectedRows((prev) => {
      prev.forEach((el) => el.classList.remove('vim-selected'));
      return new Set();
    });
  }, []);

  const toggleRowSelection = useCallback((el: HTMLElement) => {
    const row = findRow(el) ?? el;
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(row)) {
        row.classList.remove('vim-selected');
        next.delete(row);
      } else {
        row.classList.add('vim-selected');
        next.add(row);
      }
      return next;
    });
  }, []);

  const selectAllRows = useCallback(() => {
    const rows = getSelectableRows(scopeRef.current);
    setSelectedRows(() => {
      const next = new Set<HTMLElement>();
      rows.forEach((row) => {
        row.classList.add('vim-selected');
        next.add(row);
      });
      return next;
    });
  }, []);

  const selectNoneRows = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  const setCursor = useCallback((el: HTMLElement | null) => {
    if (cursorRef.current) cursorRef.current.classList.remove('vim-cursor');
    cursorRef.current = el;
    if (el) {
      el.classList.add('vim-cursor');
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, []);

  const setScope = useCallback((el: HTMLElement | null) => {
    if (scopeRef.current) scopeRef.current.classList.remove('vim-scope');
    scopeRef.current = el;
    if (el) el.classList.add('vim-scope');
  }, []);

  useEffect(() => {
    ensureCursorStyles();

    function clearPrefix() {
      prefixRef.current = false;
      setPrefixActive(false);
      if (prefixTimerRef.current) clearTimeout(prefixTimerRef.current);
    }

    function clearG() {
      gPendingRef.current = false;
      if (gTimerRef.current) clearTimeout(gTimerRef.current);
    }

    function moveCursor(direction: 1 | -1) {
      const elements = getFocusableElements(scopeRef.current);
      if (elements.length === 0) return;

      const currentIdx = cursorRef.current ? elements.indexOf(cursorRef.current) : -1;
      let nextIdx: number;
      if (currentIdx === -1) {
        nextIdx = direction === 1 ? 0 : elements.length - 1;
      } else {
        nextIdx = currentIdx + direction;
        if (nextIdx < 0) nextIdx = 0;
        if (nextIdx >= elements.length) nextIdx = elements.length - 1;
      }
      setCursor(elements[nextIdx]);
    }

    function moveCard(direction: 1 | -1) {
      const cards = getCardElements();
      if (cards.length === 0) return;

      let currentIdx = -1;
      if (cursorRef.current) {
        currentIdx = cards.findIndex(
          (card) => card.contains(cursorRef.current!) || card === cursorRef.current,
        );
      }

      let nextIdx =
        currentIdx === -1 ? (direction === 1 ? 0 : cards.length - 1) : currentIdx + direction;
      if (nextIdx < 0) nextIdx = 0;
      if (nextIdx >= cards.length) nextIdx = cards.length - 1;

      const target = cards[nextIdx];
      setCursor(target);

      // Auto-scope cards that contain enough sub-elements for drill-in
      if (hasSubElements(target)) {
        setScope(target);
      } else {
        setScope(null);
      }
    }

    function activateCursor() {
      const el = cursorRef.current;
      if (!el) return;
      const tag = el.tagName;
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        (el as HTMLElement).isContentEditable
      ) {
        el.focus();
      } else {
        el.click();
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      // ── Ctrl/Cmd+K: spotlight search (works even in inputs) ──
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        callbacksRef.current.onOpenSpotlight?.();
        return;
      }

      // ── Ctrl+h: move cursor scope to left sidebar ──
      if (e.ctrlKey && e.key === 'h' && !isInputFocused()) {
        e.preventDefault();
        const sidebar = document.querySelector<HTMLElement>('.sidebar-shell-aside, aside');
        if (sidebar) {
          setScope(sidebar);
          const items = getFocusableElements(sidebar);
          if (items.length > 0) setCursor(items[0]);
        }
        return;
      }

      // ── Ctrl+l: move cursor scope to right sidebar ──
      if (e.ctrlKey && e.key === 'l' && !isInputFocused()) {
        e.preventDefault();
        const rightPanel = document.querySelector<HTMLElement>(
          '[data-sidebar="right"], .sidebar-right, [data-panel="right"]',
        );
        if (rightPanel) {
          setScope(rightPanel);
          const items = getFocusableElements(rightPanel);
          if (items.length > 0) setCursor(items[0]);
        }
        return;
      }

      // ── Tmux prefix (Ctrl+b) ──
      if (e.ctrlKey && e.key === 'b' && !isInputFocused()) {
        e.preventDefault();
        prefixRef.current = true;
        setPrefixActive(true);
        if (prefixTimerRef.current) clearTimeout(prefixTimerRef.current);
        prefixTimerRef.current = setTimeout(clearPrefix, 2000);
        return;
      }

      // ── Tmux commands (prefix active) ──
      if (prefixRef.current) {
        e.preventDefault();
        clearPrefix();
        switch (e.key) {
          case 't':
            callbacksRef.current.onCycleTheme?.();
            return;
          case 'a':
            callbacksRef.current.onToggleLauncher?.();
            return;
          case 'b':
            callbacksRef.current.onToggleBugReport?.();
            return;
          case 's':
          case '/': {
            const search = findSearchInput();
            if (search) setCursor(search);
            return;
          }
          case '?':
            setHelpOpen((v) => !v);
            callbacksRef.current.onToggleHelp?.();
            return;
          default:
            if (e.key >= '1' && e.key <= '9') {
              callbacksRef.current.onNavJump?.(parseInt(e.key, 10) - 1);
              return;
            }
        }
        return;
      }

      // ── Star prefix (* key for select-all/none commands) ──
      if (starPrefixRef.current && !isInputFocused()) {
        e.preventDefault();
        starPrefixRef.current = false;
        setStarPrefixActive(false);
        if (starTimerRef.current) clearTimeout(starTimerRef.current);
        switch (e.key) {
          case 'a':
            selectAllRows();
            return;
          case 'n':
            selectNoneRows();
            return;
        }
        return;
      }

      // ── Escape: always works, even in inputs ──
      if (e.key === 'Escape') {
        if (helpOpen) {
          setHelpOpen(false);
          return;
        }
        if (isInputFocused()) {
          (document.activeElement as HTMLElement)?.blur();
          return;
        }
        // Clear selection first if any
        if (selectedRows.size > 0) {
          clearSelection();
          return;
        }
        // Exit scope first, then clear cursor
        if (scopeRef.current) {
          const card = scopeRef.current;
          setScope(null);
          setCursor(card);
          return;
        }
        if (cursorRef.current) {
          setCursor(null);
          return;
        }
        return;
      }

      // ── All vim keys below require NOT being in an input ──
      if (isInputFocused()) return;

      switch (e.key) {
        case 'j':
          e.preventDefault();
          moveCursor(1);
          return;

        case 'k':
          e.preventDefault();
          moveCursor(-1);
          return;

        case '/':
          e.preventDefault();
          {
            const search = findSearchInput();
            if (search) setCursor(search);
          }
          return;

        case 'g':
          if (gPendingRef.current) {
            e.preventDefault();
            clearG();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setScope(null);
            const elements = getFocusableElements();
            if (elements.length > 0) setCursor(elements[0]);
          } else {
            gPendingRef.current = true;
            gTimerRef.current = setTimeout(clearG, 500);
          }
          return;

        case 'G':
          e.preventDefault();
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          setScope(null);
          {
            const elements = getFocusableElements();
            if (elements.length > 0) setCursor(elements[elements.length - 1]);
          }
          return;

        case ' ':
          e.preventDefault();
          activateCursor();
          return;

        case 'Enter':
          if (cursorRef.current) {
            e.preventDefault();
            activateCursor();
          }
          return;

        case '}':
          e.preventDefault();
          moveCard(1);
          return;

        case '{':
          e.preventDefault();
          moveCard(-1);
          return;

        case '[':
          e.preventDefault();
          (
            callbacksRef.current.onToggleLeftSidebar ?? callbacksRef.current.onToggleSidebar
          )?.();
          return;

        case ']':
          e.preventDefault();
          // Preview the cursored row if it's a table row
          if (cursorRef.current) {
            const row = findRow(cursorRef.current);
            if (row) {
              callbacksRef.current.onPreviewRow?.(row);
              return;
            }
          }
          callbacksRef.current.onToggleRightSidebar?.();
          return;

        case 'x':
          e.preventDefault();
          if (cursorRef.current) {
            toggleRowSelection(cursorRef.current);
          }
          return;

        case '*':
          e.preventDefault();
          starPrefixRef.current = true;
          setStarPrefixActive(true);
          if (starTimerRef.current) clearTimeout(starTimerRef.current);
          starTimerRef.current = setTimeout(() => {
            starPrefixRef.current = false;
            setStarPrefixActive(false);
          }, 2000);
          return;

        case 'e':
          e.preventDefault();
          {
            const targets = selectedRows.size > 0
              ? Array.from(selectedRows).filter(hasArchiveAction)
              : cursorRef.current ? [findRow(cursorRef.current) ?? cursorRef.current].filter(hasArchiveAction) : [];
            if (targets.length > 0) {
              callbacksRef.current.onArchiveRows?.(targets);
            }
          }
          return;

        case '#':
          e.preventDefault();
          {
            const targets = selectedRows.size > 0
              ? Array.from(selectedRows).filter(hasDeleteAction)
              : cursorRef.current ? [findRow(cursorRef.current) ?? cursorRef.current].filter(hasDeleteAction) : [];
            if (targets.length > 0) {
              callbacksRef.current.onDeleteRows?.(targets);
            }
          }
          return;

        case 'c':
          e.preventDefault();
          if (cursorRef.current) {
            const copyBtn = findCopyButton(cursorRef.current);
            if (copyBtn) copyBtn.click();
          }
          return;

        case 'y':
          e.preventDefault();
          if (cursorRef.current) {
            const text = yankRecord(cursorRef.current);
            if (text) void navigator.clipboard.writeText(text);
          }
          return;

        case '?':
          e.preventDefault();
          setHelpOpen((v) => !v);
          callbacksRef.current.onToggleHelp?.();
          return;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearPrefix();
      clearG();
      if (starTimerRef.current) clearTimeout(starTimerRef.current);
      if (cursorRef.current) cursorRef.current.classList.remove('vim-cursor');
      if (scopeRef.current) scopeRef.current.classList.remove('vim-scope');
    };
  }, [helpOpen, selectedRows, setCursor, setScope, clearSelection, toggleRowSelection, selectAllRows, selectNoneRows]);

  return { prefixActive, starPrefixActive, helpOpen, toggleHelp, selectedRows, clearSelection };
}
