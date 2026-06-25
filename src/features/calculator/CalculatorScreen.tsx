"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  Calculator,
  FunctionSquare,
  Info,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  BAG_VOLUME_OPTIONS_ML,
  CALCULATOR_CONSTANTS,
  DEFAULT_CALCULATOR_SETTINGS,
  DRINKER_PROFILES,
  VOLUME_DISTRIBUTION_PROFILES,
  calculateEthanolDosing,
  calculateEthanolInfusion,
  type CalculatorSettings,
  type DrinkerStatus,
  type EthanolInfusionResult,
  type VolumeOfDistributionProfileId,
} from "./calculations";
import {
  formatHours,
  formatMg,
  formatMgPerHour,
  formatMgPerMl,
  formatMl,
  formatMlOneDecimal,
  formatMlPerHour,
  formatNumber,
  formatOneDecimal,
} from "./format";

type TargetMode = "1000" | "1500" | "custom";
type EthanolStrengthMode = "96" | "98" | "custom";

const DEFAULT_TARGET_INFUSION_PCT = "10";
const DEFAULT_BAG_VOLUME_ML = "500";
const DEFAULT_CUSTOM_STRENGTH_PCT = "96";

export function CalculatorScreen() {
  const [weightKg, setWeightKg] = React.useState("70");
  const [currentEthanolMgPerL, setCurrentEthanolMgPerL] = React.useState("800");
  const [drinkerStatus, setDrinkerStatus] =
    React.useState<DrinkerStatus>("nonDrinker");
  const [dialysis, setDialysis] = React.useState(false);
  const [targetMode, setTargetMode] = React.useState<TargetMode>("1000");
  const [customTargetEthanolMgPerL, setCustomTargetEthanolMgPerL] =
    React.useState("1000");
  const [volumeOfDistributionProfile, setVolumeOfDistributionProfile] =
    React.useState<VolumeOfDistributionProfileId>("male");
  const [ethanolStrengthMode, setEthanolStrengthMode] =
    React.useState<EthanolStrengthMode>("96");
  const [customStrengthPct, setCustomStrengthPct] = React.useState(
    DEFAULT_CUSTOM_STRENGTH_PCT,
  );
  const [targetInfusionPct, setTargetInfusionPct] = React.useState(
    DEFAULT_TARGET_INFUSION_PCT,
  );
  const [bagVolumeMl, setBagVolumeMl] = React.useState(DEFAULT_BAG_VOLUME_ML);

  const parsedWeight = parseDecimalInput(weightKg);
  const parsedEthanol = parseDecimalInput(currentEthanolMgPerL);
  const parsedCustomTarget = parseDecimalInput(customTargetEthanolMgPerL);
  const parsedCustomStrengthPct = parseDecimalInput(customStrengthPct);
  const parsedTargetInfusionPct = parseDecimalInput(targetInfusionPct);
  const parsedBagVolumeMl = parseDecimalInput(bagVolumeMl);
  const ethanolStrengthFraction =
    ethanolStrengthMode === "custom"
      ? parsedCustomStrengthPct !== null
        ? parsedCustomStrengthPct / 100
        : null
      : Number(ethanolStrengthMode) / 100;
  // Eindconcentratie is mass/volume: 10% m/v = 100 mg/ml.
  const targetInfusionMgPerMl =
    parsedTargetInfusionPct !== null ? parsedTargetInfusionPct * 10 : null;
  const infusionPreparation: EthanolInfusionResult | null =
    ethanolStrengthFraction !== null &&
    ethanolStrengthFraction > 0 &&
    ethanolStrengthFraction <= 1 &&
    targetInfusionMgPerMl !== null &&
    targetInfusionMgPerMl > 0 &&
    parsedBagVolumeMl !== null &&
    parsedBagVolumeMl > 0
      ? calculateEthanolInfusion({
          ethanolStrengthFraction,
          targetConcentrationMgPerMl: targetInfusionMgPerMl,
          bagVolumeMl: parsedBagVolumeMl,
        })
      : null;
  const infusionConcentrationGPerL =
    infusionPreparation !== null && infusionPreparation.feasible
      ? infusionPreparation.infusionConcentrationGPerL
      : null;
  const targetEthanolMgPerL =
    targetMode === "custom" ? parsedCustomTarget : Number(targetMode);
  const volumeOfDistributionLPerKg =
    VOLUME_DISTRIBUTION_PROFILES[volumeOfDistributionProfile]
      .volumeOfDistributionLPerKg;
  const settings: CalculatorSettings = {
    targetEthanolMgPerL:
      targetEthanolMgPerL ?? DEFAULT_CALCULATOR_SETTINGS.targetEthanolMgPerL,
    volumeOfDistributionLPerKg,
    infusionConcentrationGPerL:
      infusionConcentrationGPerL ??
      DEFAULT_CALCULATOR_SETTINGS.infusionConcentrationGPerL,
  };
  const settingsAreValid =
    targetEthanolMgPerL !== null &&
    targetEthanolMgPerL > 0 &&
    infusionConcentrationGPerL !== null &&
    infusionConcentrationGPerL > 0;
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
      volumeOfDistributionProfile !== "male" ||
      ethanolStrengthMode !== "96" ||
      targetInfusionPct !== DEFAULT_TARGET_INFUSION_PCT ||
      bagVolumeMl !== DEFAULT_BAG_VOLUME_ML,
  );
  const result =
    canCalculate && parsedWeight !== null && parsedEthanol !== null
      ? calculateEthanolDosing({
          weightKg: parsedWeight,
          currentEthanolMgPerL: parsedEthanol,
          drinkerStatus,
          dialysis,
          settings,
        })
      : null;
  const aboveTarget = result !== null && result.loadingDose.mg === 0;

  const resetInputs = () => {
    setWeightKg("");
    setCurrentEthanolMgPerL("");
    setDrinkerStatus("nonDrinker");
    setDialysis(false);
    setTargetMode("1000");
    setCustomTargetEthanolMgPerL("1000");
    setVolumeOfDistributionProfile("male");
    setEthanolStrengthMode("96");
    setCustomStrengthPct(DEFAULT_CUSTOM_STRENGTH_PCT);
    setTargetInfusionPct(DEFAULT_TARGET_INFUSION_PCT);
    setBagVolumeMl(DEFAULT_BAG_VOLUME_ML);
  };

  return (
    <main className="mx-auto w-full max-w-[960px] px-4 pb-12 pt-6 min-[820px]:px-6 min-[820px]:pt-8">
      <div className="flex flex-col gap-4">
        <header
          className="reveal flex flex-col gap-3 py-2 min-[820px]:py-3"
          style={{ animationDelay: "40ms" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-lg bg-primary-soft">
              <Calculator
                className="size-6 text-primary-dark"
                strokeWidth={1.75}
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <h1 className="text-title-xl font-bold text-foreground">
                EthaDose
              </h1>
              <p className="text-caption text-icon-muted">
                Ethanol doseringshulp
              </p>
            </div>
          </div>
          <p className="max-w-[720px] text-body-md text-muted-foreground">
            Bereken een oplaaddosis en onderhoudsdosering voor ethanol bij
            methanol- of ethyleenglycolintoxicatie.
          </p>
        </header>

        <div className="grid items-stretch gap-4 min-[820px]:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <Card
            className="reveal order-1 h-full"
            style={{ animationDelay: "100ms" }}
          >
            <CardContent className="flex flex-col gap-4">
              <h2 className="text-title-md font-semibold text-foreground">
                Invoer
              </h2>

              <NumberField
                id="weight"
                label="Gewicht"
                unit="kg"
                value={weightKg}
                onChange={setWeightKg}
              />

              <NumberField
                id="ethanol"
                label="Gemeten ethanolconcentratie"
                unit="mg/L"
                value={currentEthanolMgPerL}
                onChange={setCurrentEthanolMgPerL}
              />

              <div className="flex flex-col gap-2">
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
              </div>

              <div className="flex flex-col gap-2">
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
                    text={`Tijdens dialyse telt EthaDose ${CALCULATOR_CONSTANTS.dialysisClearanceMgKgHour} mg/kg/uur extra klaring bij Vmax op.`}
                  />
                ) : null}
              </div>

              <DoseSettings
                targetMode={targetMode}
                customTargetEthanolMgPerL={customTargetEthanolMgPerL}
                volumeOfDistributionProfile={volumeOfDistributionProfile}
                onTargetModeChange={setTargetMode}
                onCustomTargetChange={setCustomTargetEthanolMgPerL}
                onVolumeOfDistributionProfileChange={
                  setVolumeOfDistributionProfile
                }
              />

              {hasInput ? (
                <Button
                  variant="secondary"
                  onClick={resetInputs}
                  className="self-start"
                >
                  <RotateCcw className="size-[18px]" strokeWidth={1.75} />
                  Wis invoer
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <div className="order-2 flex h-full flex-col gap-4">
            <Card className="reveal" style={{ animationDelay: "160ms" }}>
              <CardContent className="flex flex-col gap-4">
                <h2 className="text-title-md font-semibold text-foreground">
                  Resultaat
                </h2>

                {result ? (
                  aboveTarget ? (
                    <>
                      <ResultRow
                        title="Oplaaddosis"
                        primary="Geen oplaaddosis nodig"
                        secondary={`Gemeten ethanol is op of boven ${formatOneDecimal(settings.targetEthanolMgPerL)} mg/L.`}
                      />
                      <ResultRow
                        title={
                          dialysis
                            ? "Onderhoud tijdens dialyse"
                            : "Onderhoudsdosering"
                        }
                        primary="Geen onderhoudsdosering nodig"
                        secondary={`Gemeten ethanol is op of boven ${formatOneDecimal(settings.targetEthanolMgPerL)} mg/L.`}
                        divider={false}
                      />
                      <AssumptionSummary settings={result.settings} />
                    </>
                  ) : (
                    <>
                      <div className="grid gap-3 min-[480px]:grid-cols-2">
                        <ResultRow
                          title="Oplaaddosis"
                          primary={formatMg(result.loadingDose.mg)}
                          secondary={formatMl(result.loadingDose.ml)}
                          emphasized
                        />
                        <ResultRow
                          title={
                            dialysis
                              ? "Onderhoud tijdens dialyse"
                              : "Onderhoudsdosering"
                          }
                          primary={formatMgPerHour(
                            result.selectedMaintenanceDose.mgPerHour,
                          )}
                          secondary={formatMlPerHour(
                            result.selectedMaintenanceDose.mlPerHour,
                          )}
                          emphasized
                        />
                      </div>
                      <PumpTiming
                        preparation={infusionPreparation}
                        maintenanceMlPerHour={
                          result.selectedMaintenanceDose.mlPerHour
                        }
                      />
                      <AssumptionSummary settings={result.settings} />
                    </>
                  )
                ) : (
                  <EmptyResult />
                )}
              </CardContent>
            </Card>

            <InfusionPreparationCard
              ethanolStrengthMode={ethanolStrengthMode}
              customStrengthPct={customStrengthPct}
              targetInfusionPct={targetInfusionPct}
              bagVolumeMl={bagVolumeMl}
              preparation={infusionPreparation}
              onEthanolStrengthModeChange={setEthanolStrengthMode}
              onCustomStrengthChange={setCustomStrengthPct}
              onTargetInfusionPctChange={setTargetInfusionPct}
              onBagVolumeChange={setBagVolumeMl}
            />
          </div>
        </div>

        <FormulaPanel
          drinkerStatus={drinkerStatus}
          dialysis={dialysis}
          weightKg={parsedWeight}
          currentEthanolMgPerL={parsedEthanol}
          settings={settings}
        />

        <Footer />
      </div>
    </main>
  );
}

function NumberField({
  id,
  label,
  unit,
  value,
  onChange,
  error,
  helper,
}: {
  id: string;
  label: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helper?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        <span className="text-body-sm text-muted-foreground">{unit}</span>
      </div>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(sanitizeDecimalInput(event.target.value))}
        inputMode="decimal"
        placeholder="0"
        aria-label={`${label} in ${unit}`}
        aria-invalid={Boolean(error)}
        className={
          error
            ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/25"
            : undefined
        }
      />
      {error ? (
        <p className="text-caption text-destructive">{error}</p>
      ) : helper ? (
        <p className="text-caption text-muted-foreground">{helper}</p>
      ) : null}
    </div>
  );
}

