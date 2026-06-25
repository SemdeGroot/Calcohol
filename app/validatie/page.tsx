import type { Metadata } from "next";
import { Check, X } from "lucide-react";

import { ContentPage, ContentSection } from "@/components/ContentPage";
import { REFERENCE } from "@/features/calculator/content";
import {
  formatValidationNumber,
  runValidation,
} from "@/features/calculator/validation";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Validatie - AlcoTox",
  description:
    "Validatie van AlcoTox: de berekeningen worden live vergeleken met de waarden uit de bronspreadsheet en het artikel van Touw et al. (1993).",
  alternates: { canonical: `${SITE_URL}/validatie/` },
};

export default function ValidatiePage() {
  const results = runValidation();
  const totalChecks = results.reduce((sum, c) => sum + c.metrics.length, 0);
  const passedChecks = results.reduce(
    (sum, c) => sum + c.metrics.filter((m) => m.pass).length,
    0,
  );
  const allPass = passedChecks === totalChecks;

  return (
    <ContentPage
      title="Validatie"
      intro="AlcoTox reproduceert de berekeningen uit de bronspreadsheet en het artikel. De onderstaande uitkomsten zijn live berekend met dezelfde functies als de calculator en vergeleken met de gedocumenteerde bronwaarden. Zo kun je controleren dat deze versie de bron exact reproduceert."
    >
      <div
        className={`flex items-center gap-3 rounded-lg border p-4 ${
          allPass
            ? "border-[color:var(--color-success)]/30 bg-success-soft"
            : "border-[color:var(--color-danger)]/30 bg-danger-soft"
        }`}
      >
        <span
          className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
            allPass ? "bg-success" : "bg-danger"
          } text-white`}
        >
          {allPass ? (
            <Check className="size-5" strokeWidth={2} />
          ) : (
            <X className="size-5" strokeWidth={2} />
          )}
        </span>
        <div className="flex flex-col">
          <span className="text-body-md font-semibold text-foreground">
            {allPass
              ? `Alle ${totalChecks} controles geslaagd`
              : `${passedChecks} van ${totalChecks} controles geslaagd`}
          </span>
          <span className="text-body-sm text-muted-foreground">
            Verwachte waarden uit context/EtOHcalc.XLS, berekend op het moment
            van de build.
          </span>
        </div>
      </div>

      <ContentSection title="Parameters">
        <ul className="flex list-disc flex-col gap-1 pl-5">
          <li>Michaelis-constante Km: 138 mg/L.</li>
          <li>Streefconcentratie (bron): 1000 mg/L.</li>
          <li>Verdelingsvolume: 0,6 L/kg (vrouw) of 0,7 L/kg (man).</li>
          <li>Vmax: 75 mg/kg/uur (niet-drinker), 175 mg/kg/uur (chronische drinker).</li>
          <li>Extra klaring tijdens dialyse: 150 mg/kg/uur.</li>
          <li>Infuusconcentratie: 38000 mg in 300 ml (126,67 g/L).</li>
        </ul>
      </ContentSection>

      {results.map((testCase) => (
        <ContentSection key={testCase.id} title={testCase.title}>
          <p>{testCase.inputSummary}</p>
          <p className="text-caption">Bron: {testCase.source}</p>

          <ul className="mt-2 divide-y divide-border overflow-hidden rounded-lg border border-border">
            {testCase.metrics.map((m, index) => (
              <li
                key={index}
                className="flex items-center justify-between gap-3 p-3"
              >
                <div className="flex min-w-0 items-start gap-2.5">
                  {m.pass ? (
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-success"
                      strokeWidth={2.25}
                      aria-label="Geslaagd"
                    />
                  ) : (
                    <X
                      className="mt-0.5 size-4 shrink-0 text-danger"
                      strokeWidth={2.25}
                      aria-label="Afgekeurd"
                    />
                  )}
                  <span className="text-body-sm text-foreground">
                    {m.label}{" "}
                    <span className="text-muted-foreground">({m.unit})</span>
                  </span>
                </div>
                <div className="flex shrink-0 flex-col items-end text-right tabular-nums">
                  <span className="text-body-sm font-semibold text-foreground">
                    {formatValidationNumber(m.actual)}
                  </span>
                  <span className="text-caption text-muted-foreground">
                    verwacht {formatValidationNumber(m.expected)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </ContentSection>
      ))}

      <ContentSection title="Automatische tests">
        <p>
          Naast deze pagina draait bij elke build een geautomatiseerde testset
          (Vitest) die dezelfde bronwaarden en aanvullende randgevallen
          controleert, waaronder het afkappen van de oplaaddosis op of boven de
          streefconcentratie en het weigeren van ongeldige invoer.
        </p>
      </ContentSection>

      <ContentSection title="Referentie">
        <p className="text-caption">{REFERENCE}</p>
      </ContentSection>
    </ContentPage>
  );
}
