/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#F8F7F4',
          subtle: '#F1EFEA',
          card: '#FFFFFF',
        },
        primary: {
          50: '#F0F2FF',
          100: '#E2E5FF',
          200: '#C7CDFE',
          300: '#A4ACFD',
          400: '#7E83FA',
          500: '#5452F6',
          600: '#3D35E8',
          700: '#2F26C9',
          800: '#2620A1',
          900: '#1E1B4B',
          DEFAULT: '#1E1B4B',
        },
        secondary: {
          50: '#F5F5FA',
          100: '#EBEBFA',
          200: '#D7D7F3',
          300: '#B8B8E7',
          400: '#9292D7',
          500: '#7077A1',
          DEFAULT: '#7077A1',
        },
        accent: {
          50: '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#F26A65',
          600: '#E14D48',
          DEFAULT: '#F26A65',
        },
        charcoal: {
          50: '#F6F7F9',
          100: '#EBEDF0',
          200: '#D5D8DF',
          300: '#B2B7C3',
          400: '#8A91A3',
          500: '#646B7E',
          600: '#494E5D',
          700: '#363A45',
          800: '#25272E',
          900: '#15171B',
          DEFAULT: '#15171B',
        },
        success: {
          DEFAULT: '#2A9D8F',
          50: '#E8F5F3',
          100: '#C6E8E3',
        },
        warning: {
          DEFAULT: '#E9C46A',
          50: '#FDF8E8',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'card': '0 4px 20px -2px rgba(18, 22, 33, 0.05), 0 2px 6px -1px rgba(18, 22, 33, 0.03)',
        'float': '0 10px 30px -4px rgba(18, 22, 33, 0.08), 0 4px 12px -2px rgba(18, 22, 33, 0.04)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}

