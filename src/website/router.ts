import { useSyncExternalStore } from 'react';

// Minimal hash routing: "#/about" → "/about". Other hashes ("#how-it-works") are in-page anchors.
const subscribe = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
};
const getPath = () => {
  const hash = window.location.hash.replace(/^#/, '');
  return hash.startsWith('/') ? hash : '/';
};

export function useHashPath() {
  return useSyncExternalStore(subscribe, getPath, () => '/');
}
