import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
  useWindowDimensions,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { Activity, BookOpen, Calculator, FunctionSquare, Info, RotateCcw } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { Screen } from "@/components/Screen";
import { AppModal } from "@/components/ui/AppModal";
import { AppIcon } from "@/components/ui/AppIcon";
import AppText from "@/components/ui/AppText";
import SecondaryButton from "@/components/ui/SecondaryButton";
import { useTheme } from "@/state/theme";
import {
  CALCULATOR_CONSTANTS,
  DEFAULT_CALCULATOR_SETTINGS,
  DRINKER_PROFILES,
  VOLUME_DISTRIBUTION_PROFILES,
  calculateEthanolDosing,
  type CalculatorSettings,
  type DrinkerStatus,
  type VolumeOfDistributionProfileId,
} from "./calculations";
import { formatGPerL, formatMg, formatMgPerHour, formatMl, formatMlPerHour, formatOneDecimal } from "./format";

type TargetMode = "1000" | "1500" | "custom";

export function CalculatorScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const twoColumn = width >= 820;
  const [weightKg, setWeightKg] = React.useState("");
  const [currentEthanolMgPerL, setCurrentEthanolMgPerL] = React.useState("");
  const [drinkerStatus, setDrinkerStatus] = React.useState<DrinkerStatus>("nonDrinker");
  const [dialysis, setDialysis] = React.useState(false);
  const [targetMode, setTargetMode] = React.useState<TargetMode>("1000");
  const [customTargetEthanolMgPerL, setCustomTargetEthanolMgPerL] = React.useState("");
  const [volumeOfDistributionProfile, setVolumeOfDistributionProfile] =
    React.useState<VolumeOfDistributionProfileId>("female");
  const [infusionConcentrationGPerL, setInfusionConcentrationGPerL] = React.useState(
    formatOneDecimal(DEFAULT_CALCULATOR_SETTINGS.infusionConcentrationGPerL),
  );
  const [sourceOpen, setSourceOpen] = React.useState(false);
  const parsedWeight = parseDecimalInput(weightKg);
  const parsedEthanol = parseDecimalInput(currentEthanolMgPerL);
  const parsedCustomTarget = parseDecimalInput(customTargetEthanolMgPerL);
  const parsedInfusionConcentration = parseDecimalInput(infusionConcentrationGPerL);
  const targetEthanolMgPerL = targetMode === "custom" ? parsedCustomTarget : Number(targetMode);
  const volumeOfDistributionLPerKg =
    VOLUME_DISTRIBUTION_PROFILES[volumeOfDistributionProfile].volumeOfDistributionLPerKg;
  const settings: CalculatorSettings = {
    targetEthanolMgPerL: targetEthanolMgPerL ?? DEFAULT_CALCULATOR_SETTINGS.targetEthanolMgPerL,
    volumeOfDistributionLPerKg,
    infusionConcentrationGPerL:
      parsedInfusionConcentration ?? DEFAULT_CALCULATOR_SETTINGS.infusionConcentrationGPerL,
  };
  const settingsAreValid =
    targetEthanolMgPerL !== null &&
    targetEthanolMgPerL > 0 &&
    parsedInfusionConcentration !== null &&
    parsedInfusionConcentration > 0;
  const canCalculate =
    parsedWeight !== null &&
    parsedWeight > 0 &&
    parsedEthanol !== null &&
    parsedEthanol >= 0 &&
    settingsAreValid;
  const hasInput = Boolean(
    weightKg.trim() ||
      currentEthanolMgPerL.trim() ||
      drinkerStatus !== "nonDrinker" ||
      dialysis ||
      targetMode !== "1000" ||
      customTargetEthanolMgPerL.trim() ||
      volumeOfDistributionProfile !== "female" ||
      infusionConcentrationGPerL !== formatOneDecimal(DEFAULT_CALCULATOR_SETTINGS.infusionConcentrationGPerL),
  );
  const result = canCalculate
    ? calculateEthanolDosing({
        weightKg: parsedWeight,
        currentEthanolMgPerL: parsedEthanol,
        drinkerStatus,
        dialysis,
        settings,
      })
    : null;
  const aboveTarget = result !== null && result.loadingDose.mg === 0;

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: twoColumn ? theme.space["2xl"] : theme.space.lg,
            paddingTop: twoColumn ? theme.space["2xl"] : theme.space.lg,
            paddingBottom: theme.space["3xl"],
            gap: theme.space.lg,
          }}
        >
          <View
            style={{
              gap: theme.space.md,
              paddingVertical: twoColumn ? theme.space.lg : theme.space.md,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space.md }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: theme.radius.lg,
                  backgroundColor: theme.primarySoft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AppIcon icon={Calculator} size={25} color={theme.primaryDark} />
              </View>
              <View style={{ flex: 1, gap: theme.space.xs }}>
                <AppText variant="titleXl" weight="bold">
                  AlcoTox
                </AppText>
                <AppText variant="caption" color="muted">
                  Ethanol doseringshulp
                </AppText>
              </View>
            </View>
            <AppText variant="bodyMd" color="textSub" style={{ maxWidth: 720 }}>
              Bereken een oplaaddosis en onderhoudsdosering voor ethanol bij methanol- of ethyleenglycolintoxicatie.
            </AppText>
          </View>

          <View
            style={{
              flexDirection: twoColumn ? "row" : "column",
              alignItems: "stretch",
              gap: theme.space.lg,
            }}
          >
            <Panel style={{ flex: twoColumn ? 0.95 : undefined }}>
              <View style={{ gap: theme.space.lg }}>
                <AppText variant="titleMd" weight="semibold">
                  Invoer
                </AppText>

                <NumberField
                  label="Gewicht"
                  unit="kg"
                  value={weightKg}
                  onChangeText={setWeightKg}
                />

                <NumberField
                  label="Gemeten ethanolconcentratie"
                  unit="mg/L"
                  value={currentEthanolMgPerL}
                  onChangeText={setCurrentEthanolMgPerL}
                />

                <View style={{ gap: theme.space.sm }}>
                  <SegmentedControl
                    label="Patiëntprofiel"
                    value={drinkerStatus}
                    options={[
                      { value: "nonDrinker", label: "Niet-drinker" },
                      { value: "chronicDrinker", label: "Chronische drinker" },
                    ]}
                    onChange={setDrinkerStatus}
                  />
                  <InlineNotice
                    icon={Info}
                    text={`Vmax ${DRINKER_PROFILES[drinkerStatus].vmaxMgKgHour} mg/kg/uur bepaalt de onderhoudsdosering.`}
                  />
                </View>

                <View style={{ gap: theme.space.sm }}>
                  <SegmentedControl
                    label="Dialyse"
                    value={dialysis ? "yes" : "no"}
                    options={[
                      { value: "no", label: "Nee" },
                      { value: "yes", label: "Ja" },
                    ]}
                    onChange={(value) => setDialysis(value === "yes")}
                  />
                  {dialysis ? (
                    <InlineNotice
                      icon={Activity}
                      text={`Tijdens dialyse telt AlcoTox ${CALCULATOR_CONSTANTS.dialysisClearanceMgKgHour} mg/kg/uur extra klaring bij Vmax op.`}
                    />
                  ) : null}
                </View>

                <DoseSettings
                  targetMode={targetMode}
                  customTargetEthanolMgPerL={customTargetEthanolMgPerL}
                  volumeOfDistributionProfile={volumeOfDistributionProfile}
                  infusionConcentrationGPerL={infusionConcentrationGPerL}
                  onTargetModeChange={setTargetMode}
                  onCustomTargetChange={setCustomTargetEthanolMgPerL}
                  onVolumeOfDistributionProfileChange={setVolumeOfDistributionProfile}
                  onInfusionConcentrationChange={setInfusionConcentrationGPerL}
                />

                {hasInput ? (
                  <SecondaryButton
                    title="Wis invoer"
                    icon={RotateCcw}
                    onPress={() => {
                      setWeightKg("");
                      setCurrentEthanolMgPerL("");
                      setDrinkerStatus("nonDrinker");
                      setDialysis(false);
                      setTargetMode("1000");
                      setCustomTargetEthanolMgPerL("");
                      setVolumeOfDistributionProfile("female");
                      setInfusionConcentrationGPerL(
                        formatOneDecimal(DEFAULT_CALCULATOR_SETTINGS.infusionConcentrationGPerL),
                      );
                    }}
                  />
                ) : null}
              </View>
            </Panel>

            <View style={{ flex: twoColumn ? 1.05 : undefined, gap: theme.space.lg }}>
              <Panel>
                <View style={{ gap: theme.space.lg }}>
                  <AppText variant="titleMd" weight="semibold">
                    Resultaat
                  </AppText>

                  {result ? (
                    <>
                      <ResultRow
                        title="Oplaaddosis"
                        primary={aboveTarget ? "Geen oplaaddosis nodig" : formatMg(result.loadingDose.mg)}
                        secondary={
                          aboveTarget
                            ? `Gemeten ethanol is op of boven ${formatOneDecimal(settings.targetEthanolMgPerL)} mg/L.`
                            : formatMl(result.loadingDose.ml)
                        }
                      />
                      {aboveTarget ? (
                        <ResultRow
                          title={dialysis ? "Onderhoud tijdens dialyse" : "Onderhoudsdosering"}
                          primary="Geen onderhoudsdosering nodig"
                          secondary={`Gemeten ethanol is op of boven ${formatOneDecimal(settings.targetEthanolMgPerL)} mg/L.`}
                          divider={false}
                        />
                      ) : (
                        <>
                          <ResultRow
                            title={dialysis ? "Onderhoud tijdens dialyse" : "Onderhoudsdosering"}
                            primary={formatMgPerHour(result.selectedMaintenanceDose.mgPerHour)}
                            secondary={formatMlPerHour(result.selectedMaintenanceDose.mlPerHour)}
                            emphasized
                          />
                          <InfusionBasis settings={result.settings} />
                        </>
                      )}
                      <AssumptionSummary settings={result.settings} />
                    </>
                  ) : (
                    <EmptyResult />
                  )}
                </View>
              </Panel>

              <FormulaPanel
                drinkerStatus={drinkerStatus}
                dialysis={dialysis}
                currentEthanolMgPerL={parsedEthanol}
                settings={settings}
              />

              <SecondaryButton title="Bron en methode" icon={BookOpen} onPress={() => setSourceOpen(true)} />
            </View>
          </View>

          <Footer />
        </ScrollView>
        <SourceModal open={sourceOpen} onClose={() => setSourceOpen(false)} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

function NumberField({
  label,
  unit,
  value,
  onChangeText,
  error,
  helper,
}: {
  label: string;
  unit: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  helper?: string;
}) {
  const theme = useTheme();
  const [focused, setFocused] = React.useState(false);

  return (
    <View style={{ gap: theme.space.sm }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: theme.space.md }}>
        <AppText variant="bodySm" weight="semibold">
          {label}
        </AppText>
        <AppText variant="bodySm" color="textSub">
          {unit}
        </AppText>
      </View>
      <TextInput
        value={value}
        onChangeText={(nextValue) => onChangeText(sanitizeDecimalInput(nextValue))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="decimal-pad"
        inputMode="decimal"
        accessibilityLabel={`${label} in ${unit}`}
        placeholder="0"
        placeholderTextColor={theme.textSub}
        style={[
          {
            minHeight: 48,
            borderWidth: 1,
            borderColor: focused ? theme.primary : theme.border,
            borderRadius: theme.radius.md,
            backgroundColor: theme.panel,
            color: theme.textMain,
            fontFamily: theme.fonts.medium,
            fontSize: Platform.OS === "web" ? 16 : theme.typography.bodyMd.fontSize,
            paddingHorizontal: theme.space.lg,
          },
          Platform.OS === "web" ? ({ outlineStyle: "none" } as unknown as TextStyle) : null,
        ]}
      />
      {error ? (
        <AppText variant="caption" color="danger">
          {error}
        </AppText>
      ) : helper ? (
        <AppText variant="caption" color="textSub">
          {helper}
        </AppText>
      ) : null}
    </View>
  );
}

function DoseSettings({
  targetMode,
  customTargetEthanolMgPerL,
  volumeOfDistributionProfile,
  infusionConcentrationGPerL,
  onTargetModeChange,
  onCustomTargetChange,
  onVolumeOfDistributionProfileChange,
  onInfusionConcentrationChange,
}: {
  targetMode: TargetMode;
  customTargetEthanolMgPerL: string;
  volumeOfDistributionProfile: VolumeOfDistributionProfileId;
  infusionConcentrationGPerL: string;
  onTargetModeChange: (value: TargetMode) => void;
  onCustomTargetChange: (value: string) => void;
  onVolumeOfDistributionProfileChange: (value: VolumeOfDistributionProfileId) => void;
  onInfusionConcentrationChange: (value: string) => void;
}) {
  const theme = useTheme();
  const parsedCustomTarget = parseDecimalInput(customTargetEthanolMgPerL);
  const parsedInfusionConcentration = parseDecimalInput(infusionConcentrationGPerL);
  const targetError =
    targetMode === "custom" && (parsedCustomTarget === null || parsedCustomTarget <= 0)
      ? "Vul een streefconcentratie groter dan 0 in."
      : undefined;
  const infusionError =
    parsedInfusionConcentration === null || parsedInfusionConcentration <= 0
      ? "Vul een infuusconcentratie groter dan 0 in."
      : undefined;

  return (
    <View
      style={{
        gap: theme.space.md,
        borderTopWidth: 1,
        borderTopColor: theme.border,
        paddingTop: theme.space.lg,
      }}
    >
      <View style={{ gap: theme.space.xs }}>
        <AppText variant="titleMd" weight="semibold">
          Doseerinstellingen
        </AppText>
        <AppText variant="caption" color="textSub">
          Spreadsheetwaarden staan standaard aan. Pas alleen aan volgens lokaal protocol of handboek.
        </AppText>
      </View>

      <SegmentedControl
        label="Streef ethanol"
        value={targetMode}
        options={[
          { value: "1000", label: "1,0 promille" },
          { value: "1500", label: "1,5 promille" },
          { value: "custom", label: "Anders" },
        ]}
        onChange={onTargetModeChange}
      />

      {targetMode === "custom" ? (
        <NumberField
          label="Custom streefconcentratie"
          unit="mg/L"
          value={customTargetEthanolMgPerL}
          onChangeText={onCustomTargetChange}
          error={targetError}
        />
      ) : null}

      <InlineNotice
        icon={Info}
        text="1000 mg/L is de bronwaarde uit het artikel en de spreadsheet. Lokale protocollen kunnen een hogere streefwaarde gebruiken."
      />

      <SegmentedControl
        label="Verdelingsvolume"
        value={volumeOfDistributionProfile}
        options={[
          { value: "male", label: "Man 0,7 L/kg" },
          { value: "female", label: "Vrouw 0,6 L/kg" },
        ]}
        onChange={onVolumeOfDistributionProfileChange}
      />

      <NumberField
        label="Infuusconcentratie"
        unit="g/L"
        value={infusionConcentrationGPerL}
        onChangeText={onInfusionConcentrationChange}
        error={infusionError}
        helper="Neem de lokale handboekwaarde over. Spreadsheetdefault is 50 ml ethanol 96% v/v in 300 ml totaal."
      />
    </View>
  );
}

function SegmentedControl<TValue extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: TValue;
  options: { value: TValue; label: string }[];
  onChange: (value: TValue) => void;
}) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.space.sm }}>
      <AppText variant="bodySm" weight="semibold">
        {label}
      </AppText>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: theme.space.sm,
        }}
      >
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => ({
                minHeight: 44,
                flexGrow: 1,
                flexBasis: 140,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: theme.radius.md,
                borderWidth: 1,
                borderColor: selected ? theme.primary : theme.border,
                backgroundColor: selected ? theme.primary : pressed ? theme.panelSoft : theme.panel,
                paddingHorizontal: theme.space.md,
                ...(Platform.OS === "web" ? { cursor: "pointer" } : null),
              })}
            >
              <AppText variant="bodySm" weight="semibold" color={selected ? "textButton" : "textMain"}>
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ResultRow({
  title,
  primary,
  secondary,
  emphasized = false,
  divider = true,
}: {
  title: string;
  primary: string;
  secondary: string;
  emphasized?: boolean;
  divider?: boolean;
}) {
  const theme = useTheme();

  if (emphasized) {
    return (
      <View
        style={{
          gap: theme.space.xs,
          padding: theme.space.md,
          borderRadius: theme.radius.lg,
          backgroundColor: theme.primarySoft,
        }}
      >
        <AppText variant="bodySm" color="textSub" weight="semibold">
          {title}
        </AppText>
        <AppText variant="titleXl" weight="bold" color="primaryDark">
          {primary}
        </AppText>
        <AppText variant="bodySm" color="textSub">
          {secondary}
        </AppText>
      </View>
    );
  }

  return (
    <View
      style={{
        gap: theme.space.xs,
        paddingVertical: theme.space.md,
        borderBottomWidth: divider ? 1 : 0,
        borderBottomColor: theme.border,
      }}
    >
      <AppText variant="bodySm" color="textSub" weight="semibold">
        {title}
      </AppText>
      <AppText variant="bodyMd" weight="bold">
        {primary}
      </AppText>
      <AppText variant="bodySm" color="textSub">
        {secondary}
      </AppText>
    </View>
  );
}

