/** Semantic colours switch between light and dark theme through CSS variables (see src/index.css). */
const themed = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand palette — always the same (header, hero, contact and footer stay dark in both themes)
        espresso: "#2B1B12",
        espressoDark: "#1E140D",
        cream: "#F7F1E6",
        creamDark: "#EFE4CC",
        sand: "#DCCBA0",
        brass: "#C9932E",
        clay: "#C9563A",
        clayLight: "#F0937B",

        // Theme-aware tokens
        page: themed("page"),
        pageAlt: themed("page-alt"),
        card: themed("card"),
        field: themed("field"),
        heading: themed("heading"),
        copy: themed("copy"),
        line: themed("line"),
        accent: themed("accent"),
        danger: themed("danger"),
        inverse: themed("inverse"),
        onInverse: themed("on-inverse"),
        success: themed("success"),
      },
      fontFamily: {
        display: ["Georgia", "'Times New Roman'", "serif"],
        body: ["'Helvetica Neue'", "Arial", "sans-serif"],
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "pop-in": {
          from: { opacity: "0", transform: "translateY(12px) scale(0.98)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "pop-in": "pop-in 240ms cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
