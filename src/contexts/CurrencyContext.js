import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

const currencies = {
  USD: {
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
  },
  EUR: {
    symbol: '€',
    name: 'Euro',
    locale: 'de-DE',
  },
  GBP: {
    symbol: '£',
    name: 'British Pound',
    locale: 'en-GB',
  },
  AED: {
    symbol: 'د.إ',
    name: 'UAE Dirham',
    locale: 'ar-AE',
  },
  SAR: {
    symbol: 'ر.س',
    name: 'Saudi Riyal',
    locale: 'ar-SA',
  },
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    const savedCurrency = localStorage.getItem('currency');
    return savedCurrency || 'USD';
  });

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const formatCurrency = (amount) => {
    const { locale, symbol } = currencies[currency];
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol',
    }).format(amount);
  };

  const parseCurrency = (value) => {
    if (!value) return 0;
    const { locale } = currencies[currency];
    const numberFormat = new Intl.NumberFormat(locale);
    return numberFormat.format(value);
  };

  const value = {
    currency,
    setCurrency,
    formatCurrency,
    parseCurrency,
    currencies,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}; 