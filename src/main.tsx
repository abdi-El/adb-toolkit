import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import i18n from "./i18n";
import { settingsStore, KEYS } from "./lib/store";

const savedLang = await settingsStore.get<string>(KEYS.language);
if (savedLang) await i18n.changeLanguage(savedLang);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
