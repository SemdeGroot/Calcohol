// Single source of truth for the clinical source/method copy.
// Used both by the in-app "Bron en methode" modal and by the JSON-LD
// structured data so the same text is available to readers and to search
// engines / AI answer engines.

export const REFERENCE =
  "Touw DJ, Beus WP, Vinks AATMM, van Dijk A. Intoxicatie met methanol en ethyleenglycol: klinische toxicologie en berekening van de optimale dosis ethanol als antidotum. Pharmaceutisch Weekblad. 1993, 128(11), 537-542.";

export type SourceSection = {
  title: string;
  paragraphs: string[];
};

export const SOURCE_SECTIONS: SourceSection[] = [
  {
    title: "Introductie",
    paragraphs: [
      "Methanol en ethyleenglycol veroorzaken schade vooral door metabolieten die via alcoholdehydrogenase ontstaan. De behandeling richt zich op het remmen van die omzetting en, indien nodig, op het verwijderen van de toxische stoffen.",
    ],
  },
  {
    title: "Waarom ethanol",
    paragraphs: [
      "Ethanol concurreert met methanol en ethyleenglycol om alcoholdehydrogenase. Bij voldoende ethanol worden minder toxische metabolieten gevormd. Daarom wordt ethanol als antidotum gebruikt.",
      "Bij ernstige intoxicaties kan dialyse nodig zijn; dialyse verhoogt de klaring. AlcoTox berekent daarom een aparte onderhoudsdosering tijdens dialyse.",
    ],
  },
  {
    title: "Wanneer gebruiken",
    paragraphs: [
      "Gebruik AlcoTox wanneer een ethanolspiegel bekend is en je een dosering wilt omrekenen naar een infuusvolume. De app berekent de oplaaddosis en de onderhoudsdosering, ook tijdens dialyse.",
      "De app bepaalt niet of ethanol of dialyse nodig is. Die beslissing blijft bij het lokale protocol en het klinisch oordeel.",
    ],
  },
  {
    title: "Rekenmethode",
    paragraphs: [
      "De streefconcentratie is 1000 mg/L. De oplaaddosis vult alleen het verschil aan tussen de gemeten en de gekozen streefwaarde. Ligt de gemeten waarde daar al op of boven, dan toont AlcoTox geen oplaaddosis.",
      "De onderhoudsdosering gebruikt gewicht, Vmax en Km. Bij chronisch alcoholgebruik geldt een hogere Vmax; bij dialyse telt extra klaring mee. De infuusconcentratie bepaalt de omrekening van mg ethanol naar ml.",
    ],
  },
  {
    title: "Aandachtspunten",
    paragraphs: [
      "Controleer de ethanolspiegel 4 tot 6 uur na de oplaaddosis.",
      "Houd rekening met ethanolafbraak tussen bloedafname en uitslag: de actuele concentratie kan lager zijn dan de gemeten waarde.",
    ],
  },
];

// Concise question/answer pairs for FAQPage structured data (GEO).
export const FAQ: { question: string; answer: string }[] = [
  {
    question: "Waarvoor dient AlcoTox?",
    answer:
      "AlcoTox berekent een oplaaddosis en onderhoudsdosering ethanol als antidotum bij een methanol- of ethyleenglycolintoxicatie, en rekent de dosis om naar een infuusvolume. Het is een berekeningshulpmiddel, geen behandelprotocol.",
  },
  {
    question: "Hoe berekent AlcoTox de oplaaddosis ethanol?",
    answer:
      "De oplaaddosis is het verdelingsvolume maal het gewicht maal het verschil tussen de streefconcentratie en de gemeten ethanolconcentratie: Vd x gewicht x max(0, Cdoel - Cethanol). Ligt de gemeten ethanolwaarde al op of boven de streefwaarde, dan is geen oplaaddosis nodig.",
  },
  {
    question: "Waarom is de streefconcentratie 1000 mg/L?",
    answer:
      "1000 mg/L (ongeveer 1,0 promille) is de streefwaarde uit het bronartikel en de spreadsheet. Lokale protocollen kunnen een hogere streefwaarde gebruiken, bijvoorbeeld 1,5 promille; in AlcoTox is de streefconcentratie daarom instelbaar.",
  },
  {
    question: "Hoe berekent AlcoTox de onderhoudsdosering?",
    answer:
      "De onderhoudsdosering volgt Michaelis-Menten-kinetiek: 1000 x Vmax x gewicht / (Km + Cdoel), met Km 138 mg/L. Voor chronische drinkers wordt een hogere Vmax gebruikt dan voor niet-drinkers.",
  },
  {
    question: "Wat verandert er tijdens dialyse?",
    answer:
      "Tijdens dialyse telt AlcoTox extra klaring (150 mg/kg/uur) op bij de Vmax, waardoor een hogere onderhoudsdosering nodig is om de streefconcentratie te behouden.",
  },
  {
    question:
      "Waarom werkt ethanol als antidotum bij methanol- of ethyleenglycolvergiftiging?",
    answer:
      "Ethanol concurreert met methanol en ethyleenglycol om het enzym alcoholdehydrogenase. Bij voldoende ethanol wordt minder methanol of ethyleenglycol omgezet naar toxische metabolieten, die de feitelijke orgaanschade veroorzaken.",
  },
  {
    question: "Wanneer moet de ethanolspiegel opnieuw worden gecontroleerd?",
    answer:
      "De bron noemt controle van de ethanolspiegel 4 tot 6 uur na de oplaaddosis. Houd rekening met ethanolafbraak tussen bloedafname en analyseresultaat: de actuele concentratie kan lager zijn dan de gemeten waarde.",
  },
];

// Structured representation of REFERENCE for JSON-LD citation (GEO / E-E-A-T).
export const REFERENCE_CITATION = {
  "@type": "MedicalScholarlyArticle",
  name: "Intoxicatie met methanol en ethyleenglycol: klinische toxicologie en berekening van de optimale dosis ethanol als antidotum",
  author: [
    { "@type": "Person", name: "DJ Touw" },
    { "@type": "Person", name: "WP Beus" },
    { "@type": "Person", name: "AATMM Vinks" },
    { "@type": "Person", name: "A van Dijk" },
  ],
  datePublished: "1993",
  pagination: "537-542",
  inLanguage: "nl-NL",
  isPartOf: {
    "@type": "PublicationIssue",
    issueNumber: "11",
    isPartOf: {
      "@type": "PublicationVolume",
      volumeNumber: "128",
      isPartOf: {
        "@type": "Periodical",
        name: "Pharmaceutisch Weekblad",
      },
    },
  },
};
