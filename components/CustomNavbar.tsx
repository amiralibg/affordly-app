import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Calculator, Heart, User } from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { BlurView } from 'expo-blur';

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const CustomNavBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { theme } = useTheme();

  const dynamicStyles = StyleSheet.create({
    container: {
      position: 'absolute',
      width: '70%',
      alignSelf: 'center',
      bottom: 24,
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
      backgroundColor: `${theme.colors.backgroundTertiary}BF`,
      borderRadius: 24,
    },
    text: {
      color: theme.colors.primary,
      marginLeft: 8,
      fontWeight: '600',
      fontSize: 13,
    },
  });

  const getIconByRouteName = (routeName: string, color: string) => {
    switch (routeName) {
      case 'index':
        return <Calculator size={18} color={color} strokeWidth={2} />;
      case 'wishlist':
        return <Heart size={18} color={color} strokeWidth={2} />;
      case 'profile':
        return <User size={18} color={color} strokeWidth={2} />;
      default:
        return <Calculator size={18} color={color} strokeWidth={2} />;
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

          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

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
                    ? theme.isDark
                      ? 'rgba(167, 139, 250, 0.25)'
                      : 'rgba(124, 58, 237, 0.15)'
                    : 'transparent',
                },
              ]}
            >
              {getIconByRouteName(
                route.name,
                isFocused
                  ? theme.colors.primary
                  : theme.isDark
                  ? theme.colors.textTertiary
                  : theme.colors.textSecondary
              )}
              {isFocused && (
                <Animated.Text
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(200)}
                  style={dynamicStyles.text}
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
  },
});

export default CustomNavBar;
