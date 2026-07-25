import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { restaurantService } from '../api/restaurants';
import type { Restaurant } from '../types';
import { PLACEHOLDER_IMAGES, handleImageError } from '../utils/constants';
import { Star, Clock } from 'lucide-react';

const HomePage = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const data = await restaurantService.getAll();
        setRestaurants(data);
      } catch (error) {
        console.error('Failed to fetch restaurants:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 font-mono">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-slate-100 border-3 border-primary h-80 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12 text-center md:text-left">
        <h1 className="text-5xl font-black text-primary uppercase tracking-tighter font-mono mb-4">
          Crave <span className="underline decoration-primary decoration-4">Something</span>
        </h1>
        <p className="text-slate-500 font-mono text-lg">Explore the finest urban bistros in the city.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {restaurants.map((res) => (
          <Link
            key={res._id || res.id}
            to={`/restaurant/${res._id || res.id}`}
            className="group bg-white border-3 border-primary nb-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all block overflow-hidden"
          >
            <div className="h-48 overflow-hidden border-b-3 border-primary bg-slate-100">
              <img
                src={res.imageUrl || PLACEHOLDER_IMAGES.RESTAURANT}
                alt={res.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => handleImageError(e, PLACEHOLDER_IMAGES.RESTAURANT)}
              />
            </div>
            <div className="p-5 font-mono">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-black text-primary uppercase leading-tight">{res.name}</h3>
                <div className="flex items-center gap-1 text-primary font-bold text-sm">
                  <Star size={14} fill="currentColor" />
                  {res.rating || 'N/A'}
                </div>
              </div>
              <p className="text-slate-500 text-xs mb-4 line-clamp-2">{res.address}</p>
              <div className="flex items-center justify-between pt-4 border-t-2 border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">{res.cuisine || 'Fusion'}</span>
                <div className="flex items-center gap-1 text-primary font-bold text-[10px] uppercase">
                  <Clock size={12} />
                  {res.deliveryTime || '20-30 min'}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
