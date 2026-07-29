import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../api/orders';
import { restaurantService } from '../api/restaurants';
import type { Order, MenuItem, OrderStatus } from '../types';
import { useAuthStore } from '../store/authStore';
import { convertPrice, formatPrice } from '../utils/currency';
import { Clock, Package, CheckCircle, XCircle, ShoppingCart, ArrowRight } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

const STATUS_FLOW: OrderStatus[] = ['PENDING', 'PREPARING', 'DELIVERED'];

const statusConfig: Record<OrderStatus, { label: string; icon: any; color: string; barColor: string }> = {
  PENDING: { label: 'Pending', icon: Clock, color: 'text-yellow-600 bg-yellow-100 border-yellow-600', barColor: 'bg-yellow-500' },
  PREPARING: { label: 'Preparing', icon: Package, color: 'text-blue-600 bg-blue-100 border-blue-600', barColor: 'bg-blue-500' },
  DELIVERED: { label: 'Delivered', icon: CheckCircle, color: 'text-green-600 bg-green-100 border-green-600', barColor: 'bg-green-500' },
  CANCELLED: { label: 'Cancelled', icon: XCircle, color: 'text-red-600 bg-red-100 border-red-600', barColor: 'bg-red-500' },
};

const StatusTimeline = ({ status }: { status: OrderStatus }) => {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-3 py-3 px-4 bg-red-50 border-2 border-red-200">
        <XCircle size={20} className="text-red-500 flex-shrink-0" />
        <div>
          <p className="font-black text-red-700 uppercase text-xs">Order Cancelled</p>
          <p className="text-[10px] text-red-500 font-bold">This order has been cancelled.</p>
        </div>
      </div>
    );
  }

  const currentIdx = STATUS_FLOW.indexOf(status);

  return (
    <div className="flex items-center gap-0 w-full">
      {STATUS_FLOW.map((step, idx) => {
        const isActive = idx <= currentIdx;
        const isCurrent = idx === currentIdx;
        const StepIcon = statusConfig[step].icon;
        return (
          <div key={step} className="flex-1 flex flex-col items-center relative">
            {idx > 0 && (
              <div
                className={`absolute top-4 left-0 right-1/2 h-1 -translate-y-1/2 ${
                  isActive ? statusConfig[STATUS_FLOW[idx > 0 ? idx : 0]].barColor : 'bg-slate-200'
                }`}
                style={{ zIndex: 0, marginLeft: '50%' }}
              />
            )}
            <div
              className={`relative z-10 w-8 h-8 flex items-center justify-center border-2 transition-all duration-500 ${
                isActive
                  ? `${statusConfig[step].barColor} border-transparent text-white`
                  : 'bg-white border-slate-300 text-slate-300'
              } ${isCurrent ? 'scale-110 nb-shadow-sm' : ''}`}
            >
              <StepIcon size={14} />
            </div>
            <p
              className={`text-[9px] font-black uppercase mt-1.5 text-center leading-tight ${
                isActive ? 'text-primary' : 'text-slate-300'
              } ${isCurrent ? 'underline decoration-2 underline-offset-2' : ''}`}
            >
              {statusConfig[step].label}
            </p>
          </div>
        );
      })}
    </div>
  );
};

const OrderHistoryPage = () => {
  usePageMeta({
    title: 'My Orders - Urban Bistro',
    description: 'View your complete order history and track real-time order status. Monitor pending, preparing, delivered, and cancelled orders from Urban Bistro.',
    keywords: 'order history, track order, food order status, order tracking, past orders, delivery status, order management',
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const [restaurantCurrencies, setRestaurantCurrencies] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getMyOrders();

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
        <div className="bg-slate-100 border-3 border-primary h-12 w-64 animate-pulse mb-12" />
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border-3 border-primary nb-shadow-sm p-6">
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="bg-slate-100 border-2 border-primary h-4 w-24 animate-pulse" />
                <div className="bg-slate-100 border-2 border-primary h-4 w-20 animate-pulse" />
                <div className="bg-slate-100 border-2 border-primary h-4 w-32 animate-pulse" />
                <div className="bg-slate-100 border-2 border-primary h-6 w-20 animate-pulse ml-auto" />
              </div>
              <div className="bg-slate-100 border-2 border-primary h-12 animate-pulse" />
              <div className="mt-4 space-y-2">
                <div className="bg-slate-100 border-2 border-primary h-6 animate-pulse" />
                <div className="bg-slate-100 border-2 border-primary h-6 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-12 font-mono">
        <h1 className="text-4xl font-black text-primary uppercase mb-12">My Orders</h1>
        <div className="bg-white border-3 border-primary nb-shadow p-12 md:p-16 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 border-3 border-primary bg-primary/5 flex items-center justify-center -rotate-6">
              <ShoppingCart size={36} className="text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-primary uppercase mb-3">No orders yet</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Your order history will appear here once you place your first order.
          </p>
          <Link
            to="/restaurants"
            className="nb-button bg-primary text-white px-8 py-3 inline-flex items-center gap-2"
          >
            Browse Restaurants <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-12 flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-black text-primary uppercase font-mono">My Orders</h1>
          <p className="text-slate-500 font-mono text-sm">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          to="/restaurants"
          className="nb-button bg-primary text-white px-5 py-2 text-sm flex items-center gap-2"
        >
          <ShoppingCart size={16} /> New Order
        </Link>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          const status = statusConfig[order.status];
          const StatusIcon = status.icon;

          return (
            <div
              key={order.id}
              className="bg-white border-3 border-primary nb-shadow-sm font-mono"
            >
              {/* Order header */}
              <div className="p-5 md:p-6 border-b-2 border-slate-100">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-4 md:gap-6">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Order</p>
                      <p className="font-black text-primary">#{order.id.slice(0, 8)}</p>
                    </div>
                    <div className="hidden md:block w-px h-8 bg-slate-200" />
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Date</p>
                      <p className="font-bold text-primary text-sm whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="hidden md:block w-px h-8 bg-slate-200" />
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Time</p>
                      <p className="font-bold text-primary text-sm">
                        {new Date(order.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 border-2 ${status.color}`}>
                      <StatusIcon size={13} />
                      <span className="font-black text-[10px] uppercase">{status.label}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status timeline */}
              <div className="px-5 md:px-6 py-4 border-b-2 border-slate-100 bg-slate-50/50">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-3">Order Progress</p>
                <StatusTimeline status={order.status} />
              </div>

              {/* Order body */}
              <div className="p-5 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Restaurant</span>
                    <span className="font-black text-primary uppercase text-sm">{order.restaurant?.name || 'Restaurant'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Total</span>
                    <span className="font-black text-primary text-xl">{formatPrice(convertPrice(order.totalAmount), getOrderCurrency(order.restaurantId))}</span>
                  </div>
                </div>

                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Items</p>
                <div className="space-y-1.5">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between border-2 border-slate-200 px-3 py-2"
                    >
                      <span className="text-sm text-slate-700 font-bold">
                        <span className="text-primary">{item.quantity}x</span> {item.name || item.menuItemId}
                      </span>
                      <span className="font-black text-primary text-sm">
                        {formatPrice(convertPrice(item.priceAtPurchase) * item.quantity, getOrderCurrency(order.restaurantId))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};

export default OrderHistoryPage;
