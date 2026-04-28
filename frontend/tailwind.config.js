/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Material UI Blue — professional primary (MUI default primary.main = 1976d2)
        brand: {
          50:  '#e3f2fd', 100: '#bbdefb', 200: '#90caf9',
          300: '#64b5f6', 400: '#42a5f5', 500: '#2196f3',
          600: '#1e88e5', 700: '#1976d2', 800: '#1565c0', 900: '#0d47a1'
        },
        // Material UI Purple — refined secondary (MUI default secondary.main = 9c27b0)
        candy: {
          50:  '#f3e5f5', 100: '#e1bee7', 200: '#ce93d8',
          300: '#ba68c8', 400: '#ab47bc', 500: '#9c27b0',
          600: '#8e24aa', 700: '#7b1fa2', 800: '#6a1b9a', 900: '#4a148c'
        },
        // Material UI Amber — warning accent
        sunny: {
          50:  '#fff8e1', 100: '#ffecb3', 200: '#ffe082',
          300: '#ffd54f', 400: '#ffca28', 500: '#ffc107',
          600: '#ffb300', 700: '#ffa000', 800: '#ff8f00', 900: '#ff6f00'
        },
        // Material UI Green — success (MUI success.main = 2e7d32)
        mint: {
          50:  '#e8f5e9', 100: '#c8e6c9', 200: '#a5d6a7',
          300: '#81c784', 400: '#66bb6a', 500: '#4caf50',
          600: '#43a047', 700: '#388e3c', 800: '#2e7d32', 900: '#1b5e20'
        },
        // Material UI Orange — refined pop (less candy than Deep Orange)
        coral: {
          50:  '#fff3e0', 100: '#ffe0b2', 200: '#ffcc80',
          300: '#ffb74d', 400: '#ffa726', 500: '#ff9800',
          600: '#fb8c00', 700: '#f57c00', 800: '#ef6c00', 900: '#e65100'
        },
        // Material UI Indigo — supporting deep tone
        grape: {
          50:  '#e8eaf6', 100: '#c5cae9', 200: '#9fa8da',
          300: '#7986cb', 400: '#5c6bc0', 500: '#3f51b5',
          600: '#3949ab', 700: '#303f9f', 800: '#283593', 900: '#1a237e'
        }
      },
      fontFamily: {
        sans: ['Nunito', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Fredoka"', 'Nunito', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        playful: '0 10px 30px -8px rgba(25, 118, 210, .30)',
        candy:   '0 10px 30px -8px rgba(156, 39, 176, .30)',
        sunny:   '0 10px 30px -8px rgba(255, 160, 0, .35)',
        mint:    '0 10px 30px -8px rgba(46, 125, 50, .25)'
      },
      animation: {
        'fade-in':  'fadeIn .6s ease-out',
        'slide-up': 'slideUp .7s ease-out',
        'float':    'float 6s ease-in-out infinite',
        'wiggle':   'wiggle 2.4s ease-in-out infinite',
        'pop':      'pop .5s cubic-bezier(.68,-0.55,.27,1.55)',
        'spin-slow':'spin 14s linear infinite',
        'bounce-soft':'bounceSoft 2.6s ease-in-out infinite',
        'marquee':  'marquee 28s linear infinite',
        'ping-soft':'pingSoft 2s ease-out infinite'
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: 0 },
                   '100%': { transform: 'translateY(0)', opacity: 1 } },
        float:   { '0%,100%': { transform: 'translateY(0)' },
                   '50%':     { transform: 'translateY(-14px)' } },
        wiggle:  { '0%,100%': { transform: 'rotate(-3deg)' },
                   '50%':     { transform: 'rotate(3deg)' } },
        pop:     { '0%': { transform: 'scale(.6)', opacity: 0 },
                   '100%': { transform: 'scale(1)', opacity: 1 } },
        bounceSoft: { '0%,100%': { transform: 'translateY(0)' },
                      '50%': { transform: 'translateY(-8px)' } },
        marquee: { '0%': { transform: 'translateX(0)' },
                   '100%': { transform: 'translateX(-50%)' } },
        pingSoft:{ '0%': { transform: 'scale(1)', opacity: .8 },
                   '80%,100%': { transform: 'scale(2)', opacity: 0 } }
      },
      backgroundImage: {
        'dots': 'radial-gradient(rgba(63,81,181,.15) 1.2px, transparent 1.2px)',
        'grid': 'linear-gradient(rgba(63,81,181,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(63,81,181,.08) 1px, transparent 1px)'
      },
      backgroundSize: {
        'dots': '22px 22px',
        'grid': '40px 40px'
      }
    }
  },
  plugins: []
};
