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
      "Bij ernstige intoxicaties kan dialyse nodig zijn. Omdat dialyse de klaring verhoogt, berekent EthaDose een aparte onderhoudsdosering tijdens dialyse.",
    ],
  },
  {
    title: "Wanneer gebruiken",
    paragraphs: [
      "Gebruik EthaDose wanneer een ethanolspiegel bekend is en je een dosering wilt omrekenen naar een infuusvolume. De app berekent de oplaaddosis en de onderhoudsdosering, ook tijdens dialyse.",
      "De app bepaalt niet of ethanol of dialyse nodig is. Die beslissing blijft bij het lokale protocol en het klinisch oordeel.",
    ],
  },
  {
    title: "Rekenmethode",
    paragraphs: [
      "De standaard streefconcentratie is 1000 mg/L. EthaDose schat met de tijd tussen bloedafname en start van de toediening welke ethanolconcentratie bij de start resteert. De oplaaddosis vult alleen het verschil tussen deze schatting en de gekozen streefwaarde aan.",
      "De onderhoudsdosering gebruikt gewicht, Vmax en Km. Bij chronisch alcoholgebruik geldt een hogere Vmax. Bij dialyse telt extra klaring mee. De infuusconcentratie bepaalt de omrekening van mg ethanol naar ml.",
      "De sterkte van de ethanolvoorraad wordt ingevoerd als volumepercentage. EthaDose rekent dit met de dichtheid van zuivere ethanol om naar mg/ml. Als het benodigde bijspuitvolume niet in de gekozen zak past, gebruikt de app het maximale bijspuitvolume en rekent verder met de werkelijk verkregen concentratie.",
    ],
  },
  {
    title: "Aandachtspunten",
    paragraphs: [
      "Controleer de ethanolspiegel 4 tot 6 uur na de oplaaddosis.",
      "De schatting bij start van de toediening gebruikt farmacokinetische aannames en vervangt geen nieuwe ethanolbepaling.",
    ],
  },
];

// Concise question/answer pairs for FAQPage structured data (GEO).
export const FAQ: { question: string; answer: string }[] = [
  {
    question: "Waarvoor dient EthaDose?",
    answer:
      "EthaDose berekent een oplaaddosis en onderhoudsdosering ethanol als antidotum bij een methanol- of ethyleenglycolintoxicatie, en rekent de dosis om naar een infuusvolume. Het is een berekeningshulpmiddel, geen behandelprotocol.",
  },
  {
    question: "Hoe berekent EthaDose de oplaaddosis ethanol?",
    answer:
      "EthaDose schat eerst de ethanolconcentratie bij start van de toediening aan de hand van de gemeten concentratie en de verstreken tijd sinds de bloedafname. De oplaaddosis is daarna het verdelingsvolume maal het gewicht maal het verschil met de streefconcentratie. Ligt de geschatte waarde al op of boven de streefwaarde, dan is geen oplaaddosis nodig.",
  },
  {
    question: "Hoe houdt EthaDose rekening met de tijd tussen bloedafname en toediening?",
    answer:
      "EthaDose berekent een geschatte afname in mg/L per uur met de onderhoudsformule en het verdelingsvolume. De app trekt de geschatte afname tijdens het tijdsinterval af van de gemeten concentratie. Deze uitkomst is een schatting en vervangt geen nieuwe ethanolbepaling.",
  },
  {
    question: "Hoe berekent EthaDose de concentratie van het ethanol-infuus?",
    answer:
      "EthaDose rekent de sterkte in procent v/v met een dichtheid van 789 mg/ml om naar een massaconcentratie. De app houdt rekening met het toegevoegde volume en met het maximale bijspuitvolume van de gekozen infuuszak. Alle ml-uitkomsten gebruiken de werkelijk verkregen infuusconcentratie.",
  },
  {
    question: "Waarom is de streefconcentratie 1000 mg/L?",
    answer:
      "1000 mg/L is de streefwaarde uit het bronartikel. Lokale protocollen kunnen een hogere streefwaarde gebruiken, bijvoorbeeld 1500 mg/L. In EthaDose is de streefconcentratie daarom instelbaar.",
  },
  {
    question: "Hoe berekent EthaDose de onderhoudsdosering?",
    answer:
      "De onderhoudsdosering volgt Michaelis-Menten-kinetiek: D' = Cdoel x Vmax x gewicht / (Km + Cdoel), met Km 138 mg/L. De streefconcentratie Cdoel staat in zowel teller als noemer. Voor chronische drinkers wordt een hogere Vmax gebruikt dan voor niet-drinkers.",
  },
  {
    question: "Wat verandert er tijdens dialyse?",
    answer:
      "Tijdens dialyse telt EthaDose extra klaring (150 mg/kg/uur) op bij de Vmax, waardoor een hogere onderhoudsdosering nodig is om de streefconcentratie te behouden.",
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
