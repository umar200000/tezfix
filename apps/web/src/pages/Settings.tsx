import { useNavigate } from 'react-router-dom';
import { useStore, type Lang } from '../hooks/useStore';
import { useT } from '../utils/i18n';
import { ChevronLeft, Check } from 'lucide-react';

const langs: { code: Lang; nativeKey: string; flag: string }[] = [
  { code: 'uz', nativeKey: 'lang.uz', flag: '🇺🇿' },
  { code: 'en', nativeKey: 'lang.en', flag: '🇬🇧' },
  { code: 'ru', nativeKey: 'lang.ru', flag: '🇷🇺' },
];

export default function Settings() {
  const navigate = useNavigate();
  const { language, setLanguage } = useStore();
  const t = useT();

  return (
    <div className="min-h-screen pb-24">
      <div className="ios-nav-bar">
        <div className="flex items-center justify-between h-12 px-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-0.5 text-primary-500 pl-1 active:opacity-60 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2.4} />
            <span className="text-ios-body">{t('common.back')}</span>
          </button>
          <h1 className="text-ios-headline text-primary-700">{t('lang.title')}</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="px-4 pt-4 space-y-2">
        <div className="ios-group">
          {langs.map((l, idx) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`w-full flex items-center gap-3 px-4 py-4 active:bg-surface-150 transition-colors ${
                idx > 0 ? 'border-t border-separator ml-0' : ''
              }`}
            >
              <span className="text-2xl">{l.flag}</span>
              <span className="flex-1 text-left text-ios-body text-surface-900 font-medium">
                {t(l.nativeKey)}
              </span>
              {language === l.code && (
                <Check className="w-5 h-5 text-primary-500" strokeWidth={2.6} />
              )}
            </button>
          ))}
        </div>

        <p className="text-ios-caption text-surface-500 px-2 pt-2">
          {language === 'uz'
            ? "Ilova interfeysi tilini o'zgartirish"
            : language === 'en'
            ? 'Change the app interface language'
            : 'Изменить язык интерфейса'}
        </p>
      </div>
    </div>
  );
}
