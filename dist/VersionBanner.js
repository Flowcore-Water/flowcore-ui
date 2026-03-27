import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from './ThemeContext';
export const VersionBanner = ({ versionUrl = '/version.json', pollIntervalMs = 60000, currentVersion, }) => {
    const { t } = useTheme();
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const baselineRef = useRef(currentVersion ?? null);
    const checkVersion = useCallback(async () => {
        try {
            const res = await fetch(versionUrl, { cache: 'no-store' });
            if (!res.ok)
                return;
            const data = await res.json();
            if (!baselineRef.current) {
                baselineRef.current = data.version;
                return;
            }
            if (data.version !== baselineRef.current) {
                setUpdateAvailable(true);
            }
        }
        catch {
            // Network errors are silent — banner only shows on confirmed mismatch
        }
    }, [versionUrl]);
    useEffect(() => {
        checkVersion();
        const id = setInterval(checkVersion, pollIntervalMs);
        return () => clearInterval(id);
    }, [checkVersion, pollIntervalMs]);
    if (!updateAvailable || dismissed)
        return null;
    return (_jsxs("div", { role: "status", style: {
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
        }, children: [_jsx("span", { children: "A new version is available." }), _jsx("button", { onClick: () => window.location.reload(), style: {
                    background: t.accent,
                    color: t.pageBg,
                    border: 'none',
                    borderRadius: 6,
                    padding: '4px 14px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                }, children: "Refresh" }), _jsx("button", { onClick: () => setDismissed(true), "aria-label": "Dismiss update banner", style: {
                    background: 'transparent',
                    border: 'none',
                    color: t.textMuted,
                    cursor: 'pointer',
                    fontSize: 18,
                    lineHeight: 1,
                    padding: '0 4px',
                }, children: "\u00D7" }), _jsx("style", { children: `
        @keyframes versionBannerSlideIn {
          from { opacity: 0; transform: translateY(-100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
      ` })] }));
};
//# sourceMappingURL=VersionBanner.js.map