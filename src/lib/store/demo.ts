import { actionFor, actorFor, advance, escalateOverdue } from "../queue";
import { STATUS_LABEL } from "../sla";
import { createComplaint, type NewComplaint } from "../ticket";
import type { Complaint, Role } from "../types";
import { createStore } from "./create-store";
import { pushToast } from "./toasts";

// The prototype's stand-in for a backend: complaints live in this browser only.

const KEY = "shebagrid.demo";
const TICK_MS = 30_000;

export const NO_COMPLAINTS: Complaint[] = [];

export const demo = createStore<Complaint[]>(NO_COMPLAINTS);
export const clock = createStore(0);

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(demo.get()));
  } catch {
    // Without storage the prototype still works until the page is closed.
  }
}

function load(): Complaint[] {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function submitComplaint(input: NewComplaint): Complaint {
  const complaints = demo.get();
  const complaint = createComplaint({ ...input, mine: true }, complaints, new Date().toISOString());
  demo.set([...complaints, complaint]);
  persist();
  return complaint;
}

export function moveTicket(id: string, actor: { role: Role; name: string }) {
  const current = demo.get().find((c) => c.id === id);
  if (!current || !actionFor(actor.role, current.status)) return;

  const next = advance(current, new Date().toISOString(), actorFor(actor.role, actor.name, current));
  demo.set(demo.get().map((c) => (c.id === id ? next : c)));
  persist();
  pushToast({ tone: "success", text: `${id} is now ${STATUS_LABEL[next.status].toLowerCase()}.` });
}

/** Anything late and being worked on goes to a senior engineer. */
function runEscalations() {
  const { complaints, escalated } = escalateOverdue(demo.get(), new Date().toISOString());
  if (escalated.length === 0) return;

  demo.set(complaints);
  persist();
  pushToast({
    tone: "alert",
    text:
      escalated.length === 1
        ? `${escalated[0].id} in ${escalated[0].area} missed its deadline and went to a senior engineer.`
        : `${escalated.length} tickets missed their deadline and went to a senior engineer.`,
  });
}

/** Loads the saved complaints, then keeps the clock and deadlines current. */
export function startDemo(): () => void {
  demo.set(load());
  clock.set(Date.now());
  runEscalations();

  const timer = window.setInterval(() => {
    clock.set(Date.now());
    runEscalations();
  }, TICK_MS);
  return () => window.clearInterval(timer);
}
