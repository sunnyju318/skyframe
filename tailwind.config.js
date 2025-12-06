// Tailwind CSS configuration - defines design tokens (colors, fonts, spacing)

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
      fontSize: {
        // Typography scale
        display: ["32px", { lineHeight: "40px", letterSpacing: "-0.5px" }],
        h1: ["24px", { lineHeight: "32px", letterSpacing: "-0.3px" }],
        h2: ["20px", { lineHeight: "28px", letterSpacing: "-0.2px" }],
        h3: ["18px", { lineHeight: "24px" }],
        body: ["16px", { lineHeight: "24px" }],
        "body-semibold": ["16px", { lineHeight: "24px" }],
        "body-small": ["14px", { lineHeight: "20px", letterSpacing: "0.1px" }],
        caption: ["12px", { lineHeight: "16px", letterSpacing: "0.2px" }],
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
    },
  },
  plugins: [],
};
