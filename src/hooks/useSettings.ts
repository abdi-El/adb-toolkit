import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { MantineColorScheme } from "@mantine/core";

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

function loadSetting<T>(key: string, fallback: T): T {
  const val = localStorage.getItem(key);
  return val !== null ? (val as T) : fallback;
}

export function useSettings() {
  const { i18n } = useTranslation();

  const [colorScheme, setColorSchemeState] = useState<MantineColorScheme>(
    loadSetting<MantineColorScheme>("colorScheme", "dark"),
  );
  const [accentColor, setAccentColorState] = useState<AccentColor>(
    loadSetting<AccentColor>("accentColor", "teal"),
  );

  const setLanguage = useCallback(
    (lang: string) => {
      localStorage.setItem("language", lang);
      i18n.changeLanguage(lang);
    },
    [i18n],
  );

  const setColorScheme = useCallback((scheme: MantineColorScheme) => {
    localStorage.setItem("colorScheme", scheme);
    setColorSchemeState(scheme);
  }, []);

  const setAccentColor = useCallback((color: AccentColor) => {
    localStorage.setItem("accentColor", color);
    setAccentColorState(color);
  }, []);

  return {
    language: i18n.language,
    colorScheme,
    accentColor,
    setLanguage,
    setColorScheme,
    setAccentColor,
  };
}
