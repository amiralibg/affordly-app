import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { useTheme } from '@/contexts/ThemeContext';

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#10B981',
        backgroundColor: '#065F46',
        borderRadius: 12,
        height: 60,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '600',
        color: '#ECFDF5',
        fontFamily: 'Vazirmatn_700Bold',
      }}
      text2Style={{
        fontSize: 13,
        color: '#D1FAE5',
        fontFamily: 'Vazirmatn_400Regular',
      }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: '#EF4444',
        backgroundColor: '#7F1D1D',
        borderRadius: 12,
        height: 60,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '600',
        color: '#FEE2E2',
        fontFamily: 'Vazirmatn_700Bold',
      }}
      text2Style={{
        fontSize: 13,
        color: '#FECACA',
        fontFamily: 'Vazirmatn_400Regular',
      }}
    />
  ),
  info: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#3B82F6',
        backgroundColor: '#1E3A8A',
        borderRadius: 12,
        height: 60,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '600',
        color: '#DBEAFE',
        fontFamily: 'Vazirmatn_700Bold',
      }}
      text2Style={{
        fontSize: 13,
        color: '#BFDBFE',
        fontFamily: 'Vazirmatn_400Regular',
      }}
    />
  ),
};

// Helper function to show toast notifications
export const showToast = {
  success: (title: string, message?: string) => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 3000,
      topOffset: 60,
    });
  },
  error: (title: string, message?: string) => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 4000,
      topOffset: 60,
    });
  },
  info: (title: string, message?: string) => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 3000,
      topOffset: 60,
    });
  },
};
