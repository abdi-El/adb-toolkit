import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { MantineColorScheme } from "@mantine/core";
import { settingsStore, KEYS } from "../lib/store";

export type AccentColor =
  | "teal"
  | "blue"
  | "cyan"
  | "indigo"
  | "violet"
  | "grape"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "lime"
  | "pink";

export const ACCENT_COLORS: AccentColor[] = [
  "teal",
  "blue",
  "cyan",
  "indigo",
  "violet",
  "grape",
  "pink",
  "red",
  "orange",
  "yellow",
  "lime",
  "green",
];

export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "it", label: "Italiano" },
  { value: "es", label: "Español" },
  { value: "ar", label: "العربية" },
];

export function useSettings() {
  const { i18n } = useTranslation();

  const [colorScheme, setColorSchemeState] =
    useState<MantineColorScheme>("dark");
  const [accentColor, setAccentColorState] = useState<AccentColor>("teal");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [scheme, color, lang] = await Promise.all([
        settingsStore.get<MantineColorScheme>(KEYS.colorScheme),
        settingsStore.get<AccentColor>(KEYS.accentColor),
        settingsStore.get<string>(KEYS.language),
      ]);
      if (cancelled) return;
      if (scheme) setColorSchemeState(scheme);
      if (color) setAccentColorState(color);
      if (lang && lang !== i18n.language) i18n.changeLanguage(lang);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [i18n]);

  const setLanguage = useCallback(
    (lang: string) => {
      void settingsStore.set(KEYS.language, lang);
      i18n.changeLanguage(lang);
    },
    [i18n],
  );

  const setColorScheme = useCallback((scheme: MantineColorScheme) => {
    void settingsStore.set(KEYS.colorScheme, scheme);
    setColorSchemeState(scheme);
  }, []);

  const setAccentColor = useCallback((color: AccentColor) => {
    void settingsStore.set(KEYS.accentColor, color);
    setAccentColorState(color);
  }, []);

  return {
    language: i18n.language,
    colorScheme,
    accentColor,
    loaded,
    setLanguage,
    setColorScheme,
    setAccentColor,
  };
}
