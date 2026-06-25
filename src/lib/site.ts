export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://alcotox.netlify.app"
).replace(/\/$/, "");

export const SITE_NAME = "AlcoTox";

export const SITE_TITLE =
  "AlcoTox – Ethanol doseringscalculator (methanol & ethyleenglycol)";

export const SITE_DESCRIPTION =
  "AlcoTox berekent de oplaaddosis en onderhoudsdosering ethanol als antidotum bij methanol- of ethyleenglycolintoxicatie en zet de dosis om naar infuusvolume.";

// Shown as "Laatst bijgewerkt" on the legal pages.
export const LEGAL_LAST_UPDATED = "juni 2026";
