import { useNavigate } from 'react-router-dom';
import { useT } from '../utils/i18n';
import { ChevronLeft, Sparkles } from 'lucide-react';

export default function Placeholder({ titleKey }: { titleKey: string }) {
  const navigate = useNavigate();
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
          <h1 className="text-ios-headline text-primary-700">{t(titleKey)}</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="relative w-24 h-24 mb-5">
          <div className="absolute inset-0 bg-primary-500/15 rounded-full blur-2xl" />
          <div className="relative w-24 h-24 bg-white rounded-full shadow-ios-card flex items-center justify-center">
            <Sparkles className="w-11 h-11 text-primary-500" strokeWidth={1.8} />
          </div>
        </div>
        <h2 className="text-ios-title-3 text-surface-900 mb-2">{t('soon.title')}</h2>
        <p className="text-ios-subhead text-surface-600 max-w-xs">{t('soon.body')}</p>
      </div>
    </div>
  );
}
