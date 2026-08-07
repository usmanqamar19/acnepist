// Safe-Language Protocol
// Maps clinical/medical terms to therapeutic language

const REPLACEMENTS: [RegExp, string][] = [
  [/\bdiagnos(is|e|ed|ing)\b/gi, 'observation'],
  [/\btreatment\b/gi, 'care routine'],
  [/\btreat\b/gi, 'support'],
  [/\bcure\b/gi, 'help'],
  [/\bpatient\b/gi, 'member'],
  [/\binflammation\b/gi, 'redness'],
  [/\binflamed\b/gi, 'sensitive'],
  [/\bcyst(ic)?\b/gi, 'deep bump'],
  [/\bnodule\b/gi, 'under-skin spot'],
  [/\bpustule\b/gi, 'surface blemish'],
  [/\bpapule\b/gi, 'small bump'],
  [/\blesion\b/gi, 'spot'],
  [/\bcomedone?s?\b/gi, 'congestion'],
  [/\bprescri(be|ption)\b/gi, 'recommend'],
  [/\bmedication\b/gi, 'product'],
  [/\bdrug\b/gi, 'product'],
  [/\bsymptom\b/gi, 'sign'],
  [/\bsevere\b/gi, 'more active'],
  [/\bmild\b/gi, 'gentle'],
  [/\bchronic\b/gi, 'ongoing'],
  [/\bacute\b/gi, 'current'],
  [/\binfection\b/gi, 'irritation'],
  [/\bbacteria\b/gi, 'impurities'],
  [/\bsebum\b/gi, 'natural oils'],
  [/\bscarring\b/gi, 'texture changes'],
  [/\bhyperpigmentation\b/gi, 'uneven tone'],
];

export function sanitizeTherapeuticLanguage(text: string): string {
  if (!text) return '';
  
  let result = text;
  for (const [pattern, replacement] of REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  
  return result;
}

export function containsForbiddenTerms(text: string): boolean {
  const forbidden = [
    'diagnosis', 'diagnose', 'treat', 'treatment', 'cure', 
    'prescription', 'prescribe', 'medication', 'drug',
    'inflammation', 'cyst', 'nodule', 'pustule', 'lesion'
  ];
  
  const lower = text.toLowerCase();
  return forbidden.some(term => lower.includes(term));
}
