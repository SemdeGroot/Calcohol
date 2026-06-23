import { View } from "react-native";
import { Calculator } from "lucide-react-native";
import { Screen } from "@/components/Screen";
import { AppIcon } from "@/components/ui/AppIcon";
import AppText from "@/components/ui/AppText";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { useTheme } from "@/state/theme";

export default function IndexScreen() {
  const theme = useTheme();

  return (
    <Screen>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          padding: theme.space.xl,
          gap: theme.space.lg,
        }}
      >
        <View style={{ gap: theme.space.sm }}>
          <AppIcon icon={Calculator} size={32} color={theme.primary} />
          <AppText variant="titleXl" weight="bold">
            Calcohol
          </AppText>
          <AppText variant="bodyMd" color="textSub">
            Scaffold for the ethanol antidote calculator app. Calculator logic and clinical content are intentionally not implemented in this scaffold.
          </AppText>
        </View>
        <PrimaryButton title="Scaffold ready" onPress={() => undefined} disabled />
      </View>
    </Screen>
  );
}
