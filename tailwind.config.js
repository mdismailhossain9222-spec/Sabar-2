/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        deepCherry: "#4A0E17",
        dustyPink: "#F4D3D9",
        warmCream: "#FAF5EF",
        accentDark: "#2D080E",
        warmIvory: "#F7F1EA",

        // Legacy aliases mapped for Dark Mode
        mainPink: "#4A0E17",
        lightPink: "#F4D3D9",
        daisyYellow: "#FAF5EF",
        daisyGreen: "#9EB79B",
        darkText: "#FAF5EF",
        basePink: "#4A0E17",
      },
      fontFamily: {
        serif: ['"Playfair Display"', "Georgia", "serif"],
        sans: ['"Raleway"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        editorial: "0.28em",
      },
      boxShadow: {
        liquid: "0 8px 32px 0 rgba(74, 14, 23, 0.08)",
        "daisy-lift": "0 24px 55px -26px rgba(74, 14, 23, 0.42)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-15px)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-down": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        marquee: {
          from: { transform: "translate3d(0, 0, 0)" },
          to: { transform: "translate3d(-50%, 0, 0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.45", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.04)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow:
              "0 12px 32px -12px rgba(74, 14, 23, 0.55), 0 0 0 0 rgba(74, 14, 23, 0.32)",
          },
          "50%": {
            boxShadow:
              "0 18px 42px -10px rgba(74, 14, 23, 0.68), 0 0 0 7px rgba(74, 14, 23, 0)",
          },
        },
        "success-pop": {
          "0%": { opacity: "0", transform: "translateY(18px) scale(0.97)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "cart-pop": {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.18) rotate(-6deg)" },
          "70%": { transform: "scale(0.96) rotate(2deg)" },
          "100%": { transform: "scale(1) rotate(0deg)" },
        },
        "sheet-in": {
          "0%": { opacity: "0", transform: "translateY(30px) scale(0.985)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "drawer-in": {
          from: { opacity: "0", transform: "translateX(32px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "menu-in": {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "toast-in": {
          from: { opacity: "0", transform: "translateY(14px) scale(0.97)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float 7s ease-in-out 1.2s infinite",
        "spin-slow": "spin-slow 20s linear infinite",
        "spin-slower": "spin-slow 34s linear infinite reverse",
        "fade-up": "fade-up 0.8s ease-out both",
        "fade-down": "fade-down 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.8s ease-out both",
        marquee: "marquee 38s linear infinite",
        "pulse-soft": "pulse-soft 4s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2.8s ease-in-out infinite",
        "success-pop": "success-pop 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "cart-pop": "cart-pop 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "sheet-in": "sheet-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 3.6s linear infinite",
        "drawer-in": "drawer-in 0.42s cubic-bezier(0.22, 1, 0.36, 1) both",
        "menu-in": "menu-in 0.26s cubic-bezier(0.22, 1, 0.36, 1) both",
        "toast-in": "toast-in 0.32s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};