function AssumptionSummary({ settings }: { settings: CalculatorSettings }) {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.space.sm,
        paddingTop: theme.space.sm,
      }}
    >
      <AssumptionPill text={`Doel ${formatOneDecimal(settings.targetEthanolMgPerL)} mg/L`} />
      <AssumptionPill text={`Vd ${formatOneDecimal(settings.volumeOfDistributionLPerKg)} L/kg`} />
      <AssumptionPill text={`Infuus ${formatGPerL(settings.infusionConcentrationGPerL)}`} />
    </View>
  );
}

function AssumptionPill({ text }: { text: string }) {
  const theme = useTheme();

  return (
    <View
      style={{
        minHeight: 30,
        justifyContent: "center",
        borderRadius: theme.radius.full,
        backgroundColor: theme.panelSoft,
        paddingHorizontal: theme.space.md,
      }}
    >
      <AppText variant="caption" color="textSub" weight="medium">
        {text}
      </AppText>
    </View>
  );
}

function InfusionBasis({ settings }: { settings: CalculatorSettings }) {
  const theme = useTheme();

  return (
    <View style={{ paddingTop: theme.space.sm }}>
      <AppText variant="caption" color="textSub">
        Omrekening naar infuusvolume gebruikt {formatGPerL(settings.infusionConcentrationGPerL)}. Neem de lokale
        handboekwaarde over als die afwijkt.
      </AppText>
    </View>
  );
}

