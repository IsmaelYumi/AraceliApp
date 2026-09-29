/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Serenity Childcare Material Theme Tokens from Stitch (main_html.html)
        "primary": "#1c648e",
        "primary-container": "#7cb9e8",
        "on-primary": "#ffffff",
        "on-primary-container": "#00496d",
        "primary-fixed": "#cae6ff",
        "primary-fixed-dim": "#90cdfd",
        "on-primary-fixed": "#001e30",
        "on-primary-fixed-variant": "#004b70",
        
        "secondary": "#38693f",
        "secondary-container": "#b9f0ba",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#3e6f44",
        "secondary-fixed": "#b9f0ba",
        "secondary-fixed-dim": "#9ed4a0",
        "on-secondary-fixed": "#002108",
        "on-secondary-fixed-variant": "#1f5029",

        "tertiary": "#5f559a",
        "tertiary-container": "#b4a9f5",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#453b7f",
        "tertiary-fixed": "#e5deff",
        "tertiary-fixed-dim": "#c8bfff",
        "on-tertiary-fixed": "#1b0c53",
        "on-tertiary-fixed-variant": "#473d81",

        "surface": "#f7f9fb",
        "surface-dim": "#d8dadc",
        "surface-bright": "#f7f9fb",
        "surface-variant": "#e0e3e5",
        "on-surface-variant": "#41484e",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f2f4f6",
        "surface-container": "#eceef0",
        "surface-container-high": "#e6e8ea",
        "surface-container-highest": "#e0e3e5",
        "on-surface": "#191c1e",

        "outline": "#71787f",
        "outline-variant": "#c0c7cf",
        "background": "#f7f9fb",
        "on-background": "#191c1e",

        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",

        // Backward-compatible serene shades
        serenity: {
          50: '#f0f7fe',
          100: '#cae6ff',
          200: '#90cdfd',
          300: '#7cb9e8',
          400: '#7cb9e8',
          500: '#1c648e',
          600: '#1c648e',
          700: '#00496d',
          800: '#004b70',
          900: '#001e30',
        },
        mint: {
          50: '#edfcf5',
          100: '#b9f0ba',
          200: '#9ed4a0',
          500: '#38693f',
          600: '#38693f',
          700: '#1f5029',
        },
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -1px rgba(28, 100, 142, 0.05)',
        'soft-md': '0 6px 18px -2px rgba(28, 100, 142, 0.07)',
        'soft-lg': '0 12px 28px -4px rgba(28, 100, 142, 0.09)',
        'soft-hover': '0 10px 24px -2px rgba(28, 100, 142, 0.12)',
        'active-nav': '0 2px 12px rgba(124, 185, 232, 0.2)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      }
    },
  },
  plugins: [],
}
