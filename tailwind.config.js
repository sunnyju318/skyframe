// Tailwind configuration for SkyFrame design system
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary colors
        primary: {
          900: "#2F2F32",
          700: "#4C4464",
          500: "#766A95",
          300: "#A18DC8",
          100: "#C3B9E5",
          50: "#E2E1F0",
        },
        // Gray scale
        gray: {
          900: "#212529",
          700: "#343434",
          500: "#6C757D",
          400: "#ADB5BD",
          300: "#CED4DA",
          200: "#DEE2E6",
          100: "#F1F3F5",
          50: "#F8F9FA",
        },
        // Accent colors
        blue: "#0D6EFD",
        red: "#FF4C4C",
        // Semantic colors
        success: "#11C166",
        warning: "#FFD43B",
        error: "#FF6B6B",
        info: "#74C0FC",
      },
      fontFamily: {
        // Poppins font family
        sans: ["Poppins", "sans-serif"],
      },
      fontWeight: {
        // Poppins weights
        regular: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },
      fontSize: {
        // Typography scale
        display: [
          "32px",
          { lineHeight: "40px", letterSpacing: "-0.5px", fontWeight: "700" },
        ],
        h1: [
          "24px",
          { lineHeight: "32px", letterSpacing: "-0.3px", fontWeight: "600" },
        ],
        h2: [
          "20px",
          { lineHeight: "28px", letterSpacing: "-0.2px", fontWeight: "600" },
        ],
        h3: ["18px", { lineHeight: "24px", fontWeight: "500" }],
        body: ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-semibold": ["16px", { lineHeight: "24px", fontWeight: "600" }],
        "body-small": [
          "14px",
          { lineHeight: "20px", letterSpacing: "0.1px", fontWeight: "400" },
        ],
        caption: [
          "12px",
          { lineHeight: "16px", letterSpacing: "0.2px", fontWeight: "500" },
        ],
      },
      spacing: {
        // 4px-based spacing system
        2: "2px",
        4: "4px",
        8: "8px",
        12: "12px",
        16: "16px",
        20: "20px",
        24: "24px",
        28: "28px",
        32: "32px",
        36: "36px",
        40: "40px",
        60: "60px",
        58: "58px",
      },
      borderRadius: {
        // Custom radius values from design system
        none: "0",
        sm: "4px",
        DEFAULT: "8px",
        md: "8px",
        lg: "10px",
        xl: "14px",
        20: "20px",
        30: "30px",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