function EmptyResult() {
  const theme = useTheme();

  return (
    <View style={{ alignItems: "center", gap: theme.space.sm, paddingVertical: theme.space.xl }}>
      <AppIcon icon={Calculator} size={28} color={theme.muted} />
      <AppText color="textSub" style={{ textAlign: "center", maxWidth: 320 }}>
        Vul gewicht en gemeten ethanolconcentratie in. De dosering verschijnt zodra beide waarden geldig zijn.
      </AppText>
    </View>
  );
}

function InlineNotice({
  icon,
  text,
  tone = "info",
}: {
  icon: LucideIcon;
  text: string;
  tone?: "info" | "warning";
}) {
  const theme = useTheme();
  const color = tone === "warning" ? theme.warning : theme.primaryDark;
  const backgroundColor = tone === "warning" ? theme.warningSoft : theme.primarySoft;

  return (
    <View
      style={{
        flexDirection: "row",
        gap: theme.space.sm,
        borderRadius: theme.radius.md,
        backgroundColor,
        padding: theme.space.md,
      }}
    >
      <AppIcon icon={icon} size={18} color={color} />
      <AppText variant="bodySm" color="textSub" style={{ flex: 1 }}>
        {text}
      </AppText>
    </View>
  );
}

function FormulaPanel({
  drinkerStatus,
  dialysis,
  currentEthanolMgPerL,
  settings,
}: {
  drinkerStatus: DrinkerStatus;
  dialysis: boolean;
  currentEthanolMgPerL: number | null;
  settings: CalculatorSettings;
}) {
  const theme = useTheme();
  const profile = DRINKER_PROFILES[drinkerStatus];
  const vmax = dialysis
    ? profile.vmaxMgKgHour + CALCULATOR_CONSTANTS.dialysisClearanceMgKgHour
    : profile.vmaxMgKgHour;

  return (
    <Panel>
      <View style={{ gap: theme.space.md }}>
        <View style={{ flexDirection: "row", gap: theme.space.sm, alignItems: "center" }}>
          <AppIcon icon={FunctionSquare} size={20} color={theme.primaryDark} />
          <AppText variant="titleMd" weight="semibold">
            Gebruikte formules
          </AppText>
        </View>

        <FormulaLine
          label="Oplaaddosis"
          formula="Vd x gewicht x max(0, Cdoel - Cethanol)"
          detail={`Ingevuld: ${formatOneDecimal(settings.volumeOfDistributionLPerKg)} L/kg x gewicht x max(0, ${formatOneDecimal(settings.targetEthanolMgPerL)} - gemeten ethanol)`}
        />
        <FormulaLine
          label="Onderhoud"
          formula="1000 x Vmax x gewicht / (Km + Cdoel)"
          detail={`Ingevuld: 1000 x ${vmax} mg/kg/uur x gewicht / (138 + ${formatOneDecimal(settings.targetEthanolMgPerL)})`}
        />
        <FormulaLine
          label="Omrekening naar infuus"
          formula="dosis ethanol / infuusconcentratie"
          detail={`Ingevuld: mg ethanol / ${formatGPerL(settings.infusionConcentrationGPerL)}`}
        />

        {currentEthanolMgPerL !== null && currentEthanolMgPerL >= settings.targetEthanolMgPerL ? (
          <AppText variant="bodySm" color="textSub">
            Boven de streefconcentratie is doseren niet nodig. AlcoTox toont dan geen oplaad- en geen
            onderhoudsdosering.
          </AppText>
        ) : null}
      </View>
    </Panel>
  );
}

