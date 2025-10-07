import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { LogOut, Moon, Sun, Languages } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '@/i18n';
import { showToast } from '@/lib/toast';
import { useLocalizedFont } from '@/hooks/useLocalizedFont';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const { theme, isDark, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const fontRegular = useLocalizedFont('regular');
  const fontBold = useLocalizedFont('bold');

  const handleSignOut = async () => {
    await signOut();
  };

  const handleLanguageChange = async (lang: string) => {
    const currentLang = i18n.language;
    console.log("Current language:", currentLang);
    if (currentLang === lang) return;

    console.log("Changing language to:", lang);

    await changeLanguage(lang);

    showToast.info(
      t('common.success'),
      t('profile.restartRequired')
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, fontBold, { color: theme.colors.text }]}>{t('profile.title')}</Text>
        <Text style={[styles.email, fontRegular, { color: theme.colors.textSecondary }]}>{user?.email || 'user@example.com'}</Text>
      </View>

      {/* Language Selector */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, fontBold, { color: theme.colors.text }]}>{t('profile.language')}</Text>
        <Text style={[styles.sectionDescription, fontRegular, { color: theme.colors.textSecondary }]}>
          {t('profile.languageDescription')}
        </Text>

        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              {
                backgroundColor: i18n.language === 'en' ? theme.colors.primary : theme.colors.card,
                borderColor: theme.colors.cardBorder
              }
            ]}
            onPress={() => handleLanguageChange('en')}
          >
            <Languages size={20} color={i18n.language === 'en' ? theme.colors.background : theme.colors.textSecondary} strokeWidth={2} />
            <Text style={[
              styles.optionText,
              { color: i18n.language === 'en' ? theme.colors.background : theme.colors.text }
            ]}>
              English
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              {
                backgroundColor: i18n.language === 'fa' ? theme.colors.primary : theme.colors.card,
                borderColor: theme.colors.cardBorder
              }
            ]}
            onPress={() => handleLanguageChange('fa')}
          >
            <Languages size={20} color={i18n.language === 'fa' ? theme.colors.background : theme.colors.textSecondary} strokeWidth={2} />
            <Text style={[
              styles.optionText,
              { color: i18n.language === 'fa' ? theme.colors.background : theme.colors.text }
            ]}>
              فارسی
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Theme Selector */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, fontBold, { color: theme.colors.text }]}>{t('profile.theme')}</Text>
        <Text style={[styles.sectionDescription, fontRegular, { color: theme.colors.textSecondary }]}>
          {t('profile.themeDescription')}
        </Text>

        <View style={[styles.themeContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          {isDark ? (
            <Moon size={20} color={theme.colors.textSecondary} strokeWidth={2} />
          ) : (
            <Sun size={20} color={theme.colors.textSecondary} strokeWidth={2} />
          )}
          <Text style={[styles.themeLabel, fontRegular, { color: theme.colors.text }]}>
            {isDark ? t('profile.darkMode') : t('profile.lightMode')}
          </Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
            thumbColor={isDark ? theme.colors.primary : '#f4f3f4'}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.signOutButton, { borderColor: theme.colors.error }]}
        onPress={handleSignOut}
      >
        <LogOut size={20} color={theme.colors.error} strokeWidth={2} />
        <Text style={[styles.signOutText, fontBold, { color: theme.colors.error }]}>{t('profile.signOut')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'left',
    fontFamily: 'Vazirmatn_700Bold',
  },
  email: {
    fontSize: 16,
    textAlign: 'left',
    fontFamily: 'Vazirmatn_400Regular',
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'left',
    fontFamily: 'Vazirmatn_700Bold',
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
    textAlign: 'left',
    fontFamily: 'Vazirmatn_400Regular',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Vazirmatn_700Bold',
  },
  themeContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  themeLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginRight: 12,
    textAlign: 'left',
    fontFamily: 'Vazirmatn_400Regular',
  },
  signOutButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Vazirmatn_700Bold',
  },
});
