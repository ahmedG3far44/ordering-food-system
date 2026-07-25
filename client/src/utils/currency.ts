export const getCurrencySymbol = (currency?: string): string => {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'CA$',
    AUD: 'A$',
    INR: '₹',
    AED: 'د.إ ',
    SAR: 'ر.س ',
    EGP: 'E£',
  };
  return symbols[currency || 'USD'] || '$';
};

export const formatPrice = (price: number, currency?: string): string => {
  return `${getCurrencySymbol(currency)}${price.toFixed(2)}`;
};

export const convertPrice = (price: number | { $numberDecimal: string } | undefined): number => {
  if (typeof price === 'number') return price;
  if (price && typeof price === 'object' && '$numberDecimal' in price) {
    return parseFloat(price.$numberDecimal);
  }
  return 0;
};