function DoseSettings({
  targetMode,
  customTargetEthanolMgPerL,
  volumeOfDistributionProfile,
  onTargetModeChange,
  onCustomTargetChange,
  onVolumeOfDistributionProfileChange,
}: {
  targetMode: TargetMode;
  customTargetEthanolMgPerL: string;
  volumeOfDistributionProfile: VolumeOfDistributionProfileId;
  onTargetModeChange: (value: TargetMode) => void;
  onCustomTargetChange: (value: string) => void;
  onVolumeOfDistributionProfileChange: (
    value: VolumeOfDistributionProfileId,
  ) => void;
}) {
  const parsedCustomTarget = parseDecimalInput(customTargetEthanolMgPerL);
  const volumeOfDistributionLPerKg =
    VOLUME_DISTRIBUTION_PROFILES[volumeOfDistributionProfile]
      .volumeOfDistributionLPerKg;
  const targetError =
    targetMode === "custom" &&
    (parsedCustomTarget === null || parsedCustomTarget <= 0)
      ? "Vul een streefconcentratie groter dan 0 in."
      : undefined;

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-title-md font-semibold text-foreground">
          Doseerinstellingen
        </h2>
      </div>

      <SegmentedControl
        label="Streefconcentratie ethanol"
        value={targetMode}
        options={[
          { value: "1000", label: "1000 mg/L" },
          { value: "1500", label: "1500 mg/L" },
          { value: "custom", label: "Anders" },
        ]}
        onChange={onTargetModeChange}
      />

      {targetMode === "custom" ? (
        <NumberField
          id="custom-target"
          label="Streefconcentratie"
          unit="mg/L"
          value={customTargetEthanolMgPerL}
          onChange={onCustomTargetChange}
          error={targetError}
        />
      ) : null}

      <InlineNotice
        icon={Info}
        text="1000 mg/L is de in de standaard nagestreefde ethanolconcentratie. Lokale protocollen kunnen verschillen."
      />

      <div className="flex flex-col gap-2">
        <SegmentedControl
          label="Verdelingsvolume"
          value={volumeOfDistributionProfile}
          options={[
            { value: "male", label: "Man" },
            { value: "female", label: "Vrouw" },
          ]}
          onChange={onVolumeOfDistributionProfileChange}
        />
        <InlineNotice
          icon={Info}
          text={`Vd ${formatOneDecimal(volumeOfDistributionLPerKg)} L/kg bepaalt de oplaaddosis.`}
        />
      </div>
    </div>
  );
}

