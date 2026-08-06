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
      
        destructive: "var(--destructive)",
        "destructive-foreground": "var(--destructive-foreground)",
      
        terracotta: {
          50: "#fff7f3",
          100: "#ffe8df",
          200: "#f7cdbf",
          300: "#eba991",
          400: "#dc7f60",
          500: "#c96545",
          600: "#a94f36",
          700: "#843e2f",
          800: "#653329",
          900: "#3f241f"
        },
        
        finance: {
          ink: "#1f2421",
          muted: "#6f736f",
          surface: "#fffaf6",
          line: "#ead8cf",
          success: "#127a54",
          warning: "#a35b00"
        }
      },
      boxShadow: {
        soft: "0 16px 40px rgba(63, 36, 31, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
