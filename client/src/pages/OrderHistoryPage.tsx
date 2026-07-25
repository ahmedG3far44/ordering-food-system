import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../api/orders';
import { restaurantService } from '../api/restaurants';
import type { Order, MenuItem } from '../types';
import { useAuthStore } from '../store/authStore';
import { convertPrice, formatPrice } from '../utils/currency';
import { Clock, Package, CheckCircle, XCircle, ShoppingCart } from 'lucide-react';

const statusConfig = {
  PENDING: { label: 'Pending', icon: Clock, color: 'text-yellow-600 bg-yellow-100 border-yellow-600' },
  PREPARING: { label: 'Preparing', icon: Package, color: 'text-blue-600 bg-blue-100 border-blue-600' },
  DELIVERED: { label: 'Delivered', icon: CheckCircle, color: 'text-green-600 bg-green-100 border-green-600' },
  CANCELLED: { label: 'Cancelled', icon: XCircle, color: 'text-red-600 bg-red-100 border-red-600' },
};

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const [restaurantCurrencies, setRestaurantCurrencies] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getMyOrders();

        // Fetch restaurant info for each order to get currency
        const restaurantIds = [...new Set(data.map(o => o.restaurantId))];
        const currencies: Record<string, string> = {};
        
        for (const id of restaurantIds) {
          try {
            const restaurant = await restaurantService.getById(id);
            currencies[id] = restaurant.currency || 'USD';
          } catch {
            currencies[id] = 'USD';
          }
        }
        setRestaurantCurrencies(currencies);

        // Fetch menu item names for each order
        const ordersWithNames = await Promise.all(
          data.map(async (order) => {
            try {
              const menuItems = await restaurantService.getMenu(order.restaurantId);
              const menuMap = new Map(menuItems.map((item: MenuItem) => [item._id || item.id, item.name]));

              const itemsWithNames = order.items.map((item) => ({
                ...item,
                name: item.name || menuMap.get(item.menuItemId) || item.menuItemId
              }));

              return { ...order, items: itemsWithNames };
            } catch {
              return order;
            }
          })
        );

        setOrders(ordersWithNames);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchOrders();
  }, [user]);

  const getOrderCurrency = (restaurantId: string) => restaurantCurrencies[restaurantId] || 'USD';

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 font-mono text-center">
        <p className="text-slate-500 mb-4">Please login to view your orders.</p>
        <Link to="/login" className="nb-button bg-primary text-white px-6 py-2">Login</Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 font-mono">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-100 border-3 border-primary h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 font-mono text-center">
        <div className="flex justify-center mb-6">
          <ShoppingCart size={64} className="text-slate-300" />
        </div>
        <h2 className="text-2xl font-black text-primary uppercase mb-4">No orders yet</h2>
        <p className="text-slate-500 mb-8">Place your first order to get started.</p>
        <Link to="/restaurants" className="nb-button bg-primary text-white px-6 py-2">
          Browse Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black text-primary uppercase mb-12 font-mono">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => {
          const status = statusConfig[order.status];
          const StatusIcon = status.icon;

          return (
            <div
              key={order.id}
              className="bg-white border-3 border-primary nb-shadow-sm p-6 font-mono"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Order ID</p>
                  <p className="font-black text-primary text-sm">#{order.id.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Date</p>
                  <p className="font-bold text-primary text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Restaurant</p>
                  <p className="font-bold text-primary text-sm">{order.restaurant?.name || 'Restaurant'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total</p>
                  <p className="font-black text-primary text-lg">{formatPrice(convertPrice(order.totalAmount), getOrderCurrency(order.restaurantId))}</p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 border-2 ${status.color}`}>
                  <StatusIcon size={14} />
                  <span className="font-bold text-xs uppercase">{status.label}</span>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Items</p>
                <div className="flex flex-col gap-2 w-1/2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="w-full border-2 border-slate-200 p-2 flex justify-start gap-2 text-sm">
                      <span className="text-slate-600">
                        {item.quantity}x {item.name || item.menuItemId}
                      </span>
                      <span className="font-bold text-primary ml-auto">{formatPrice(convertPrice(item.priceAtPurchase) * item.quantity, getOrderCurrency(order.restaurantId))}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderHistoryPage;