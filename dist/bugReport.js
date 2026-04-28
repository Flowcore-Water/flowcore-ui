import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { useTheme } from './ThemeContext';
const BugReportContext = createContext(null);
const SENSITIVE_KEY_PATTERN = /(authorization|password|secret|token|cookie|api[-_]?key|session|credential)/i;
const MAX_SERIALIZE_DEPTH = 6;
const MAX_ARRAY_ITEMS = 100;
const MAX_OBJECT_KEYS = 100;
const MAX_STRING_LENGTH = 4000;
const DEFAULT_IDENTITY_API_BASE = 'https://us-central1-flowcore-st-mirror.cloudfunctions.net/identity';
const DEFAULT_BUG_ENDPOINT_PATH = '/api/bugs/intake';
const MAX_CAPTURED_ERRORS = 20;
const AUTOMATIC_CAPTURE_TIMEOUT_MS = 8000;
const MANUAL_CAPTURE_READY_TIMEOUT_MS = 5000;
const AUTOMATIC_CAPTURE_WEBKIT_MESSAGE = 'Automatic page capture is unreliable in Safari/WebKit. Use Capture Browser Manually.';
const recentCapturedErrors = [];
let errorCaptureInstalled = false;
const MAX_CAPTURED_CONSOLE_LOGS = 50;
const recentConsoleLogs = [];
let consoleCaptureInstalled = false;
function BugReportFabIcon() {
    return (_jsxs("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", focusable: "false", children: [_jsx("path", { d: "M9 7 7 5" }), _jsx("path", { d: "M15 7 17 5" }), _jsx("path", { d: "M8 10H5" }), _jsx("path", { d: "M19 10h-3" }), _jsx("path", { d: "M8 14H5" }), _jsx("path", { d: "M19 14h-3" }), _jsx("path", { d: "M9 18 7 20" }), _jsx("path", { d: "M15 18 17 20" }), _jsx("path", { d: "M12 7V4" }), _jsx("path", { d: "M12 12v2" }), _jsx("path", { d: "M12 7a4 4 0 0 0-4 4v3a4 4 0 1 0 8 0v-3a4 4 0 0 0-4-4Z" })] }));
}
function truncateString(value) {
    if (value.length <= MAX_STRING_LENGTH)
        return value;
    return `${value.slice(0, MAX_STRING_LENGTH)}…[truncated]`;
}
export function pushCapturedError(nextError) {
    recentCapturedErrors.unshift(nextError);
    if (recentCapturedErrors.length > MAX_CAPTURED_ERRORS) {
        recentCapturedErrors.length = MAX_CAPTURED_ERRORS;
    }
}
function normalizeCapturedError(error) {
    if (error instanceof Error) {
        return {
            message: error.message,
            stack: error.stack ?? null,
            timestamp: Date.now(),
        };
    }
    return {
        message: typeof error === 'string' ? error : 'Unknown uncaught error',
        stack: null,
        timestamp: Date.now(),
    };
}
function sanitizeValue(value, depth = 0, seen = new WeakSet()) {
    if (value == null)
        return value;
    if (typeof value === 'string')
        return truncateString(value);
    if (typeof value === 'number' || typeof value === 'boolean')
        return value;
    if (typeof value === 'bigint')
        return Number(value);
    if (typeof value === 'function')
        return '[Function]';
    if (value instanceof Date)
        return value.toISOString();
    if (value instanceof Error) {
        return {
            message: value.message,
            stack: value.stack ?? null,
            name: value.name,
        };
    }
    if (depth >= MAX_SERIALIZE_DEPTH)
        return '[MaxDepthExceeded]';
    if (Array.isArray(value)) {
        return value.slice(0, MAX_ARRAY_ITEMS).map((item) => sanitizeValue(item, depth + 1, seen));
    }
    if (typeof value === 'object') {
        if (seen.has(value))
            return '[Circular]';
        seen.add(value);
        const entries = Object.entries(value).slice(0, MAX_OBJECT_KEYS);
        const output = {};
        for (const [key, nestedValue] of entries) {
            output[key] = SENSITIVE_KEY_PATTERN.test(key)
                ? '[REDACTED]'
                : sanitizeValue(nestedValue, depth + 1, seen);
        }
        return output;
    }
    return String(value);
}
function readDefaultRouteContext() {
    const params = new URLSearchParams(window.location.search);
    return {
        path: window.location.pathname,
        queryParams: Object.fromEntries(params.entries()),
        hash: window.location.hash || null,
    };
}
function getErrorMessage(error, fallback) {
    return error instanceof Error && error.message ? error.message : fallback;
}
function shouldSkipAutomaticCapture() {
    if (typeof navigator === 'undefined')
        return false;
    const ua = navigator.userAgent;
    const isSafari = /\bSafari\//.test(ua) && !/\b(Chrome|Chromium|CriOS|Edg|EdgiOS|OPR|OPiOS|Firefox|FxiOS)\b/.test(ua);
    const isIosWebKit = /\b(iPad|iPhone|iPod)\b/i.test(ua);
    return isSafari || isIosWebKit;
}
function mountHiddenCaptureVideo(video) {
    video.setAttribute('autoplay', '');
    video.setAttribute('muted', '');
    video.style.position = 'fixed';
    video.style.opacity = '0';
    video.style.pointerEvents = 'none';
    video.style.width = '1px';
    video.style.height = '1px';
    video.style.left = '-9999px';
    video.style.top = '0';
    document.body.appendChild(video);
    return () => {
        video.remove();
    };
}
async function withTimeout(promise, timeoutMs, message) {
    let timeoutId = 0;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = window.setTimeout(() => reject(new Error(message)), timeoutMs);
    });
    try {
        return await Promise.race([promise, timeoutPromise]);
    }
    finally {
        window.clearTimeout(timeoutId);
    }
}
async function waitForVideoDimensions(video) {
    if (video.videoWidth > 0 && video.videoHeight > 0) {
        return;
    }
    await new Promise((resolve, reject) => {
        const onReady = () => {
            if (video.videoWidth > 0 && video.videoHeight > 0) {
                cleanup();
                resolve();
            }
        };
        const onTimeout = () => {
            cleanup();
            reject(new Error('Manual browser capture did not produce a video frame.'));
        };
        const cleanup = () => {
            window.clearTimeout(timeoutId);
            video.removeEventListener('loadedmetadata', onReady);
            video.removeEventListener('resize', onReady);
            video.removeEventListener('playing', onReady);
        };
        const timeoutId = window.setTimeout(onTimeout, MANUAL_CAPTURE_READY_TIMEOUT_MS);
        video.addEventListener('loadedmetadata', onReady);
        video.addEventListener('resize', onReady);
        video.addEventListener('playing', onReady);
    });
}
async function waitForRenderedVideoFrame(video) {
    const requestFrame = video.requestVideoFrameCallback?.bind(video);
    if (!requestFrame) {
        await waitForVideoDimensions(video);
        return;
    }
    await withTimeout(new Promise((resolve) => {
        requestFrame(() => resolve());
    }), MANUAL_CAPTURE_READY_TIMEOUT_MS, 'Manual browser capture did not render a video frame.');
}
export function installBugReportErrorCapture() {
    if (errorCaptureInstalled || typeof window === 'undefined')
        return;
    window.addEventListener('error', (event) => {
        pushCapturedError({
            message: event.message || event.error?.message || 'Unhandled window error',
            stack: event.error?.stack ?? null,
            timestamp: Date.now(),
        });
    });
    window.addEventListener('unhandledrejection', (event) => {
        pushCapturedError(normalizeCapturedError(event.reason));
    });
    installConsoleCapture();
    errorCaptureInstalled = true;
}
export function getRecentBugReportErrors(limit = 10) {
    return recentCapturedErrors.slice(0, Math.max(limit, 0));
}
function installConsoleCapture() {
    if (consoleCaptureInstalled || typeof window === 'undefined')
        return;
    const levels = ['error', 'warn', 'log'];
    for (const level of levels) {
        const original = console[level];
        console[level] = (...args) => {
            original.apply(console, args);
            const message = args
                .map((a) => (typeof a === 'string' ? a : JSON.stringify(a)))
                .join(' ');
            recentConsoleLogs.unshift({
                level,
                message: message.slice(0, MAX_STRING_LENGTH),
                args: args.slice(0, 5).map((a) => sanitizeValue(a)),
                timestamp: Date.now(),
            });
            if (recentConsoleLogs.length > MAX_CAPTURED_CONSOLE_LOGS) {
                recentConsoleLogs.length = MAX_CAPTURED_CONSOLE_LOGS;
            }
        };
    }
    consoleCaptureInstalled = true;
}
export function getRecentConsoleLogs(limit = 50) {
    return recentConsoleLogs.slice(0, Math.max(limit, 0));
}
export function resolveIdentityBugReportApiBase(apiBaseUrl) {
    return (apiBaseUrl && apiBaseUrl.trim() ? apiBaseUrl : DEFAULT_IDENTITY_API_BASE).replace(/\/$/, '');
}
export function createIdentityBugReportSubmitter({ getAuthToken, apiBaseUrl, endpointPath = DEFAULT_BUG_ENDPOINT_PATH, fetchImpl = fetch, }) {
    const baseUrl = resolveIdentityBugReportApiBase(apiBaseUrl);
    const normalizedPath = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;
    return async (payload) => {
        const token = await getAuthToken();
        if (!token) {
            throw new Error('Not authenticated');
        }
        const response = await fetchImpl(`${baseUrl}${normalizedPath}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || `Bug report intake failed (${response.status})`);
        }
        const data = await response.json();
        const ticketId = String(data.id ?? '').trim();
        if (!ticketId) {
            throw new Error('Bug report intake did not return a ticket id');
        }
        return {
            ticketId,
            status: data.status,
            duplicateOfTicketId: data.duplicate_of_ticket_id ?? null,
            githubIssueUrl: data.github?.issue_url ?? null,
        };
    };
}
export function createIdentityMyBugsFetcher({ getAuthToken, apiBaseUrl, fetchImpl = fetch, }) {
    const baseUrl = resolveIdentityBugReportApiBase(apiBaseUrl);
    return async () => {
        const token = await getAuthToken();
        if (!token)
            return [];
        const response = await (fetchImpl ?? fetch)(`${baseUrl}/api/bugs/my-bugs`, {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        });
        if (!response.ok)
            return [];
        const data = await response.json();
        return data.items ?? [];
    };
}
export function createIdentityFeedbackSubmitter({ getAuthToken, apiBaseUrl, fetchImpl = fetch, }) {
    const baseUrl = resolveIdentityBugReportApiBase(apiBaseUrl);
    return async (ticketId, verdict) => {
        const token = await getAuthToken();
        if (!token)
            throw new Error('Not authenticated');
        const response = await (fetchImpl ?? fetch)(`${baseUrl}/api/bugs/${ticketId}/feedback`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ verdict }),
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || `Feedback submission failed (${response.status})`);
        }
    };
}
async function captureAutomaticScreenshot(target) {
    const captureTarget = target ?? document.body;
    const canvas = await withTimeout(html2canvas(captureTarget, {
        backgroundColor: null,
        useCORS: true,
        logging: false,
        scale: Math.min(window.devicePixelRatio || 1, 2),
    }), AUTOMATIC_CAPTURE_TIMEOUT_MS, 'Automatic page capture timed out. You can capture the browser manually.');
    return {
        dataUrl: canvas.toDataURL('image/png'),
        source: 'automatic',
        width: canvas.width,
        height: canvas.height,
        capturedAt: new Date().toISOString(),
    };
}
async function captureManualScreenshot() {
    if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error('Manual screen capture is not available in this browser.');
    }
    const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
    });
    try {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.playsInline = true;
        video.muted = true;
        const unmountVideo = mountHiddenCaptureVideo(video);
        try {
            await video.play();
            await waitForVideoDimensions(video);
            await waitForRenderedVideoFrame(video);
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (!context) {
                throw new Error('Unable to capture screenshot context.');
            }
            context.drawImage(video, 0, 0);
            return {
                dataUrl: canvas.toDataURL('image/png'),
                source: 'manual',
                width: canvas.width,
                height: canvas.height,
                capturedAt: new Date().toISOString(),
            };
        }
        finally {
            video.pause();
            video.srcObject = null;
            unmountVideo();
        }
    }
    finally {
        stream.getTracks().forEach((track) => track.stop());
    }
}
const AUTO_CAPTURE_DEFAULTS = {
    dedupeWindowMs: 30000,
    maxReportsPerSession: 10,
    debounceMs: 2000,
};
const AUTO_REPORT_TOAST_DURATION_MS = 4000;
let autoReportToastCounter = 0;
function AutoBugReporter({ config }) {
    const opts = useMemo(() => {
        if (!config.autoCapture || config.autoCapture === true)
            return AUTO_CAPTURE_DEFAULTS;
        return { ...AUTO_CAPTURE_DEFAULTS, ...config.autoCapture };
    }, [config.autoCapture]);
    const reportsThisSession = useRef(0);
    const recentMessageTimestamps = useRef(new Map());
    const debounceTimer = useRef(0);
    const pendingErrors = useRef([]);
    const [toasts, setToasts] = useState([]);
    const { t } = useTheme();
    const submitAutoReport = useCallback(async (errors) => {
        if (reportsThisSession.current >= opts.maxReportsPerSession)
            return;
        if (errors.length === 0)
            return;
        const now = Date.now();
        const deduped = errors.filter((err) => {
            const key = err.message;
            const lastSeen = recentMessageTimestamps.current.get(key);
            if (lastSeen && now - lastSeen < opts.dedupeWindowMs)
                return false;
            recentMessageTimestamps.current.set(key, now);
            return true;
        });
        if (deduped.length === 0)
            return;
        reportsThisSession.current += 1;
        const summary = deduped.length === 1
            ? `[Auto] ${deduped[0].message.slice(0, 200)}`
            : `[Auto] ${deduped.length} errors: ${deduped[0].message.slice(0, 150)}`;
        const comments = deduped
            .map((e, i) => `Error ${i + 1}: ${e.message}${e.stack ? `\n${e.stack}` : ''}`)
            .join('\n\n---\n\n');
        try {
            const [reporter, diagnostics, release, routeContext] = await Promise.all([
                config.getReporter?.(),
                config.getDiagnostics?.(),
                config.getRelease?.(),
                config.getRouteContext?.(),
            ]);
            const mergedDiagnostics = {
                ...diagnostics,
                recentErrors: deduped,
                consoleLogs: getRecentConsoleLogs(),
            };
            const payload = {
                appSlug: config.appSlug,
                summary,
                comments,
                url: window.location.href,
                userAgent: navigator.userAgent,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    devicePixelRatio: window.devicePixelRatio || 1,
                },
                route: sanitizeValue(routeContext ?? readDefaultRouteContext()),
                user: sanitizeValue(reporter),
                release: sanitizeValue(release),
                diagnostics: sanitizeValue(mergedDiagnostics),
                submittedAt: new Date().toISOString(),
            };
            const result = await config.submitReport(payload);
            const toastId = ++autoReportToastCounter;
            setToasts((prev) => [...prev, {
                    id: toastId,
                    ticketId: result.ticketId,
                    summary: deduped[0].message.slice(0, 120),
                    githubIssueUrl: result.githubIssueUrl,
                }]);
            setTimeout(() => {
                setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
            }, AUTO_REPORT_TOAST_DURATION_MS);
        }
        catch {
            // Auto-report submission failed silently — don't cascade errors
        }
    }, [config, opts]);
    const scheduleSubmission = useCallback((error) => {
        pendingErrors.current.push(error);
        window.clearTimeout(debounceTimer.current);
        debounceTimer.current = window.setTimeout(() => {
            const batch = pendingErrors.current.splice(0);
            void submitAutoReport(batch);
        }, opts.debounceMs);
    }, [opts.debounceMs, submitAutoReport]);
    useEffect(() => {
        function handleError(event) {
            scheduleSubmission({
                message: event.message || event.error?.message || 'Unhandled error',
                stack: event.error?.stack ?? null,
                timestamp: Date.now(),
            });
        }
        function handleRejection(event) {
            scheduleSubmission(normalizeCapturedError(event.reason));
        }
        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleRejection);
        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleRejection);
            window.clearTimeout(debounceTimer.current);
        };
    }, [scheduleSubmission]);
    if (toasts.length === 0)
        return null;
    return (_jsx("div", { style: {
            position: 'fixed',
            right: 20,
            top: 20,
            zIndex: 45002,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            maxWidth: 360,
        }, children: toasts.map((toast) => (_jsxs("div", { role: "status", style: {
                borderRadius: 12,
                border: `1px solid ${t.failBorder}`,
                background: t.cardBg,
                padding: '12px 16px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }, children: [_jsx("span", { style: { color: t.fail, fontSize: 12, fontWeight: 700 }, children: "Bug auto-reported" }), _jsxs("span", { style: { color: t.textMuted, fontSize: 11 }, children: ["#", toast.ticketId] })] }), _jsx("div", { style: { color: t.textSecondary, fontSize: 12, lineHeight: 1.4, wordBreak: 'break-word' }, children: toast.summary })] }, toast.id))) }));
}
export class BugReportErrorBoundary extends React.Component {
    constructor() {
        super(...arguments);
        this.state = { error: null, reported: false };
    }
    static getDerivedStateFromError(error) {
        return { error };
    }
    componentDidCatch(error, errorInfo) {
        if (this.state.reported)
            return;
        this.setState({ reported: true });
        const { config } = this.props;
        void this.submitCrashReport(error, errorInfo, config);
    }
    async submitCrashReport(error, errorInfo, config) {
        try {
            const [reporter, diagnostics, release, routeContext] = await Promise.all([
                config.getReporter?.(),
                config.getDiagnostics?.(),
                config.getRelease?.(),
                config.getRouteContext?.(),
            ]);
            const mergedDiagnostics = {
                ...diagnostics,
                recentErrors: [{
                        message: error.message,
                        stack: error.stack ?? null,
                        timestamp: Date.now(),
                    }],
                consoleLogs: getRecentConsoleLogs(),
                extra: {
                    ...(diagnostics?.extra ?? {}),
                    componentStack: errorInfo.componentStack ?? null,
                },
            };
            const payload = {
                appSlug: config.appSlug,
                summary: `[Crash] ${error.message.slice(0, 200)}`,
                comments: `React render crash.\n\n${error.stack ?? error.message}\n\nComponent stack:\n${errorInfo.componentStack ?? 'N/A'}`,
                url: window.location.href,
                userAgent: navigator.userAgent,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    devicePixelRatio: window.devicePixelRatio || 1,
                },
                route: sanitizeValue(routeContext ?? readDefaultRouteContext()),
                user: sanitizeValue(reporter),
                release: sanitizeValue(release),
                diagnostics: sanitizeValue(mergedDiagnostics),
                submittedAt: new Date().toISOString(),
            };
            await config.submitReport(payload);
        }
        catch {
            // Crash report submission failed — nothing we can do
        }
    }
    render() {
        if (this.state.error) {
            return this.props.fallback ?? (_jsx("div", { style: { padding: '2rem', textAlign: 'center', color: '#ef4444' }, children: "Something went wrong. A bug report has been submitted automatically. Please refresh the page." }));
        }
        return this.props.children;
    }
}
export function BugReportProvider({ config, children, }) {
    const value = useMemo(() => {
        if (!config || config.enabled === false)
            return null;
        return { config };
    }, [config]);
    const autoCaptureEnabled = !!(config && config.enabled !== false && config.autoCapture);
    return (_jsxs(BugReportContext.Provider, { value: value, children: [autoCaptureEnabled && _jsx(AutoBugReporter, { config: config }), children] }));
}
export function useBugReport() {
    return useContext(BugReportContext);
}
export function BugReportWidget() {
    const bugReport = useBugReport();
    const { t } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [isScreenshotExpanded, setIsScreenshotExpanded] = useState(false);
    const [captureAttempt, setCaptureAttempt] = useState(0);
    const [summary, setSummary] = useState('');
    const [comments, setComments] = useState('');
    const [screenshot, setScreenshot] = useState(null);
    const [captureError, setCaptureError] = useState(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('report');
    const [myBugs, setMyBugs] = useState([]);
    const [myBugsLoading, setMyBugsLoading] = useState(false);
    const [feedbackPending, setFeedbackPending] = useState(null);
    const [relatedToTicketId, setRelatedToTicketId] = useState(null);
    const pendingFeedbackCount = myBugs.filter((b) => b.status === 'resolved').length;
    const config = bugReport?.config;
    const skipAutomaticCapture = shouldSkipAutomaticCapture();
    const showAutomaticRetry = !skipAutomaticCapture;
    useEffect(() => {
        if (!isOpen || !config || screenshot || isCapturing)
            return;
        if (skipAutomaticCapture) {
            setCaptureError(AUTOMATIC_CAPTURE_WEBKIT_MESSAGE);
            return;
        }
        let cancelled = false;
        setIsCapturing(true);
        setCaptureError(null);
        void captureAutomaticScreenshot(config.getCaptureTarget?.() ?? null)
            .then((nextScreenshot) => {
            if (!cancelled)
                setScreenshot(nextScreenshot);
        })
            .catch((error) => {
            if (!cancelled) {
                setCaptureError(getErrorMessage(error, 'Automatic page capture failed. You can capture the browser manually.'));
            }
        })
            .finally(() => {
            if (!cancelled)
                setIsCapturing(false);
        });
        return () => {
            cancelled = true;
        };
    }, [captureAttempt, config, isCapturing, isOpen, screenshot, skipAutomaticCapture]);
    useEffect(() => {
        if (!isOpen || !config?.getMyBugs)
            return;
        let cancelled = false;
        setMyBugsLoading(true);
        void config.getMyBugs()
            .then((bugs) => { if (!cancelled)
            setMyBugs(bugs); })
            .catch(() => { if (!cancelled)
            setMyBugs([]); })
            .finally(() => { if (!cancelled)
            setMyBugsLoading(false); });
        return () => { cancelled = true; };
    }, [isOpen, config]);
    if (!config)
        return null;
    async function handleManualCapture() {
        setIsScreenshotExpanded(false);
        setIsCapturing(true);
        setCaptureError(null);
        // Hide the modal so it doesn't appear in the screenshot
        setIsOpen(false);
        try {
            const captured = await captureManualScreenshot();
            setScreenshot(captured);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Manual browser capture failed.';
            setCaptureError(message);
        }
        finally {
            setIsCapturing(false);
            setIsOpen(true);
        }
    }
    function resetForm() {
        setSummary('');
        setComments('');
        setScreenshot(null);
        setIsScreenshotExpanded(false);
        setCaptureError(null);
        setSubmitError(null);
        setResult(null);
        setIsCapturing(false);
        setIsSubmitting(false);
        setActiveTab('report');
        setRelatedToTicketId(null);
        setFeedbackPending(null);
    }
    async function handleSubmit(event) {
        event.preventDefault();
        if (!config)
            return;
        const trimmedSummary = summary.trim();
        if (!trimmedSummary) {
            setSubmitError('A short summary is required.');
            return;
        }
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            const activeConfig = config;
            const [reporter, stateSnapshot, diagnostics, release, routeContext] = await Promise.all([
                activeConfig.getReporter?.(),
                activeConfig.getStateSnapshot?.(),
                activeConfig.getDiagnostics?.(),
                activeConfig.getRelease?.(),
                activeConfig.getRouteContext?.(),
            ]);
            const mergedDiagnostics = {
                ...diagnostics,
                consoleLogs: getRecentConsoleLogs(),
            };
            const submission = {
                appSlug: activeConfig.appSlug,
                summary: trimmedSummary,
                comments: comments.trim(),
                url: window.location.href,
                userAgent: navigator.userAgent,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    devicePixelRatio: window.devicePixelRatio || 1,
                },
                route: sanitizeValue(routeContext ?? readDefaultRouteContext()),
                user: sanitizeValue(reporter),
                release: sanitizeValue(release),
                diagnostics: sanitizeValue(mergedDiagnostics),
                appState: sanitizeValue(stateSnapshot),
                screenshot: screenshot ?? undefined,
                submittedAt: new Date().toISOString(),
            };
            if (relatedToTicketId) {
                submission.relatedToTicketId = relatedToTicketId;
            }
            const nextResult = await activeConfig.submitReport(submission);
            setResult(nextResult);
            setTimeout(() => {
                setIsOpen(false);
                resetForm();
            }, 2200);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to submit the bug report.';
            setSubmitError(message);
        }
        finally {
            setIsSubmitting(false);
        }
    }
    async function handleFeedback(ticketId, verdict) {
        if (!config?.submitFeedback)
            return;
        setFeedbackPending(ticketId);
        try {
            await config.submitFeedback(ticketId, verdict);
            setMyBugs((prev) => prev.map((b) => b.id === ticketId
                ? { ...b, status: verdict === 'confirmed_fixed' ? 'closed' : 'triaged' }
                : b));
        }
        catch {
            // Silently fail for now — the badge will refresh next open
        }
        finally {
            setFeedbackPending(null);
        }
    }
    function handleNewProblem(ticketId) {
        setRelatedToTicketId(ticketId);
        setActiveTab('report');
    }
    return (_jsxs(_Fragment, { children: [_jsxs("button", { type: "button", onClick: () => {
                    if (result)
                        resetForm();
                    setCaptureAttempt((value) => value + 1);
                    setIsOpen(true);
                }, "aria-label": config.buttonAriaLabel ?? 'Report a bug', title: config.buttonAriaLabel ?? 'Report a bug', style: {
                    position: 'fixed',
                    right: 20,
                    bottom: 20,
                    zIndex: 45000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 52,
                    height: 52,
                    padding: 0,
                    borderRadius: 9999,
                    border: `1px solid ${t.border}`,
                    background: t.accent,
                    color: t.pageBg,
                    lineHeight: 0,
                    cursor: 'pointer',
                    boxShadow: '0 18px 38px rgba(0, 0, 0, 0.38)',
                }, children: [_jsx(BugReportFabIcon, {}), pendingFeedbackCount > 0 && (_jsx("span", { style: {
                            position: 'absolute',
                            top: -4,
                            right: -4,
                            minWidth: 20,
                            height: 20,
                            borderRadius: 9999,
                            background: t.fail,
                            color: '#fff',
                            fontSize: 11,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0 5px',
                            lineHeight: 1,
                        }, children: pendingFeedbackCount }))] }), result && (_jsxs("div", { role: "status", style: {
                    position: 'fixed',
                    right: 20,
                    bottom: 84,
                    zIndex: 45001,
                    width: 320,
                    borderRadius: 14,
                    border: `1px solid ${t.successBorder}`,
                    background: t.cardBg,
                    padding: 16,
                    boxShadow: '0 18px 38px rgba(0, 0, 0, 0.38)',
                }, children: [_jsx("div", { style: { color: t.success, fontWeight: 700, marginBottom: 6 }, children: "Bug report submitted" }), _jsxs("div", { style: { color: t.textSecondary, fontSize: 13 }, children: ["Ticket `", result.ticketId, "` created", result.duplicateOfTicketId ? ` and linked to ${result.duplicateOfTicketId}` : '', "."] }), result.githubIssueUrl && (_jsx("a", { href: result.githubIssueUrl, target: "_blank", rel: "noreferrer", style: { color: t.accent, fontSize: 13, display: 'inline-block', marginTop: 8 }, children: "Open linked GitHub issue" }))] })), isScreenshotExpanded && screenshot && (_jsx("div", { role: "dialog", "aria-modal": "true", "aria-label": "Expanded bug report screenshot", onClick: () => setIsScreenshotExpanded(false), style: {
                    position: 'fixed',
                    inset: 0,
                    zIndex: 47000,
                    background: 'rgba(4, 10, 18, 0.84)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 24,
                }, children: _jsxs("div", { onClick: (event) => event.stopPropagation(), style: {
                        maxWidth: '96vw',
                        maxHeight: '92vh',
                        display: 'grid',
                        gap: 12,
                        justifyItems: 'center',
                    }, children: [_jsx("button", { type: "button", onClick: () => setIsScreenshotExpanded(false), style: {
                                justifySelf: 'end',
                                borderRadius: 9999,
                                border: `1px solid ${t.border}`,
                                background: t.cardBg,
                                color: t.textPrimary,
                                padding: '8px 12px',
                                cursor: 'pointer',
                            }, children: "Close Preview" }), _jsx("img", { src: screenshot.dataUrl, alt: "Expanded bug report screenshot", style: {
                                display: 'block',
                                maxWidth: '96vw',
                                maxHeight: '82vh',
                                width: 'auto',
                                height: 'auto',
                                borderRadius: 16,
                                border: `1px solid ${t.border}`,
                                background: t.pageBg,
                                boxShadow: '0 28px 48px rgba(0, 0, 0, 0.45)',
                            } }), _jsxs("div", { style: { color: t.textMuted, fontSize: 12 }, children: [screenshot.width, "\u00D7", screenshot.height, " \u00B7 ", screenshot.source === 'manual' ? 'Browser window capture' : 'Page snapshot'] })] }) })), isOpen && (_jsx("div", { onClick: () => setIsOpen(false), style: {
                    position: 'fixed',
                    inset: 0,
                    zIndex: 46000,
                    background: 'rgba(5, 10, 18, 0.74)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                    padding: 20,
                }, children: _jsxs("div", { onClick: (event) => event.stopPropagation(), style: {
                        width: 420,
                        maxWidth: '100%',
                        maxHeight: '85vh',
                        overflowY: 'auto',
                        borderRadius: 18,
                        border: `1px solid ${t.border}`,
                        background: t.cardBg,
                        boxShadow: '0 28px 48px rgba(0, 0, 0, 0.45)',
                    }, children: [_jsxs("div", { style: {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '16px 18px',
                                borderBottom: `1px solid ${t.border}`,
                            }, children: [_jsxs("div", { children: [_jsx("div", { style: { color: t.textPrimary, fontWeight: 700 }, children: config.modalTitle ?? 'Report a bug' }), _jsx("div", { style: { color: t.textMuted, fontSize: 12 }, children: "Captures the page, app state, and your comments for triage." })] }), _jsx("button", { type: "button", onClick: () => setIsOpen(false), style: {
                                        border: 'none',
                                        background: 'transparent',
                                        color: t.textSecondary,
                                        cursor: 'pointer',
                                        fontSize: 22,
                                        lineHeight: 1,
                                    }, children: "\u00D7" })] }), _jsx("div", { style: {
                                display: 'flex',
                                borderBottom: `1px solid ${t.border}`,
                            }, children: ['report', 'my-bugs'].map((tab) => (_jsxs("button", { type: "button", onClick: () => setActiveTab(tab), style: {
                                    flex: 1,
                                    padding: '10px 0',
                                    border: 'none',
                                    borderBottom: activeTab === tab ? `2px solid ${t.accent}` : '2px solid transparent',
                                    background: 'transparent',
                                    color: activeTab === tab ? t.textPrimary : t.textMuted,
                                    fontWeight: activeTab === tab ? 700 : 400,
                                    cursor: 'pointer',
                                    fontSize: 13,
                                    position: 'relative',
                                }, children: [tab === 'report' ? 'Report' : 'My Bugs', tab === 'my-bugs' && pendingFeedbackCount > 0 && (_jsx("span", { style: {
                                            marginLeft: 6,
                                            minWidth: 18,
                                            height: 18,
                                            borderRadius: 9999,
                                            background: t.fail,
                                            color: '#fff',
                                            fontSize: 10,
                                            fontWeight: 700,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '0 4px',
                                        }, children: pendingFeedbackCount }))] }, tab))) }), activeTab === 'report' && (_jsxs("form", { onSubmit: (event) => void handleSubmit(event), style: { padding: 18 }, children: [relatedToTicketId && (_jsxs("div", { style: {
                                        marginBottom: 14,
                                        padding: '8px 12px',
                                        borderRadius: 8,
                                        background: t.inputBg,
                                        border: `1px solid ${t.border}`,
                                        color: t.textSecondary,
                                        fontSize: 12,
                                    }, children: ["Follow-up to ticket ", relatedToTicketId] })), _jsx("label", { style: { display: 'block', color: t.textSecondary, fontSize: 12, marginBottom: 6 }, children: "Summary" }), _jsx("input", { value: summary, onChange: (event) => setSummary(event.target.value), placeholder: "Short description of the problem", disabled: isSubmitting, style: {
                                        width: '100%',
                                        borderRadius: 10,
                                        border: `1px solid ${t.inputBorder}`,
                                        background: t.inputBg,
                                        color: t.textPrimary,
                                        padding: '10px 12px',
                                        marginBottom: 14,
                                    } }), _jsx("label", { style: { display: 'block', color: t.textSecondary, fontSize: 12, marginBottom: 6 }, children: "What did you see?" }), _jsx("textarea", { value: comments, onChange: (event) => setComments(event.target.value), placeholder: "What happened, what you expected, and any steps that led to it", disabled: isSubmitting, rows: 5, style: {
                                        width: '100%',
                                        borderRadius: 10,
                                        border: `1px solid ${t.inputBorder}`,
                                        background: t.inputBg,
                                        color: t.textPrimary,
                                        padding: '10px 12px',
                                        resize: 'vertical',
                                    } }), _jsxs("div", { style: { marginTop: 18 }, children: [_jsx("div", { style: { color: t.textSecondary, fontSize: 12, marginBottom: 8 }, children: "Page capture" }), screenshot ? (_jsx("button", { type: "button", onClick: () => setIsScreenshotExpanded(true), style: {
                                                display: 'block',
                                                width: '100%',
                                                padding: 0,
                                                border: 'none',
                                                background: 'transparent',
                                                cursor: 'zoom-in',
                                            }, title: "Expand screenshot", "aria-label": "Expand screenshot preview", children: _jsx("img", { src: screenshot.dataUrl, alt: "Bug report screenshot", style: {
                                                    width: '100%',
                                                    maxHeight: 180,
                                                    objectFit: 'cover',
                                                    borderRadius: 12,
                                                    border: `1px solid ${t.border}`,
                                                    background: t.pageBg,
                                                } }) })) : (_jsx("div", { style: {
                                                borderRadius: 12,
                                                border: `1px dashed ${t.borderSubtle}`,
                                                background: t.inputBg,
                                                padding: 14,
                                                color: t.textMuted,
                                                fontSize: 13,
                                            }, children: isCapturing ? 'Capturing the current page…' : 'No screenshot captured yet.' })), screenshot && (_jsx("div", { style: { color: t.textMuted, fontSize: 12, marginTop: 8 }, children: "Click the screenshot to inspect it full size." })), captureError && (_jsx("div", { style: { color: t.fail, fontSize: 12, marginTop: 8 }, children: captureError })), _jsx("div", { style: { color: t.textMuted, fontSize: 12, marginTop: 8 }, children: showAutomaticRetry
                                                ? 'Page snapshot reads the app DOM. Browser window capture uses the browser share picker for an exact tab or window image.'
                                                : 'Safari uses browser window capture here because automatic page snapshotting is unreliable in WebKit.' }), _jsxs("div", { style: { display: 'flex', gap: 10, marginTop: 10 }, children: [_jsx("button", { type: "button", disabled: isCapturing || isSubmitting, onClick: () => void handleManualCapture(), style: {
                                                        borderRadius: 8,
                                                        border: `1px solid ${t.buttonBorder}`,
                                                        padding: '8px 12px',
                                                        background: t.buttonBg,
                                                        color: t.buttonText,
                                                        cursor: isCapturing || isSubmitting ? 'default' : 'pointer',
                                                    }, children: "Capture Browser Window" }), showAutomaticRetry && (_jsx("button", { type: "button", disabled: isCapturing || isSubmitting, onClick: () => {
                                                        setScreenshot(null);
                                                        setIsScreenshotExpanded(false);
                                                        setCaptureError(null);
                                                        setCaptureAttempt((value) => value + 1);
                                                    }, style: {
                                                        borderRadius: 8,
                                                        border: `1px solid ${t.buttonBorder}`,
                                                        padding: '8px 12px',
                                                        background: 'transparent',
                                                        color: t.textSecondary,
                                                        cursor: isCapturing || isSubmitting ? 'default' : 'pointer',
                                                    }, children: "Retry Page Snapshot" }))] })] }), submitError && (_jsx("div", { style: {
                                        marginTop: 14,
                                        borderRadius: 10,
                                        border: `1px solid ${t.failBorder}`,
                                        background: t.failBg,
                                        color: t.fail,
                                        padding: '10px 12px',
                                        fontSize: 13,
                                    }, children: submitError })), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 18 }, children: [_jsx("button", { type: "button", disabled: isSubmitting, onClick: () => setIsOpen(false), style: {
                                                borderRadius: 8,
                                                border: `1px solid ${t.buttonBorder}`,
                                                padding: '10px 14px',
                                                background: 'transparent',
                                                color: t.textSecondary,
                                                cursor: isSubmitting ? 'default' : 'pointer',
                                            }, children: "Cancel" }), _jsx("button", { type: "submit", disabled: isSubmitting, style: {
                                                borderRadius: 8,
                                                border: `1px solid ${t.accent}`,
                                                padding: '10px 14px',
                                                background: t.accent,
                                                color: t.pageBg,
                                                fontWeight: 700,
                                                cursor: isSubmitting ? 'default' : 'pointer',
                                            }, children: isSubmitting ? 'Submitting…' : 'Submit Bug Report' })] })] })), activeTab === 'my-bugs' && (_jsx("div", { style: { padding: 18 }, children: myBugsLoading ? (_jsx("div", { style: { color: t.textMuted, fontSize: 13, textAlign: 'center', padding: 24 }, children: "Loading your bugs..." })) : myBugs.length === 0 ? (_jsx("div", { style: { color: t.textMuted, fontSize: 13, textAlign: 'center', padding: 24 }, children: "No bug reports found." })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 12 }, children: myBugs.map((bug) => (_jsxs("div", { style: {
                                        borderRadius: 10,
                                        border: `1px solid ${bug.status === 'resolved' ? t.accent : t.border}`,
                                        padding: 12,
                                        background: bug.status === 'resolved' ? `${t.accent}11` : 'transparent',
                                    }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }, children: [_jsx("div", { style: { color: t.textPrimary, fontSize: 13, fontWeight: 600, flex: 1 }, children: bug.summary }), _jsx("span", { style: {
                                                        fontSize: 10,
                                                        fontWeight: 600,
                                                        padding: '2px 8px',
                                                        borderRadius: 9999,
                                                        background: bug.status === 'resolved' ? t.accent : t.borderSubtle,
                                                        color: bug.status === 'resolved' ? '#fff' : t.textSecondary,
                                                        whiteSpace: 'nowrap',
                                                    }, children: bug.status.replace(/_/g, ' ') })] }), _jsxs("div", { style: { color: t.textMuted, fontSize: 11, marginTop: 4 }, children: [bug.app_slug, bug.updated_at ? ` · ${new Date(bug.updated_at).toLocaleDateString()}` : ''] }), bug.status === 'resolved' && (_jsxs("div", { style: { display: 'flex', gap: 8, marginTop: 10 }, children: [_jsx("button", { type: "button", disabled: feedbackPending === bug.id, onClick: () => void handleFeedback(bug.id, 'confirmed_fixed'), style: {
                                                        flex: 1,
                                                        padding: '6px 0',
                                                        borderRadius: 6,
                                                        border: `1px solid ${t.success}`,
                                                        background: 'transparent',
                                                        color: t.success,
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        cursor: feedbackPending === bug.id ? 'default' : 'pointer',
                                                    }, children: "It's fixed!" }), _jsx("button", { type: "button", disabled: feedbackPending === bug.id, onClick: () => void handleFeedback(bug.id, 'still_broken'), style: {
                                                        flex: 1,
                                                        padding: '6px 0',
                                                        borderRadius: 6,
                                                        border: `1px solid ${t.fail}`,
                                                        background: 'transparent',
                                                        color: t.fail,
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        cursor: feedbackPending === bug.id ? 'default' : 'pointer',
                                                    }, children: "Still broken" }), _jsx("button", { type: "button", disabled: feedbackPending === bug.id, onClick: () => handleNewProblem(bug.id), style: {
                                                        flex: 1,
                                                        padding: '6px 0',
                                                        borderRadius: 6,
                                                        border: `1px solid ${t.border}`,
                                                        background: 'transparent',
                                                        color: t.textSecondary,
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        cursor: feedbackPending === bug.id ? 'default' : 'pointer',
                                                    }, children: "New problem" })] }))] }, bug.id))) })) }))] }) }))] }));
}
//# sourceMappingURL=bugReport.js.map