function InfusionPreparationCard({
  ethanolStrengthMode,
  customStrengthPct,
  targetInfusionPct,
  bagVolumeMl,
  preparation,
  onEthanolStrengthModeChange,
  onCustomStrengthChange,
  onTargetInfusionPctChange,
  onBagVolumeChange,
}: {
  ethanolStrengthMode: EthanolStrengthMode;
  customStrengthPct: string;
  targetInfusionPct: string;
  bagVolumeMl: string;
  preparation: EthanolInfusionResult | null;
  onEthanolStrengthModeChange: (value: EthanolStrengthMode) => void;
  onCustomStrengthChange: (value: string) => void;
  onTargetInfusionPctChange: (value: string) => void;
  onBagVolumeChange: (value: string) => void;
}) {
  const parsedCustomStrengthPct = parseDecimalInput(customStrengthPct);
  const parsedTargetInfusionPct = parseDecimalInput(targetInfusionPct);
  const strengthPctLabel =
    ethanolStrengthMode === "custom"
      ? parsedCustomStrengthPct !== null
        ? `${formatOneDecimal(parsedCustomStrengthPct)}%`
        : "ethanol"
      : `${ethanolStrengthMode}%`;
  const strengthError =
    ethanolStrengthMode === "custom" &&
    (parsedCustomStrengthPct === null ||
      parsedCustomStrengthPct <= 0 ||
      parsedCustomStrengthPct > 100)
      ? "Vul een percentage tussen 0 en 100 in."
      : undefined;
  const targetError =
    parsedTargetInfusionPct === null || parsedTargetInfusionPct <= 0
      ? "Vul een eindconcentratie groter dan 0 in."
      : undefined;

  return (
    <Card className="reveal flex-1" style={{ animationDelay: "250ms" }}>
      <CardContent className="flex h-full flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-title-md font-semibold text-foreground">
            Infuusbereiding
          </h2>
          <p className="text-caption text-muted-foreground">
            Kies de ethanolconcentratie, de gewenste eindconcentratie (m/v) en het
            volume van de glucose 5% zak. EthaDose berekent hoeveel ml ethanol je
            moet bijspuiten en het resulterende eindvolume.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <SegmentedControl
            label="Ethanolconcentratie ampul/injectieflacon (v/v)"
            value={ethanolStrengthMode}
            options={[
              { value: "96", label: "96%" },
              { value: "98", label: "98%" },
              { value: "custom", label: "Anders" },
            ]}
            onChange={onEthanolStrengthModeChange}
          />
          {ethanolStrengthMode === "custom" ? (
            <NumberField
              id="custom-strength"
              label="Ethanolconcentratie"
              unit="% v/v"
              value={customStrengthPct}
              onChange={onCustomStrengthChange}
              error={strengthError}
            />
          ) : null}
        </div>

        <NumberField
          id="target-infusion"
          label="Eindconcentratie ethanol infuuszak"
          unit="% m/v"
          value={targetInfusionPct}
          onChange={onTargetInfusionPctChange}
          error={targetError}
          helper="10% m/v komt overeen met 100 mg/ml."
        />

        <SegmentedControl
          label="Infuuszak glucose 5%"
          value={bagVolumeMl}
          options={BAG_VOLUME_OPTIONS_ML.map((volume) => ({
            value: String(volume),
            label: `${volume} ml`,
          }))}
          onChange={onBagVolumeChange}
        />

        {preparation && preparation.feasible ? (
          <ResultRow
            title={`Bijspuiten ethanol ${strengthPctLabel}`}
            primary={formatMlOneDecimal(preparation.ethanolToAddMl)}
            secondary={`Eindvolume ${formatMlOneDecimal(preparation.finalVolumeMl)} (${formatNumber(Number(bagVolumeMl) || 0)} ml zak + ${formatMlOneDecimal(preparation.ethanolToAddMl)} ethanol).`}
            emphasized
          />
        ) : preparation && !preparation.feasible ? (
          <InlineNotice
            icon={Info}
            tone="warning"
            text={`De eindconcentratie (${formatMgPerMl(preparation.infusionConcentrationGPerL)}) is hoger dan de stocksterkte (${formatMgPerMl(preparation.stockConcentrationMgPerMl)}). Kies een lagere eindconcentratie of een sterkere ethanol.`}
          />
        ) : (
          <InlineNotice
            icon={Info}
            text="Vul de sterkte, eindconcentratie en zakvolume in om de bereiding te berekenen."
          />
        )}
      </CardContent>
    </Card>
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
  return (
    <div className="flex flex-col gap-2">
      <span className="text-body-sm font-semibold text-foreground">
        {label}
      </span>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(next) => {
          if (next) {
            onChange(next as TValue);
          }
        }}
        aria-label={label}
      >
        {options.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value}>
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
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
  if (emphasized) {
    return (
      <div className="flex flex-col gap-1 rounded-lg bg-primary-soft p-3">
        <span className="text-body-sm font-semibold text-muted-foreground">
          {title}
        </span>
        <span className="text-title-xl font-bold text-primary-dark">
          {primary}
        </span>
        <span className="text-body-sm text-muted-foreground">{secondary}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-1 py-3",
        divider && "border-b border-border",
      )}
    >
      <span className="text-body-sm font-semibold text-muted-foreground">
        {title}
      </span>
      <span className="text-body-md font-bold text-foreground">{primary}</span>
      <span className="text-body-sm text-muted-foreground">{secondary}</span>
    </div>
  );
}

