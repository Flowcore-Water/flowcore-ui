import React from 'react';
type MaybePromise<T> = T | Promise<T>;
export interface BugReportUserContext {
    uid?: string | null;
    email?: string | null;
    displayName?: string | null;
    role?: string | null;
}
export interface BugReportReleaseInfo {
    version?: string | null;
    build?: string | null;
    commit?: string | null;
    environment?: string | null;
}
export interface BugReportRouteContext {
    path?: string;
    routeParams?: Record<string, string>;
    queryParams?: Record<string, string>;
    hash?: string | null;
}
export interface BugReportDiagnosticError {
    message: string;
    stack?: string | null;
    timestamp?: number | null;
    eventId?: string | null;
}
export interface BugReportDiagnostics {
    recentErrors?: BugReportDiagnosticError[];
    consoleLogs?: ConsoleLogEntry[];
    breadcrumbs?: unknown[];
    sentry?: {
        lastEventId?: string | null;
        replayId?: string | null;
    };
    extra?: Record<string, unknown>;
}
export interface BugReportScreenshot {
    dataUrl: string;
    source: 'automatic' | 'manual';
    width: number;
    height: number;
    capturedAt: string;
}
export interface BugReportSubmissionPayload {
    appSlug: string;
    summary: string;
    comments: string;
    url: string;
    userAgent: string;
    viewport: {
        width: number;
        height: number;
        devicePixelRatio: number;
    };
    route: BugReportRouteContext;
    user?: BugReportUserContext;
    release?: BugReportReleaseInfo;
    diagnostics?: BugReportDiagnostics;
    appState?: unknown;
    screenshot?: BugReportScreenshot;
    submittedAt: string;
}
export interface BugReportSubmissionResult {
    ticketId: string;
    status?: string;
    githubIssueUrl?: string | null;
    duplicateOfTicketId?: string | null;
}
export interface MyBugSummary {
    id: string;
    app_slug: string;
    summary: string;
    status: string;
    updated_at: string | null;
}
export type BugReportFeedbackVerdict = 'confirmed_fixed' | 'still_broken';
export interface IdentityBugReportSubmitterOptions {
    getAuthToken: () => MaybePromise<string | null | undefined>;
    apiBaseUrl?: string;
    endpointPath?: string;
    fetchImpl?: typeof fetch;
}
export interface AutoCaptureConfig {
    /** Minimum milliseconds between auto-reports for the same error message. Default 30 000. */
    dedupeWindowMs?: number;
    /** Maximum auto-reports allowed per page session. Default 10. */
    maxReportsPerSession?: number;
    /** Milliseconds to wait after an error before submitting, to batch cascading errors. Default 2 000. */
    debounceMs?: number;
}
export interface BugReportConfig {
    appSlug: string;
    enabled?: boolean;
    modalTitle?: string;
    buttonAriaLabel?: string;
    /** Enable automatic bug report submission on uncaught errors. Pass `true` for defaults or a config object. */
    autoCapture?: boolean | AutoCaptureConfig;
    submitReport: (payload: BugReportSubmissionPayload) => Promise<BugReportSubmissionResult>;
    getReporter?: () => MaybePromise<BugReportUserContext | undefined>;
    getStateSnapshot?: () => MaybePromise<unknown>;
    getDiagnostics?: () => MaybePromise<BugReportDiagnostics | undefined>;
    getRelease?: () => MaybePromise<BugReportReleaseInfo | undefined>;
    getRouteContext?: () => MaybePromise<BugReportRouteContext | undefined>;
    getCaptureTarget?: () => HTMLElement | null;
    getMyBugs?: () => Promise<MyBugSummary[]>;
    submitFeedback?: (ticketId: string, verdict: BugReportFeedbackVerdict) => Promise<void>;
}
interface BugReportContextValue {
    config: BugReportConfig;
}
export interface ConsoleLogEntry {
    level: 'error' | 'warn' | 'log';
    message: string;
    args: unknown[];
    timestamp: number;
}
export declare function pushCapturedError(nextError: BugReportDiagnosticError): void;
export declare function installBugReportErrorCapture(): void;
export declare function getRecentBugReportErrors(limit?: number): BugReportDiagnosticError[];
export declare function getRecentConsoleLogs(limit?: number): ConsoleLogEntry[];
export declare function resolveIdentityBugReportApiBase(apiBaseUrl?: string): string;
export declare function createIdentityBugReportSubmitter({ getAuthToken, apiBaseUrl, endpointPath, fetchImpl, }: IdentityBugReportSubmitterOptions): BugReportConfig['submitReport'];
export declare function createIdentityMyBugsFetcher({ getAuthToken, apiBaseUrl, fetchImpl, }: Pick<IdentityBugReportSubmitterOptions, 'getAuthToken' | 'apiBaseUrl' | 'fetchImpl'>): BugReportConfig['getMyBugs'];
export declare function createIdentityFeedbackSubmitter({ getAuthToken, apiBaseUrl, fetchImpl, }: Pick<IdentityBugReportSubmitterOptions, 'getAuthToken' | 'apiBaseUrl' | 'fetchImpl'>): BugReportConfig['submitFeedback'];
interface BugReportErrorBoundaryProps {
    config: BugReportConfig;
    fallback?: React.ReactNode;
    children: React.ReactNode;
}
interface BugReportErrorBoundaryState {
    error: Error | null;
    reported: boolean;
}
export declare class BugReportErrorBoundary extends React.Component<BugReportErrorBoundaryProps, BugReportErrorBoundaryState> {
    state: BugReportErrorBoundaryState;
    static getDerivedStateFromError(error: Error): Partial<BugReportErrorBoundaryState>;
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void;
    private submitCrashReport;
    render(): React.ReactNode;
}
export declare function BugReportProvider({ config, children, }: {
    config: BugReportConfig | null | undefined;
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useBugReport(): BugReportContextValue | null;
export declare function BugReportWidget(): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=bugReport.d.ts.map