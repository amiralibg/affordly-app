import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CurrencyType = 'USD' | 'IRR';

interface CurrencyConfig {
  code: CurrencyType;
  symbol: string;
  name: string;
  nameFa: string;
}

export const CURRENCIES: Record<CurrencyType, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    nameFa: 'دلار آمریکا',
  },
  IRR: {
    code: 'IRR',
    symbol: '﷼',
    name: 'Iranian Toman',
    nameFa: 'تومان',
  },
};

interface CurrencyContextType {
  currency: CurrencyType;
  currencyConfig: CurrencyConfig;
  setCurrency: (currency: CurrencyType) => Promise<void>;
  formatAmount: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_STORAGE_KEY = '@affordly_currency';

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyType>('USD');

  useEffect(() => {
    loadCurrency();
  }, []);

  const loadCurrency = async () => {
    try {
      const savedCurrency = await AsyncStorage.getItem(CURRENCY_STORAGE_KEY);
      if (savedCurrency && (savedCurrency === 'USD' || savedCurrency === 'IRR')) {
        setCurrencyState(savedCurrency);
      }
    } catch (error) {
      console.error('Failed to load currency:', error);
    }
  };

  const setCurrency = async (newCurrency: CurrencyType) => {
    try {
      setCurrencyState(newCurrency);
      await AsyncStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
    } catch (error) {
      console.error('Failed to save currency:', error);
    }
  };

  const formatAmount = (amount: number): string => {
    const config = CURRENCIES[currency];

    if (currency === 'IRR') {
      // Format Persian numbers with Persian digits
      return amount.toLocaleString('fa-IR') + ' ' + config.symbol;
    } else {
      return config.symbol + amount.toLocaleString('en-US');
    }
  };

  const currencyConfig = CURRENCIES[currency];

  return (
    <CurrencyContext.Provider value={{ currency, currencyConfig, setCurrency, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
