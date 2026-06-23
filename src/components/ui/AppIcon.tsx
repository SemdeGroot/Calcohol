import React from "react";
import type { ColorValue } from "react-native";
import type { LucideIcon } from "lucide-react-native";

export function AppIcon({
  icon: Icon,
  size = 20,
  color,
}: {
  icon: LucideIcon;
  size?: number;
  color: ColorValue;
}) {
  return <Icon size={size} color={color} strokeWidth={1.75} />;
}
