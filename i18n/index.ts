import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import fa from './locales/fa.json';

const LANGUAGE_KEY = '@affordly_language';

const resources = {
  en: { translation: en },
  fa: { translation: fa },
};

const initI18n = async () => {
  let savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);

  if (!savedLanguage) {
    // Default to device language if Persian, otherwise English
    const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'en';
    savedLanguage = deviceLanguage === 'fa' ? 'fa' : 'en';
  }

  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: savedLanguage,
      fallbackLng: 'en',
      compatibilityJSON: 'v3',
      interpolation: {
        escapeValue: false,
      },
    });
};

export const changeLanguage = async (lang: string) => {
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  i18n.changeLanguage(lang);
};

initI18n();

export default i18n;
