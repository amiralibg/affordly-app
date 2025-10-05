import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { LogOut, Moon, Sun, Languages } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '@/i18n';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const { theme, isDark, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleLanguageChange = async (lang: string) => {
    const currentLang = i18n.language;
    console.log("Current language:", currentLang);
    if (currentLang === lang) return;

    console.log("Changing language to:", lang);

    await changeLanguage(lang);

    Alert.alert(
      lang === 'fa' ? 'موفق' : 'Success',
      lang === 'fa'
        ? 'زبان تغییر کرد. برای اعمال کامل تغییرات، لطفاً اپلیکیشن را ببندید و دوباره باز کنید.'
        : 'Language changed. Please close and reopen the app to apply RTL layout changes.',
      [
        {
          text: lang === 'fa' ? 'باشه' : 'OK',
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>تنظیمات</Text>
        <Text style={[styles.email, { color: theme.colors.textSecondary }]}>{user?.email || 'user@example.com'}</Text>
      </View>

      {/* Language Selector */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>زبان</Text>
        <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
          انتخاب زبان اپلیکیشن
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
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>تم</Text>
        <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
          انتخاب حالت تاریک یا روشن
        </Text>

        <View style={[styles.themeContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          {isDark ? (
            <Moon size={20} color={theme.colors.textSecondary} strokeWidth={2} />
          ) : (
            <Sun size={20} color={theme.colors.textSecondary} strokeWidth={2} />
          )}
          <Text style={[styles.themeLabel, { color: theme.colors.text }]}>
            {isDark ? 'حالت تاریک' : 'حالت روشن'}
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
        <Text style={[styles.signOutText, { color: theme.colors.error }]}>خروج از حساب</Text>
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
    textAlign: 'right',
    fontFamily: 'Vazirmatn_700Bold',
  },
  email: {
    fontSize: 16,
    textAlign: 'right',
    fontFamily: 'Vazirmatn_400Regular',
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'right',
    fontFamily: 'Vazirmatn_700Bold',
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
    textAlign: 'right',
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
    textAlign: 'right',
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
