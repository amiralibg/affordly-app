import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  I18nManager,
} from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { useSignIn, useSignUp } from '@/lib/hooks/useAuth';
import { Wallet, Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useLocalizedFont } from '@/hooks/useLocalizedFont';
import { showToast } from '@/lib/toast';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: false,
    password: false,
    name: false,
  });

  const setUser = useAuthStore((state) => state.setUser);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const fontRegular = useLocalizedFont('regular');
  const fontBold = useLocalizedFont('bold');
  const isRTL = i18n.language === 'fa';

  const signInMutation = useSignIn();
  const signUpMutation = useSignUp();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAuth = async () => {
    // Reset errors
    const newErrors = {
      email: false,
      password: false,
      name: false,
    };

    // Validate inputs
    if (!email || !validateEmail(email)) {
      newErrors.email = true;
    }

    if (!password) {
      newErrors.password = true;
    }

    if (isSignUp && !name) {
      newErrors.name = true;
    }

    // Update error state
    setErrors(newErrors);

    // Check if there are any errors
    if (newErrors.email || newErrors.password || newErrors.name) {
      if (!email || !password || (isSignUp && !name)) {
        showToast.error(t('common.error'), t('auth.fillAllFields'));
      } else if (newErrors.email) {
        showToast.error(t('common.error'), t('auth.invalidEmail'));
      }
      return;
    }

    try {
      if (isSignUp) {
        const result = await signUpMutation.mutateAsync({ email, password, name });
        setUser(result.user);
        setAuthenticated(true);
      } else {
        const result = await signInMutation.mutateAsync({ email, password });
        setUser(result.user);
        setAuthenticated(true);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'An error occurred';
      showToast.error(t('common.error'), errorMessage);
    }
  };

  const loading = signInMutation.isPending || signUpMutation.isPending;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.backgroundSecondary }]}>
            <Wallet size={48} color={theme.colors.primary} strokeWidth={2} />
          </View>
          <Text style={[styles.title, fontBold, { color: theme.colors.text }]}>{t('auth.appName')}</Text>
          <Text style={[styles.subtitle, fontRegular, { color: theme.colors.textSecondary }]}>
            {t('auth.appTagline')}
          </Text>
        </View>

        <View style={styles.form}>
          {isSignUp && (
            <TextInput
              style={[
                styles.input,
                fontRegular,
                {
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: errors.name ? '#EF4444' : theme.colors.cardBorder,
                }
              ]}
              placeholder={t('auth.name')}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name && text) {
                  setErrors({ ...errors, name: false });
                }
              }}
              autoCapitalize="words"
              placeholderTextColor={theme.colors.textTertiary}
            />
          )}

          <TextInput
            style={[
              styles.input,
              fontRegular,
              {
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                borderColor: errors.email ? '#EF4444' : theme.colors.cardBorder,
              }
            ]}
            placeholder={t('auth.email')}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email && text) {
                setErrors({ ...errors, email: false });
              }
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor={theme.colors.textTertiary}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.passwordInput,
                fontRegular,
                {
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: errors.password ? '#EF4444' : theme.colors.cardBorder,
                  paddingLeft: isRTL ? 16 :  50,
                  paddingRight: isRTL ? 50  : 16,
                  textAlign: isRTL ? 'right' : 'left',
                }
              ]}
              placeholder={t('auth.password')}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password && text) {
                  setErrors({ ...errors, password: false });
                }
              }}
              secureTextEntry={!showPassword}
              placeholderTextColor={theme.colors.textTertiary}
            />
            <TouchableOpacity
              style={[styles.eyeIcon, isRTL ? styles.eyeIconRight : styles.eyeIconLeft]}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} color={theme.colors.textSecondary} strokeWidth={2} />
              ) : (
                <Eye size={20} color={theme.colors.textSecondary} strokeWidth={2} />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }, loading && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            <Text style={[styles.buttonText, fontBold, { color: theme.colors.background }]}>
              {loading ? t('common.loading') : isSignUp ? t('auth.signUp') : t('auth.signIn')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsSignUp(!isSignUp)}
          >
            <Text style={[styles.switchButtonText, fontRegular, { color: theme.colors.primary }]}>
              {isSignUp
                ? t('auth.alreadyHaveAccount')
                : t('auth.noAccount')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  input: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  passwordInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  eyeIcon: {
    position: 'absolute',
    top: 16,
    padding: 4,
  },
  eyeIconRight: {
    right: 16,
  },
  eyeIconLeft: {
    left: 16,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
  },
  switchButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  switchButtonText: {
    fontSize: 14,
  },
});
