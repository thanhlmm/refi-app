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
      colors: {
        palette: {
          lighter: "#EFF6FF",
          light: "#ffd761",
          primary: "#FFA000",
          dark: "#F57C00",
        },
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
      textColor: ["disabled"],
      borderColor: ["disabled"],
      height: ["focus"],
      backgroundColor: ["active"],
    },
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
  purge: ["./src/**/*.html", "./src/**/*.ts", "./src/**/*.tsx", "./index.html"],
};
