import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--color-canvas)",
        surface: "var(--color-surface)",
        "surface-subtle": "var(--color-surface-subtle)",
        ink: "var(--color-text-primary)",
        muted: "var(--color-text-secondary)",
        quiet: "var(--color-text-tertiary)",
        line: "var(--color-border)",
        "line-strong": "var(--color-border-strong)",
        brand: "var(--color-primary)",
        "brand-hover": "var(--color-primary-hover)",
        "brand-soft": "var(--color-primary-soft)",
        accent: "var(--color-secondary)",
        "accent-hover": "var(--color-secondary-hover)",
        "accent-soft": "var(--color-secondary-soft)",
        "status-success": "var(--color-success)",
        "status-success-bg": "var(--color-success-bg)",
        "status-success-border": "var(--color-success-border)",
        "status-warning": "var(--color-warning)",
        "status-warning-bg": "var(--color-warning-bg)",
        "status-warning-border": "var(--color-warning-border)",
        "status-danger": "var(--color-danger)",
        "status-danger-bg": "var(--color-danger-bg)",
        "status-danger-border": "var(--color-danger-border)",
        "status-neutral": "var(--color-neutral)",
        "status-neutral-bg": "var(--color-neutral-bg)",
        "status-neutral-border": "var(--color-neutral-border)",
        "status-info": "var(--color-info)",
        "status-info-bg": "var(--color-info-bg)",
        "status-info-border": "var(--color-info-border)",
      },
      fontFamily: {
        sans: ["Pretendard Variable", "Pretendard", "Inter", "Noto Sans KR", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        control: "0.75rem",
        card: "1rem",
        panel: "1.25rem",
      },
      boxShadow: {
        card: "0 4px 16px rgba(15, 23, 42, 0.06)",
      },
      maxWidth: {
        page: "70rem",
        reading: "45rem",
      },
    },
  },
  plugins: [],
};

export default config;
