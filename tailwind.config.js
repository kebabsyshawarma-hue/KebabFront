/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: '#FFD700',
        dark: '#1a1a1a',
        accent: '#A52A2A',
      },
    },
  },
  plugins: [],
  // Mantenemos preflight false para seguridad con Bootstrap, 
  // pero ten en cuenta que deberemos ser explícitos con borders y backgrounds.
  corePlugins: {
    preflight: false, 
  }
}
