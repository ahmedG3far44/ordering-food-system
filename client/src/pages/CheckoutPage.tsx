import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { orderService } from '../api/orders';
import { convertPrice, formatPrice } from '../utils/currency';
import { Minus, Plus, ShoppingCart, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { usePageMeta } from '../hooks/usePageMeta';

const CheckoutPage = () => {
  usePageMeta({
    title: 'Checkout - Urban Bistro',
    description: 'Review your cart and complete your food order. Fast checkout for your favorite meals from curated restaurants on Urban Bistro.',
    keywords: 'checkout, place order, food order review, cart, complete order, food checkout',
  });
  const navigate = useNavigate();
  const { items, updateQuantity, clearCart, getTotal, getCurrency } = useCartStore();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const currency = getCurrency();

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    
    setIsLoading(true);
    try {
      const orderData = {
        restaurantId: items[0].restaurantId,
        items: items.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
      };

      await orderService.create(orderData);
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      console.error('Failed to place order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 font-mono text-center">
        <p className="text-slate-500 mb-4">Please login to view your cart.</p>
        <Link to="/login" className="nb-button bg-primary text-white px-6 py-2">Login</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 font-mono text-center">
        <div className="flex justify-center mb-6">
          <ShoppingCart size={64} className="text-slate-300" />
        </div>
        <h2 className="text-2xl font-black text-primary uppercase mb-4">Your cart is empty</h2>
        <p className="text-slate-500 mb-8">Add items from a restaurant to get started.</p>
        <Link to="/restaurants" className="nb-button bg-primary text-white px-6 py-2">
          Browse Restaurants
        </Link>
      </div>
    );
  }

  const total = getTotal();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Link 
        to="/restaurants" 
        className="inline-flex items-center gap-2 text-sm font-bold text-primary mb-8 hover:underline"
      >
        <ArrowLeft size={16} /> Continue Shopping
      </Link>

      <h1 className="text-4xl font-black text-primary uppercase mb-12 font-mono">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white border-3 border-primary nb-shadow p-6 font-mono">
            <h2 className="text-xl font-black text-primary uppercase mb-6 flex items-center gap-2">
              <ShoppingCart size={20} />
              Your Order
            </h2>

            <div className="space-y-4">
              {items.map((item) => (
                <div 
                  key={item.menuItemId} 
                  className="flex items-center gap-4 p-4 border-2 border-slate-100"
                >
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599b?w=100'}
                    alt={item.name}
                    className="w-16 h-16 object-cover border-2 border-slate-200"
                  />
                  <div className="flex-1">
                    <h3 className="font-black text-primary uppercase text-sm">{item.name}</h3>
                    <p className="text-primary font-bold">{formatPrice(convertPrice(item.price), currency)}</p>
                  </div>
                  <div className="flex items-center gap-3 border-2 border-primary p-1">
                    <button
                      onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                      className="p-1 hover:bg-primary hover:text-white transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-black text-primary text-sm w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                      className="p-1 hover:bg-primary hover:text-white transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-primary">{formatPrice(convertPrice(item.price) * item.quantity, currency)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border-3 border-primary nb-shadow p-6 font-mono sticky top-24">
            <h2 className="text-xl font-black text-primary uppercase mb-6">Order Summary</h2>
            
            <div className="space-y-3 mb-6 pb-6 border-b-2 border-slate-100">
              {items.map((item) => (
                <div key={item.menuItemId} className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-bold text-primary">{formatPrice(convertPrice(item.price) * item.quantity, currency)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between mb-6">
              <span className="font-black text-primary uppercase text-lg">Total</span>
              <span className="font-black text-primary text-2xl">{formatPrice(total, currency)}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isLoading}
              className="w-full nb-button bg-primary text-white py-4 uppercase tracking-wider disabled:opacity-50"
            >
              {isLoading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;