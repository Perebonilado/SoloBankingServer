export type NameMatch = 'exact' | 'partial' | 'fuzzy';

export interface RankedMatch<T> {
  item: T;
  match: NameMatch;
}

export const FUZZY_THRESHOLD = 0.85;

const STRENGTH: Record<NameMatch, number> = { exact: 0, partial: 1, fuzzy: 2 };

export function normalizeName(value: string): string[] {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

export function jaroWinkler(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  const window = Math.max(0, Math.floor(Math.max(a.length, b.length) / 2) - 1);
  const aMatched = Array.from({ length: a.length }, () => false);
  const bMatched = Array.from({ length: b.length }, () => false);
  let matches = 0;

  for (let i = 0; i < a.length; i++) {
    const start = Math.max(0, i - window);
    const end = Math.min(i + window + 1, b.length);
    for (let j = start; j < end; j++) {
      if (bMatched[j] || a[i] !== b[j]) continue;
      aMatched[i] = true;
      bMatched[j] = true;
      matches++;
      break;
    }
  }
  if (matches === 0) return 0;

  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < a.length; i++) {
    if (!aMatched[i]) continue;
    while (!bMatched[k]) k++;
    if (a[i] !== b[k]) transpositions++;
    k++;
  }

  const jaro =
    (matches / a.length +
      matches / b.length +
      (matches - transpositions / 2) / matches) /
    3;

  let prefix = 0;
  const maxPrefix = Math.min(4, a.length, b.length);
  while (prefix < maxPrefix && a[prefix] === b[prefix]) prefix++;

  return jaro + prefix * 0.1 * (1 - jaro);
}

function matchWord(spoken: string, saved: string): NameMatch | null {
  if (spoken === saved) return 'exact';
  if (saved.startsWith(spoken)) return 'partial';
  if (jaroWinkler(spoken, saved) >= FUZZY_THRESHOLD) return 'fuzzy';
  return null;
}

export function matchName(spoken: string, saved: string): NameMatch | null {
  const spokenWords = normalizeName(spoken);
  const savedWords = normalizeName(saved);
  if (spokenWords.length === 0) return null;

  let weakest: NameMatch = 'exact';
  for (const word of spokenWords) {
    let best: NameMatch | null = null;
    for (const savedWord of savedWords) {
      const match = matchWord(word, savedWord);
      if (match && (best === null || STRENGTH[match] < STRENGTH[best])) {
        best = match;
      }
    }
    if (best === null) return null;
    if (STRENGTH[best] > STRENGTH[weakest]) weakest = best;
  }
  return weakest;
}

export function rankByName<T>(
  spoken: string,
  items: T[],
  nameOf: (item: T) => string,
): RankedMatch<T>[] {
  return items
    .flatMap((item) => {
      const match = matchName(spoken, nameOf(item));
      return match ? [{ item, match }] : [];
    })
    .sort((left, right) => STRENGTH[left.match] - STRENGTH[right.match]);
}
