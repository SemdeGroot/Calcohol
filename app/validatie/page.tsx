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
  title: "Validatie - EthaDose",
  description:
    "Validatie van EthaDose. De berekeningen worden live vergeleken met de uitkomsten van de gepubliceerde formules van Touw et al. (1993), met de formules uitgeschreven om na te rekenen.",
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
      intro="EthaDose volgt de formules uit het artikel van Touw et al. (1993). Het eerste voorbeeld is de casus uit het artikel zelf. De andere voorbeelden passen dezelfde formules toe op andere profielen en op dialyse. Alle uitkomsten zijn live berekend met dezelfde functies als de calculator, met de formules uitgeschreven zodat je ze met een rekenmachine kunt narekenen."
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
            Berekend tijdens de build met dezelfde functies als de calculator.
          </span>
        </div>
      </div>

      <ContentSection title="Formules">
        <p>Voor elke uitkomst geldt:</p>
        <div className="rounded-md bg-panel-soft p-3 font-mono text-caption text-foreground">
          <p>Oplaaddosis = Vd x gewicht x max(0, Cdoel - Cethanol)</p>
          <p>Onderhoud = 1000 x Vmax x gewicht / (Km + Cdoel)</p>
          <p>Onderhoud bij dialyse = 1000 x (Vmax + 150) x gewicht / (Km + Cdoel)</p>
          <p>Geschatte afname = onderhoud zonder dialyse / (Vd x gewicht)</p>
          <p>Cstart = max(0, Cgemeten - geschatte afname x tijd)</p>
          <p>Omrekening naar ml = dosis ethanol (mg) / infuusconcentratie (g/L)</p>
        </div>
        <p>
          Daarbij is Km 138 mg/L en de streefconcentratie 1000 mg/L. Vmax is
          75 mg/kg/uur voor een niet-drinker en 175 mg/kg/uur voor een chronische
          drinker. Vd is 0,7 L/kg voor een man en 0,6 L/kg voor een vrouw. De
          geschatte afname gebruikt de onderhoudsdosis zonder dialyse. De
          ml-uitkomsten zijn afhankelijk van de gekozen bereiding. EthaDose
          rekent de ethanolsterkte in procent v/v om naar mg/ml en gebruikt de
          werkelijke concentratie na het bijspuiten.
        </p>
      </ContentSection>

      {results.map((testCase) => (
        <ContentSection key={testCase.id} title={testCase.title}>
          <p>{testCase.inputSummary}</p>

          <div className="flex flex-col gap-1 rounded-md bg-panel-soft p-3 font-mono text-caption text-foreground">
            {testCase.formulas.map((formula, index) => (
              <p key={index} className="break-words">
                {formula}
              </p>
            ))}
          </div>

          {testCase.note ? (
            <p className="text-caption text-muted-foreground">{testCase.note}</p>
          ) : null}

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
          die dezelfde waarden en aanvullende randgevallen controleert. Daaronder
          vallen het afkappen van de oplaaddosis op of boven de streefconcentratie
          en het weigeren van ongeldige invoer. De tests controleren ook de
          tijdcorrectie, zakcapaciteit en omzetting van procent v/v naar mg/ml.
        </p>
      </ContentSection>

      <ContentSection title="Referentie">
        <p className="text-caption">{REFERENCE}</p>
      </ContentSection>
    </ContentPage>
  );
}
