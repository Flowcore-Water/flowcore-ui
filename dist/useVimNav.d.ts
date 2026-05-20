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
export declare function useVimNav(callbacks?: VimNavCallbacks): VimNavState;
//# sourceMappingURL=useVimNav.d.ts.map