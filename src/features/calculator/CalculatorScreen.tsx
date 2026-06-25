"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  BookOpen,
  Calculator,
  FunctionSquare,
  Info,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
import {
  formatGPerL,
  formatMg,
  formatMgPerHour,
  formatMl,
  formatMlPerHour,
  formatOneDecimal,
} from "./format";
import { REFERENCE, SOURCE_SECTIONS } from "./content";

type TargetMode = "1000" | "1500" | "custom";

const DEFAULT_INFUSION = formatOneDecimal(
  DEFAULT_CALCULATOR_SETTINGS.infusionConcentrationGPerL,
);

export function CalculatorScreen() {
  const [weightKg, setWeightKg] = React.useState("70");
  const [currentEthanolMgPerL, setCurrentEthanolMgPerL] = React.useState("800");
  const [drinkerStatus, setDrinkerStatus] =
    React.useState<DrinkerStatus>("nonDrinker");
  const [dialysis, setDialysis] = React.useState(false);
  const [targetMode, setTargetMode] = React.useState<TargetMode>("1000");
  const [customTargetEthanolMgPerL, setCustomTargetEthanolMgPerL] =
    React.useState("");
  const [volumeOfDistributionProfile, setVolumeOfDistributionProfile] =
    React.useState<VolumeOfDistributionProfileId>("male");
  const [infusionConcentrationGPerL, setInfusionConcentrationGPerL] =
    React.useState(DEFAULT_INFUSION);
  const [sourceOpen, setSourceOpen] = React.useState(false);

  const parsedWeight = parseDecimalInput(weightKg);
  const parsedEthanol = parseDecimalInput(currentEthanolMgPerL);
  const parsedCustomTarget = parseDecimalInput(customTargetEthanolMgPerL);
  const parsedInfusionConcentration = parseDecimalInput(
    infusionConcentrationGPerL,
  );
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
      parsedInfusionConcentration ??
      DEFAULT_CALCULATOR_SETTINGS.infusionConcentrationGPerL,
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
      volumeOfDistributionProfile !== "male" ||
      infusionConcentrationGPerL !== DEFAULT_INFUSION,
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
    setCustomTargetEthanolMgPerL("");
    setVolumeOfDistributionProfile("male");
    setInfusionConcentrationGPerL(DEFAULT_INFUSION);
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
                AlcoTox
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

        <div className="flex flex-col items-stretch gap-4 min-[820px]:flex-row">
          <Card
            className="reveal min-[820px]:flex-[0.95]"
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
                    text={`Tijdens dialyse telt AlcoTox ${CALCULATOR_CONSTANTS.dialysisClearanceMgKgHour} mg/kg/uur extra klaring bij Vmax op.`}
                  />
                ) : null}
              </div>

              <DoseSettings
                targetMode={targetMode}
                customTargetEthanolMgPerL={customTargetEthanolMgPerL}
                volumeOfDistributionProfile={volumeOfDistributionProfile}
                infusionConcentrationGPerL={infusionConcentrationGPerL}
                onTargetModeChange={setTargetMode}
                onCustomTargetChange={setCustomTargetEthanolMgPerL}
                onVolumeOfDistributionProfileChange={
                  setVolumeOfDistributionProfile
                }
                onInfusionConcentrationChange={setInfusionConcentrationGPerL}
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

          <div className="flex flex-col gap-4 min-[820px]:flex-[1.05]">
            <Card className="reveal" style={{ animationDelay: "160ms" }}>
              <CardContent className="flex flex-col gap-4">
                <h2 className="text-title-md font-semibold text-foreground">
                  Resultaat
                </h2>

                {result ? (
                  <>
                    <ResultRow
                      title="Oplaaddosis"
                      primary={
                        aboveTarget
                          ? "Geen oplaaddosis nodig"
                          : formatMg(result.loadingDose.mg)
                      }
                      secondary={
                        aboveTarget
                          ? `Gemeten ethanol is op of boven ${formatOneDecimal(settings.targetEthanolMgPerL)} mg/L.`
                          : formatMl(result.loadingDose.ml)
                      }
                    />
                    {aboveTarget ? (
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
                    ) : (
                      <>
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
                        <InfusionBasis settings={result.settings} />
                      </>
                    )}
                    <AssumptionSummary settings={result.settings} />
                  </>
                ) : (
                  <EmptyResult />
                )}
              </CardContent>
            </Card>

            <FormulaPanel
              drinkerStatus={drinkerStatus}
              dialysis={dialysis}
              currentEthanolMgPerL={parsedEthanol}
              settings={settings}
            />

            <Button
              variant="secondary"
              onClick={() => setSourceOpen(true)}
              className="reveal w-full"
              style={{ animationDelay: "280ms" }}
            >
              <BookOpen className="size-[18px]" strokeWidth={1.75} />
              Bron en methode
            </Button>
          </div>
        </div>

        <Footer />
      </div>

      <SourceModal open={sourceOpen} onOpenChange={setSourceOpen} />
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
  onVolumeOfDistributionProfileChange: (
    value: VolumeOfDistributionProfileId,
  ) => void;
  onInfusionConcentrationChange: (value: string) => void;
}) {
  const parsedCustomTarget = parseDecimalInput(customTargetEthanolMgPerL);
  const parsedInfusionConcentration = parseDecimalInput(
    infusionConcentrationGPerL,
  );
  const targetError =
    targetMode === "custom" &&
    (parsedCustomTarget === null || parsedCustomTarget <= 0)
      ? "Vul een streefconcentratie groter dan 0 in."
      : undefined;
  const infusionError =
    parsedInfusionConcentration === null || parsedInfusionConcentration <= 0
      ? "Vul een infuusconcentratie groter dan 0 in."
      : undefined;

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-title-md font-semibold text-foreground">
          Doseerinstellingen
        </h2>
        <p className="text-caption text-muted-foreground">
          Standaardwaarden staan aan. Pas alleen aan volgens lokaal protocol.
        </p>
      </div>

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
          id="custom-target"
          label="Custom streefconcentratie"
          unit="mg/L"
          value={customTargetEthanolMgPerL}
          onChange={onCustomTargetChange}
          error={targetError}
        />
      ) : null}

      <InlineNotice
        icon={Info}
        text="Bij 1000 mg/L is circa 90% van de methanoloxidatie geremd. Lokale protocollen kunnen hoger zijn."
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
        id="infusion"
        label="Infuusconcentratie"
        unit="g/L"
        value={infusionConcentrationGPerL}
        onChange={onInfusionConcentrationChange}
        error={infusionError}
        helper="Standaard 50 ml ethanol 96% v/v in 300 ml totaal."
      />
    </div>
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
        text={`Infuus ${formatGPerL(settings.infusionConcentrationGPerL)}`}
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

