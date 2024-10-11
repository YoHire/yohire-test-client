/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/david-ui-angular/**/*.{html,ts,js,mjs}",
  ],
  theme: {
    extend: {
      spacing: {
        '73': '18.1rem',
        '74': '19.2rem',
        '22': '5.5rem',
      },
      fontSize: {
        'xxs': '0.6rem',
      },
      fontFamily: {
        sans: ["Open Sans", "Work Sans", "sans-serif", "Roboto"],
      },
      colors: {
        circleYellow: '#e68f05',
      },

      keyframes: {
        float: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-100%)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInDelay: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 1s ease-in-out',
        'slide-down': 'slide-down 1s ease-in-out',
        'fade-in': 'fade-in 1s ease-in-out',
        float: 'float 3s ease-in-out infinite',
        fadeIn: 'fadeIn 1s ease-in-out forwards',
        fadeInDelay: 'fadeInDelay 1s ease-in-out forwards',
      },
    },
    plugins: [],
  },
};
