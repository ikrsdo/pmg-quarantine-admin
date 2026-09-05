import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { version as currentVersion } from '../../package.json';

const REPO = 'ikrsdo/pmg-quarantine-admin';
const DISMISSED_KEY = 'pmg-dismissed-update-version';

function parseSemver(tagName) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)/.exec(tagName);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function isNewer(a, b) {
  for (let i = 0; i < 3; i += 1) {
    if (a[i] > b[i]) return true;
    if (a[i] < b[i]) return false;
  }
  return false;
}

export default function UpdateBanner() {
  const [latestVersion, setLatestVersion] = useState(null);
  const [swUpdateReady, setSwUpdateReady] = useState(false);

  // Fired by main.jsx when the service worker has swapped in a new version
  // of the app in the background (see sw.js). Takes priority over the
  // GitHub-tag banner below since reloading is the actual fix, not just
  // a notice.
  useEffect(() => {
    function handleSwUpdate() {
      setSwUpdateReady(true);
    }
    window.addEventListener('pmg:sw-update-ready', handleSwUpdate);
    return () => window.removeEventListener('pmg:sw-update-ready', handleSwUpdate);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function checkForUpdate() {
      try {
        const res = await fetch(`https://api.github.com/repos/${REPO}/tags`);
        if (!res.ok) return;
        const tags = await res.json();

        const current = parseSemver(currentVersion);
        if (!current) return;

        let latest = null;
        for (const tag of tags) {
          const parsed = parseSemver(tag.name);
          if (parsed && (!latest || isNewer(parsed, latest))) {
            latest = parsed;
          }
        }
        if (!latest || !isNewer(latest, current)) return;

        const latestStr = latest.join('.');
        let dismissed = null;
        try {
          dismissed = localStorage.getItem(DISMISSED_KEY);
        } catch {
          // localStorage unavailable (private mode etc.) - just show the banner
        }
        if (dismissed === latestStr) return;

        if (!cancelled) setLatestVersion(latestStr);
      } catch {
        // offline, rate-limited, or GitHub unreachable - fail silently
      }
    }

    checkForUpdate();
    return () => {
      cancelled = true;
    };
  }, []);

  if (swUpdateReady) {
    return (
      <div className="pb-safe fixed inset-x-0 bottom-0 z-20 flex items-center justify-center gap-3 border-t border-blue-800 bg-blue-950 px-4 py-3 text-sm text-blue-100 shadow-lg">
        <p className="min-w-0">A new version has loaded in the background.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="shrink-0 rounded-md bg-blue-800 px-3 py-1 font-semibold hover:bg-blue-700"
        >
          Reload
        </button>
      </div>
    );
  }

  if (!latestVersion) return null;

  function dismiss() {
    try {
      localStorage.setItem(DISMISSED_KEY, latestVersion);
    } catch {
      // localStorage unavailable - dismissal just won't persist across reloads
    }
    setLatestVersion(null);
  }

  return (
    <div className="pb-safe fixed inset-x-0 bottom-0 z-20 flex items-center justify-center gap-3 border-t border-blue-800 bg-blue-950 px-4 py-3 text-sm text-blue-100 shadow-lg">
      <p className="min-w-0">
        A new version is available:{' '}
        <span className="font-semibold">v{latestVersion}</span>{' '}
        <span className="text-blue-300">(currently running v{currentVersion})</span>.{' '}
        <a
          href={`https://github.com/${REPO}/blob/main/CHANGELOG.md`}
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-white"
        >
          View changelog
        </a>
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 rounded-md p-1 hover:bg-blue-900"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
