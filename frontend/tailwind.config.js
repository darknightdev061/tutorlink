/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Material UI palette — Indigo as brand
        brand: {
          50:  '#e8eaf6', 100: '#c5cae9', 200: '#9fa8da',
          300: '#7986cb', 400: '#5c6bc0', 500: '#3f51b5',
          600: '#3949ab', 700: '#303f9f', 800: '#283593', 900: '#1a237e'
        },
        // Material UI Pink — secondary
        candy: {
          50:  '#fce4ec', 100: '#f8bbd0', 200: '#f48fb1',
          300: '#f06292', 400: '#ec407a', 500: '#e91e63',
          600: '#d81b60', 700: '#c2185b', 800: '#ad1457', 900: '#880e4f'
        },
        // Material UI Amber — sunshine accent for kids
        sunny: {
          50:  '#fff8e1', 100: '#ffecb3', 200: '#ffe082',
          300: '#ffd54f', 400: '#ffca28', 500: '#ffc107',
          600: '#ffb300', 700: '#ffa000', 800: '#ff8f00', 900: '#ff6f00'
        },
        // Material UI Teal — success / safe
        mint: {
          50:  '#e0f2f1', 100: '#b2dfdb', 200: '#80cbc4',
          300: '#4db6ac', 400: '#26a69a', 500: '#009688',
          600: '#00897b', 700: '#00796b', 800: '#00695c', 900: '#004d40'
        },
        // Material UI Deep Orange — playful pop
        coral: {
          50:  '#fbe9e7', 100: '#ffccbc', 200: '#ffab91',
          300: '#ff8a65', 400: '#ff7043', 500: '#ff5722',
          600: '#f4511e', 700: '#e64a19', 800: '#d84315', 900: '#bf360c'
        },
        // Material UI Deep Purple
        grape: {
          50:  '#ede7f6', 100: '#d1c4e9', 200: '#b39ddb',
          300: '#9575cd', 400: '#7e57c2', 500: '#673ab7',
          600: '#5e35b1', 700: '#512da8', 800: '#4527a0', 900: '#311b92'
        }
      },
      fontFamily: {
        sans: ['Nunito', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Fredoka"', 'Nunito', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        playful: '0 10px 30px -8px rgba(63, 81, 181, .35)',
        candy:   '0 10px 30px -8px rgba(233, 30, 99, .35)',
        sunny:   '0 10px 30px -8px rgba(255, 193, 7, .45)',
        mint:    '0 10px 30px -8px rgba(0, 150, 136, .35)'
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
