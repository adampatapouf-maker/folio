import type { Config } from "tailwindcss";

/**
 * Folio design tokens.
 *
 * Colors are wired to CSS variables defined in `globals.css` so that the
 * light/dark themes (toggled via `data-theme` on <html>) flow through Tailwind
 * utilities automatically. Static brand colors (lime, purple, …) are also
 * exposed directly for chart code and accents.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        bgwarm: "var(--bgwarm)",
        surface: "var(--surface)",
        surface2: "var(--surface2)",
        ink: "var(--ink)",
        ink2: "var(--ink2)",
        ink3: "var(--ink3)",
        line: "var(--line)",
        panel: "var(--panel)",
        panelink: "var(--panelink)",
        inkfix: "var(--inkfix)",
        // brand accents (stable across themes)
        lime: "var(--lime)",
        limesoft: "var(--limesoft)",
        limedeep: "var(--limedeep)",
        purple: "var(--purple)",
        purplesoft: "var(--purplesoft)",
        coral: "var(--coral)",
        coralsoft: "var(--coralsoft)",
        amber: "var(--amber)",
        ambersoft: "var(--ambersoft)",
        gold: "var(--gold)",
        blue: "var(--blue)",
        bluesoft: "var(--bluesoft)",
        teal: "var(--teal)",
        tealsoft: "var(--tealsoft)",
        pink: "var(--pink)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Fraunces", "serif"],
        sans: ["var(--font-body)", "DM Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "20px",
      },
      boxShadow: {
        card: "var(--shadow)",
        cardlg: "var(--shadow-lg)",
      },
      maxWidth: {
        phone: "430px",
      },
    },
  },
  plugins: [],
};

export default config;
