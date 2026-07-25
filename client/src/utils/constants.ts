export const PLACEHOLDER_IMAGES = {
  RESTAURANT: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
  MENU_ITEM: 'https://images.unsplash.com/photo-1546069901-ba9599b?w=400&q=80',
};

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, fallback: string = PLACEHOLDER_IMAGES.RESTAURANT) => {
  const target = e.target as HTMLImageElement;
  target.src = fallback;
  target.onerror = null;
};