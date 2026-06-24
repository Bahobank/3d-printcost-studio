import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        muted: "#64748b",
        line: "#dbe4ef",
        brand: "#2563eb",
        brandDark: "#1e40af",
        warm: "#f59e0b"
      },
      boxShadow: {
        soft: "0 24px 60px rgba(37, 99, 235, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
