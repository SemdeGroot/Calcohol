import { describe, expect, it } from "vitest";
import {
  CalculatorInputError,
  calculateEthanolDosing,
  calculateEthanol96Infusion,
  calculateLoadingDoseMg,
  calculateMaintenanceDoseMgPerHour,
  convertMgToInfusionMl,
  parseDrinkerStatus,
} from "./calculations";

describe("ethanol dosing calculations", () => {
  it("matches the non-drinker reference example", () => {
    const result = calculateEthanolDosing({
      weightKg: 65,
      currentEthanolMgPerL: 800,
      drinkerStatus: "nonDrinker",
      dialysis: false,
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

  it("converts mg ethanol to ml infusion solution", () => {
    expect(convertMgToInfusionMl(7800)).toBeCloseTo(61.5789473684211, 10);
  });

  it("calculates infusion concentration from ethanol 96 percent v/v in glucose 5 percent", () => {
    const result = calculateEthanol96Infusion(50, 300);

    expect(result.ethanolGram).toBe(38);
    expect(result.infusionConcentrationGPerL).toBeCloseTo(126.666666666667, 10);
    expect(result.exceedsFinalVolume).toBe(false);
  });

  it("flags ethanol 96 percent v/v volumes that exceed the final volume", () => {
    const result = calculateEthanol96Infusion(60, 50);

    expect(result.ethanol96VolumeMl).toBe(60);
    expect(result.exceedsFinalVolume).toBe(true);
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
    expect(result.maintenanceDose.mgPerHour).toBeCloseTo(2976.190476190476, 10);
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
