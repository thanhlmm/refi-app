module.exports = {
  important: "#root-body",
  theme: {
    extend: {
      fontSize: {
        key: "10px",
      },
      minHeight: {
        12: "3rem",
      },
    },
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
