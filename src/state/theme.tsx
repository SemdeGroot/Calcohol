import React from "react";

export type ColorToken =
  | "primary"
  | "primaryDark"
  | "primaryDisabled"
  | "bg"
  | "panel"
  | "panelSoft"
  | "textMain"
  | "textSub"
  | "border"
  | "textButton"
  | "danger"
  | "warning"
  | "success";

export type TypographyVariant = "caption" | "bodySm" | "bodyMd" | "titleMd" | "titleXl";
export type TypographyWeight = "regular" | "medium" | "semibold" | "bold";

type Theme = Record<ColorToken, string> & {
  fonts: Record<TypographyWeight, string>;
  typography: Record<TypographyVariant, { fontSize: number; lineHeight: number; letterSpacing?: number }>;
  space: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    "2xl": number;
    "3xl": number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
};

const shared = {
  fonts: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semibold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
  },
  typography: {
    caption: { fontSize: 13, lineHeight: 18, letterSpacing: 0 },
    bodySm: { fontSize: 14, lineHeight: 21, letterSpacing: 0 },
    bodyMd: { fontSize: 15, lineHeight: 23, letterSpacing: 0 },
    titleMd: { fontSize: 18, lineHeight: 24, letterSpacing: -0.2 },
    titleXl: { fontSize: 28, lineHeight: 34, letterSpacing: -0.4 },
  },
  space: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
    "3xl": 32,
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 18,
    full: 9999,
  },
};

const lightTheme: Theme = {
  primary: "#5C778F",
  primaryDark: "#2A6072",
  primaryDisabled: "rgba(15,23,42,0.45)",
  bg: "#F6F8FB",
  panel: "#FFFFFF",
  panelSoft: "#EEF2F7",
  textMain: "#0E1726",
  textSub: "#475569",
  border: "rgba(15,23,42,0.10)",
  textButton: "#FFFFFF",
  danger: "#D32F2F",
  warning: "#DF5B17",
  success: "#0C8F66",
  ...shared,
};

const ThemeContext = React.createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeContext.Provider value={lightTheme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const theme = React.useContext(ThemeContext);
  if (!theme) throw new Error("useTheme must be used inside ThemeProvider");
  return theme;
}
