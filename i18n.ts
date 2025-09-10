import React, { useState, createContext, useContext, useMemo } from 'react';
import zh from './translations.zh.ts';
import en from './translations.en.ts';

export const translations = {
  zh,
  en,
};

export type Language = keyof typeof translations;

// FIX: Export Translations type for broader use.
export type Translations = typeof zh;
// FIX: Export TranslationKey type for type casting and checking.
export type TranslationKey = keyof Translations;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, replacements?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('zh');

  const t = useMemo((): I18nContextType['t'] => {
    const currentTranslations: Record<string, string> = translations[language];
    
    return (key: TranslationKey, replacements?: Record<string, string | number>): string => {
        // FIX: Resolve multiple TypeScript errors by ensuring `translation` is always a string.
        // `key` is cast to a string for indexing, and the fallback value is converted to a string.
        let translation = currentTranslations[key as string] || String(key);
        if (replacements) {
            Object.keys(replacements).forEach(rKey => {
                translation = translation.replace(`{${rKey}}`, String(replacements[rKey]));
            });
        }
        return translation;
    };
  }, [language]);


  const value = {
    language,
    setLanguage,
    t,
  };

  // FIX: Replaced JSX with React.createElement because JSX is not supported in .ts files.
  return React.createElement(I18nContext.Provider, { value: value }, children);
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};