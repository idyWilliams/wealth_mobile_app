/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#007AFF",
        secondary: "#5856D6",
        background: "#F2F2F7",
        foreground: "#000000",
        muted: "#8E8E93",
        accent: "#FF9500",
        destructive: "#FF3B30",
        border: "#C6C6C8",
      },
    },
  },
  plugins: [],
};
