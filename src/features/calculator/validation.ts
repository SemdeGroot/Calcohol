// Validation dataset for the /validatie page.
//
// The formulas and constants come from the article (Touw et al., Pharmaceutisch
// Weekblad 1993). The first case is the worked example from the article itself
// (a 12 kg child). The other cases apply the same formulas to other profiles.
// The page computes the actual values live with the same functions the
// calculator uses and shows the worked formulas so anyone can recompute by hand.

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
  inputSummary: string;
  formulas: string[];
  note?: string;
  metrics: ValidationMetric[];
  pass: boolean;
};

type ValidationCase = {
  id: string;
  title: string;
  inputSummary: string;
  formulas: string[];
  note?: string;
  includeDialysis: boolean;
  input: CalculatorInput;
  expected: {
    loadingMg: number;
    maintenanceMgPerHour: number;
    dialysisMaintenanceMgPerHour: number;
  };
};

// Exact reproduction is required: same formula, same constants. The tolerance
// only absorbs IEEE-754 floating point noise, not real rounding.
const TOLERANCE = 1e-6;

const CASES: ValidationCase[] = [
  {
    id: "article",
    title: "Casus uit het artikel (kind van 12 kg)",
    inputSummary:
      "Voorbeeld uit Touw et al. (1993): kind van 12 kg, niet-drinker, Vd 0,6 L/kg, streef 1000 mg/L. Op het moment van doseren is de ethanolconcentratie circa 600 mg/L.",
    formulas: [
      "D = Vd x gewicht x (Cdoel - Cethanol) = 0,6 x 12 x (1000 - 600) = 2880 mg",
      "D' = Cdoel x Vmax x gewicht / (Km + Cdoel) = 1000 x 75 x 12 / (138 + 1000) = 790,86 mg/uur",
    ],
    note: "Het artikel toont een oplaaddosis van 2880 mg en rondt de onderhoudsdosering af naar 800 mg/uur. EthaDose toont de onafgeronde waarde.",
    includeDialysis: false,
    input: {
      weightKg: 12,
      currentEthanolMgPerL: 600,
      drinkerStatus: "nonDrinker",
      dialysis: false,
    },
    expected: {
      loadingMg: 2880,
      maintenanceMgPerHour: 790.8611599297012,
      dialysisMaintenanceMgPerHour: 0,
    },
  },
  {
    id: "non-drinker",
    title: "Niet-drinker (65 kg)",
    inputSummary:
      "Gewicht 65 kg, gemeten ethanol 800 mg/L, niet-drinker (Vmax 75 mg/kg/uur), Vd 0,6 L/kg, streef 1000 mg/L.",
    formulas: [
      "D = Vd x gewicht x (Cdoel - Cethanol) = 0,6 x 65 x (1000 - 800) = 7800 mg",
      "D' = Cdoel x Vmax x gewicht / (Km + Cdoel) = 1000 x 75 x 65 / (138 + 1000) = 4283,83 mg/uur",
      "D' bij dialyse = Cdoel x (Vmax + 150) x gewicht / (Km + Cdoel) = 1000 x (75 + 150) x 65 / (138 + 1000) = 12851,49 mg/uur",
    ],
    includeDialysis: true,
    input: {
      weightKg: 65,
      currentEthanolMgPerL: 800,
      drinkerStatus: "nonDrinker",
      dialysis: false,
    },
    expected: {
      loadingMg: 7800,
      maintenanceMgPerHour: 4283.83128295255,
      dialysisMaintenanceMgPerHour: 12851.4938488576,
    },
  },
  {
    id: "chronic-drinker",
    title: "Chronische drinker (82 kg)",
    inputSummary:
      "Gewicht 82 kg, gemeten ethanol 800 mg/L, chronische drinker (Vmax 175 mg/kg/uur), Vd 0,6 L/kg, streef 1000 mg/L.",
    formulas: [
      "D = Vd x gewicht x (Cdoel - Cethanol) = 0,6 x 82 x (1000 - 800) = 9840 mg",
      "D' = Cdoel x Vmax x gewicht / (Km + Cdoel) = 1000 x 175 x 82 / (138 + 1000) = 12609,84 mg/uur",
      "D' bij dialyse = Cdoel x (Vmax + 150) x gewicht / (Km + Cdoel) = 1000 x (175 + 150) x 82 / (138 + 1000) = 23418,28 mg/uur",
    ],
    includeDialysis: true,
    input: {
      weightKg: 82,
      currentEthanolMgPerL: 800,
      drinkerStatus: "chronicDrinker",
      dialysis: false,
    },
    expected: {
      loadingMg: 9840,
      maintenanceMgPerHour: 12609.841827768,
      dialysisMaintenanceMgPerHour: 23418.2776801406,
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
    const result = calculateEthanolDosing(testCase.input);
    const metrics: ValidationMetric[] = [
      metric("Oplaaddosis", "mg", testCase.expected.loadingMg, result.loadingDose.mg),
      metric(
        "Onderhoudsdosering",
        "mg/uur",
        testCase.expected.maintenanceMgPerHour,
        result.maintenanceDose.mgPerHour,
      ),
    ];

    if (testCase.includeDialysis) {
      metrics.push(
        metric(
          "Onderhoud tijdens dialyse",
          "mg/uur",
          testCase.expected.dialysisMaintenanceMgPerHour,
          result.dialysisMaintenanceDose.mgPerHour,
        ),
      );
    }

    return {
      id: testCase.id,
      title: testCase.title,
      inputSummary: testCase.inputSummary,
      formulas: testCase.formulas,
      note: testCase.note,
      metrics,
      pass: metrics.every((entry) => entry.pass),
    };
  });
}

export function formatValidationNumber(value: number): string {
  return new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 4 }).format(value);
}
