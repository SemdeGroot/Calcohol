import React from "react";
import { Platform, Pressable, Text, type ViewStyle } from "react-native";
import { useTheme } from "@/state/theme";

export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
  style,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          minHeight: 48,
          borderRadius: theme.radius.xl,
          paddingHorizontal: theme.space.lg,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: disabled ? theme.primaryDisabled : pressed ? theme.primaryDark : theme.primary,
          opacity: disabled ? 0.7 : 1,
          ...(Platform.OS === "web"
            ? {
                cursor: disabled ? "not-allowed" : "pointer",
              }
            : null),
        },
        style,
      ]}
    >
      <Text style={{ color: theme.textButton, fontFamily: theme.fonts.bold, fontSize: 15 }}>
        {title}
      </Text>
    </Pressable>
  );
}
