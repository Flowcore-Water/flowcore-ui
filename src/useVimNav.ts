import { useEffect, useCallback, useRef, useState } from 'react';

/**
 * Vim/tmux-style keyboard navigation for Flowcore apps.
 *
 * Vim layer (active when not in an input):
 *   j/k     move down/up through focusable items
 *   h/l     collapse/expand sidebar or move between tabs
 *   /       focus search input
 *   gg      scroll to top / first item
 *   G       scroll to bottom / last item
 *   Esc     close modal, blur input, deselect
 *   Enter   activate focused item
 *   o       expand/collapse focused row
 *   ?       toggle keyboard help overlay
 *
 * Tmux layer (Ctrl+b prefix):
 *   Ctrl+b then t   cycle theme
 *   Ctrl+b then a   open app launcher
 *   Ctrl+b then 1-9 jump to nav item by position
 *   Ctrl+b then s   focus search
 *   Ctrl+b then ?   show all shortcuts
 */

export interface VimNavCallbacks {
  /** Called when theme cycle is requested (Ctrl+b t) */
  onCycleTheme?: () => void;
  /** Called when app launcher toggle is requested (Ctrl+b a) */
  onToggleLauncher?: () => void;
  /** Called when help overlay toggle is requested (?) */
  onToggleHelp?: () => void;
  /** Called when sidebar toggle is requested (h/l) */
  onToggleSidebar?: () => void;
  /** Called when nav item jump is requested (Ctrl+b 1-9) */
  onNavJump?: (index: number) => void;
}

export interface VimNavState {
  /** Whether the tmux prefix (Ctrl+b) is active and awaiting next key */
  prefixActive: boolean;
  /** Whether the help overlay is showing */
  helpOpen: boolean;
  /** Toggle help overlay */
  toggleHelp: () => void;
}

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

