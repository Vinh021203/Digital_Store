'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 text-slate-500 hover:text-orange-600 p-1.5 transition-colors rounded-lg hover:bg-orange-50"
      title={i18n.language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
    >
      <Globe size={18} />
      <span className="text-xs font-bold uppercase">{i18n.language === 'vi' ? 'VN' : 'EN'}</span>
    </button>
  );
};

export default LanguageSwitcher;

