export interface AlertBannerProps {
    variant: 'error' | 'warning' | 'info' | 'success';
    message?: string;
    error?: unknown;
    sentryEventId?: string;
    persistent?: boolean;
    onDismiss?: () => void;
    onRetry?: () => void;
}
export declare function AlertBanner({ variant, message, error, sentryEventId, persistent, onDismiss, onRetry, }: AlertBannerProps): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=AlertBanner.d.ts.map