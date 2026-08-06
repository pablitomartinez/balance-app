import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
      
        popover: "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",
      
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
      
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
      
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
      
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
      
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",

        success: "var(--success)",
        "success-muted": "var(--success-muted)",
        "success-border": "var(--success-border)",

        warning: "var(--warning)",

        destructive: "var(--destructive)",
        "destructive-foreground": "var(--destructive-foreground)",
        "destructive-muted": "var(--destructive-muted)",
        "destructive-border": "var(--destructive-border)"
      },
      boxShadow: {
        soft: "var(--shadow-soft)"
      }
    }
  },
  plugins: []
};

export default config;
