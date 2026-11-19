import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** The store runs in the browser, so give it a window and a localStorage to use. */
function installBrowser() {
  const data = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  });
  vi.stubGlobal("window", {
    setTimeout: globalThis.setTimeout.bind(globalThis),
    setInterval: globalThis.setInterval.bind(globalThis),
    clearInterval: globalThis.clearInterval.bind(globalThis),
  });
  return data;
}

const spot = { lat: 23.8069, lng: 90.3687, category: "pothole" as const, description: "A deep hole", urgency: 5 as const };

async function freshStore() {
  vi.resetModules();
  const store = await import("./demo");
  const toasts = await import("./toasts");
  return { ...store, toasts: toasts.toasts };
}

describe("the browser store", () => {
  let data: Map<string, string>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-19T06:00:00.000Z"));
    data = installBrowser();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("starts with no complaints", async () => {
    const { demo, startDemo } = await freshStore();
    const stop = startDemo();
    expect(demo.get()).toEqual([]);
    stop();
  });

  it("files a complaint with the next number and saves it", async () => {
    const { demo, submitComplaint, startDemo } = await freshStore();
    const stop = startDemo();
    const first = submitComplaint(spot);
    const second = submitComplaint(spot);
    expect([first.id, second.id]).toEqual(["SG-0001", "SG-0002"]);
    expect(first.mine).toBe(true);
    expect(first.reportedAt).toBe("2026-10-19T06:00:00.000Z");
    expect(JSON.parse(data.get("shebagrid.demo") ?? "[]")).toHaveLength(2);
    expect(demo.get()).toHaveLength(2);
    stop();
  });

  it("brings saved complaints back after a reload", async () => {
    const one = await freshStore();
    const stopOne = one.startDemo();
    one.submitComplaint(spot);
    stopOne();

    const two = await freshStore();
    const stopTwo = two.startDemo();
    expect(two.demo.get().map((c) => c.id)).toEqual(["SG-0001"]);
    stopTwo();
  });

  it("moves a ticket on only for an allowed role", async () => {
    const { demo, submitComplaint, moveTicket, startDemo } = await freshStore();
    const stop = startDemo();
    const { id } = submitComplaint(spot);

    moveTicket(id, { role: "resident", name: "Someone" });
    expect(demo.get()[0].status).toBe("open");

    moveTicket(id, { role: "engineer", name: "Engr. N. Akter" });
    expect(demo.get()[0].status).toBe("assigned");
    expect(demo.get()[0].assignee).toBe("Engr. N. Akter");
    stop();
  });

  it("escalates a worked-on ticket once its deadline passes", async () => {
    const { demo, submitComplaint, moveTicket, startDemo, toasts } = await freshStore();
    const stop = startDemo();
    const seen: string[] = [];
    toasts.subscribe(() => seen.push(...toasts.get().map((t) => t.text)));
    const { id } = submitComplaint(spot);
    moveTicket(id, { role: "engineer", name: "Engr. N. Akter" });

    vi.advanceTimersByTime(6 * 3_600_000);
    expect(demo.get()[0].status).toBe("assigned");
    vi.advanceTimersByTime(19 * 3_600_000);
    expect(demo.get()[0].status).toBe("escalated");
    expect(seen.some((text) => text.includes("missed its deadline"))).toBe(true);
    stop();
  });

  it("follows the real clock", async () => {
    const { clock, startDemo } = await freshStore();
    const stop = startDemo();
    const start = clock.get();
    vi.advanceTimersByTime(60_000);
    expect(clock.get() - start).toBe(60_000);
    stop();
  });
});
