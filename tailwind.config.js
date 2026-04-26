/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        // 移动端断点 (768px 以下为移动端布局)
        'md': '768px',
      },
      height: {
        'titlebar': '32px',
        'statusbar': '24px',
      },
      minHeight: {
        'titlebar': '32px',
        'statusbar': '24px',
      },
      maxHeight: {
        'titlebar': '32px',
        'statusbar': '24px',
      },
      colors: {
        'titlebar': {
          light: '#ffffff',
          dark: '#1e1e1e',
        },
        'statusbar': {
          light: '#f3f3f3',
          dark: '#252526',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}