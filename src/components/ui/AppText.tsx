import React from "react";
import { Text, type TextProps, type StyleProp, type TextStyle } from "react-native";
import { useTheme, type ColorToken, type TypographyVariant, type TypographyWeight } from "@/state/theme";

export type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  weight?: TypographyWeight;
  color?: ColorToken;
  style?: StyleProp<TextStyle>;
};

export default function AppText({
  variant = "bodyMd",
  weight = "regular",
  color = "textMain",
  style,
  ...rest
}: AppTextProps) {
  const theme = useTheme();
  const typography = theme.typography[variant];
  const fontFamily = theme.fonts[weight];

  return <Text style={[typography, { color: theme[color], fontFamily }, style]} {...rest} />;
}