function AssumptionSummary({ settings }: { settings: CalculatorSettings }) {
  return (
    <div className="flex flex-wrap gap-2 pt-2">
      <AssumptionPill
        text={`Doel ${formatOneDecimal(settings.targetEthanolMgPerL)} mg/L`}
      />
      <AssumptionPill
        text={`Vd ${formatOneDecimal(settings.volumeOfDistributionLPerKg)} L/kg`}
      />
      <AssumptionPill
        text={`Infuus ${formatMgPerMl(settings.infusionConcentrationGPerL)}`}
      />
    </div>
  );
}

function AssumptionPill({ text }: { text: string }) {
  return (
    <span className="inline-flex min-h-[30px] items-center rounded-full bg-panel-soft px-3 text-caption font-medium text-muted-foreground">
      {text}
    </span>
  );
}

function PumpTiming({
  preparation,
  maintenanceMlPerHour,
}: {
  preparation: EthanolInfusionResult | null;
  maintenanceMlPerHour: number;
}) {
  if (
    !preparation ||
    !preparation.feasible ||
    maintenanceMlPerHour <= 0
  ) {
    return null;
  }

  const hoursToEmpty = preparation.finalVolumeMl / maintenanceMlPerHour;

  return (
    <div className="flex flex-col gap-1 rounded-lg bg-panel-soft p-3">
      <span className="text-body-sm font-semibold text-muted-foreground">
        Pomp instellen (onderhoud)
      </span>
      <span className="text-body-md text-foreground">
        Zak leeg na {formatHours(hoursToEmpty)} bij{" "}
        {formatMlPerHour(maintenanceMlPerHour)}.
      </span>
      <span className="text-body-sm text-muted-foreground">
        Inhoud zak {formatMlOneDecimal(preparation.finalVolumeMl)}.
      </span>
    </div>
  );
}

