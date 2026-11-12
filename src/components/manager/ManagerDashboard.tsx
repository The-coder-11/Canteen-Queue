import React, { useState, useMemo } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { MenuItem, FoodCategory } from '../../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  ShieldCheck,
  LayoutDashboard,
  UtensilsCrossed,
  Clock,
  Users,
  ShoppingBag,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  LogOut,
  IndianRupee,
  Search,
  Filter,
  DollarSign,
  AlertTriangle,
  Boxes,
} from 'lucide-react';

export const ManagerDashboard: React.FC = () => {
  const {
    currentStaff,
    logout,
    orders,
    groupOrders,
    menuItems,
    pickupSlots,
    updateMenuItem,
    addMenuItem,
    deleteMenuItem,
    toggleFoodAvailability,
    updateSlotCapacity,
    kitchenMetrics,
    inventory,
    foodWasteRecords,
  } = useCanteen();

  // Active section
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'slots' | 'staff' | 'orders' | 'analytics'>('overview');

  // Menu Modal state (Add / Edit)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [itemFormName, setItemFormName] = useState('');
  const [itemFormCategory, setItemFormCategory] = useState<FoodCategory>('Breakfast');
  const [itemFormPrice, setItemFormPrice] = useState(50);
  const [itemFormDescription, setItemFormDescription] = useState('');
  const [itemFormImageUrl, setItemFormImageUrl] = useState('');
  const [itemFormPrepTime, setItemFormPrepTime] = useState(8);

  // Search filter in order management
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Handle open add modal
  const handleOpenAdd = () => {
    setEditingItem(null);
    setItemFormName('');
    setItemFormCategory('Breakfast');
    setItemFormPrice(50);
    setItemFormDescription('');
    setItemFormImageUrl('https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80');
    setItemFormPrepTime(8);
    setIsMenuModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setItemFormName(item.name);
    setItemFormCategory(item.category);
    setItemFormPrice(item.price);
    setItemFormDescription(item.description);
    setItemFormImageUrl(item.imageUrl);
    setItemFormPrepTime(item.prepTimeMinutes);
    setIsMenuModalOpen(true);
  };

  // Submit menu item form
  const handleSaveMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemFormName.trim()) return;

    if (editingItem) {
      updateMenuItem({
        ...editingItem,
        name: itemFormName.trim(),
        category: itemFormCategory,
        price: Number(itemFormPrice),
        description: itemFormDescription.trim(),
        imageUrl: itemFormImageUrl.trim(),
        prepTimeMinutes: Number(itemFormPrepTime),
      });
    } else {
      addMenuItem({
        name: itemFormName.trim(),
        category: itemFormCategory,
        price: Number(itemFormPrice),
        description: itemFormDescription.trim(),
        imageUrl: itemFormImageUrl.trim(),
        prepTimeMinutes: Number(itemFormPrepTime),
        isAvailable: true,
        dietary: 'veg',
      });
    }
    setIsMenuModalOpen(false);
  };

  // Analytics datasets
  const salesBySlotData = useMemo(() => {
    return pickupSlots.slice(0, 10).map((s) => ({
      slot: s.time,
      orders: s.booked,
      revenue: s.booked * 75,
    }));
  }, [pickupSlots]);

  const paymentBreakdownData = useMemo(() => {
    const online = orders.filter((o) => o.paymentMethod === 'online').length;
    const cash = orders.filter((o) => o.paymentMethod === 'cash').length;
    return [
      { name: 'Online (Razorpay / UPI)', value: online || 1, color: '#3b82f6' },
      { name: 'Cash at Canteen', value: cash || 1, color: '#f97316' },
    ];
  }, [orders]);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation - White Background */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between shrink-0 shadow-xs">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-black shadow-md shadow-amber-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-slate-900 tracking-wide">
                CANTEEN DIRECTOR
              </h2>
              <span className="text-[10px] text-amber-600 font-mono block">
                Executive Management Portal
              </span>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'overview' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Operations Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('menu')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'menu' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Menu &amp; Recipes</span>
            </button>

            <button
              onClick={() => setActiveTab('slots')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'slots' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Slot Scheduling &amp; Capacity</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'orders' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>All Orders &amp; Groups</span>
            </button>

            <button
              onClick={() => setActiveTab('staff')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'staff' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Staff &amp; Role Shifts</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'analytics' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Revenue &amp; Analytics</span>
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {currentStaff?.name || 'Dr. K. Srinivas'}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Director &middot; Operations
              </div>
            </div>
            <button onClick={logout} className="text-slate-400 hover:text-red-600 p-1 cursor-pointer transition-colors" title="Sign Out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Viewport - White Background */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-white">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-extrabold text-slate-900 capitalize">
              Manager Console &ndash; {activeTab}
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
            <span>Date: <strong className="text-slate-900">{new Date().toISOString().split('T')[0]}</strong></span>
            <span>Live Sync: <strong className="text-emerald-600 font-bold">Connected</strong></span>
          </div>
        </header>

        {/* OVERVIEW SECTION */}
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6 animate-in fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-xs">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Revenue</span>
                <span className="text-3xl font-black font-mono text-emerald-600 mt-2 block">
                  ₹{kitchenMetrics.revenueToday}
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block">Includes online &amp; cash transactions</span>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-xs">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Orders Logged</span>
                <span className="text-3xl font-black font-mono text-slate-900 mt-2 block">
                  {kitchenMetrics.totalOrdersToday}
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block">{kitchenMetrics.ordersReady} ready &middot; {kitchenMetrics.ordersCompleted} collected</span>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-xs">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Active Students</span>
                <span className="text-3xl font-black font-mono text-amber-600 mt-2 block">
                  {kitchenMetrics.activeStudents}
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block">Registered USN campus accounts</span>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-xs">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Pickup Slots Open</span>
                <span className="text-3xl font-black font-mono text-cyan-700 mt-2 block">
                  {pickupSlots.filter((s) => s.booked < s.capacity).length} / {pickupSlots.length}
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block">Max 30 orders/slot capacity enforced</span>
              </div>
            </div>

            {/* Live Throughput Chart */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4">
                Slot Volume &amp; Capacity Utilization (30 Max per Slot)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesBySlotData}>
                    <XAxis dataKey="slot" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="orders" fill="#d97706" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* MENU MANAGEMENT SECTION */}
        {activeTab === 'menu' && (
          <div className="p-6 space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Food Menu &amp; Recipe Catalog</h3>
                <p className="text-xs text-slate-500">Control menu items, pricing, images, and daily availability.</p>
              </div>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-600/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Food Item</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-3xl p-4 flex flex-col justify-between space-y-3 shadow-xs"
                >
                  <div className="flex gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 rounded-2xl object-cover shrink-0 bg-slate-100 border border-slate-100"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h4 className="font-bold text-sm text-slate-900">{item.name}</h4>
                        <span className="font-mono font-black text-amber-600">₹{item.price}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{item.category} &middot; {item.prepTimeMinutes}m prep</span>
                      <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">{item.description}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => toggleFoodAvailability(item.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        item.isAvailable
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {item.isAvailable ? 'In Stock' : 'Unavailable'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                        title="Edit Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMenuItem(item.id)}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PICKUP SLOT MANAGEMENT */}
        {activeTab === 'slots' && (
          <div className="p-6 space-y-6 animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 flex items-center justify-between shadow-xs">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Pickup Slot Capacity Governance</h3>
                <p className="text-xs text-slate-500">
                  Slots generated at 15-minute intervals starting at 09:00 AM. Default cap is 30 orders/slot.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {pickupSlots.map((s) => {
                const isFull = s.booked >= s.capacity;
                return (
                  <div
                    key={s.id}
                    className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2 flex flex-col justify-between shadow-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-slate-900 text-xs">{s.time}</span>
                      {isFull ? (
                        <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.2 rounded font-bold">FULL</span>
                      ) : (
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-mono font-bold">
                          {s.capacity - s.booked} left
                        </span>
                      )}
                    </div>

                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${isFull ? 'bg-red-500' : 'bg-amber-500'}`}
                        style={{ width: `${Math.min(100, (s.booked / s.capacity) * 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>Cap: {s.capacity}</span>
                      <span>Booked: {s.booked}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ALL ORDERS & GROUP ORDERS */}
        {activeTab === 'orders' && (
          <div className="p-6 space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Comprehensive Orders Registry</h3>
                <p className="text-xs text-slate-500">Real-time database of all student and group pre-orders.</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search token, student, USN..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Token</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">USN</th>
                    <th className="py-3 px-4">Slot</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {orders
                    .filter(
                      (o) =>
                        !orderSearchQuery ||
                        o.token.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                        o.studentName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                        o.usn.toLowerCase().includes(orderSearchQuery.toLowerCase())
                    )
                    .map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 text-amber-600 font-bold">{ord.token}</td>
                        <td className="py-3 px-4 font-sans text-slate-900 font-medium">{ord.studentName}</td>
                        <td className="py-3 px-4 text-slate-600">{ord.usn}</td>
                        <td className="py-3 px-4 text-slate-700">{ord.pickupSlot}</td>
                        <td className="py-3 px-4 text-right text-slate-900 font-bold">₹{ord.totalAmount}</td>
                        <td className="py-3 px-4 text-[10px] uppercase font-sans text-slate-700">
                          {ord.paymentStatus} ({ord.paymentMethod})
                        </td>
                        <td className="py-3 px-4 text-[10px] uppercase font-sans text-slate-700">{ord.status}</td>
                        <td className="py-3 px-4 text-slate-500 font-sans text-[10px]">
                          {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STAFF MANAGEMENT */}
        {activeTab === 'staff' && (
          <div className="p-6 space-y-6 animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 flex items-center justify-between shadow-xs">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Staff Stations &amp; Shift Assignment</h3>
                <p className="text-xs text-slate-500">Manage kitchen staff assignments across 4 core departments.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Chef Ramesh', role: 'Head Preparation Lead', section: 'Food Prep', contact: '+91 9988776655' },
                { name: 'Anand Kumar', role: 'Packaging Specialist', section: 'Packing', contact: '+91 9988776656' },
                { name: 'Meena Reddy', role: 'Express Counter Cashier', section: 'Verification', contact: '+91 9988776657' },
                { name: 'Kiran Gowda', role: 'Dispatch Lead', section: 'Collection', contact: '+91 9988776658' },
              ].map((st, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-xs">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    {st.name[0]}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{st.name}</h4>
                    <span className="text-xs text-slate-500">{st.role}</span>
                  </div>
                  <div className="text-xs font-mono text-amber-700">
                    Station: <strong>{st.section}</strong>
                  </div>
                  <div className="text-[11px] text-slate-500">{st.contact}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REVENUE & BUSINESS ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="p-6 space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
                <h4 className="text-xs font-bold text-slate-600 uppercase mb-4">
                  Payment Gateway Breakdown (Online vs Cash)
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentBreakdownData}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        <Cell fill="#3b82f6" />
                        <Cell fill="#f97316" />
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
                <h4 className="text-xs font-bold text-slate-600 uppercase mb-4">
                  Revenue per Pickup Slot (₹)
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesBySlotData}>
                      <XAxis dataKey="slot" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ADD / EDIT MENU ITEM MODAL */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white text-slate-900 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">
                {editingItem ? 'Edit Food Item' : 'Add New Food Item'}
              </h3>
              <button onClick={() => setIsMenuModalOpen(false)} className="text-xs text-slate-400 hover:text-slate-700">
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveMenuItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Item Name *</label>
                <input
                  type="text"
                  value={itemFormName}
                  onChange={(e) => setItemFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category *</label>
                  <select
                    value={itemFormCategory}
                    onChange={(e) => setItemFormCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Rice and Lunch">Rice and Lunch</option>
                    <option value="Chats and Snacks">Chats and Snacks</option>
                    <option value="Juices">Juices</option>
                    <option value="Milkshakes">Milkshakes</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    value={itemFormPrice}
                    onChange={(e) => setItemFormPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description</label>
                <textarea
                  value={itemFormDescription}
                  onChange={(e) => setItemFormDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Image URL</label>
                  <input
                    type="url"
                    value={itemFormImageUrl}
                    onChange={(e) => setItemFormImageUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Prep Time (mins)</label>
                  <input
                    type="number"
                    value={itemFormPrepTime}
                    onChange={(e) => setItemFormPrepTime(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsMenuModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold shadow-md shadow-amber-600/20"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