function FormulaLine({ label, formula, detail }: { label: string; formula: string; detail?: string }) {
  const theme = useTheme();

  return (
    <View
      style={{
        gap: theme.space.xs,
        padding: theme.space.md,
        borderRadius: theme.radius.md,
        backgroundColor: theme.panelSoft,
      }}
    >
      <AppText variant="bodySm" color="textSub" weight="semibold">
        {label}
      </AppText>
      <AppText variant="bodySm">{formula}</AppText>
      {detail ? (
        <AppText variant="caption" color="textSub">
          {detail}
        </AppText>
      ) : null}
    </View>
  );
}

function SourceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const theme = useTheme();

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Bron en methode"
      subtitle="Waarom 1000 mg/L de standaardwaarde is en welke aannames lokaal kunnen afwijken."
    >
      <SourceSection title="Introductie">
        <AppText variant="bodySm" color="textSub">
          Het artikel beschrijft intoxicaties met methanol en ethyleenglycol vanuit de klinische toxicologie. De schade
          ontstaat vooral door metabolieten die via alcoholdehydrogenase worden gevormd. Daarom richt de behandeling in
          het artikel zich op het remmen van die omzetting en op het verwijderen van de toxische stoffen wanneer dat nodig
          is.
        </AppText>
      </SourceSection>

      <SourceSection title="Referentie">
        <AppText variant="bodySm" color="textSub">
          Touw DJ, Beus WP, Vinks AATMM, van Dijk A. Intoxicatie met methanol en ethyleenglycol: klinische toxicologie
          en berekening van de optimale dosis ethanol als antidotum. Pharmaceutisch Weekblad. 1993, 128(11), 537-542.
        </AppText>
      </SourceSection>

      <SourceSection title="Waarom ethanol">
        <AppText variant="bodySm" color="textSub">
          Ethanol concurreert met methanol en ethyleenglycol om alcoholdehydrogenase. Bij voldoende ethanol wordt minder
          methanol of ethyleenglycol omgezet naar toxische metabolieten. Het artikel noemt dit als de reden om ethanol als
          antidotum te gebruiken.
        </AppText>
        <AppText variant="bodySm" color="textSub">
          Bij ernstige intoxicaties kan dialyse nodig zijn. Het artikel beschrijft dat dialyse de klaring verhoogt.
          AlcoTox rekent daarom een aparte onderhoudsdosering tijdens dialyse uit.
        </AppText>
      </SourceSection>

      <SourceSection title="Wanneer gebruiken">
        <AppText variant="bodySm" color="textSub">
          AlcoTox kan worden gebruikt wanneer een ethanolspiegel bekend is en je een ethanoldosering wilt omrekenen naar een
          infuusvolume. De app rekent de oplaaddosis, de onderhoudsdosering en de onderhoudsdosering tijdens dialyse uit.
        </AppText>
        <AppText variant="bodySm" color="textSub">
          De app bepaalt niet of ethanol of dialyse nodig is. Die beslissing blijft onderdeel van het lokale protocol en
          het klinisch oordeel.
        </AppText>
      </SourceSection>

      <SourceSection title="Rekenmethode">
        <AppText variant="bodySm" color="textSub">
          Het artikel noemt een nagestreefde ethanolconcentratie van 1000 mg/L. De oplaaddosis vult alleen het verschil
          aan tussen de gemeten ethanolconcentratie en de gekozen streefwaarde. Ligt de gemeten waarde al op of boven de
          gekozen streefwaarde, dan toont AlcoTox geen oplaaddosis.
        </AppText>
        <AppText variant="bodySm" color="textSub">
          De onderhoudsdosering gebruikt gewicht, Vmax en Km. Voor chronisch alcoholgebruik rekent AlcoTox met een hogere
          Vmax dan voor niet-drinkers. Bij dialyse telt AlcoTox extra klaring op.
        </AppText>
        <AppText variant="bodySm" color="textSub">
          De infuusconcentratie wordt gebruikt voor de omrekening van mg ethanol naar ml infuusvolume. De standaardwaarde
          komt overeen met de spreadsheetbereiding, maar kan worden aangepast aan het lokale handboek.
        </AppText>
      </SourceSection>

      <SourceSection title="Aandachtspunten">
        <AppText variant="bodySm" color="textSub">
          De bron noemt controle van de ethanolspiegel 4 tot 6 uur na de oplaaddosis.
        </AppText>
        <AppText variant="bodySm" color="textSub">
          Houd rekening met ethanolafbraak tussen bloedafname en analyseresultaat. Als de uitslag later beschikbaar komt, kan de
          actuele ethanolconcentratie lager zijn dan de gemeten waarde.
        </AppText>
      </SourceSection>

      <View style={{ borderRadius: theme.radius.md, backgroundColor: theme.panelSoft, padding: theme.space.md }}>
        <AppText variant="caption" color="textSub">
          Deze tekst verklaart de berekening. AlcoTox is geen behandelprotocol.
        </AppText>
      </View>
    </AppModal>
  );
}

function SourceSection({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.space.sm }}>
      <AppText variant="bodySm" weight="semibold">
        {title}
      </AppText>
      <View style={{ gap: theme.space.sm }}>{children}</View>
    </View>
  );
}

function Panel({
  children,
  soft = false,
  style,
}: {
  children: React.ReactNode;
  soft?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: soft ? theme.panelSoft : theme.panel,
          padding: theme.space.lg,
          ...(Platform.OS === "web" ? theme.elevation.sm : null),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function Footer() {
  const theme = useTheme();

  return (
    <View
      style={{
        paddingTop: theme.space.md,
      }}
    >
      <AppText variant="caption" color="textSub">
        AlcoTox is een berekeningshulpmiddel, geen behandelprotocol.
      </AppText>
    </View>
  );
}

function parseDecimalInput(value: string): number | null {
  const normalized = value.trim().replace(",", ".");

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function sanitizeDecimalInput(value: string): string {
  let next = "";
  let hasSeparator = false;

  for (const char of value) {
    if (char >= "0" && char <= "9") {
      next += char;
      continue;
    }

    if ((char === "," || char === ".") && !hasSeparator) {
      next += char;
      hasSeparator = true;
    }
  }

  return next;
}
