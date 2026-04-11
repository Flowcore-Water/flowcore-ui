import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import html2canvas from 'html2canvas';
import { useTheme } from './ThemeContext';

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

export interface IdentityBugReportSubmitterOptions {
  getAuthToken: () => MaybePromise<string | null | undefined>;
  apiBaseUrl?: string;
  endpointPath?: string;
  fetchImpl?: typeof fetch;
}

export interface BugReportConfig {
  appSlug: string;
  enabled?: boolean;
  modalTitle?: string;
  buttonAriaLabel?: string;
  submitReport: (payload: BugReportSubmissionPayload) => Promise<BugReportSubmissionResult>;
  getReporter?: () => MaybePromise<BugReportUserContext | undefined>;
  getStateSnapshot?: () => MaybePromise<unknown>;
  getDiagnostics?: () => MaybePromise<BugReportDiagnostics | undefined>;
  getRelease?: () => MaybePromise<BugReportReleaseInfo | undefined>;
  getRouteContext?: () => MaybePromise<BugReportRouteContext | undefined>;
  getCaptureTarget?: () => HTMLElement | null;
}

interface BugReportContextValue {
  config: BugReportConfig;
}

const BugReportContext = createContext<BugReportContextValue | null>(null);

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

const recentCapturedErrors: BugReportDiagnosticError[] = [];
let errorCaptureInstalled = false;

function BugReportFabIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M9 7 7 5" />
      <path d="M15 7 17 5" />
      <path d="M8 10H5" />
      <path d="M19 10h-3" />
      <path d="M8 14H5" />
      <path d="M19 14h-3" />
      <path d="M9 18 7 20" />
      <path d="M15 18 17 20" />
      <path d="M12 7V4" />
      <path d="M12 12v2" />
      <path d="M12 7a4 4 0 0 0-4 4v3a4 4 0 1 0 8 0v-3a4 4 0 0 0-4-4Z" />
    </svg>
  );
}

function truncateString(value: string): string {
  if (value.length <= MAX_STRING_LENGTH) return value;
  return `${value.slice(0, MAX_STRING_LENGTH)}…[truncated]`;
}

function pushCapturedError(nextError: BugReportDiagnosticError): void {
  recentCapturedErrors.unshift(nextError);
  if (recentCapturedErrors.length > MAX_CAPTURED_ERRORS) {
    recentCapturedErrors.length = MAX_CAPTURED_ERRORS;
  }
}

function normalizeCapturedError(error: unknown): BugReportDiagnosticError {
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

function sanitizeValue(value: unknown, depth = 0, seen = new WeakSet<object>()): unknown {
  if (value == null) return value;
  if (typeof value === 'string') return truncateString(value);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (typeof value === 'bigint') return Number(value);
  if (typeof value === 'function') return '[Function]';
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Error) {
    return {
      message: value.message,
      stack: value.stack ?? null,
      name: value.name,
    };
  }
  if (depth >= MAX_SERIALIZE_DEPTH) return '[MaxDepthExceeded]';

  if (Array.isArray(value)) {
    return value.slice(0, MAX_ARRAY_ITEMS).map((item) => sanitizeValue(item, depth + 1, seen));
  }

  if (typeof value === 'object') {
    if (seen.has(value as object)) return '[Circular]';
    seen.add(value as object);

    const entries = Object.entries(value as Record<string, unknown>).slice(0, MAX_OBJECT_KEYS);
    const output: Record<string, unknown> = {};
    for (const [key, nestedValue] of entries) {
      output[key] = SENSITIVE_KEY_PATTERN.test(key)
        ? '[REDACTED]'
        : sanitizeValue(nestedValue, depth + 1, seen);
    }
    return output;
  }

  return String(value);
}

