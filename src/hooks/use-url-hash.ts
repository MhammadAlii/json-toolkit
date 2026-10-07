"use client";

import { useCallback, useSyncExternalStore } from "react";

function subscribe(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}
const getHash = () => decodeURIComponent(window.location.hash.slice(1));
const getServerHash = () => "";

export function useUrlHash(): [string, (value: string) => void] {
  const hash = useSyncExternalStore(subscribe, getHash, getServerHash);
  const setHash = useCallback((value: string) => {
    history.replaceState(null, "", `#${value}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }, []);
  return [hash, setHash];
}
