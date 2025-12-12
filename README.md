# Ganjino (گنجینو)

<div align="center">

**A full-stack savings goal tracker mobile app**

[![Expo](https://img.shields.io/badge/Expo-54.0-000020?style=flat&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=flat&logo=react&logoColor=white)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

## 📱 Overview

Ganjino helps users achieve their savings goals by:
- 💰 Calculating how long it takes to save for desired items
- 🎯 Tracking savings progress for multiple products
- ⭐ Managing a wishlist of products
- 📊 Visualizing savings history and progress
- 🌙 Supporting both light and dark themes

## ✨ Features

- **Smart Savings Calculator**: Enter your monthly salary and product price to see how long it takes to save
- **Product Wishlist**: Add products to your wishlist and track them over time
- **Savings Tracking**: Monitor your progress with visual charts and statistics
- **User Profile Management**: Set your monthly salary and manage account settings
- **Offline Support**: Continue using the app even without internet connection
- **Persian Language Support**: Fully localized for Persian speakers with Vazirmatn font
- **Cross-Platform**: Works on iOS, Android, and Web

## 🛠 Tech Stack

### Frontend
- **Framework**: React Native 0.81 with Expo SDK 54
- **Language**: TypeScript 5.9
- **Routing**: Expo Router (file-based routing)
- **State Management**:
  - React Query (TanStack Query) for server state
  - Zustand for client state
- **UI Components**: Custom components with Lucide React Native icons
- **Charts**: React Native Gifted Charts
- **Styling**: React Native StyleSheet with custom theme system
- **Fonts**: Vazirmatn (Persian), Poppins (English)

### Key Libraries
- `axios` - HTTP client
- `@react-native-async-storage/async-storage` - Persistent storage
- `react-native-gesture-handler` - Touch gestures
- `react-native-reanimated` - Smooth animations
- `expo-haptics` - Haptic feedback
- `react-native-toast-message` - Toast notifications

## 📂 Project Structure

```
ganjino/
├── app/                      # Expo Router screens
│   ├── (auth)/              # Authentication screens
│   │   ├── index.tsx        # Sign in/Sign up screen
│   │   └── _layout.tsx      # Auth layout
│   ├── (tabs)/              # Main app tabs (protected)
│   │   ├── index.tsx        # Calculate screen
│   │   ├── wishlist.tsx     # Wishlist screen
│   │   ├── savings.tsx      # Savings tracking screen
│   │   ├── profile.tsx      # Profile screen
│   │   └── _layout.tsx      # Tab bar layout
│   ├── _layout.tsx          # Root layout with auth check
│   └── +not-found.tsx       # 404 screen
├── components/              # Reusable UI components
│   ├── ui/                  # Base UI components
│   └── icons/               # Custom icon components
├── lib/                     # Core application logic
│   ├── api/                 # API client and endpoints
│   │   ├── client.ts        # Axios instance with interceptors
│   │   ├── auth.ts          # Authentication API
│   │   ├── products.ts      # Products API
│   │   └── profile.ts       # Profile API
│   ├── hooks/               # React Query custom hooks
│   │   ├── useAuth.ts       # Auth queries and mutations
│   │   ├── useProducts.ts   # Products queries and mutations
│   │   └── useProfile.ts    # Profile queries and mutations
│   └── utils/               # Utility functions
├── store/                   # Zustand stores
│   └── useAuthStore.ts      # Authentication state
├── contexts/                # React contexts
│   └── ThemeContext.tsx     # Theme provider
├── constants/               # App constants
│   └── text.ts              # Localized strings
├── styles/                  # Global styles
├── assets/                  # Static assets
│   ├── icons/               # App icons
│   └── images/              # Images
├── hooks/                   # Custom React hooks
├── utils/                   # Utility functions
├── android/                 # Android native code
├── ios/                     # iOS native code
└── app.json                 # Expo configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode (macOS only) or iOS Simulator
- Android: Android Studio or Android Emulator
- Backend server running (see [backend documentation](../ganjino-backend/README.md))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ganjino
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Configure API URL:

Edit [lib/api/client.ts](lib/api/client.ts) with your backend URL:

```typescript
// For iOS Simulator
const API_URL = 'http://localhost:3000/api';

// For Android Emulator
const API_URL = 'http://10.0.2.2:3000/api';

// For Physical Device (use your computer's IP)
const API_URL = 'http://192.168.1.x:3000/api';
```

4. Start the development server:
```bash
npm run dev
```

5. Run on your preferred platform:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app for physical device

## 📜 Available Scripts

### Development
```bash
npm run dev                    # Start Expo dev server
npm run dev:production         # Start with production optimizations
```

### Code Quality
```bash
npm run typecheck              # Run TypeScript type checking
npm run lint                   # Run ESLint
npm run lint:fix               # Fix ESLint errors automatically
npm run format                 # Format code with Prettier
npm run format:check           # Check code formatting
```

### Platform Specific
```bash
npm run ios                    # Run on iOS (requires Xcode)
npm run android                # Run on Android (requires Android Studio)
```

## 🏗 Architecture

### State Management Pattern

Ganjino uses a **dual state management** approach:

#### 1. Server State (React Query)
All API data fetching and mutations are handled by React Query:
- Custom hooks in [lib/hooks/](lib/hooks/) (`useAuth`, `useProducts`, `useProfile`)
- Centralized query client in [lib/queryClient.ts](lib/queryClient.ts)
- Automatic cache invalidation on mutations
- Background refetching and optimistic updates

#### 2. Client State (Zustand)
Authentication state only:
- [store/useAuthStore.ts](store/useAuthStore.ts) manages auth state
- Syncs with AsyncStorage for token persistence
- Minimal client state for better performance

### API Client Architecture

The API client is built with axios and includes:
- **Base client** ([lib/api/client.ts](lib/api/client.ts)): Configured axios instance
- **Request interceptor**: Auto-injects JWT from AsyncStorage
- **Response interceptor**: Handles 401 errors and token cleanup
- **API modules**: Typed functions for auth, products, and profile

### Routing (Expo Router)

File-based routing with route groups:
- `app/(auth)/` - Authentication screens (unauthenticated users)
- `app/(tabs)/` - Main app tabs (requires authentication)
- `app/_layout.tsx` - Root layout with auth check

### Authentication Flow

1. User signs up/in → Backend returns JWT token
2. Frontend stores token in AsyncStorage
3. `apiClient` auto-includes token in Authorization header
4. Backend middleware verifies token and attaches `userId` to request
5. On 401 response, frontend clears token and redirects to auth

## 🎨 Theming

Ganjino supports automatic light/dark theme switching based on system preferences:

- Theme context in [contexts/ThemeContext.tsx](contexts/ThemeContext.tsx)
- Custom theme hook: `useTheme()`
- Smooth theme transitions
- Separate icons and colors for each theme

## 🔐 Security

- JWT tokens stored securely in AsyncStorage
- Automatic token injection in API requests
- Token cleanup on authentication errors
- No sensitive data in client-side code

## 📱 Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
| iOS | ✅ Supported | iOS 13+ |
| Android | ✅ Supported | Android 5.0+ (API 21+) |
| Web | ✅ Supported | Modern browsers |

## 🧪 Testing

### Test Account Creation
1. Start the backend server
2. Launch the app
3. Navigate to the auth screen
4. Create a new account
5. Set your monthly salary in the Profile tab
6. Start adding products in the Calculate tab

## 🐛 Troubleshooting

### Common Issues

**Metro bundler issues:**
```bash
# Clear Metro cache
npx expo start -c
```

**iOS build issues:**
```bash
cd ios && pod install && cd ..
npx expo run:ios
```

**Android build issues:**
```bash
cd android && ./gradlew clean && cd ..
npx expo run:android
```

**API connection issues:**
- Verify backend server is running
- Check API_URL in [lib/api/client.ts](lib/api/client.ts)
- For physical devices, use your computer's IP address
- Ensure devices are on the same WiFi network

## 📦 Building for Production

### iOS
```bash
# Development build
eas build --platform ios --profile development

# Production build
eas build --platform ios --profile production
```

### Android
```bash
# Development build
eas build --platform android --profile development

# Production build (APK)
eas build --platform android --profile production

# Production build (AAB for Google Play)
eas build --platform android --profile production --android-build-type app-bundle
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- Follow the existing code style
- Run `npm run lint` before committing
- Format code with Prettier: `npm run format`
- Ensure TypeScript types are correct: `npm run typecheck`

## 📄 License

This project is private and proprietary.

## 👨‍💻 Author

**Amirali Bigdeli**
- GitHub: [@amiralibgi](https://github.com/amiralibgi)
- Expo: [@amiralibgi](https://expo.dev/@amiralibgi)

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) - Universal React Native platform
- [React Navigation](https://reactnavigation.org/) - Routing and navigation
- [TanStack Query](https://tanstack.com/query) - Powerful data synchronization
- [Zustand](https://github.com/pmndrs/zustand) - Minimal state management
- [Lucide](https://lucide.dev/) - Beautiful icon system
- [Vazirmatn](https://github.com/rastikerdar/vazirmatn) - Persian font

## 📞 Support

For backend documentation, see [ganjino-backend README](../ganjino-backend/README.md).

For issues and questions:
- Create an issue in the repository
- Contact the development team

---

<div align="center">
Made with ❤️ in Iran
</div>
