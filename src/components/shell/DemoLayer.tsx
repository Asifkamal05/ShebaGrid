"use client";

import { useEffect } from "react";
import { startDemo } from "@/lib/store/demo";
import { hydrateSession } from "@/lib/store/session";
import { hydrateTheme } from "@/lib/store/theme";
import { Toaster } from "./Toaster";

/** Loads the saved complaints, theme and session in the browser, and shows the toasts. */
export function DemoLayer() {
  useEffect(() => {
    // Complaints load first, so a page never shows one as missing while the saved ones are read.
    const stop = startDemo();
    hydrateTheme();
    hydrateSession();
    return stop;
  }, []);

  return <Toaster />;
}