function EmptyResult() {
  return (
    <div className="flex flex-col items-center gap-2 py-5 text-center">
      <Calculator className="size-7 text-icon-muted" strokeWidth={1.75} />
      <p className="max-w-[320px] text-body-md text-muted-foreground">
        Vul gewicht en gemeten ethanolconcentratie in. De dosering verschijnt
        zodra beide waarden geldig zijn.
      </p>
    </div>
  );
}

function InlineNotice({
  icon: Icon,
  text,
  tone = "info",
}: {
  icon: LucideIcon;
  text: string;
  tone?: "info" | "warning";
}) {
  return (
    <div
      className={cn(
        "flex gap-2 rounded-md p-3",
        tone === "warning" ? "bg-warning-soft" : "bg-primary-soft",
      )}
    >
      <Icon
        className={cn(
          "size-[18px] shrink-0",
          tone === "warning" ? "text-warning" : "text-primary-dark",
        )}
        strokeWidth={1.75}
      />
      <p className="text-body-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function FormulaPanel({
  className,
  drinkerStatus,
  dialysis,
  weightKg,
  currentEthanolMgPerL,
  settings,
}: {
  className?: string;
  drinkerStatus: DrinkerStatus;
  dialysis: boolean;
  weightKg: number | null;
  currentEthanolMgPerL: number | null;
  settings: CalculatorSettings;
}) {
  const profile = DRINKER_PROFILES[drinkerStatus];
  const vmax = dialysis
    ? profile.vmaxMgKgHour + CALCULATOR_CONSTANTS.dialysisClearanceMgKgHour
    : profile.vmaxMgKgHour;
  const km = CALCULATOR_CONSTANTS.kmMgPerL;
  const target = settings.targetEthanolMgPerL;
  const vd = settings.volumeOfDistributionLPerKg;
  // Show the filled-in numbers only when both patient inputs are valid.
  const hasInputs = weightKg !== null && currentEthanolMgPerL !== null;
  const loadingSubstitution = hasInputs
    ? `= ${formatOneDecimal(vd)} x ${formatNumber(weightKg)} x max(0, ${formatNumber(target)} - ${formatNumber(currentEthanolMgPerL)})`
    : undefined;
  const maintenanceSubstitution = hasInputs
    ? `= ${formatNumber(target)} x ${formatNumber(vmax)} x ${formatNumber(weightKg)} / (${formatNumber(km)} + ${formatNumber(target)})`
    : undefined;

  return (
    <Card className={cn("reveal", className)} style={{ animationDelay: "220ms" }}>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <FunctionSquare
            className="size-5 text-primary-dark"
            strokeWidth={1.75}
          />
          <h2 className="text-title-md font-semibold text-foreground">
            Gebruikte formules
          </h2>
        </div>

        <div className="grid gap-3 min-[720px]:grid-cols-2">
          <FormulaLine
            label="Oplaaddosis"
            formula="D = Vd x gewicht x max(0, Cdoel - Cethanol)"
            substitution={loadingSubstitution}
          />
          <FormulaLine
            label={dialysis ? "Onderhoud tijdens dialyse" : "Onderhoud"}
            formula="D' = Cdoel x Vmax x gewicht / (Km + Cdoel)"
            substitution={maintenanceSubstitution}
          />
        </div>

        {currentEthanolMgPerL !== null &&
        currentEthanolMgPerL >= settings.targetEthanolMgPerL ? (
          <p className="text-body-sm text-muted-foreground">
            Boven de streefconcentratie is doseren niet nodig. EthaDose toont dan
            geen oplaad- en geen onderhoudsdosering.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function FormulaLine({
  label,
  formula,
  substitution,
}: {
  label: string;
  formula: string;
  substitution?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-md bg-panel-soft p-3">
      <span className="text-body-sm font-semibold text-muted-foreground">
        {label}
      </span>
      <span className="text-body-sm text-foreground">{formula}</span>
      {substitution ? (
        <span className="text-caption text-muted-foreground">
          {substitution}
        </span>
      ) : null}
    </div>
  );
}

function Footer() {
  return (
    <footer
      className="reveal mt-2 flex flex-col gap-5 border-t border-border pt-6"
      style={{ animationDelay: "340ms" }}
    >
      <div className="flex flex-col gap-4 min-[560px]:flex-row min-[560px]:items-center min-[560px]:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary-soft">
            <Calculator className="size-4 text-primary-dark" strokeWidth={1.75} />
          </span>
          <span className="text-body-sm font-semibold text-foreground">
            EthaDose
          </span>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-1.5">
          {[
            { href: "/validatie/", label: "Validatie" },
            { href: "/bron/", label: "Bron" },
            { href: "/voorwaarden/", label: "Voorwaarden" },
            { href: "/privacy/", label: "Privacy" },
            { href: "/cookies/", label: "Cookies" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-body-sm text-muted-foreground underline-offset-4 transition-colors hover:text-primary-dark hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-1 border-t border-border pt-4">
        <p className="text-caption text-muted-foreground">
          EthaDose is een berekeningshulpmiddel, geen behandelprotocol.
        </p>
      </div>
    </footer>
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
