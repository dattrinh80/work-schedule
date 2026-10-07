/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F5FAFB',
        surface: '#FFFFFF',
        'surface-secondary': '#F7FAFC',
        'surface-subtle': '#EFFBFC',
        'border-default': '#DCE7EA',
        'border-subtle': '#EAF1F3',
        text: {
          primary: '#102A43',
          secondary: '#52667A',
          muted: '#8796A5',
        },
        aqua: {
          primary: '#0797A8',
          hover: '#087F8D',
          active: '#076D79',
          secondary: '#42C8D5',
          soft: '#DDF7FA',
          'soft-2': '#EFFBFC',
          dark: '#073B4C',
          focus: '#19B5C5',
        },
        brand: {
          50: '#EFFBFC',
          100: '#DDF7FA',
          200: '#B9EEF4',
          500: '#42C8D5',
          600: '#0797A8',
          700: '#087F8D',
          800: '#076D79',
          900: '#073B4C',
        },
      },
      borderRadius: {
        small: '6px',
        control: '8px',
        card: '12px',
        panel: '14px',
        modal: '14px',
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(7, 59, 76, 0.04)',
        card: '0 1px 3px 0 rgba(7, 59, 76, 0.05), 0 1px 2px -1px rgba(7, 59, 76, 0.05)',
        dropdown: '0 4px 6px -2px rgba(7, 59, 76, 0.05), 0 10px 15px -3px rgba(7, 59, 76, 0.08)',
        modal: '0 20px 25px -5px rgba(7, 59, 76, 0.1), 0 8px 10px -6px rgba(7, 59, 76, 0.08)',
      },
    },
  },
  plugins: [],
};
