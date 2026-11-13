// "The Haddad Family" → "H", "Karim & Maya Rizk" → "KR", "Mr & Mrs Azar" → "A"
export function initials(name: string) {
  const words = name
    .replace(/^(the|mr\s*&\s*mrs|mr|mrs)\s+/i, "")
    .replace(/\s+family$/i, "")
    .split(/[\s&]+/)
    .filter(Boolean);
  const pick = words.length > 1 ? [words[0], words[words.length - 1]] : words;
  return pick.map((w) => w[0].toUpperCase()).join("");
}
