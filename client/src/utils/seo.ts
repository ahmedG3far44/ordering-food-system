const BASE_URL = 'https://food.njerka.xyz';

export function JsonLd() {
  return null;
}

export function renderJsonLd(data: Record<string, unknown>) {
  const script = document.querySelector('#json-ld') as HTMLScriptElement | null;
  if (script) {
    script.textContent = JSON.stringify(data);
    return;
  }
  const el = document.createElement('script');
  el.id = 'json-ld';
  el.type = 'application/ld+json';
  el.textContent = JSON.stringify(data);
  document.head.appendChild(el);
}

export function removeJsonLd() {
  const script = document.querySelector('#json-ld');
  if (script) script.remove();
}

export function appStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Urban Bistro',
    url: BASE_URL,
    description:
      'The definitive food ordering experience. Browse restaurants, order food, and manage your business with a brutalist-designed platform.',
    applicationCategory: 'FoodOrdering',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
}

export function restaurantStructuredData(restaurant: {
  name: string;
  address?: string;
  cuisine?: string;
  imageUrl?: string;
  rating?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: restaurant.name,
    image: restaurant.imageUrl,
    address: restaurant.address
      ? { '@type': 'PostalAddress', streetAddress: restaurant.address }
      : undefined,
    servesCuisine: restaurant.cuisine,
    aggregateRating: restaurant.rating
      ? { '@type': 'AggregateRating', ratingValue: restaurant.rating }
      : undefined,
  };
}
