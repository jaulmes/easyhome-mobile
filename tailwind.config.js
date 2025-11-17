/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#6D9BFF', // Un bleu plus clair pour les survols ou états actifs
          DEFAULT: '#3D7BFF', // Couleur principale pour les boutons et accents
          dark: '#2A5ADF',  // Un bleu plus foncé pour les bordures ou états pressés
        },
        secondary: {
          light: '#FFD789',
          DEFAULT: '#FFC75F', // Une couleur secondaire pour les badges ou informations
          dark: '#E0A83F',
        },
        background: {
          light: '#F8F9FA', // Arrière-plan général très clair
          DEFAULT: '#F1F3F5', // Arrière-plan par défaut
        },
        text: {
          primary: '#212529',   // Texte principal
          secondary: '#495057', // Texte secondaire, moins important
          muted: '#ADB5BD',      // Texte estompé, pour les placeholders etc.
        },
        success: '#28A745',
        danger: '#DC3545',
        warning: '#FFC107',
      },
      fontFamily: {
        sans: ['System', 'sans-serif'], // Police système par défaut
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
