import { ROLES } from "../people";
import type { Role } from "../types";
import { createStore } from "./create-store";

export interface SessionState {
  /** False until the browser has been asked who is signed in. */
  hydrated: boolean;
  role: Role | null;
}

const KEY = "shebagrid.session";

export const session = createStore<SessionState>({ hydrated: false, role: null });

/** Loads the demo session once the page is in the browser. */
export function hydrateSession() {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(KEY);
  } catch {
    // Treated as signed out.
  }
  session.set({ hydrated: true, role: ROLES.find((role) => role === saved) ?? null });
}

export function signIn(role: Role) {
  try {
    localStorage.setItem(KEY, role);
  } catch {
    // The demo session then lasts until the page is closed.
  }
  session.set({ hydrated: true, role });
}

export function signOut() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to remove.
  }
  session.set({ hydrated: true, role: null });
}
