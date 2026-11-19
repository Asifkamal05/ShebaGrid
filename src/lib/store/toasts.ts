import { createStore } from "./create-store";

export type ToastTone = "info" | "success" | "alert";

export interface Toast {
  id: number;
  text: string;
  tone: ToastTone;
}

export const toasts = createStore<Toast[]>([]);

let counter = 0;

export function pushToast(toast: Omit<Toast, "id">) {
  const id = ++counter;
  toasts.set((all) => [...all, { ...toast, id }].slice(-4));
  window.setTimeout(() => dismissToast(id), 7000);
}

export function dismissToast(id: number) {
  toasts.set((all) => all.filter((t) => t.id !== id));
}
