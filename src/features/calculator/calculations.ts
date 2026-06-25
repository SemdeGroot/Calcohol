export type DrinkerStatus = "nonDrinker" | "chronicDrinker";
export type VolumeOfDistributionProfileId = "male" | "female";

export type CalculatorSettings = {
  targetEthanolMgPerL: number;
  volumeOfDistributionLPerKg: number;
  infusionConcentrationGPerL: number;
};

export type CalculatorInput = {
  weightKg?: number | null;
  currentEthanolMgPerL?: number | null;
  drinkerStatus: DrinkerStatus;
  dialysis: boolean;
  settings?: Partial<CalculatorSettings>;
};

export type DoseResult = {
  mg: number;
  ml: number;
};

export type MaintenanceDoseResult = DoseResult & {
  mgPerHour: number;
  mlPerHour: number;
};

export type CalculatorResult = {
  loadingDose: DoseResult;
  maintenanceDose: MaintenanceDoseResult;
  dialysisMaintenanceDose: MaintenanceDoseResult;
  selectedMaintenanceDose: MaintenanceDoseResult;
  profile: DrinkerProfile;
  settings: CalculatorSettings;
  constants: typeof CALCULATOR_CONSTANTS;
};

export type DrinkerProfile = {
  status: DrinkerStatus;
  label: string;
  vmaxMgKgHour: number;
};

export class CalculatorInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CalculatorInputError";
  }
}

export const CALCULATOR_CONSTANTS = {
  targetEthanolMgPerL: 1000,
  kmMgPerL: 138,
  volumeOfDistributionLPerKg: 0.6,
  dialysisClearanceMgKgHour: 150,
  ethanolStockMg: 38000,
  infusionVolumeMl: 300,
  infusionConcentrationGPerL: 38000 / 300,
} as const;

export const TARGET_ETHANOL_OPTIONS_MG_PER_L = [1000, 1500] as const;

export const VOLUME_DISTRIBUTION_PROFILES: Record<
  VolumeOfDistributionProfileId,
  {
    id: VolumeOfDistributionProfileId;
    label: string;
    volumeOfDistributionLPerKg: number;
  }
> = {
  male: {
    id: "male",
    label: "Man",
    volumeOfDistributionLPerKg: 0.7,
  },
  female: {
    id: "female",
    label: "Vrouw",
    volumeOfDistributionLPerKg: 0.6,
  },
};

export const DEFAULT_CALCULATOR_SETTINGS: CalculatorSettings = {
  targetEthanolMgPerL: CALCULATOR_CONSTANTS.targetEthanolMgPerL,
  volumeOfDistributionLPerKg: CALCULATOR_CONSTANTS.volumeOfDistributionLPerKg,
  infusionConcentrationGPerL: CALCULATOR_CONSTANTS.infusionConcentrationGPerL,
};

export const DRINKER_PROFILES: Record<DrinkerStatus, DrinkerProfile> = {
  nonDrinker: {
    status: "nonDrinker",
    label: "Niet-drinker",
    vmaxMgKgHour: 75,
  },
  chronicDrinker: {
    status: "chronicDrinker",
    label: "Chronische drinker",
    vmaxMgKgHour: 175,
  },
};

export function isDrinkerStatus(value: unknown): value is DrinkerStatus {
  return value === "nonDrinker" || value === "chronicDrinker";
}

export function parseDrinkerStatus(value: unknown): DrinkerStatus {
  if (!isDrinkerStatus(value)) {
    throw new CalculatorInputError("Onbekende drinkerstatus.");
  }

  return value;
}

export function calculateLoadingDoseMg(
  weightKg: number,
  currentEthanolMgPerL: number,
  targetEthanolMgPerL = DEFAULT_CALCULATOR_SETTINGS.targetEthanolMgPerL,
  volumeOfDistributionLPerKg = DEFAULT_CALCULATOR_SETTINGS.volumeOfDistributionLPerKg,
): number {
  const concentrationGapMgPerL = Math.max(0, targetEthanolMgPerL - currentEthanolMgPerL);

  return volumeOfDistributionLPerKg * weightKg * concentrationGapMgPerL;
}

export function calculateMaintenanceDoseMgPerHour(
  weightKg: number,
  vmaxMgKgHour: number,
  targetEthanolMgPerL = DEFAULT_CALCULATOR_SETTINGS.targetEthanolMgPerL,
): number {
  return (1000 * vmaxMgKgHour * weightKg) / (CALCULATOR_CONSTANTS.kmMgPerL + targetEthanolMgPerL);
}

