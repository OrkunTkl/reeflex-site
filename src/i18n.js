import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import frJSON from './locale/fr.json';
import enJSON from './locale/en.json';

// The site is English-only now — fixed language, no browser detection, so
// it never falls back to French for visitors whose browser isn't set to
// French or English.
i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: frJSON },
      en: { translation: enJSON }
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

export default i18n;
