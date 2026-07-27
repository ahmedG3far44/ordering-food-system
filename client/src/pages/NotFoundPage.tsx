import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

const NotFoundPage = () => {
  usePageMeta({
    title: '404 Page Not Found - Urban Bistro',
    description: 'The page you are looking for does not exist or has been moved. Browse our restaurants or go back home.',
  });
  return (
    <main className="max-w-7xl mx-auto px-4 py-24 font-mono">
      <div className="text-center">
        <div className="mb-8">
          <Search size={80} className="mx-auto text-slate-300" />
        </div>
        <h1 className="text-6xl font-black text-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold text-primary uppercase mb-4">Page Not Found</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/"
            className="nb-button bg-primary text-white px-6 py-3 flex items-center gap-2"
          >
            <Home size={18} />
            Go Home
          </Link>
          <Link
            to="/restaurants"
            className="px-6 py-3 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors"
          >
            Browse Restaurants
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFoundPage;