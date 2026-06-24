// Maps ISO 3166-1 alpha-2 country codes to phone dial prefixes.
// Countries likely used by Zyra clients are listed first; others follow.
const PREFIXES: Record<string, string> = {
  // Africa
  cm: '+237', // Cameroun
  ci: '+225', // Côte d'Ivoire
  sn: '+221', // Sénégal
  ml: '+223', // Mali
  bf: '+226', // Burkina Faso
  bj: '+229', // Bénin
  tg: '+228', // Togo
  ne: '+227', // Niger
  gn: '+224', // Guinée
  ga: '+241', // Gabon
  cg: '+242', // Congo
  cd: '+243', // RD Congo
  mg: '+261', // Madagascar
  ma: '+212', // Maroc
  dz: '+213', // Algérie
  tn: '+216', // Tunisie
  eg: '+20',  // Égypte
  gh: '+233', // Ghana
  ng: '+234', // Nigeria
  ke: '+254', // Kenya
  tz: '+255', // Tanzanie
  za: '+27',  // Afrique du Sud
  // Europe
  fr: '+33',
  be: '+32',
  ch: '+41',
  gb: '+44',
  de: '+49',
  es: '+34',
  it: '+39',
  pt: '+351',
  // Americas
  us: '+1',
  ca: '+1',
  br: '+55',
}

export function getPhonePrefix(countryCode: string): string {
  return PREFIXES[countryCode?.toLowerCase()] ?? '+1'
}
