
'use client';

import * as React from 'react';
import { useToast } from '@/hooks/use-toast';
import en from '@/locales/en.json';
import es from '@/locales/es.json';

type Locale = 'en' | 'es';

const translations = { en, es };

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = React.useState<Locale>('en');
  const { toast } = useToast();

  const setAndStoreLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    try {
      localStorage.setItem('locale', newLocale);
    } catch (error) {
      console.warn('Could not save locale to localStorage', error);
    }
  };

  React.useEffect(() => {
    try {
      const storedLocale = localStorage.getItem('locale') as Locale | null;
      if (storedLocale && (storedLocale === 'en' || storedLocale === 'es')) {
        setLocale(storedLocale);
      }
    } catch (error) {
      console.warn('Could not read locale from localStorage', error);
    }
  }, []);

  const t = (key: string): string => {
    const keys = key.split('.');
    let result: any = translations[locale];
    for (const k of keys) {
        result = result?.[k];
        if (result === undefined) {
            // Fallback to English if translation is missing
            let fallbackResult: any = translations['en'];
            for (const fk of keys) {
                fallbackResult = fallbackResult?.[fk];
                if(fallbackResult === undefined) return key;
            }
            return fallbackResult;
        }
    }
    return result || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale: setAndStoreLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = React.useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
