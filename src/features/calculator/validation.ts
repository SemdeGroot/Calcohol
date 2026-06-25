// Validation dataset for the /validatie page.
//
// The expected values below are taken verbatim from the source spreadsheet
// (context/EtOHcalc.XLS, worksheet Blad1; see context/EtOHcalc.md) and the
// source article (Touw et al., Pharmaceutisch Weekblad 1993). The page computes
// the actual values live with the same functions the calculator uses and
// compares them against these documented values, so anyone can verify that the
// deployed build reproduces the source exactly.

import {
  calculateEthanolDosing,
  type CalculatorInput,
} from "./calculations";

export type ValidationMetric = {
  label: string;
  unit: string;
  expected: number;
  actual: number;
  pass: boolean;
};

export type ValidationCaseResult = {
  id: string;
  title: string;
  source: string;
  inputSummary: string;
  metrics: ValidationMetric[];
  pass: boolean;
};

type ValidationCase = {
  id: string;
  title: string;
  source: string;
  inputSummary: string;
  input: CalculatorInput;
  expected: {
    loadingMg: number;
    loadingMl: number;
    maintenanceMgPerHour: number;
    maintenanceMlPerHour: number;
    dialysisMaintenanceMgPerHour: number;
    dialysisMaintenanceMlPerHour: number;
  };
};

// Exact reproduction is required: same formula, same constants. The tolerance
// only absorbs IEEE-754 floating point noise, not real rounding.
const TOLERANCE = 1e-6;

const CASES: ValidationCase[] = [
  {
    id: "non-drinker",
    title: "Niet-drinker",
    source: "EtOHcalc.XLS, Blad1, niet-drinker blok (B19-H23)",
    inputSummary:
      "Gewicht 65 kg, gemeten ethanol 800 mg/L, niet-drinker (Vmax 75 mg/kg/uur), Vd 0,6 L/kg, streef 1000 mg/L.",
    input: {
      weightKg: 65,
      currentEthanolMgPerL: 800,
      drinkerStatus: "nonDrinker",
      dialysis: false,
    },
    expected: {
      loadingMg: 7800,
      loadingMl: 61.5789473684211,
      maintenanceMgPerHour: 4283.83128295255,
      maintenanceMlPerHour: 33.8197206548885,
      dialysisMaintenanceMgPerHour: 12851.4938488576,
      dialysisMaintenanceMlPerHour: 101.459161964666,
    },
  },
  {
    id: "chronic-drinker",
    title: "Chronische drinker",
    source: "EtOHcalc.XLS, Blad1, chronische-drinker blok (B29-H33)",
    inputSummary:
      "Gewicht 82 kg, gemeten ethanol 800 mg/L, chronische drinker (Vmax 175 mg/kg/uur), Vd 0,6 L/kg, streef 1000 mg/L.",
    input: {
      weightKg: 82,
      currentEthanolMgPerL: 800,
      drinkerStatus: "chronicDrinker",
      dialysis: false,
    },
    expected: {
      loadingMg: 9840,
      loadingMl: 77.6842105263158,
      maintenanceMgPerHour: 12609.841827768,
      maintenanceMlPerHour: 99.5513828508001,
      dialysisMaintenanceMgPerHour: 23418.2776801406,
      dialysisMaintenanceMlPerHour: 184.881139580057,
    },
  },
];

function metric(
  label: string,
  unit: string,
  expected: number,
  actual: number,
): ValidationMetric {
  const pass = Math.abs(expected - actual) <= TOLERANCE * Math.max(1, Math.abs(expected));
  return { label, unit, expected, actual, pass };
}

export function runValidation(): ValidationCaseResult[] {
  return CASES.map((testCase) => {
    // The spreadsheet block lists both the regular and the dialysis maintenance
    // dose, so read both from the result regardless of the dialysis input.
    const result = calculateEthanolDosing(testCase.input);
    const metrics: ValidationMetric[] = [
      metric("Oplaaddosis", "mg", testCase.expected.loadingMg, result.loadingDose.mg),
      metric("Oplaaddosis", "ml", testCase.expected.loadingMl, result.loadingDose.ml),
      metric(
        "Onderhoudsdosering",
        "mg/uur",
        testCase.expected.maintenanceMgPerHour,
        result.maintenanceDose.mgPerHour,
      ),
      metric(
        "Onderhoudsdosering",
        "ml/uur",
        testCase.expected.maintenanceMlPerHour,
        result.maintenanceDose.mlPerHour,
      ),
      metric(
        "Onderhoud tijdens dialyse",
        "mg/uur",
        testCase.expected.dialysisMaintenanceMgPerHour,
        result.dialysisMaintenanceDose.mgPerHour,
      ),
      metric(
        "Onderhoud tijdens dialyse",
        "ml/uur",
        testCase.expected.dialysisMaintenanceMlPerHour,
        result.dialysisMaintenanceDose.mlPerHour,
      ),
    ];

    return {
      id: testCase.id,
      title: testCase.title,
      source: testCase.source,
      inputSummary: testCase.inputSummary,
      metrics,
      pass: metrics.every((entry) => entry.pass),
    };
  });
}

export function formatValidationNumber(value: number): string {
  return new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 4 }).format(value);
}
