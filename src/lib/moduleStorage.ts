import { useEffect, useRef, useState } from "react";

/**
 * Per-module persistence helper used by every service-config configurator.
 *
 * Keys state under `${prefix}:${serviceId}:${moduleName}` so Issuance and
 * Renewal edits live side by side without colliding.
 */
export function useModuleState<T>(
  prefix: string,
  serviceId: string,
  moduleName: string,
  buildSeed: () => T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const key = `${prefix}:${serviceId}:${moduleName}`;
  const seedRef = useRef(buildSeed);
  seedRef.current = buildSeed;

  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed != null) return parsed as T;
      }
    } catch { /* ignore */ }
    return seedRef.current();
  });

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
  }, [key, value]);

  return [value, setValue];
}