export function convertMgToInfusionMl(
  doseMg: number,
  infusionConcentrationGPerL = DEFAULT_CALCULATOR_SETTINGS.infusionConcentrationGPerL,
): number {
  return doseMg / infusionConcentrationGPerL;
}

export function calculateEthanolDosing(input: CalculatorInput): CalculatorResult {
  const settings = resolveCalculatorSettings(input.settings);
  validateCalculatorInput(input, settings);

  const profile = DRINKER_PROFILES[input.drinkerStatus];
  const weightKg = input.weightKg;
  const currentEthanolMgPerL = input.currentEthanolMgPerL;

  if (typeof weightKg !== "number" || typeof currentEthanolMgPerL !== "number") {
    throw new CalculatorInputError("Gewicht en ethanolconcentratie zijn verplicht.");
  }

  const loadingMg = calculateLoadingDoseMg(
    weightKg,
    currentEthanolMgPerL,
    settings.targetEthanolMgPerL,
    settings.volumeOfDistributionLPerKg,
  );
  const maintenanceMgPerHour = calculateMaintenanceDoseMgPerHour(
    weightKg,
    profile.vmaxMgKgHour,
    settings.targetEthanolMgPerL,
  );
  const dialysisMaintenanceMgPerHour = calculateMaintenanceDoseMgPerHour(
    weightKg,
    profile.vmaxMgKgHour + CALCULATOR_CONSTANTS.dialysisClearanceMgKgHour,
    settings.targetEthanolMgPerL,
  );

  const maintenanceDose = toMaintenanceDose(maintenanceMgPerHour, settings.infusionConcentrationGPerL);
  const dialysisMaintenanceDose = toMaintenanceDose(
    dialysisMaintenanceMgPerHour,
    settings.infusionConcentrationGPerL,
  );

  return {
    loadingDose: {
      mg: loadingMg,
      ml: convertMgToInfusionMl(loadingMg, settings.infusionConcentrationGPerL),
    },
    maintenanceDose,
    dialysisMaintenanceDose,
    selectedMaintenanceDose: input.dialysis ? dialysisMaintenanceDose : maintenanceDose,
    profile,
    settings,
    constants: CALCULATOR_CONSTANTS,
  };
}

export function resolveCalculatorSettings(settings?: Partial<CalculatorSettings>): CalculatorSettings {
  return {
    ...DEFAULT_CALCULATOR_SETTINGS,
    ...settings,
  };
}

function validateCalculatorInput(input: CalculatorInput, settings: CalculatorSettings) {
  if (!isDrinkerStatus(input.drinkerStatus)) {
    throw new CalculatorInputError("Onbekende drinkerstatus.");
  }

  if (typeof input.weightKg !== "number") {
    throw new CalculatorInputError("Gewicht is verplicht.");
  }

  if (input.weightKg <= 0) {
    throw new CalculatorInputError("Gewicht moet groter zijn dan 0 kg.");
  }

  if (typeof input.currentEthanolMgPerL !== "number") {
    throw new CalculatorInputError("Ethanolconcentratie is verplicht.");
  }

  if (input.currentEthanolMgPerL < 0) {
    throw new CalculatorInputError("Ethanolconcentratie kan niet negatief zijn.");
  }

  if (settings.targetEthanolMgPerL <= 0) {
    throw new CalculatorInputError("Streefconcentratie moet groter zijn dan 0 mg/L.");
  }

  if (settings.volumeOfDistributionLPerKg <= 0) {
    throw new CalculatorInputError("Verdelingsvolume moet groter zijn dan 0 L/kg.");
  }

  if (settings.infusionConcentrationGPerL <= 0) {
    throw new CalculatorInputError("Infuusconcentratie moet groter zijn dan 0 g/L.");
  }
}

function toMaintenanceDose(mgPerHour: number, infusionConcentrationGPerL: number): MaintenanceDoseResult {
  return {
    mg: mgPerHour,
    ml: convertMgToInfusionMl(mgPerHour, infusionConcentrationGPerL),
    mgPerHour,
    mlPerHour: convertMgToInfusionMl(mgPerHour, infusionConcentrationGPerL),
  };
}
