import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { ShoppingCart, LogOut, Store, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b-3 border-primary bg-white sticky top-0 z-50 font-mono">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Store className="text-primary group-hover:rotate-12 transition-transform" />
          <span className="text-xl font-black text-primary uppercase tracking-tighter">
            Urban<span className="text-slate-400">Bistro</span>
          </span>
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              {user.role === 'CUSTOMER' ? (
                <>
                  <Link
                    to="/orders"
                    className="hidden md:block text-sm font-bold text-primary hover:underline underline-offset-4"
                  >
                    My Orders
                  </Link>

                  <Link
                    to="/checkout"
                    className="relative p-2 border-2 border-primary nb-shadow-sm hover:bg-primary hover:text-white transition-all"
                  >
                    <ShoppingCart size={20} />
                    {items.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                        {items.reduce((acc, item) => acc + item.quantity, 0)}
                      </span>
                    )}
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-8">
                  <Link
                    to="/owner/dashboard"
                    className="flex items-center gap-2 text-sm font-bold text-primary hover:underline underline-offset-4"
                  >
                    <LayoutDashboard size={18} />
                    <span className="hidden md:inline">Dashboard</span>
                  </Link>
                  <Link
                    to="/owner/restaurants"
                    className="flex items-center gap-2 text-sm font-bold text-primary hover:underline underline-offset-4"
                  >
                    <Store size={18} />
                    <span className="hidden md:inline">Restaurants</span>
                  </Link>
                </div>
              )}

              <div className="flex items-center gap-3 pl-6 border-l-2 border-slate-200">
                <div className="hidden sm:block text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Logged in as</p>
                  <p className="text-xs font-black text-primary uppercase">{user.name}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-bold text-primary hover:underline underline-offset-4"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="nb-button bg-primary text-white text-xs uppercase py-2 px-4"
              >
                Join Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
