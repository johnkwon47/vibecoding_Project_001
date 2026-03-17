export function getTarotImageCandidates(nameKo: string): string[] {
  const trimmed = nameKo.trim();
  const noSpaces = trimmed.replace(/\s+/g, "");
  const compactNumber = trimmed.replace(/\s+(?=\d+$)/, "");

  const baseNames = [
    trimmed,
    ` ${trimmed}`,
    noSpaces,
    ` ${noSpaces}`,
    compactNumber,
    ` ${compactNumber}`,
    `${trimmed}jpg`,
    `${compactNumber}jpg`,
    ` ${trimmed}jpg`,
  ];

  return [...new Set(baseNames)]
    .filter(Boolean)
    .map((baseName) => `/tarot_card_images/${encodeURIComponent(baseName)}.jpg`);
}
