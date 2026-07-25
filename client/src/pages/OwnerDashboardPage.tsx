import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../api/orders';
import { restaurantService } from '../api/restaurants';
import type { Order, Restaurant, SalesData, DateRange } from '../types';
import { useAuthStore } from '../store/authStore';
import { useThemeStore, type ThemeColor } from '../store/themeStore';
import { Clock, Package, CheckCircle, XCircle, Utensils, ChefHat, DollarSign, TrendingUp, Store, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const convertPrice = (price: number | { $numberDecimal: string } | undefined): number => {
  if (typeof price === 'number') return price;
  if (price && typeof price === 'object' && '$numberDecimal' in price) {
    return parseFloat(price.$numberDecimal);
  }
  return 0;
};

const statusConfig = {
  PENDING: { label: 'Pending', icon: Clock, color: 'text-yellow-600 bg-yellow-100 border-yellow-600' },
  PREPARING: { label: 'Preparing', icon: Package, color: 'text-blue-600 bg-blue-100 border-blue-600' },
  DELIVERED: { label: 'Delivered', icon: CheckCircle, color: 'text-green-600 bg-green-100 border-green-600' },
  CANCELLED: { label: 'Cancelled', icon: XCircle, color: 'text-red-600 bg-red-100 border-red-600' },
};

type DateFilter = '7days' | '30days' | '90days' | 'custom';

const OwnerDashboardPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<DateFilter>('7days');
  const [customRange, setCustomRange] = useState<DateRange>({ startDate: '', endDate: '' });
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'sales' | 'settings'>('orders');
  const [filterRestaurant, setFilterRestaurant] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { user } = useAuthStore();

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  useEffect(() => {
    if (selectedRestaurant || dateFilter !== 'custom') {
      fetchSalesData();
    }
  }, [selectedRestaurant, dateFilter, customRange]);

  const getDateRange = (): DateRange => {
    const end = new Date();
    const start = new Date();

    switch (dateFilter) {
      case '7days':
        start.setDate(end.getDate() - 7);
        break;
      case '30days':
        start.setDate(end.getDate() - 30);
        break;
      case '90days':
        start.setDate(end.getDate() - 90);
        break;
      case 'custom':
        return customRange;
    }

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      startDate: formatDate(start),
      endDate: formatDate(end),
    };
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [myRestaurants, fetchedOrders] = await Promise.all([
        restaurantService.getMy(),
        orderService.getMyOrders(),
      ]);

      // Map restaurant IDs to names
      const restaurantMap = new Map(myRestaurants.map(r => [r.id, r.name]));
      const restaurantIdMap = new Map(myRestaurants.map(r => [r._id || r.id, r.name]));

      // Map customer info from populated customer field
      const ordersWithRestaurant = fetchedOrders.map(order => {
        const customerData = order.customer as any;
        return {
          ...order,
          customerName: customerData?.name || customerData?.email || 'Customer',
          customerEmail: customerData?.email || '',
          restaurant: order.restaurant || {
            id: order.restaurantId,
            name: restaurantMap.get(order.restaurantId) || restaurantIdMap.get(order.restaurantId) || 'Restaurant',
            address: ''
          }
        };
      });

      setRestaurants(myRestaurants);
      setOrders(ordersWithRestaurant);

      // Set default filters
      if (myRestaurants.length > 0 && !selectedRestaurant) {
        setSelectedRestaurant(myRestaurants[0]);
        setFilterRestaurant(myRestaurants[0]._id || myRestaurants[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSalesData = async () => {
    if (!selectedRestaurant) return;

    const restaurantId = selectedRestaurant._id || selectedRestaurant.id;

    if (!restaurantId) {
      console.error('No restaurant ID available');
      return;
    }

    try {
      const range = getDateRange();
      const data = await restaurantService.getSales(restaurantId, range);
      setSalesData(data);
    } catch (error) {
      console.error('Failed to fetch sales:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    const orderRestaurantId = order.restaurantId || order.restaurant?.id;
    const matchesRestaurant = filterRestaurant === 'all' || orderRestaurantId === filterRestaurant;
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesRestaurant && matchesStatus;
  });

  const pendingCount = filteredOrders.filter(o => o.status === 'PENDING').length;
  const preparingCount = filteredOrders.filter(o => o.status === 'PREPARING').length;
  const deliveredCount = filteredOrders.filter(o => o.status === 'DELIVERED').length;

  const handleStatusUpdate = async (orderId: string, status: Order['status']) => {
    setUpdatingOrderId(orderId);
    try {
      await orderService.updateStatus(orderId, status);
      toast.success('Order status updated');
      fetchData();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 font-mono text-center">
        <p className="text-slate-500 mb-4">Please login to access the dashboard.</p>
        <Link to="/login" className="nb-button bg-primary text-white px-6 py-2">Login</Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 font-mono">
        <div className="grid grid-cols-3 gap-6 mb-12">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-100 border-3 border-primary h-32 animate-pulse" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-slate-100 border-3 border-primary h-24 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-primary uppercase font-mono">Dashboard</h1>
          <p className="text-slate-500 font-mono">Manage your restaurant business</p>
        </div>
        <div className="flex gap-2">
          <Link to="/owner/restaurants" className="nb-button bg-primary text-white px-4 py-2 flex items-center gap-2">
            <Store size={18} />
            Restaurants
          </Link>
          <Link to="/owner/menu" className="nb-button bg-primary text-white px-4 py-2 flex items-center gap-2">
            <ChefHat size={18} />
            Menu
          </Link>
        </div>
      </div>

      {/* Restaurant Selector */}
      {restaurants.length > 0 && (
        <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2">
          {restaurants.map((res) => (
            <button
              key={res.id || res._id}
              onClick={() => setSelectedRestaurant(res)}
              className={`px-4 py-2 border-2 font-bold text-sm uppercase whitespace-nowrap ${selectedRestaurant?.id === res.id
                ? 'bg-primary text-white border-primary'
                : 'border-slate-200 text-slate-500 hover:border-primary'
                }`}
            >
              {res.name}
            </button>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b-2 border-slate-200">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-3 font-bold uppercase text-sm ${activeTab === 'orders'
            ? 'border-b-4 border-primary text-primary'
            : 'text-slate-500'
            }`}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-6 py-3 font-bold uppercase text-sm ${activeTab === 'sales'
            ? 'border-b-4 border-primary text-primary'
            : 'text-slate-500'
            }`}
        >
          Sales Analytics
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-3 font-bold uppercase text-sm ${activeTab === 'settings'
            ? 'border-b-4 border-primary text-primary'
            : 'text-slate-500'
            }`}
        >
          Settings
        </button>
      </div>

      {activeTab === 'orders' ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-12">
            <div className="bg-white border-3 border-yellow-500 nb-shadow-sm p-6 font-mono text-center">
              <Clock size={32} className="text-yellow-500 mx-auto mb-2" />
              <p className="text-3xl font-black text-primary">{pendingCount}</p>
              <p className="text-sm font-bold text-slate-500 uppercase">Pending</p>
            </div>
            <div className="bg-white border-3 border-blue-500 nb-shadow-sm p-6 font-mono text-center">
              <Package size={32} className="text-blue-500 mx-auto mb-2" />
              <p className="text-3xl font-black text-primary">{preparingCount}</p>
              <p className="text-sm font-bold text-slate-500 uppercase">Preparing</p>
            </div>
            <div className="bg-white border-3 border-green-500 nb-shadow-sm p-6 font-mono text-center">
              <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
              <p className="text-3xl font-black text-primary">{deliveredCount}</p>
              <p className="text-sm font-bold text-slate-500 uppercase">Delivered</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Restaurant:</label>
              <select
                value={filterRestaurant}
                onChange={(e) => setFilterRestaurant(e.target.value)}
                className="border-2 border-primary p-2 outline-none focus:bg-primary/5"
              >
                <option value="all">All Restaurants</option>
                {restaurants.map(res => (
                  <option key={res.id} value={res._id || res.id}>{res.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border-2 border-primary p-2 outline-none focus:bg-primary/5"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PREPARING">Preparing</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Orders List */}
          <div className="bg-white border-3 border-primary nb-shadow p-6 font-mono overflow-hidden">
            <h2 className="text-xl font-black text-primary uppercase mb-6 flex items-center gap-2">
              <Utensils size={20} />
              Recent Orders
            </h2>

            {filteredOrders.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left py-3 text-xs font-bold text-slate-500 uppercase">Order ID</th>
                      <th className="text-left py-3 text-xs font-bold text-slate-500 uppercase">Customer</th>
                      <th className="text-left py-3 text-xs font-bold text-slate-500 uppercase">Restaurant</th>
                      <th className="text-right py-3 text-xs font-bold text-slate-500 uppercase">Items</th>
                      <th className="text-right py-3 text-xs font-bold text-slate-500 uppercase">Total</th>
                      <th className="text-center py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                      <th className="text-left py-3 text-xs font-bold text-slate-500 uppercase">Date</th>
                      <th className="text-center py-3 text-xs font-bold text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => {
                      const status = statusConfig[order.status];
                      const StatusIcon = status.icon;
                      const id = order.id;
                      const restaurantName = order.restaurant?.name || 'Restaurant';
                      const customerName = order.customerName || 'Customer';
                      const customerEmail = order.customerEmail || '';

                      return (
                        <tr key={id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3">
                            <span className="font-black text-primary text-sm">#{id?.slice(0, 8)}</span>
                          </td>
                          <td className="py-3">
                            <div>
                              <span className="font-bold text-primary text-sm">{customerName}</span>
                              {customerEmail && (
                                <p className="text-xs text-slate-400">{customerEmail}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-3">
                            <span className="font-bold text-primary text-sm">{restaurantName}</span>
                          </td>
                          <td className="py-3 text-right font-bold text-primary">
                            {order.items.length}
                          </td>
                          <td className="py-3 text-right font-black text-primary">
                            ${convertPrice(order.totalAmount)}
                          </td>
                          <td className="py-3 text-center">
                            <span className={`inline-flex items-center gap-1 font-bold text-xs uppercase px-3 py-1 border-2 ${status.color}`}>
                              <StatusIcon size={12} className={status.color.split(' ')[0]} />
                              {status.label}
                            </span>
                          </td>
                          <td className="py-3 text-sm text-slate-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 text-center">
                            <div className="flex justify-center gap-1">
                              {order.status === 'PENDING' && (
                                <button
                                  onClick={() => handleStatusUpdate(id, 'PREPARING')}
                                  disabled={updatingOrderId === id}
                                  className="px-2 py-1 text-xs bg-blue-500 text-white font-bold uppercase disabled:opacity-50"
                                >
                                  {updatingOrderId === id ? '...' : 'Start'}
                                </button>
                              )}
                              {order.status === 'PREPARING' && (
                                <button
                                  onClick={() => handleStatusUpdate(id, 'DELIVERED')}
                                  disabled={updatingOrderId === id}
                                  className="px-2 py-1 text-xs bg-green-500 text-white font-bold uppercase disabled:opacity-50"
                                >
                                  {updatingOrderId === id ? '...' : 'Complete'}
                                </button>
                              )}
                              {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                                <button
                                  onClick={() => handleStatusUpdate(id, 'CANCELLED')}
                                  disabled={updatingOrderId === id}
                                  className="px-2 py-1 text-xs bg-red-500 text-white font-bold uppercase disabled:opacity-50"
                                >
                                  {updatingOrderId === id ? '...' : 'Cancel'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Date Filter */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-slate-500" />
              <span className="font-bold text-sm text-slate-500 uppercase">Date Range:</span>
            </div>
            {(['7days', '30days', '90days'] as DateFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-4 py-2 border-2 font-bold text-sm uppercase ${dateFilter === filter
                  ? 'bg-primary text-white border-primary'
                  : 'border-slate-200 text-slate-500 hover:border-primary'
                  }`}
              >
                {filter === '7days' ? '7 Days' : filter === '30days' ? '30 Days' : '90 Days'}
              </button>
            ))}
            <input
              type="date"
              value={customRange?.startDate || ''}
              onChange={(e) => setCustomRange({ ...customRange, startDate: e.target.value })}
              className="border-2 border-primary p-2 font-mono text-sm"
              placeholder="Start"
            />
            <span className="text-slate-500">-</span>
            <input
              type="date"
              value={customRange?.endDate || ''}
              onChange={(e) => setCustomRange({ ...customRange, endDate: e.target.value })}
              className="border-2 border-primary p-2 font-mono text-sm"
              placeholder="End"
            />
            <button
              onClick={() => setDateFilter('custom')}
              className={`px-4 py-2 border-2 font-bold text-sm uppercase ${dateFilter === 'custom'
                ? 'bg-primary text-white border-primary'
                : 'border-slate-200 text-slate-500 hover:border-primary'
                }`}
            >
              Apply
            </button>
          </div>

          {/* Sales Stats */}
          {salesData && (
            <div className="grid grid-cols-2 gap-6 mb-12">
              <div className="bg-white border-3 border-green-500 nb-shadow-sm p-6 font-mono text-center">
                <DollarSign size={32} className="text-green-500 mx-auto mb-2" />
                <p className="text-3xl font-black text-primary">${salesData?.totalRevenue?.toFixed(2) || '0.00'}</p>
                <p className="text-sm font-bold text-slate-500 uppercase">Total Revenue</p>
              </div>
              <div className="bg-white border-3 border-primary nb-shadow-sm p-6 font-mono text-center">
                <TrendingUp size={32} className="text-primary mx-auto mb-2" />
                <p className="text-3xl font-black text-primary">{salesData?.totalOrders || 0}</p>
                <p className="text-sm font-bold text-slate-500 uppercase">Total Orders</p>
              </div>
            </div>
          )}

          {/* Sales Items Breakdown */}
          <div className="bg-white border-3 border-primary nb-shadow p-6 font-mono">
            <h2 className="text-xl font-black text-primary uppercase mb-6 flex items-center gap-2">
              <TrendingUp size={20} />
              Revenue by Item
            </h2>

          {!salesData || salesData?.items?.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No sales data for this period.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-3 text-xs font-bold text-slate-500 uppercase">Item</th>
                    <th className="text-right py-3 text-xs font-bold text-slate-500 uppercase">Quantity Sold</th>
                    <th className="text-right py-3 text-xs font-bold text-slate-500 uppercase">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData?.items?.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="py-3 font-bold text-primary">{item.name}</td>
                      <td className="py-3 text-right font-bold text-primary">{item.quantitySold}</td>
                      <td className="py-3 text-right font-black text-primary">${item.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </div>
        </>
      )}

      {activeTab === 'settings' && (
        <SettingsContent />
      )}
    </div>
  );
};

const SettingsContent = () => {
  const { color, setColor } = useThemeStore();

  const colors: { label: string; value: ThemeColor; bg: string }[] = [
    { label: 'Slate', value: 'slate', bg: 'bg-slate-900' },
    { label: 'Green', value: 'green', bg: 'bg-green-600' },
    { label: 'Orange', value: 'orange', bg: 'bg-orange-600' },
    { label: 'Purple', value: 'purple', bg: 'bg-purple-600' },
    { label: 'Blue', value: 'blue', bg: 'bg-blue-600' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-primary uppercase mb-4">Color Palette</h2>
        <div className="grid grid-cols-1 gap-3">
          {colors.map((c) => (
            <button
              key={c.value}
              onClick={() => setColor(c.value)}
              className={`flex items-center justify-between p-4 border-3 transition-all ${color === c.value
                ? 'border-primary bg-primary text-white shadow-[4px_4px_0px_0px_var(--primary)]'
                : 'border-slate-200 bg-white text-slate-600 hover:border-primary'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full ${c.bg} border-2 border-white`} />
                <span className="font-black uppercase">{c.label}</span>
              </div>
              {color === c.value && (
                <span className="text-[10px] font-black uppercase bg-white text-primary px-2 py-1">Active</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border-3 border-primary nb-shadow p-6">
        <h2 className="text-xl font-bold text-primary uppercase mb-4">Preview</h2>
        <div className="space-y-4">
          <div className="h-12 bg-primary/10 border-2 border-primary rounded flex items-center px-4 font-black text-primary text-sm uppercase">
            Sample Button
          </div>
          <div className="p-4 border-2 border-primary bg-primary/5 text-primary text-xs font-bold uppercase">
            This is how your brand colors will look across the application.
          </div>
          <div className="flex gap-2">
            <div className="w-full h-4 bg-primary" />
            <div className="w-full h-4 bg-primary/50" />
            <div className="w-full h-4 bg-primary/20" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboardPage;