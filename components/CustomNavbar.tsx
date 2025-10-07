import { View, TouchableOpacity, StyleSheet, Platform, Text } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Coins, Heart, Settings } from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';
import { useLocalizedFont } from '@/hooks/useLocalizedFont';

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const CustomNavBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const fontBold = useLocalizedFont('bold');

  const dynamicStyles = StyleSheet.create({
    container: {
      position: 'absolute',
      width: '70%',
      alignSelf: 'center',
      bottom: 42,
      borderRadius: 28,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    glowOuter: {
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 20,
        },
        android: {
          elevation: 12,
        },
      }),
    },
    innerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 14,
      backgroundColor: theme.isDark ? theme.colors.card + 'E6' : '#FFFFFFBF',
      borderRadius: 24,
    },
    text: {
      color: theme.colors.primary,
      marginRight: 8,
      fontWeight: '600',
      fontSize: 13,
    },
  });

  const getIconByRouteName = (routeName: string, color: string) => {
    switch (routeName) {
      case 'index':
        return <Coins size={18} color={color} strokeWidth={2} />;
      case 'wishlist':
        return <Heart size={18} color={color} strokeWidth={2} />;
      case 'profile':
        return <Settings size={18} color={color} strokeWidth={2} />;
      default:
        return <Coins size={18} color={color} strokeWidth={2} />;
    }
  };

  const getLabel = (routeName: string) => {
    switch (routeName) {
      case 'index':
        return t('navigation.calculate');
      case 'wishlist':
        return t('navigation.wishlist');
      case 'profile':
        return t('navigation.settings');
      default:
        return routeName;
    }
  };

  return (
    <View style={[dynamicStyles.container, dynamicStyles.glowOuter]}>
      <BlurView
        intensity={80}
        tint={theme.isDark ? 'dark' : 'light'}
        style={dynamicStyles.innerContainer}
      >
        {state.routes.map((route, index) => {
          if (['_sitemap', '+not-found'].includes(route.name)) return null;

          const label = getLabel(route.name);
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <AnimatedTouchableOpacity
              layout={LinearTransition.springify().mass(0.5)}
              key={route.key}
              onPress={onPress}
              style={[
                styles.tabItem,
                {
                  backgroundColor: isFocused
                    ? theme.colors.primary + '26'
                    : 'transparent',
                },
              ]}
            >
              {getIconByRouteName(
                route.name,
                isFocused ? theme.colors.primary : theme.colors.textSecondary
              )}
              {isFocused && (
                <Animated.Text
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(200)}
                  style={[dynamicStyles.text, fontBold]}
                >
                  {label as string}
                </Animated.Text>
              )}
            </AnimatedTouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  tabItem: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 24,
    marginHorizontal: 4,
    gap: 6,
  },
});

export default CustomNavBar;
