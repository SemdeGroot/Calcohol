import { describe, expect, it } from "vitest";
import {
  CalculatorInputError,
  calculateEstimatedEliminationMgPerLHour,
  calculateEthanolDosing,
  calculateEthanolInfusion,
  calculateLoadingDoseMg,
  calculateMaintenanceDoseMgPerHour,
  convertEthanolVolumePercentToMgPerMl,
  convertMgToInfusionMl,
  estimateEthanolAtAdministrationMgPerL,
  parseDrinkerStatus,
} from "./calculations";

describe("ethanol dosing calculations", () => {
  it("matches the non-drinker reference example", () => {
    const result = calculateEthanolDosing({
      weightKg: 65,
      currentEthanolMgPerL: 800,
      drinkerStatus: "nonDrinker",
      dialysis: false,
      // Pin the spreadsheet preparation (50 ml 96% v/v in 300 ml) so the ml
      // conversions reproduce the EtOHcalc.XLS reference outputs exactly.
      settings: { infusionConcentrationGPerL: 38000 / 300 },
    });

    expect(result.loadingDose.mg).toBeCloseTo(7800, 10);
    expect(result.loadingDose.ml).toBeCloseTo(61.5789473684211, 10);
    expect(result.maintenanceDose.mgPerHour).toBeCloseTo(4283.83128295255, 10);
    expect(result.maintenanceDose.mlPerHour).toBeCloseTo(33.8197206548885, 10);
    expect(result.dialysisMaintenanceDose.mgPerHour).toBeCloseTo(12851.4938488576, 10);
    expect(result.dialysisMaintenanceDose.mlPerHour).toBeCloseTo(101.459161964666, 10);
    expect(result.selectedMaintenanceDose).toBe(result.maintenanceDose);
  });

  it("matches the chronic drinker reference example", () => {
    const result = calculateEthanolDosing({
      weightKg: 82,
      currentEthanolMgPerL: 800,
      drinkerStatus: "chronicDrinker",
      dialysis: true,
      settings: { infusionConcentrationGPerL: 38000 / 300 },
    });

    expect(result.loadingDose.mg).toBeCloseTo(9840, 10);
    expect(result.loadingDose.ml).toBeCloseTo(77.6842105263158, 10);
    expect(result.maintenanceDose.mgPerHour).toBeCloseTo(12609.841827768, 10);
    expect(result.maintenanceDose.mlPerHour).toBeCloseTo(99.5513828508001, 10);
    expect(result.dialysisMaintenanceDose.mgPerHour).toBeCloseTo(23418.2776801406, 10);
    expect(result.dialysisMaintenanceDose.mlPerHour).toBeCloseTo(184.881139580057, 10);
    expect(result.selectedMaintenanceDose).toBe(result.dialysisMaintenanceDose);
  });

  it("calculates maintenance dose without dialysis", () => {
    expect(calculateMaintenanceDoseMgPerHour(65, 75)).toBeCloseTo(4283.83128295255, 10);
  });

  it("calculates maintenance dose with dialysis clearance", () => {
    expect(calculateMaintenanceDoseMgPerHour(65, 75 + 150)).toBeCloseTo(12851.4938488576, 10);
  });

  it("converts mg ethanol to ml infusion solution using the default 10 percent m/v concentration", () => {
    expect(convertMgToInfusionMl(7800)).toBeCloseTo(78, 10);
  });

  it("calculates how much ethanol to add to a glucose 5 percent bag", () => {
    const result = calculateEthanolInfusion({
      ethanolStrengthFraction: 0.96,
      targetConcentrationMgPerMl: 100,
      bagVolumeMl: 500,
    });

    // stock = 0.96 * 789 = 757.44 mg/ml; Vadd = 100 * 500 / (757.44 - 100)
    expect(result.stockConcentrationMgPerMl).toBeCloseTo(757.44, 10);
    expect(result.ethanolToAddMl).toBeCloseTo(76.05256753467998, 10);
    expect(result.requiredEthanolToAddMl).toBeCloseTo(76.05256753467998, 10);
    expect(result.finalVolumeMl).toBeCloseTo(576.05256753468, 10);
    expect(result.actualConcentrationMgPerMl).toBeCloseTo(100, 10);
    expect(result.infusionConcentrationGPerL).toBeCloseTo(100, 10);
    expect(result.maximumAddVolumeMl).toBe(150);
    expect(result.capacityLimited).toBe(false);
    expect(result.feasible).toBe(true);
  });

  it("converts any ethanol volume percentage to a mass concentration", () => {
    expect(convertEthanolVolumePercentToMgPerMl(96)).toBeCloseTo(757.44, 10);
    expect(convertEthanolVolumePercentToMgPerMl(98)).toBeCloseTo(773.22, 10);
    expect(convertEthanolVolumePercentToMgPerMl(50)).toBeCloseTo(394.5, 10);
    expect(convertEthanolVolumePercentToMgPerMl(96) * 50).toBeCloseTo(37872, 10);
  });

  it("limits preparation to the maximum add volume and returns the actual concentration", () => {
    const result = calculateEthanolInfusion({
      ethanolStrengthFraction: 0.96,
      targetConcentrationMgPerMl: 100,
      bagVolumeMl: 1000,
    });

    expect(result.requiredEthanolToAddMl).toBeCloseTo(152.10513506935996, 10);
    expect(result.ethanolToAddMl).toBe(150);
    expect(result.finalVolumeMl).toBe(1150);
    expect(result.actualConcentrationMgPerMl).toBeCloseTo(98.79652173913044, 10);
    expect(result.capacityLimited).toBe(true);
  });

  it("flags an infeasible preparation when the target exceeds the stock strength", () => {
    const result = calculateEthanolInfusion({
      ethanolStrengthFraction: 0.05,
      targetConcentrationMgPerMl: 100,
      bagVolumeMl: 500,
    });

    expect(result.feasible).toBe(false);
    expect(result.ethanolToAddMl).toBe(0);
    expect(result.finalVolumeMl).toBe(500);
    expect(result.actualConcentrationMgPerMl).toBe(0);
  });

  it("estimates elimination and concentration at administration", () => {
    const elimination = calculateEstimatedEliminationMgPerLHour(70, 75, 1000, 0.7);

    expect(elimination).toBeCloseTo(94.15013808686919, 10);
    expect(estimateEthanolAtAdministrationMgPerL(800, elimination, 90)).toBeCloseTo(
      658.7747928696963,
      10,
    );
  });

  it("uses the estimated concentration at administration for the loading dose", () => {
    const result = calculateEthanolDosing({
      weightKg: 70,
      currentEthanolMgPerL: 800,
      sampleToAdministrationMinutes: 90,
      drinkerStatus: "nonDrinker",
      dialysis: false,
      settings: { volumeOfDistributionLPerKg: 0.7 },
    });

    expect(result.measuredEthanolMgPerL).toBe(800);
    expect(result.estimatedEliminationMgPerLHour).toBeCloseTo(94.15013808686919, 10);
    expect(result.estimatedEthanolAtAdministrationMgPerL).toBeCloseTo(
      658.7747928696963,
      10,
    );
    expect(result.loadingDose.mg).toBeCloseTo(16720.035149384883, 10);
  });

  it("clamps the estimated concentration at administration to zero", () => {
    expect(estimateEthanolAtAdministrationMgPerL(100, 200, 60)).toBe(0);
  });

  it("clamps loading dose to zero at or above target concentration", () => {
    expect(calculateLoadingDoseMg(65, 1000)).toBe(0);
    expect(calculateLoadingDoseMg(65, 1200)).toBe(0);
  });

  it("uses a higher target concentration when selected", () => {
    const result = calculateEthanolDosing({
      weightKg: 65,
      currentEthanolMgPerL: 800,
      drinkerStatus: "nonDrinker",
      dialysis: false,
      settings: {
        targetEthanolMgPerL: 1500,
      },
    });

    expect(result.loadingDose.mg).toBeCloseTo(27300, 10);
    // Cdoel appears in the numerator too: 1500 x 75 x 65 / (138 + 1500).
    expect(result.maintenanceDose.mgPerHour).toBeCloseTo(4464.285714285714, 10);
  });

  it("clamps loading dose against a custom target concentration", () => {
    expect(calculateLoadingDoseMg(65, 800, 700)).toBe(0);
    expect(calculateLoadingDoseMg(65, 800, 1500)).toBeCloseTo(27300, 10);
  });

  it("uses distribution volume only for the loading dose", () => {
    const result = calculateEthanolDosing({
      weightKg: 65,
      currentEthanolMgPerL: 800,
      drinkerStatus: "nonDrinker",
      dialysis: false,
      settings: {
        volumeOfDistributionLPerKg: 0.7,
      },
    });

    expect(result.loadingDose.mg).toBeCloseTo(9100, 10);
    expect(result.maintenanceDose.mgPerHour).toBeCloseTo(4283.83128295255, 10);
  });

  it("converts dose to ml using a local infusion concentration", () => {
    expect(convertMgToInfusionMl(7800, 100)).toBeCloseTo(78, 10);
  });

  it("rejects missing weight", () => {
    expect(() =>
      calculateEthanolDosing({
        currentEthanolMgPerL: 800,
        drinkerStatus: "nonDrinker",
        dialysis: false,
      }),
    ).toThrow(CalculatorInputError);
  });

  it("rejects zero or negative weight", () => {
    expect(() =>
      calculateEthanolDosing({
        weightKg: 0,
        currentEthanolMgPerL: 800,
        drinkerStatus: "nonDrinker",
        dialysis: false,
      }),
    ).toThrow(CalculatorInputError);

    expect(() =>
      calculateEthanolDosing({
        weightKg: -1,
        currentEthanolMgPerL: 800,
        drinkerStatus: "nonDrinker",
        dialysis: false,
      }),
    ).toThrow(CalculatorInputError);
  });

  it("rejects negative ethanol concentration", () => {
    expect(() =>
      calculateEthanolDosing({
        weightKg: 65,
        currentEthanolMgPerL: -1,
        drinkerStatus: "nonDrinker",
        dialysis: false,
      }),
    ).toThrow(CalculatorInputError);
  });

  it("rejects invalid calculator settings", () => {
    expect(() =>
      calculateEthanolDosing({
        weightKg: 65,
        currentEthanolMgPerL: 800,
        drinkerStatus: "nonDrinker",
        dialysis: false,
        settings: { targetEthanolMgPerL: 0 },
      }),
    ).toThrow(CalculatorInputError);

    expect(() =>
      calculateEthanolDosing({
        weightKg: 65,
        currentEthanolMgPerL: 800,
        drinkerStatus: "nonDrinker",
        dialysis: false,
        settings: { volumeOfDistributionLPerKg: 0 },
      }),
    ).toThrow(CalculatorInputError);

    expect(() =>
      calculateEthanolDosing({
        weightKg: 65,
        currentEthanolMgPerL: 800,
        drinkerStatus: "nonDrinker",
        dialysis: false,
        settings: { infusionConcentrationGPerL: 0 },
      }),
    ).toThrow(CalculatorInputError);
  });

  it("rejects unsupported drinker status from external input", () => {
    expect(() => parseDrinkerStatus("unknown")).toThrow(CalculatorInputError);
    expect(() =>
      calculateEthanolDosing({
        weightKg: 65,
        currentEthanolMgPerL: 800,
        drinkerStatus: "unknown" as never,
        dialysis: false,
      }),
    ).toThrow(CalculatorInputError);
  });
});
