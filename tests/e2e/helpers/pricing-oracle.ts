export const REPO_PRICING: Record<string, Record<string, Record<string, number>>> = {
  USD: {
    '30': { '2': 40, '3': 50, '4': 55, '5': 60 },
    '40': { '2': 56, '3': 66, '4': 73, '5': 80 },
  },
  AED: {
    '30': { '2': 146, '3': 183, '4': 201, '5': 220 },
    '40': { '2': 205, '3': 242, '4': 268, '5': 293 },
  },
  SAR: {
    '30': { '2': 150, '3': 187, '4': 206, '5': 225 },
    '40': { '2': 210, '3': 247, '4': 274, '5': 300 },
  },
  GBP: {
    '30': { '2': 29, '3': 37, '4': 40, '5': 44 },
    '40': { '2': 41, '3': 48, '4': 54, '5': 59 },
  },
  EUR: {
    '30': { '2': 34, '3': 43, '4': 47, '5': 51 },
    '40': { '2': 48, '3': 57, '4': 63, '5': 69 },
  },
  SGD: {
    '30': { '2': 50, '3': 63, '4': 69, '5': 76 },
    '40': { '2': 71, '3': 84, '4': 92, '5': 101 },
  },
  CAD: {
    '30': { '2': 55, '3': 69, '4': 75, '5': 82 },
    '40': { '2': 77, '3': 91, '4': 100, '5': 110 },
  },
  AUD: {
    '30': { '2': 55, '3': 69, '4': 76, '5': 83 },
    '40': { '2': 78, '3': 92, '4': 101, '5': 111 },
  },
};

export const EXPECTED_CURRENCY_FOR_COUNTRY: Record<string, { currency: string; symbol: string }> = {
  GB: { currency: 'GBP', symbol: '£' },
  DE: { currency: 'EUR', symbol: '€' },
  SA: { currency: 'SAR', symbol: '﷼' },
  AE: { currency: 'AED', symbol: 'د.إ' },
  SG: { currency: 'SGD', symbol: 'S$' },
  CA: { currency: 'CAD', symbol: 'CA$' },
  AU: { currency: 'AUD', symbol: 'A$' },
  QA: { currency: 'USD', symbol: '$' },
  PK: { currency: 'USD', symbol: '$' },
  US: { currency: 'USD', symbol: '$' },
};
