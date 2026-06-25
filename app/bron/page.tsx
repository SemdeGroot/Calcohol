import type { Metadata } from "next";

import { ContentPage, ContentSection } from "@/components/ContentPage";
import {
  REFERENCE,
  REFERENCE_CITATION,
  SOURCE_SECTIONS,
} from "@/features/calculator/content";
import { SITE_URL } from "@/lib/site";

const BRON_DESCRIPTION =
  "Bron en rekenmethode van EthaDose: ethanol als antidotum bij methanol- of ethyleenglycolintoxicatie, de gebruikte formules en de klinische aannames.";

export const metadata: Metadata = {
  title: "Bron en methode - EthaDose",
  description: BRON_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/bron/` },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "MedicalWebPage",
  "@id": `${SITE_URL}/bron/#webpage`,
  url: `${SITE_URL}/bron/`,
  name: "Bron en methode - EthaDose",
  description: BRON_DESCRIPTION,
  inLanguage: "nl-NL",
  medicalAudience: {
    "@type": "MedicalAudience",
    audienceType: "Clinician",
  },
  about: [
    { "@type": "MedicalCondition", name: "Methanolintoxicatie" },
    { "@type": "MedicalCondition", name: "Ethyleenglycolintoxicatie" },
  ],
  citation: REFERENCE_CITATION,
};

export default function BronPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ContentPage
        title="Bron en methode"
        intro="EthaDose volgt de formules uit Touw et al. (1993). De app is een berekeningshulpmiddel voor ethanol als antidotum bij methanol- of ethyleenglycolintoxicatie, geen behandelprotocol."
      >
        {SOURCE_SECTIONS.map((section) => (
          <ContentSection key={section.title} title={section.title}>
            {section.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </ContentSection>
        ))}

        <ContentSection title="Referentie">
          <p className="text-caption">{REFERENCE}</p>
        </ContentSection>
      </ContentPage>
    </>
  );
}