function InfusionBasis({ settings }: { settings: CalculatorSettings }) {
  return (
    <p className="pt-2 text-caption text-muted-foreground">
      Omrekening naar infuusvolume gebruikt{" "}
      {formatGPerL(settings.infusionConcentrationGPerL)}.
    </p>
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
  const profile = DRINKER_PROFILES[drinkerStatus];
  const vmax = dialysis
    ? profile.vmaxMgKgHour + CALCULATOR_CONSTANTS.dialysisClearanceMgKgHour
    : profile.vmaxMgKgHour;

  return (
    <Card className="reveal" style={{ animationDelay: "220ms" }}>
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

        {currentEthanolMgPerL !== null &&
        currentEthanolMgPerL >= settings.targetEthanolMgPerL ? (
          <p className="text-body-sm text-muted-foreground">
            Boven de streefconcentratie is doseren niet nodig. AlcoTox toont dan
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
  detail,
}: {
  label: string;
  formula: string;
  detail?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-md bg-panel-soft p-3">
      <span className="text-body-sm font-semibold text-muted-foreground">
        {label}
      </span>
      <span className="text-body-sm text-foreground">{formula}</span>
      {detail ? (
        <span className="text-caption text-muted-foreground">{detail}</span>
      ) : null}
    </div>
  );
}

function SourceModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bron en methode</DialogTitle>
          <DialogDescription>
            Waarom 1000 mg/L de standaardwaarde is en welke aannames lokaal
            kunnen afwijken.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {SOURCE_SECTIONS.map((section) => (
            <section key={section.title} className="flex flex-col gap-2">
              <h3 className="text-body-sm font-semibold text-foreground">
                {section.title}
              </h3>
              <div className="flex flex-col gap-2">
                {section.paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-body-sm text-muted-foreground"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}

          <div className="rounded-md bg-panel-soft p-3">
            <p className="text-caption text-muted-foreground">
              Deze tekst verklaart de berekening. AlcoTox is geen
              behandelprotocol.
            </p>
          </div>

          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <h3 className="text-body-sm font-semibold text-foreground">
              Referentie
            </h3>
            <p className="text-caption text-muted-foreground">{REFERENCE}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
            AlcoTox
          </span>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-1.5">
          {[
            { href: "/validatie/", label: "Validatie" },
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
          AlcoTox is een berekeningshulpmiddel, geen behandelprotocol.
        </p>
        <p className="text-caption text-muted-foreground">Bron: {REFERENCE}</p>
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
