import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en";
import it from "./it";
import es from "./es";
import ar from "./ar";

const savedLang = localStorage.getItem("language") || "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    it: { translation: it },
    es: { translation: es },
    ar: { translation: ar },
  },
  lng: savedLang,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
