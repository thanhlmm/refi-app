module.exports = {
  important: "#root-body",
  theme: {
    extend: {},
    fontFamily: {
      sans: ["Inter", "sans-serif"],
      mono: ["Menlo", "Monaco", "Courier New", "monospace"],
    },
  },
  variants: {
    extend: {
      borderWidth: ["last"],
    },
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
  purge: ["./src/**/*.html", "./src/**/*.ts", "./src/**/*.tsx", "./index.html"],
};
