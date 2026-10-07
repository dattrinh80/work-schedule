/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F8F9FC',
        surface: '#FFFFFF',
        'surface-subtle': '#F7F8FA',
        'border-default': '#E4E7EC',
        'border-subtle': '#EAECF0',
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
      },
      borderRadius: {
        card: '12px',
        modal: '16px',
        control: '10px',
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(16, 24, 40, 0.05)',
        card: '0 1px 3px 0 rgba(16, 24, 40, 0.06), 0 1px 2px -1px rgba(16, 24, 40, 0.06)',
        dropdown: '0 4px 6px -2px rgba(16, 24, 40, 0.05), 0 10px 15px -3px rgba(16, 24, 40, 0.1)',
        modal: '0 20px 25px -5px rgba(16, 24, 40, 0.1), 0 8px 10px -6px rgba(16, 24, 40, 0.1)',
      },
    },
  },
  plugins: [],
};
