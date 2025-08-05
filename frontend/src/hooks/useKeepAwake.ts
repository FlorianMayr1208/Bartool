import { useEffect } from 'react';

export function useKeepAwake() {
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;
    let flip = false;

    async function requestWakeLock() {
      try {
        if ('wakeLock' in navigator) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const nav: any = navigator;
          wakeLock = await nav.wakeLock.request('screen');
          wakeLock.addEventListener?.('release', () => {
            wakeLock = null;
          });
        }
      } catch (err) {
        console.warn('WakeLock request failed:', err);
      }
    }

    function nudge() {
      try {
        const y = flip ? 0 : 1;
        window.scrollTo(0, y);
        flip = !flip;
      } catch {
        /* noop */
      }
    }

    function hiddenReloadFallback() {
      if (document.hidden) {
        setTimeout(() => {
          if (document.hidden) location.reload();
        }, 10 * 60 * 1000);
      }
    }

    requestWakeLock();
    const intervalId = setInterval(nudge, 60000);

    const onVisibilityChange = () => {
      if (!document.hidden) requestWakeLock();
      hiddenReloadFallback();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const timeoutId = setTimeout(nudge, 15000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      wakeLock?.release().catch(() => {});
    };
  }, []);
}
