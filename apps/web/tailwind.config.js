/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand — deep navy slate (screenshot match)
        primary: {
          50:  '#EBF0F4',
          100: '#D2DCE5',
          200: '#A5B9C9',
          300: '#7896AE',
          400: '#4B7592',
          500: '#1F3A52',  // main
          600: '#182F42',
          700: '#122432',
          800: '#0C1A24',
          900: '#060F16',
        },
        // Neutrals — cool warm gray
        surface: {
          50:  '#FFFFFF',
          100: '#F8F9FB',
          150: '#F1F3F6',  // main app background
          200: '#E4E7ED',
          300: '#D0D5DE',
          400: '#AEB4BF',
          500: '#858C99',
          600: '#646B78',
          700: '#464D59',
          800: '#2A303A',
          900: '#121620',
        },
        separator: '#D8DCE3',
        // Mint accent for success (screenshot UzCard pill)
        mint: {
          50:  '#E8F7EF',
          100: '#CDEFDD',
          200: '#A6E4C2',
          500: '#3DAE75',
          600: '#2A8A5A',
          700: '#1E6643',
        },
        success: {
          50:  '#E8F7EF',
          500: '#2A8A5A',
          600: '#1E6643',
        },
        danger: {
          50:  '#FDECEC',
          500: '#D93A39',
          600: '#A82A29',
        },
        warn: {
          50:  '#FEF3E0',
          500: '#D98B2B',
          600: '#A66820',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Inter"',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        'ios-lg-title': ['30px', { lineHeight: '36px', letterSpacing: '-0.3px', fontWeight: '700' }],
        'ios-title-1': ['26px', { lineHeight: '32px', letterSpacing: '-0.3px', fontWeight: '700' }],
        'ios-title-2': ['22px', { lineHeight: '28px', letterSpacing: '-0.3px', fontWeight: '700' }],
        'ios-title-3': ['19px', { lineHeight: '24px', letterSpacing: '-0.2px', fontWeight: '600' }],
        'ios-headline': ['16px', { lineHeight: '21px', letterSpacing: '-0.2px', fontWeight: '600' }],
        'ios-body': ['16px', { lineHeight: '21px', letterSpacing: '-0.2px', fontWeight: '400' }],
        'ios-callout': ['15px', { lineHeight: '20px', letterSpacing: '-0.2px', fontWeight: '400' }],
        'ios-subhead': ['14px', { lineHeight: '19px', letterSpacing: '-0.1px', fontWeight: '400' }],
        'ios-footnote': ['13px', { lineHeight: '17px', letterSpacing: '0px', fontWeight: '500' }],
        'ios-caption': ['12px', { lineHeight: '16px', letterSpacing: '0.1px', fontWeight: '500' }],
        'ios-caption-2': ['11px', { lineHeight: '13px', letterSpacing: '0.3px', fontWeight: '600' }],
      },
      borderRadius: {
        'ios': '10px',
        'ios-lg': '14px',
        'ios-xl': '18px',
        'ios-2xl': '22px',
        'ios-3xl': '28px',
      },
      boxShadow: {
        'ios-card': '0 1px 2px rgba(18,22,32,0.04), 0 0 0 1px rgba(18,22,32,0.04)',
        'ios-elevated': '0 10px 30px -10px rgba(18,22,32,0.20), 0 2px 6px rgba(18,22,32,0.06)',
        'ios-nav': '0 1px 0 rgba(18,22,32,0.06)',
        'ios-button': '0 1px 2px rgba(18,22,32,0.20), 0 6px 16px -4px rgba(31,58,82,0.25)',
        'ios-inset': 'inset 0 0 0 1px rgba(216,220,227,0.6)',
      },
      backdropBlur: {
        'ios': '22px',
      },
      animation: {
        'ios-bounce': 'iosBounce 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        'fade-up': 'fadeUp 0.4s ease-out',
        'shimmer': 'shimmer 1.6s linear infinite',
      },
      keyframes: {
        iosBounce: {
          '0%': { transform: 'scale(0.92)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
    },
  },
  plugins: [],
};
