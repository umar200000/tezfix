import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { Car, Wrench, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

const slides = [
  {
    icon: Car,
    title: 'TezFix',
    subtitle: 'Avtomobilingizga eng mos\nustaxonalarni bir joyda toping',
    bg: 'bg-primary-500',
    glow: 'bg-primary-500/20',
  },
  {
    icon: Sparkles,
    title: 'Tezkor va oson',
    subtitle: 'Kerakli xizmatni tanlang,\nusta bilan bir tugmada bog\'laning',
    bg: 'bg-primary-600',
    glow: 'bg-primary-500/20',
  },
  {
    icon: ShieldCheck,
    title: 'Ishonchli xizmat',
    subtitle: 'Tekshirilgan ustalar, haqiqiy\nbaholar va shaffof narxlar',
    bg: 'bg-primary-700',
    glow: 'bg-mint-500/20',
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [showRole, setShowRole] = useState(false);
  const { setOnboarded } = useStore();
  const isLast = step === slides.length - 1;
  const current = slides[step];
  const Icon = current.icon;

  const handleNext = () => {
    if (isLast) setShowRole(true);
    else setStep(step + 1);
  };

  const handleRoleSelect = (role: 'master' | 'client') => {
    localStorage.setItem('tezfix-role', role);
    setOnboarded(true);
  };

  if (showRole) {
    return (
      <div className="min-h-screen flex flex-col safe-top">
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-20 h-20 rounded-ios-xl bg-primary-500 flex items-center justify-center mb-6 shadow-ios-elevated">
            <Sparkles className="w-10 h-10 text-white" strokeWidth={2.2} />
          </div>
          <h1 className="text-ios-title-1 text-primary-700 text-center mb-2">Kim siz?</h1>
          <p className="text-ios-callout text-surface-600 text-center mb-10 max-w-xs">
            Davom etish uchun rolingizni tanlang
          </p>

          <div className="w-full max-w-sm space-y-3">
            <button
              onClick={() => handleRoleSelect('client')}
              className="w-full bg-white rounded-ios-lg p-5 flex items-center gap-4 shadow-ios-card active:scale-[0.98] transition-all"
            >
              <div className="w-12 h-12 rounded-ios-lg bg-primary-50 flex items-center justify-center">
                <Car className="w-6 h-6 text-primary-500" strokeWidth={2} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-ios-headline text-primary-700">Men mijozman</p>
                <p className="text-ios-footnote text-surface-600 mt-0.5">Xizmat qidiraman</p>
              </div>
              <ArrowRight className="w-5 h-5 text-surface-400" />
            </button>

            <button
              onClick={() => handleRoleSelect('master')}
              className="w-full bg-white rounded-ios-lg p-5 flex items-center gap-4 shadow-ios-card active:scale-[0.98] transition-all"
            >
              <div className="w-12 h-12 rounded-ios-lg bg-mint-100 flex items-center justify-center">
                <Wrench className="w-6 h-6 text-mint-600" strokeWidth={2} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-ios-headline text-primary-700">Men ustaman</p>
                <p className="text-ios-footnote text-surface-600 mt-0.5">Xizmat ko'rsataman</p>
              </div>
              <ArrowRight className="w-5 h-5 text-surface-400" />
            </button>
          </div>
        </div>
        <div className="pb-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden safe-top relative">
      {/* Skip */}
      <div className="flex justify-end px-5 pt-4">
        <button
          onClick={() => setShowRole(true)}
          className="text-ios-subhead text-surface-600 font-medium px-3 py-1"
        >
          O'tkazib yuborish
        </button>
      </div>

      {/* Animated hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
        <div className={`absolute w-[380px] h-[380px] rounded-full blur-3xl opacity-60 ${current.glow} transition-all duration-700`} />

        <div
          key={step}
          className={`relative w-40 h-40 rounded-ios-2xl ${current.bg} flex items-center justify-center shadow-ios-elevated mb-10 animate-ios-bounce`}
        >
          <Icon className="w-20 h-20 text-white" strokeWidth={2} />
        </div>

        <h1 key={`t-${step}`} className="text-ios-title-1 text-primary-700 text-center mb-3 animate-fade-up">
          {current.title}
        </h1>
        <p
          key={`s-${step}`}
          className="text-ios-body text-surface-600 text-center whitespace-pre-line max-w-xs animate-fade-up"
        >
          {current.subtitle}
        </p>
      </div>

      {/* Footer */}
      <div className="px-6 pb-10 space-y-6">
        <div className="flex justify-center gap-1.5">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-7 bg-primary-500' : 'w-1.5 bg-surface-300'
              }`}
            />
          ))}
        </div>
        <button onClick={handleNext} className="ios-btn-primary w-full">
          {isLast ? 'Boshlash' : 'Keyingisi'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