function readDefaultRouteContext(): BugReportRouteContext {
  const params = new URLSearchParams(window.location.search);
  return {
    path: window.location.pathname,
    queryParams: Object.fromEntries(params.entries()),
    hash: window.location.hash || null,
  };
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function shouldSkipAutomaticCapture(): boolean {
  if (typeof navigator === 'undefined') return false;

  const ua = navigator.userAgent;
  const isSafari = /\bSafari\//.test(ua) && !/\b(Chrome|Chromium|CriOS|Edg|EdgiOS|OPR|OPiOS|Firefox|FxiOS)\b/.test(ua);
  const isIosWebKit = /\b(iPad|iPhone|iPod)\b/i.test(ua);
  return isSafari || isIosWebKit;
}

function mountHiddenCaptureVideo(video: HTMLVideoElement): () => void {
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

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timeoutId = 0;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function waitForVideoDimensions(video: HTMLVideoElement): Promise<void> {
  if (video.videoWidth > 0 && video.videoHeight > 0) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
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

async function waitForRenderedVideoFrame(video: HTMLVideoElement): Promise<void> {
  const requestFrame = video.requestVideoFrameCallback?.bind(video);
  if (!requestFrame) {
    await waitForVideoDimensions(video);
    return;
  }

  await withTimeout(
    new Promise<void>((resolve) => {
      requestFrame(() => resolve());
    }),
    MANUAL_CAPTURE_READY_TIMEOUT_MS,
    'Manual browser capture did not render a video frame.'
  );
}

export function installBugReportErrorCapture(): void {
  if (errorCaptureInstalled || typeof window === 'undefined') return;

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

  errorCaptureInstalled = true;
}

export function getRecentBugReportErrors(limit = 10): BugReportDiagnosticError[] {
  return recentCapturedErrors.slice(0, Math.max(limit, 0));
}

export function resolveIdentityBugReportApiBase(apiBaseUrl?: string): string {
  return (apiBaseUrl && apiBaseUrl.trim() ? apiBaseUrl : DEFAULT_IDENTITY_API_BASE).replace(/\/$/, '');
}

export function createIdentityBugReportSubmitter({
  getAuthToken,
  apiBaseUrl,
  endpointPath = DEFAULT_BUG_ENDPOINT_PATH,
  fetchImpl = fetch,
}: IdentityBugReportSubmitterOptions): BugReportConfig['submitReport'] {
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

    const data = await response.json() as {
      id?: string;
      status?: string;
      duplicate_of_ticket_id?: string | null;
      github?: { issue_url?: string | null };
    };

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

async function captureAutomaticScreenshot(target: HTMLElement | null): Promise<BugReportScreenshot> {
  const captureTarget = target ?? document.body;
  const canvas = await withTimeout(
    html2canvas(captureTarget, {
      backgroundColor: null,
      useCORS: true,
      logging: false,
      scale: Math.min(window.devicePixelRatio || 1, 2),
    }),
    AUTOMATIC_CAPTURE_TIMEOUT_MS,
    'Automatic page capture timed out. You can capture the browser manually.'
  );

  return {
    dataUrl: canvas.toDataURL('image/png'),
    source: 'automatic',
    width: canvas.width,
    height: canvas.height,
    capturedAt: new Date().toISOString(),
  };
}

async function captureManualScreenshot(): Promise<BugReportScreenshot> {
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
    } finally {
      video.pause();
      video.srcObject = null;
      unmountVideo();
    }
  } finally {
    stream.getTracks().forEach((track) => track.stop());
  }
}

export function BugReportProvider({
  config,
  children,
}: {
  config: BugReportConfig | null | undefined;
  children: React.ReactNode;
}) {
  const value = useMemo<BugReportContextValue | null>(() => {
    if (!config || config.enabled === false) return null;
    return { config };
  }, [config]);

  return (
    <BugReportContext.Provider value={value}>
      {children}
    </BugReportContext.Provider>
  );
}

export function useBugReport(): BugReportContextValue | null {
  return useContext(BugReportContext);
}

export function BugReportWidget() {
  const bugReport = useBugReport();
  const { t } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [captureAttempt, setCaptureAttempt] = useState(0);
  const [summary, setSummary] = useState('');
  const [comments, setComments] = useState('');
  const [screenshot, setScreenshot] = useState<BugReportScreenshot | null>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<BugReportSubmissionResult | null>(null);

  const config = bugReport?.config;
  const skipAutomaticCapture = shouldSkipAutomaticCapture();

  useEffect(() => {
    if (!isOpen || !config || screenshot || isCapturing) return;
    if (skipAutomaticCapture) {
      setCaptureError(AUTOMATIC_CAPTURE_WEBKIT_MESSAGE);
      return;
    }

    let cancelled = false;
    setIsCapturing(true);
    setCaptureError(null);

    void captureAutomaticScreenshot(config.getCaptureTarget?.() ?? null)
      .then((nextScreenshot) => {
        if (!cancelled) setScreenshot(nextScreenshot);
      })
      .catch((error) => {
        if (!cancelled) {
          setCaptureError(getErrorMessage(error, 'Automatic page capture failed. You can capture the browser manually.'));
        }
      })
      .finally(() => {
        if (!cancelled) setIsCapturing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [captureAttempt, config, isCapturing, isOpen, screenshot, skipAutomaticCapture]);

  if (!config) return null;

  async function handleManualCapture(): Promise<void> {
    setIsCapturing(true);
    setCaptureError(null);
    try {
      setScreenshot(await captureManualScreenshot());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Manual browser capture failed.';
      setCaptureError(message);
    } finally {
      setIsCapturing(false);
    }
  }

  function resetForm(): void {
    setSummary('');
    setComments('');
    setScreenshot(null);
    setCaptureError(null);
    setSubmitError(null);
    setResult(null);
    setIsCapturing(false);
    setIsSubmitting(false);
  }

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    if (!config) return;

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

      const submission: BugReportSubmissionPayload = {
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
        route: sanitizeValue(routeContext ?? readDefaultRouteContext()) as BugReportRouteContext,
        user: sanitizeValue(reporter) as BugReportUserContext | undefined,
        release: sanitizeValue(release) as BugReportReleaseInfo | undefined,
        diagnostics: sanitizeValue(diagnostics) as BugReportDiagnostics | undefined,
        appState: sanitizeValue(stateSnapshot),
        screenshot: screenshot ?? undefined,
        submittedAt: new Date().toISOString(),
      };

      const nextResult = await activeConfig.submitReport(submission);
      setResult(nextResult);
      setTimeout(() => {
        setIsOpen(false);
        resetForm();
      }, 2200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit the bug report.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          resetForm();
          setCaptureAttempt((value) => value + 1);
          setIsOpen(true);
        }}
        aria-label={config.buttonAriaLabel ?? 'Report a bug'}
        title={config.buttonAriaLabel ?? 'Report a bug'}
        style={{
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
        }}
      >
        <BugReportFabIcon />
      </button>

      {result && (
        <div
          role="status"
          style={{
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
          }}
        >
          <div style={{ color: t.success, fontWeight: 700, marginBottom: 6 }}>Bug report submitted</div>
          <div style={{ color: t.textSecondary, fontSize: 13 }}>
            Ticket `{result.ticketId}` created{result.duplicateOfTicketId ? ` and linked to ${result.duplicateOfTicketId}` : ''}.
          </div>
          {result.githubIssueUrl && (
            <a href={result.githubIssueUrl} target="_blank" rel="noreferrer" style={{ color: t.accent, fontSize: 13, display: 'inline-block', marginTop: 8 }}>
              Open linked GitHub issue
            </a>
          )}
        </div>
      )}

      {isOpen && (
        <div
          onClick={() => {
            setIsOpen(false);
            resetForm();
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 46000,
            background: 'rgba(5, 10, 18, 0.74)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            padding: 20,
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: 420,
              maxWidth: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              borderRadius: 18,
              border: `1px solid ${t.border}`,
              background: t.cardBg,
              boxShadow: '0 28px 48px rgba(0, 0, 0, 0.45)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 18px',
                borderBottom: `1px solid ${t.border}`,
              }}
            >
              <div>
                <div style={{ color: t.textPrimary, fontWeight: 700 }}>
                  {config.modalTitle ?? 'Report a bug'}
                </div>
                <div style={{ color: t.textMuted, fontSize: 12 }}>
                  Captures the page, app state, and your comments for triage.
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  resetForm();
                }}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: t.textSecondary,
                  cursor: 'pointer',
                  fontSize: 22,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={(event) => void handleSubmit(event)} style={{ padding: 18 }}>
              <label style={{ display: 'block', color: t.textSecondary, fontSize: 12, marginBottom: 6 }}>
                Summary
              </label>
              <input
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                placeholder="Short description of the problem"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  borderRadius: 10,
                  border: `1px solid ${t.inputBorder}`,
                  background: t.inputBg,
                  color: t.textPrimary,
                  padding: '10px 12px',
                  marginBottom: 14,
                }}
              />

              <label style={{ display: 'block', color: t.textSecondary, fontSize: 12, marginBottom: 6 }}>
                What did you see?
              </label>
              <textarea
                value={comments}
                onChange={(event) => setComments(event.target.value)}
                placeholder="What happened, what you expected, and any steps that led to it"
                disabled={isSubmitting}
                rows={5}
                style={{
                  width: '100%',
                  borderRadius: 10,
                  border: `1px solid ${t.inputBorder}`,
                  background: t.inputBg,
                  color: t.textPrimary,
                  padding: '10px 12px',
                  resize: 'vertical',
                }}
              />

              <div style={{ marginTop: 18 }}>
                <div style={{ color: t.textSecondary, fontSize: 12, marginBottom: 8 }}>
                  Page capture
                </div>
                {screenshot ? (
                  <img
                    src={screenshot.dataUrl}
                    alt="Bug report screenshot"
                    style={{
                      width: '100%',
                      maxHeight: 180,
                      objectFit: 'cover',
                      borderRadius: 12,
                      border: `1px solid ${t.border}`,
                      background: t.pageBg,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      borderRadius: 12,
                      border: `1px dashed ${t.borderSubtle}`,
                      background: t.inputBg,
                      padding: 14,
                      color: t.textMuted,
                      fontSize: 13,
                    }}
                  >
                    {isCapturing ? 'Capturing the current page…' : 'No screenshot captured yet.'}
                  </div>
                )}
                {captureError && (
                  <div style={{ color: t.fail, fontSize: 12, marginTop: 8 }}>
                    {captureError}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  <button
                    type="button"
                    disabled={isCapturing || isSubmitting}
                    onClick={() => void handleManualCapture()}
                    style={{
                      borderRadius: 8,
                      border: `1px solid ${t.buttonBorder}`,
                      padding: '8px 12px',
                      background: t.buttonBg,
                      color: t.buttonText,
                      cursor: isCapturing || isSubmitting ? 'default' : 'pointer',
                    }}
                  >
                    Capture Browser Manually
                  </button>
                  <button
                    type="button"
                    disabled={isCapturing || isSubmitting}
                    onClick={() => {
                      setScreenshot(null);
                      setCaptureError(null);
                      setCaptureAttempt((value) => value + 1);
                    }}
                    style={{
                      borderRadius: 8,
                      border: `1px solid ${t.buttonBorder}`,
                      padding: '8px 12px',
                      background: 'transparent',
                      color: t.textSecondary,
                      cursor: isCapturing || isSubmitting ? 'default' : 'pointer',
                    }}
                  >
                    Retry Auto Capture
                  </button>
                </div>
              </div>

              {submitError && (
                <div
                  style={{
                    marginTop: 14,
                    borderRadius: 10,
                    border: `1px solid ${t.failBorder}`,
                    background: t.failBg,
                    color: t.fail,
                    padding: '10px 12px',
                    fontSize: 13,
                  }}
                >
                  {submitError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 18 }}>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsOpen(false);
                    resetForm();
                  }}
                  style={{
                    borderRadius: 8,
                    border: `1px solid ${t.buttonBorder}`,
                    padding: '10px 14px',
                    background: 'transparent',
                    color: t.textSecondary,
                    cursor: isSubmitting ? 'default' : 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    borderRadius: 8,
                    border: `1px solid ${t.accent}`,
                    padding: '10px 14px',
                    background: t.accent,
                    color: t.pageBg,
                    fontWeight: 700,
                    cursor: isSubmitting ? 'default' : 'pointer',
                  }}
                >
                  {isSubmitting ? 'Submitting…' : 'Submit Bug Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
