import { useEffect } from 'react';
/**
 * Sets the browser page title in the standard Flowcore format:
 * `{appName} - {pageTitle}`
 *
 * When no pageTitle is provided, shows just the appName.
 *
 * Usage:
 *   usePageTitle('Analytics', 'Marketing');  // → "Analytics - Marketing"
 *   usePageTitle('WellScope');               // → "WellScope"
 */
export function usePageTitle(appName, pageTitle) {
    useEffect(() => {
        document.title = pageTitle ? `${appName} - ${pageTitle}` : appName;
    }, [appName, pageTitle]);
}
//# sourceMappingURL=usePageTitle.js.map