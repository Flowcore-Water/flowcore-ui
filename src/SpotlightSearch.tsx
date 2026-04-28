import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { ThemeColors } from './theme';
import type { AppInfo } from './AppLauncher';
import type { NavEntry, NavItem } from './AppShell';

export interface SpotlightSearchProps {
  open: boolean;
  onClose: () => void;
  theme: ThemeColors;
  /** All known Flowcore apps — shows cross-app navigation */
  apps?: AppInfo[];
  /** Nav items from the current app */
  navItems?: NavEntry[];
  currentAppSlug?: string;
  currentAppTitle?: string;
  /** Called for internal routes (same app). Receives the path string. */
  onNavigate?: (path: string) => void;
}

interface SearchResult {
  label: string;
  url: string;
  category: string;
  icon?: string;
}

function buildResults(
  apps: AppInfo[],
  navItems: NavEntry[],
  currentAppSlug?: string,
  currentAppTitle?: string,
): SearchResult[] {
  const results: SearchResult[] = [];

  // Current app nav items first
  for (const entry of navItems) {
    if ('kind' in entry && entry.kind === 'group') {
      for (const item of (entry as { items: NavItem[] }).items) {
        results.push({
          label: item.label,
          url: item.to,
          category: currentAppTitle || 'Current App',
          icon: item.icon,
        });
      }
    } else {
      const item = entry as NavItem;
      results.push({
        label: item.label,
        url: item.to,
        category: currentAppTitle || 'Current App',
        icon: item.icon,
      });
    }
  }

  // Cross-app links (skip current app)
  for (const app of apps) {
    if (app.slug === currentAppSlug) continue;
    results.push({
      label: app.display_name,
      url: app.url,
      category: 'Apps',
    });
  }

  return results;
}

export const SpotlightSearch: React.FC<SpotlightSearchProps> = ({
  open,
  onClose,
  theme: t,
  apps = [],
  navItems = [],
  currentAppSlug,
  currentAppTitle,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const allResults = useMemo(
    () => buildResults(apps, navItems, currentAppSlug, currentAppTitle),
    [apps, navItems, currentAppSlug, currentAppTitle],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return allResults;
    const q = query.toLowerCase();
    return allResults.filter(
      (r) => r.label.toLowerCase().includes(q) || r.category.toLowerCase().includes(q),
    );
  }, [query, allResults]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIdx(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Clamp selection
  useEffect(() => {
    if (selectedIdx >= filtered.length) {
      setSelectedIdx(Math.max(0, filtered.length - 1));
    }
  }, [filtered.length, selectedIdx]);

  function navigate(result: SearchResult) {
    if (result.url.startsWith('http')) {
      window.location.href = result.url;
    } else if (onNavigate) {
      onNavigate(result.url);
    }
    onClose();
  }

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === 'ArrowDown' || (e.ctrlKey && e.key === 'j')) {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
        return;
      }
      if (e.key === 'ArrowUp' || (e.ctrlKey && e.key === 'k')) {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter' && filtered.length > 0) {
        e.preventDefault();
        navigate(filtered[selectedIdx]);
        return;
      }
    }
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [open, onClose, filtered, selectedIdx]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.55)',
        zIndex: 9500,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(560px, 90vw)',
          maxHeight: '60vh',
          background: t.cardBg,
          border: `1px solid ${t.border}`,
          borderRadius: 16,
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'spotlightFadeIn 120ms ease-out',
        }}
      >
        {/* Search input */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${t.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <SearchIcon color={t.textMuted} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIdx(0);
            }}
            placeholder="Search pages, apps, and actions\u2026"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: t.textPrimary,
              fontSize: 16,
              fontFamily: 'inherit',
            }}
          />
          <kbd
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: 11,
              padding: '2px 6px',
              borderRadius: 4,
              background: t.surfaceHover,
              color: t.textMuted,
              border: `1px solid ${t.borderSubtle}`,
            }}
          >
            esc
          </kbd>
        </div>

        {/* Results */}
        <div style={{ overflowY: 'auto', padding: '4px 0' }}>
          {filtered.length === 0 ? (
            <div
              style={{
                padding: '32px 20px',
                textAlign: 'center',
                color: t.textMuted,
                fontSize: 13,
              }}
            >
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((result, i) => (
              <button
                key={`${result.category}-${result.url}`}
                onClick={() => navigate(result)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 20px',
                  border: 'none',
                  background: i === selectedIdx ? t.surfaceHover : 'transparent',
                  color: i === selectedIdx ? t.textPrimary : t.textSecondary,
                  fontSize: 14,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 80ms',
                }}
                onMouseEnter={() => setSelectedIdx(i)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {result.icon && (
                    <span style={{ width: 18, textAlign: 'center', fontSize: 15, flexShrink: 0 }}>
                      {result.icon}
                    </span>
                  )}
                  <span>{result.label}</span>
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: t.textMuted,
                    fontFamily: 'ui-monospace, monospace',
                  }}
                >
                  {result.category}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '10px 20px',
            borderTop: `1px solid ${t.border}`,
            display: 'flex',
            gap: 16,
            fontSize: 11,
            color: t.textMuted,
          }}
        >
          <span>
            <kbd style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>
              &uarr;&darr;
            </kbd>{' '}
            navigate
          </span>
          <span>
            <kbd style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>&crarr;</kbd>{' '}
            open
          </span>
          <span>
            <kbd style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>esc</kbd>{' '}
            close
          </span>
        </div>
      </div>

      <style>{`
        @keyframes spotlightFadeIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

function SearchIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