function getFocusableElements(container?: HTMLElement): HTMLElement[] {
  const root = container || document.querySelector('main') || document.body;
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter((el) => {
      // Skip hidden elements
      if (el.offsetParent === null && el.tagName !== 'BODY') return false;
      // Skip elements in closed dropdowns
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
}

function findSearchInput(): HTMLInputElement | null {
  const candidates = document.querySelectorAll<HTMLInputElement>(
    'input[type="search"], input[placeholder*="earch"], input[placeholder*="ilter"], input[aria-label*="earch"]'
  );
  return candidates[0] || null;
}

const CARD_SELECTOR = [
  '[class*="rounded-xl"][class*="border"]',
  '[class*="rounded-lg"][class*="border"]',
  '[style*="borderRadius"]',
  '[role="article"]',
  '[role="listitem"]',
].join(',');

function getCardElements(): HTMLElement[] {
  const root = document.querySelector('main') || document.body;
  return Array.from(root.querySelectorAll<HTMLElement>(CARD_SELECTOR))
    .filter((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 100 && rect.height > 40;
    });
}

function focusSearch() {
  const search = findSearchInput();
  if (search) search.focus();
}

export function useVimNav(callbacks: VimNavCallbacks = {}): VimNavState {
  const prefixRef = useRef(false);
  const prefixTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const gPendingRef = useRef(false);
  const gTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [prefixActive, setPrefixActive] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const toggleHelp = useCallback(() => setHelpOpen((v) => !v), []);

  useEffect(() => {
    function clearPrefix() {
      prefixRef.current = false;
      setPrefixActive(false);
      if (prefixTimerRef.current) clearTimeout(prefixTimerRef.current);
    }

    function clearG() {
      gPendingRef.current = false;
      if (gTimerRef.current) clearTimeout(gTimerRef.current);
    }

    function moveFocus(direction: 1 | -1) {
      const elements = getFocusableElements();
      if (elements.length === 0) return;

      const currentIdx = elements.indexOf(document.activeElement as HTMLElement);
      let nextIdx: number;

      if (currentIdx === -1) {
        // Nothing focused in main content; focus first/last depending on direction
        nextIdx = direction === 1 ? 0 : elements.length - 1;
      } else {
        nextIdx = currentIdx + direction;
        if (nextIdx < 0) nextIdx = 0;
        if (nextIdx >= elements.length) nextIdx = elements.length - 1;
      }

      elements[nextIdx]?.focus();
      elements[nextIdx]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    function moveCard(direction: 1 | -1) {
      const cards = getCardElements();
      if (cards.length === 0) return;
      // Find which card contains the active element or is closest
      const active = document.activeElement as HTMLElement;
      let currentIdx = -1;
      if (active) {
        currentIdx = cards.findIndex((card) => card.contains(active) || card === active);
      }
      let nextIdx = currentIdx === -1
        ? (direction === 1 ? 0 : cards.length - 1)
        : currentIdx + direction;
      if (nextIdx < 0) nextIdx = 0;
      if (nextIdx >= cards.length) nextIdx = cards.length - 1;
      const target = cards[nextIdx];
      target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      // Focus the first focusable element inside the card, or the card itself
      const inner = target.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      if (inner) inner.focus();
      else { target.tabIndex = -1; target.focus(); }
    }

    function handleKeyDown(e: KeyboardEvent) {
      // --- Ctrl/Cmd+K: universal search (works even in inputs) ---
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        focusSearch();
        return;
      }

      // --- Tmux prefix handling ---
      if (e.ctrlKey && e.key === 'b' && !isInputFocused()) {
        e.preventDefault();
        prefixRef.current = true;
        setPrefixActive(true);
        // Auto-clear prefix after 2 seconds
        if (prefixTimerRef.current) clearTimeout(prefixTimerRef.current);
        prefixTimerRef.current = setTimeout(clearPrefix, 2000);
        return;
      }

      // If prefix is active, handle tmux commands
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
          case 's':
          case '/':
            focusSearch();
            return;
          case '?':
            setHelpOpen((v) => !v);
            callbacksRef.current.onToggleHelp?.();
            return;
          default:
            // Ctrl+b then 1-9: nav jump
            if (e.key >= '1' && e.key <= '9') {
              callbacksRef.current.onNavJump?.(parseInt(e.key, 10) - 1);
              return;
            }
        }
        return;
      }

      // --- Esc: always works, even in inputs ---
      if (e.key === 'Escape') {
        if (helpOpen) {
          setHelpOpen(false);
          return;
        }
        if (isInputFocused()) {
          (document.activeElement as HTMLElement)?.blur();
          return;
        }
        // Let modals/dropdowns handle their own Esc
        return;
      }

      // --- All vim keys below require NOT being in an input ---
      if (isInputFocused()) return;

      switch (e.key) {
        case 'j':
          e.preventDefault();
          moveFocus(1);
          return;

        case 'k':
          e.preventDefault();
          moveFocus(-1);
          return;

        case 'h':
          e.preventDefault();
          callbacksRef.current.onToggleSidebar?.();
          return;

        case 'l':
          e.preventDefault();
          callbacksRef.current.onToggleSidebar?.();
          return;

        case '/':
          e.preventDefault();
          focusSearch();
          return;

        case 'g':
          if (gPendingRef.current) {
            // gg: go to top
            e.preventDefault();
            clearG();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            const elements = getFocusableElements();
            if (elements.length > 0) elements[0].focus();
          } else {
            gPendingRef.current = true;
            gTimerRef.current = setTimeout(clearG, 500);
          }
          return;

        case 'G':
          e.preventDefault();
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          {
            const elements = getFocusableElements();
            if (elements.length > 0) elements[elements.length - 1].focus();
          }
          return;

        case ' ':
          e.preventDefault();
          {
            // Space: expand/collapse the focused element
            const active = document.activeElement as HTMLElement;
            if (active) active.click();
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

        case '?':
          e.preventDefault();
          setHelpOpen((v) => !v);
          callbacksRef.current.onToggleHelp?.();
          return;

        case 'Enter':
          // Let default behavior handle it (click on focused element)
          return;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearPrefix();
      clearG();
    };
  }, [helpOpen]);

  return { prefixActive, helpOpen, toggleHelp };
}
