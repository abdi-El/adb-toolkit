import { LazyStore } from "@tauri-apps/plugin-store";

export const settingsStore = new LazyStore("settings.json", {
  defaults: {},
  autoSave: true,
});

export const KEYS = {
  language: "language",
  colorScheme: "colorScheme",
  accentColor: "accentColor",
  onboardingSeen: "onboardingSeen",
} as const;
