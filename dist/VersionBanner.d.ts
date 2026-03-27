import React from 'react';
export interface VersionBannerProps {
    /** URL that returns JSON with a `version` field, e.g. "/version.json" */
    versionUrl?: string;
    /** Poll interval in ms (default 60 000 — one minute) */
    pollIntervalMs?: number;
    /** Current build hash. If omitted, the first fetch result is used as baseline. */
    currentVersion?: string;
}
export declare const VersionBanner: React.FC<VersionBannerProps>;
//# sourceMappingURL=VersionBanner.d.ts.map