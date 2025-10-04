import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

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
    await AsyncStorage.setItem(LANGUAGE_KEY, savedLanguage);
  }

  // Set RTL based on language - MUST be done before any React components render
  const isRTL = savedLanguage === 'fa';
  I18nManager.allowRTL(true);

  if (I18nManager.isRTL !== isRTL) {
    I18nManager.forceRTL(isRTL);
    // Note: This change requires a full app restart (close and reopen)
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

  // Update RTL setting - this requires app reload
  const isRTL = lang === 'fa';
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
    // Note: App reload is needed and should be handled by the caller
  }

  await i18n.changeLanguage(lang);
};

initI18n();

export default i18n;
