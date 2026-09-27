import { useSyncExternalStore } from 'react';

const subscribe = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
};
const getPath = () => window.location.hash.replace(/^#/, '') || '/';

/** The editor follows the site's hash route, so navigating inside the preview switches pages here too. */
export function useHashPath() {
  return useSyncExternalStore(subscribe, getPath, () => '/');
}

export function navigate(path: string) {
  window.location.hash = path;
}
