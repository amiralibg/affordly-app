import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { User, ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { TEXT } from '@/constants/text';

export default function AppHeader() {
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  // Determine which screen we're on
  const getScreenInfo = () => {
    if (pathname === '/wishlist') {
      return {
        title: TEXT.wishlist.title,
        subtitle: TEXT.wishlist.subtitle,
      };
    } else if (pathname === '/history') {
      return {
        title: TEXT.history.title,
        subtitle: TEXT.history.subtitle,
      };
    } else if (pathname === '/profile') {
      return {
        title: TEXT.profile.title,
        subtitle: TEXT.profile.subtitle,
      };
    } else {
      // Default to calculate screen
      return {
        title: TEXT.calculate.title,
        subtitle: TEXT.calculate.subtitle,
      };
    }
  };

  const screenInfo = getScreenInfo();
  const isProfileScreen = pathname === '/profile';

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.colors.backgroundSecondary,
        },
        theme.shadows.small,
      ]}
    >
      <View style={styles.headerContent}>
        <View style={styles.titleContainer}>
          {isProfileScreen && (
            <TouchableOpacity
              style={[
                styles.backButton,
                {
                  backgroundColor: theme.colors.primary + '15',
                },
              ]}
              onPress={() => router.back()}
            >
              <ChevronLeft size={24} color={theme.colors.primary} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
          {!isProfileScreen && (
            <TouchableOpacity
              style={[
                styles.profileButton,
                {
                  backgroundColor: theme.colors.primary + '15',
                },
              ]}
              onPress={() => router.push('/profile')}
            >
              <User size={22} color={theme.colors.primary} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
          <Text style={[styles.title, styles.fontBold, { color: theme.colors.text }]}>
            {screenInfo.title}
          </Text>
          {screenInfo.subtitle && (
            <Text
              style={[styles.subtitle, styles.fontRegular, { color: theme.colors.textSecondary }]}
            >
              {screenInfo.subtitle}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginRight: 12,
    width: 48,
  },
  fontBold: {
    fontFamily: 'Vazirmatn_700Bold',
  },
  fontRegular: {
    fontFamily: 'Vazirmatn_400Regular',
  },
  header: {
    paddingBottom: 24,
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  headerContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profileButton: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
    textAlign: 'right',
  },
  title: {
    fontSize: 34,
    marginBottom: 4,
    textAlign: 'right',
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
});
