import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from './ThemeContext';

export interface VersionBannerProps {
  /** URL that returns JSON with a `version` field, e.g. "/version.json" */
  versionUrl?: string;
  /** Poll interval in ms (default 60 000 — one minute) */
  pollIntervalMs?: number;
  /** Current build hash. If omitted, the first fetch result is used as baseline. */
  currentVersion?: string;
}

export const VersionBanner: React.FC<VersionBannerProps> = ({
  versionUrl = '/version.json',
  pollIntervalMs = 60_000,
  currentVersion,
}) => {
  const { t } = useTheme();
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const baselineRef = useRef<string | null>(currentVersion ?? null);

  const checkVersion = useCallback(async () => {
    try {
      const res = await fetch(versionUrl, { cache: 'no-store' });
      if (!res.ok) return;
      const data: { version: string } = await res.json();
      if (!baselineRef.current) {
        baselineRef.current = data.version;
        return;
      }
      if (data.version !== baselineRef.current) {
        setUpdateAvailable(true);
      }
    } catch {
      // Network errors are silent — banner only shows on confirmed mismatch
    }
  }, [versionUrl]);

  useEffect(() => {
    checkVersion();
    const id = setInterval(checkVersion, pollIntervalMs);
    return () => clearInterval(id);
  }, [checkVersion, pollIntervalMs]);

  if (!updateAvailable || dismissed) return null;

  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: '10px 16px',
        background: t.accentBg,
        borderBottom: `1px solid ${t.accent}`,
        color: t.textPrimary,
        fontFamily: "'Inter', sans-serif",
        fontSize: 14,
        animation: 'versionBannerSlideIn 200ms ease-out',
      }}
    >
      <span>A new version is available.</span>
      <button
        onClick={() => window.location.reload()}
        style={{
          background: t.accent,
          color: t.pageBg,
          border: 'none',
          borderRadius: 6,
          padding: '4px 14px',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Refresh
      </button>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss update banner"
        style={{
          background: 'transparent',
          border: 'none',
          color: t.textMuted,
          cursor: 'pointer',
          fontSize: 18,
          lineHeight: 1,
          padding: '0 4px',
        }}
      >
        &times;
      </button>

      <style>{`
        @keyframes versionBannerSlideIn {
          from { opacity: 0; transform: translateY(-100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
