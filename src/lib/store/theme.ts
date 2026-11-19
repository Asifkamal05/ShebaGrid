import { createStore } from "./create-store";

const KEY = "sg-theme";

export const theme = createStore({ dark: false });

/** Reads the theme the page was painted with (see THEME_INIT_SCRIPT). */
export function hydrateTheme() {
  theme.set({ dark: document.documentElement.dataset.theme === "dark" });
}

export function setDark(dark: boolean) {
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  try {
    localStorage.setItem(KEY, dark ? "dark" : "light");
  } catch {
    // The choice then lasts until the page is closed.
  }
  theme.set({ dark });
}

/** Runs in the document head before first paint, so there is no flash of the wrong theme. */
export const THEME_INIT_SCRIPT = `var t;try{t=localStorage.getItem("${KEY}")}catch(e){}if(t!=="dark"&&t!=="light")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t`;
