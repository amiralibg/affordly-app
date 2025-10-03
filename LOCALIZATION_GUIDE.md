# Localization & Currency Guide

## Overview
The Affordly app now supports:
- **Languages**: English (en) and Persian/Farsi (fa)
- **Currencies**: US Dollar (USD) and Iranian Toman (IRR)
- **RTL Support**: Automatic right-to-left layout for Persian

## Setup

### 1. i18n Configuration
- **Library**: i18next + react-i18next + expo-localization
- **Config**: `/i18n/index.ts`
- **Translations**: `/i18n/locales/en.json` and `/i18n/locales/fa.json`

### 2. Currency System
- **Provider**: `CurrencyProvider` in `/contexts/CurrencyContext.tsx`
- **Supported**: USD ($) and IRR (﷼ Toman)
- **Formatting**: Automatic locale-based number formatting

### 3. RTL Support
- Automatically enables RTL when Persian is selected
- Uses React Native's `I18nManager`

## Usage

### Using Translations
```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

// Simple translation
<Text>{t('calculate.title')}</Text>

// With interpolation
<Text>{t('defaultAmount', { amount: 1000 })}</Text>
```

### Using Currency
```typescript
import { useCurrency } from '@/contexts/CurrencyContext';

const { currency, formatAmount } = useCurrency();

// Format amount
<Text>{formatAmount(1000)}</Text>
// USD: $1,000
// IRR: ۱,۰۰۰ ﷼
```

### Changing Language
```typescript
import { changeLanguage } from '@/i18n';

await changeLanguage('fa'); // Switch to Persian
await changeLanguage('en'); // Switch to English
```

### Changing Currency
```typescript
import { useCurrency } from '@/contexts/CurrencyContext';

const { setCurrency } = useCurrency();

await setCurrency('IRR'); // Switch to Toman
await setCurrency('USD'); // Switch to Dollar
```

## Translation Keys Structure

```
common.*          - Common words (save, cancel, etc.)
auth.*           - Authentication screens
calculate.*      - Calculate/Add product screen
wishlist.*       - Wishlist screen
profile.*        - Profile screen
time.*           - Time units (year, month, day, etc.)
```

## RTL Considerations

When Persian is selected:
1. Layout automatically flips to RTL
2. Text alignment changes
3. Icons and navigation reverse
4. Numbers display with Persian digits (۰-۹)

## Adding New Translations

1. Add key to `/i18n/locales/en.json`
2. Add Persian translation to `/i18n/locales/fa.json`
3. Use `t('your.key')` in components

## Persisting Preferences

- Language preference: Stored in AsyncStorage as `@affordly_language`
- Currency preference: Stored in AsyncStorage as `@affordly_currency`
- Both persist across app restarts
