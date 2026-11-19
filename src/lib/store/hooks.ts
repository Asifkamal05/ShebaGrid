"use client";

import { useMemo, useSyncExternalStore } from "react";
import { buildHotspots } from "../hotspots";
import { PLACES } from "../places";
import { MINUTE_MS } from "../time";
import { NO_COMPLAINTS, clock, demo } from "./demo";
import { session } from "./session";
import { theme } from "./theme";
import { toasts } from "./toasts";

export function useSession() {
  return useSyncExternalStore(session.subscribe, session.get, session.get);
}

export function useComplaints() {
  return useSyncExternalStore(demo.subscribe, demo.get, () => NO_COMPLAINTS);
}

export function useHotspots() {
  const complaints = useComplaints();
  return useMemo(() => buildHotspots(complaints, PLACES), [complaints]);
}

/** The time, rounded down to the minute, so a list does not re-sort more than once a minute. */
export function useNowMinute() {
  return useSyncExternalStore(
    clock.subscribe,
    () => Math.floor(clock.get() / MINUTE_MS) * MINUTE_MS,
    () => 0,
  );
}

export function useNowIso() {
  return new Date(useNowMinute()).toISOString();
}

export function useToasts() {
  return useSyncExternalStore(toasts.subscribe, toasts.get, toasts.get);
}

export function useDark() {
  return useSyncExternalStore(
    theme.subscribe,
    () => theme.get().dark,
    () => false,
  );
}
