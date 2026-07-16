'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'light' | 'dark';
}

const LanguageSwitcher = ({ variant = 'light' }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.resolvedLanguage || i18n.language || 'vi');

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => setLanguage(lng);
    i18n.on('languageChanged', handleLanguageChanged);
    setLanguage(i18n.resolvedLanguage || i18n.language || 'vi');

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const toggleLanguage = () => {
    const newLang = language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center gap-1.5 p-1.5 transition-colors rounded-lg ${
        variant === 'dark'
          ? 'text-slate-200 hover:bg-slate-800 hover:text-white'
          : 'text-slate-600 hover:bg-orange-50 hover:text-orange-700'
      }`}
      title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
      aria-label={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
    >
      <Globe size={18} />
      <span className="text-xs font-bold uppercase">{language === 'vi' ? 'VN' : 'EN'}</span>
    </button>
  );
};

export default LanguageSwitcher;
