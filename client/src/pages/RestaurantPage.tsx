import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { restaurantService } from '../api/restaurants';
import type { MenuItem, Restaurant } from '../types';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { convertPrice, formatPrice } from '../utils/currency';
import { PLACEHOLDER_IMAGES, handleImageError } from '../utils/constants';
import { Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { usePageMeta } from '../hooks/usePageMeta';
import { restaurantStructuredData, breadcrumbStructuredData, renderJsonLd } from '../utils/seo';

const RestaurantPage = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem, items, updateQuantity } = useCartStore();
  const { user } = useAuthStore();
  const isOwner = user?.role === 'RESTAURANT_OWNER';

  usePageMeta({
    title: restaurant ? `${restaurant.name} - Urban Bistro` : 'Restaurant - Urban Bistro',
    description: restaurant
      ? `Order food online from ${restaurant.name}. Browse the menu, choose from ${restaurant.cuisine || 'various cuisines'}, and get fast delivery in ${restaurant.deliveryTime || '30 min'}. ${restaurant.address || ''}`.trim()
      : 'View restaurant details, browse menu items, and order food online for delivery.',
    keywords: restaurant
      ? `${restaurant.name}, ${restaurant.cuisine || 'restaurant'} menu, order food, food delivery, ${restaurant.address || 'restaurant near me'}`
      : 'restaurant menu, order food, restaurant details, food delivery',
  });

  useEffect(() => {
    if (restaurant) {
      renderJsonLd({
        '@context': 'https://schema.org',
        '@graph': [
          restaurantStructuredData(restaurant),
          breadcrumbStructuredData([
            { name: 'Home', url: '/' },
            { name: 'Restaurants', url: '/restaurants' },
            { name: restaurant.name, url: `/restaurant/${id}` },
          ]),
        ],
      });
    }
  }, [restaurant, id]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        let restaurantRes: Restaurant | null = null;

        try {
          restaurantRes = await restaurantService.getById(id);
        } catch {
          const restaurants = await restaurantService.getAll();
          restaurantRes = restaurants.find(r => (r._id || r.id) === id) || null;
        }

        if (restaurantRes) {
          setRestaurant(restaurantRes);
          const menu = await restaurantService.getMenu(id);
          setMenuItems(menu);
        }
      } catch (error) {
        console.error('Failed to fetch restaurant data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return <div className="p-20 text-center font-mono">Loading...</div>;
  }

  if (!restaurant) return <div className="p-20 text-center font-mono">Restaurant not found.</div>;

  const currentItemQuantity = (menuItem: MenuItem) => {
    const itemId = menuItem._id || menuItem.id;
    return items.find(i => i.menuItemId === itemId)?.quantity || 0;
  };

  const handleAdd = (item: MenuItem) => {
    const restaurantId = restaurant._id || restaurant.id;
    const itemId = item._id || item.id;
    const price = convertPrice(item.price);
    const currency = restaurant.currency || 'USD';
    const result = addItem({
      menuItemId: itemId,
      name: item.name,
      price,
      restaurantId,
      currency,
      quantity: 1,
      imageUrl: item.imageUrl,
    });
    if (!result.success) {
      toast.error(result.message);
    }
  };

  const handleUpdateQuantity = (item: MenuItem, newQty: number) => {
    const itemId = item._id || item.id;
    updateQuantity(itemId, newQty);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Restaurant Info */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white border-3 border-primary nb-shadow p-6 font-mono">
            <img
              src={restaurant.imageUrl || PLACEHOLDER_IMAGES.RESTAURANT}
              alt={restaurant.name}
              className="w-full h-64 object-cover border-3 border-primary mb-6"
              onError={(e) => handleImageError(e, PLACEHOLDER_IMAGES.RESTAURANT)}
            />
            <h1 className="text-3xl font-black text-primary uppercase mb-2">{restaurant.name}</h1>
            <p className="text-slate-500 text-sm mb-6">{restaurant.address}</p>
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1 border-2 border-primary text-primary text-[10px] font-bold uppercase">
                {restaurant.cuisine || 'Fusion'}
              </span>
              <span className="px-3 py-1 border-2 border-primary text-primary text-[10px] font-bold uppercase">
                {restaurant.deliveryTime || '20-30 min'}
              </span>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="lg:col-span-2 font-mono">
          <h2 className="text-3xl font-black text-primary uppercase mb-8 underline decoration-primary decoration-4">The Menu</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menuItems.map((item) => {
              const itemId = item._id || item.id;
              const qty = currentItemQuantity(item);
              return (
                <div key={itemId} className="bg-white border-3 border-primary nb-shadow-sm p-4 flex gap-4 group">
                  <div className="w-24 h-24 border-2 border-primary bg-slate-100 flex-shrink-0 overflow-hidden">
                    <img
                      src={item.imageUrl || PLACEHOLDER_IMAGES.MENU_ITEM}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => handleImageError(e, PLACEHOLDER_IMAGES.MENU_ITEM)}
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-black text-primary uppercase text-sm">{item.name}</h3>
                      <p className="text-slate-500 text-[10px] line-clamp-2 mb-2">{item.description}</p>
                      <p className="font-black text-primary">{formatPrice(convertPrice(item.price), restaurant.currency)}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {isOwner ? (
                        <Link
                          to="/owner/menu"
                          className="text-[10px] text-slate-500 hover:text-primary"
                        >
                          Manage Menu
                        </Link>
                      ) : qty === 0 ? (
                        <button
                          onClick={() => handleAdd(item)}
                          className="nb-button bg-primary text-white text-[10px] uppercase py-1 px-3 flex items-center gap-1"
                        >
                          <Plus size={12} /> Add
                        </button>
                      ) : (
                        <div className="flex items-center gap-3 border-2 border-primary p-1 bg-primary/5">
                          <button
                            onClick={() => handleUpdateQuantity(item, qty - 1)}
                            className="p-1 hover:bg-primary hover:text-white transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="font-black text-primary text-xs">{qty}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item, qty + 1)}
                            className="p-1 hover:bg-primary hover:text-white transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
};

export default RestaurantPage;
