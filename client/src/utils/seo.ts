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
      'The definitive food ordering experience. Browse curated restaurants, order food online, and manage your business with a brutalist-designed platform.',
    applicationCategory: 'FoodOrdering',
    operatingSystem: 'Web',
    author: {
      '@type': 'Organization',
      name: 'Urban Bistro',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    keywords: 'food ordering, online food delivery, restaurant management, urban dining, bistro',
  };
}

export function restaurantStructuredData(restaurant: {
  name: string;
  address?: string;
  cuisine?: string;
  imageUrl?: string;
  rating?: number;
  description?: string;
}) {
  return {
    '@type': 'Restaurant',
    name: restaurant.name,
    image: restaurant.imageUrl,
    description: restaurant.description || `Order from ${restaurant.name} on Urban Bistro. ${restaurant.cuisine || 'Various cuisines'} delivered to your door.`,
    address: restaurant.address
      ? { '@type': 'PostalAddress', streetAddress: restaurant.address }
      : undefined,
    servesCuisine: restaurant.cuisine || 'Various',
    aggregateRating: restaurant.rating
      ? { '@type': 'AggregateRating', ratingValue: restaurant.rating, bestRating: 5 }
      : undefined,
  };
}

export function breadcrumbStructuredData(items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };
}
