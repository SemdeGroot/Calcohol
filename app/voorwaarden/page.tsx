import type { Metadata } from "next";
import Link from "next/link";

import { ContentPage, ContentSection } from "@/components/ContentPage";
import { REFERENCE } from "@/features/calculator/content";
import { LEGAL_LAST_UPDATED, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Gebruiksvoorwaarden - AlcoTox",
  description:
    "Gebruiksvoorwaarden en medische disclaimer van AlcoTox, een rekenhulp voor ethanoldosering bij methanol- of ethyleenglycolintoxicatie.",
  alternates: { canonical: `${SITE_URL}/voorwaarden/` },
};

export default function VoorwaardenPage() {
  return (
    <ContentPage
      title="Gebruiksvoorwaarden"
      intro={`Door AlcoTox te gebruiken ga je akkoord met onderstaande voorwaarden. Laatst bijgewerkt: ${LEGAL_LAST_UPDATED}.`}
    >
      <ContentSection title="Over AlcoTox">
        <p>
          AlcoTox is een gratis rekenhulp die de oplaaddosis en
          onderhoudsdosering ethanol berekent als antidotum bij een methanol- of
          ethyleenglycolintoxicatie en deze omrekent naar een infuusvolume. De
          berekening gebeurt volledig lokaal in je browser.
        </p>
      </ContentSection>

      <ContentSection title="Geen behandelprotocol of medisch advies">
        <p>
          AlcoTox is een berekeningshulpmiddel, geen behandelprotocol en geen
          vervanging van klinisch oordeel. De app bepaalt niet of behandeling
          met ethanol of dialyse nodig is. De uitkomsten zijn uitsluitend bedoeld
          ter ondersteuning; de behandelend zorgprofessional blijft volledig
          verantwoordelijk voor elke beslissing en voor de toegediende dosering.
        </p>
        <p>
          Controleer iedere uitkomst tegen het lokale protocol en de primaire
          bron voordat je er klinisch op handelt.
        </p>
      </ContentSection>

      <ContentSection title="Bedoeld gebruik">
        <p>
          AlcoTox is bedoeld voor bevoegde zorgprofessionals, zoals
          ziekenhuisapothekers, klinisch toxicologen en SEH- en IC-clinici. De
          app is niet bedoeld voor patiënten of als zelfhulpmiddel.
        </p>
      </ContentSection>

      <ContentSection title="Geen garantie en geen aansprakelijkheid">
        <p>
          De berekeningen zijn met zorg gebouwd en getoetst aan de
          bronspreadsheet en het bronartikel (zie{" "}
          <Link href="/validatie/" className="text-primary underline-offset-4 hover:underline">
            validatie
          </Link>
          ). Toch wordt AlcoTox aangeboden &quot;zoals het is&quot;, zonder enige
          garantie op juistheid, volledigheid of geschiktheid voor een specifiek
          doel.
        </p>
        <p>
          De beheerder aanvaardt geen aansprakelijkheid voor schade die voortvloeit
          uit het gebruik van of het vertrouwen op AlcoTox. Gebruik is op eigen
          risico en onder eigen professionele verantwoordelijkheid.
        </p>
      </ContentSection>

      <ContentSection title="Bron">
        <p className="text-caption">{REFERENCE}</p>
      </ContentSection>

      <ContentSection title="Wijzigingen">
        <p>Deze voorwaarden kunnen worden aangepast.</p>
      </ContentSection>
    </ContentPage>
  );
}
