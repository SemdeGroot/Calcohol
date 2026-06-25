import type { Metadata } from "next";
import Link from "next/link";

import { ContentPage, ContentSection } from "@/components/ContentPage";
import { LEGAL_LAST_UPDATED, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacyverklaring - AlcoTox",
  description:
    "Privacyverklaring van AlcoTox. De calculator rekent volledig lokaal in je browser. Ingevoerde gegevens verlaten je apparaat niet en worden niet opgeslagen of verzonden.",
  alternates: { canonical: `${SITE_URL}/privacy/` },
};

export default function PrivacyPage() {
  return (
    <ContentPage
      title="Privacyverklaring"
      intro={`AlcoTox is gebouwd om met zo min mogelijk gegevens te werken. Laatst bijgewerkt: ${LEGAL_LAST_UPDATED}.`}
    >
      <ContentSection title="Lokale verwerking">
        <p>
          AlcoTox rekent volledig lokaal in je browser. De waarden die je invult,
          zoals gewicht en gemeten ethanolconcentratie, blijven op je apparaat.
          Ze worden niet naar een server gestuurd, niet opgeslagen en niet door
          ons ingezien.
        </p>
      </ContentSection>

      <ContentSection title="Geen account en geen server-side gegevens">
        <p>
          Er is geen account, geen inlog en geen database. De site is een
          statische webpagina zonder backend die persoonsgegevens verwerkt.
        </p>
      </ContentSection>

      <ContentSection title="Geen analyse of tracking">
        <p>
          AlcoTox gebruikt geen analytics, advertenties of trackingdiensten en
          maakt geen gebruikersprofielen aan. Zie ook de{" "}
          <Link
            href="/cookies/"
            className="text-primary underline-offset-4 hover:underline"
          >
            cookieverklaring
          </Link>
          .
        </p>
      </ContentSection>

      <ContentSection title="Hosting en serverlogs">
        <p>
          De site wordt statisch gehost bij een externe hostingprovider
          (Netlify). Zoals gebruikelijk bij webhosting kan de provider technische
          serverlogs bijhouden, bijvoorbeeld IP-adres en browsertype, voor
          beveiliging en betrouwbaarheid. Wij gebruiken deze logs niet om je te
          identificeren.
        </p>
      </ContentSection>

      <ContentSection title="Patiëntgegevens">
        <p>
          Voer geen direct identificerende patiëntgegevens in. Dat is voor de
          berekening ook niet nodig: AlcoTox heeft alleen klinische waarden zoals
          gewicht en ethanolconcentratie nodig.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
