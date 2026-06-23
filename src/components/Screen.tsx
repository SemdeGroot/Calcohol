import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/state/theme";

const DESKTOP_MAX_WIDTH = 960;

export function Screen({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.bg,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <View
        style={{
          flex: 1,
          width: "100%",
          maxWidth: DESKTOP_MAX_WIDTH,
          alignSelf: "center",
          backgroundColor: theme.bg,
        }}
      >
        {children}
      </View>
    </View>
  );
}
