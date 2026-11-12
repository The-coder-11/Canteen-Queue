import React, { useState, useMemo } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { Order } from '../../types';
import { CameraQRScanner } from '../common/CameraQRScanner';
import {
  ChefHat,
  LayoutDashboard,
  Clock,
  Sparkles,
  Flame,
  Package,
  ListTodo,
  Search,
  CheckCircle2,
  Printer,
  QrCode,
  LogOut,
  AlertTriangle,
  ArrowRight,
  User,
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const {
    currentStaff,
    logout,
    orders,
    pickupSlots,
    updateOrderStatus,
    toggleItemPacked,
    confirmFoodCollection,
    confirmGroupCollection,
    staffTasks,
    updateTaskStatus,
    addTask,
  } = useCanteen();

  // Active Sidebar Module - only remaining modules
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'live_orders'
    | 'token_packing'
    | 'staff_tasks'
  >('dashboard');

  // Scanner Modal & Active Scanned Order
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedOrderModal, setScannedOrderModal] = useState<Order | null>(null);
  const [scannedGroupModalId, setScannedGroupModalId] = useState<string | null>(null);
  const [scanMessage, setScanMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters for Live Orders
  const [slotFilter, setSlotFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Preparation Report Modal
  const [showPrepReportModal, setShowPrepReportModal] = useState(false);
  const [selectedReportSlot, setSelectedReportSlot] = useState('10:30 AM');

  // New Task Form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSection, setNewTaskSection] = useState<'preparation' | 'packing' | 'verification' | 'collection'>('preparation');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Chef Ramesh');
  const [newTaskPriority, setNewTaskPriority] = useState<'normal' | 'high' | 'urgent'>('high');

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSlot = slotFilter === 'All' || o.pickupSlot === slotFilter;
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !q ||
        o.token.toLowerCase().includes(q) ||
        o.studentName.toLowerCase().includes(q) ||
        o.usn.toLowerCase().includes(q) ||
        o.items.some((i) => i.name.toLowerCase().includes(q));
      return matchSlot && matchQuery;
    });
  }, [orders, slotFilter, searchQuery]);

  // AI Food Quantity Calculator aggregation (Deterministic)
  const calculateFoodQuantitiesForSlot = (targetSlot: string) => {
    const slotOrders = orders.filter((o) => o.pickupSlot === targetSlot && o.status !== 'cancelled');
    const counts: Record<string, { totalQty: number; prepTime: number }> = {};

    slotOrders.forEach((ord) => {
      ord.items.forEach((item) => {
        if (!counts[item.name]) {
          counts[item.name] = { totalQty: 0, prepTime: 8 };
        }
        counts[item.name].totalQty += item.quantity;
      });
    });

    return {
      slot: targetSlot,
      totalOrders: slotOrders.length,
      items: Object.entries(counts).map(([name, data]) => ({
        name,
        quantity: data.totalQty,
        prepTime: data.prepTime,
      })),
    };
  };

  const currentSlotReport = calculateFoodQuantitiesForSlot(selectedReportSlot);

  // Scanner Handler
  const handleScanSuccess = (decodedData: string) => {
    setIsScannerOpen(false);
    setScanMessage(null);

    try {
      let query = decodedData.trim();
      let isGroup = false;

      if (decodedData.includes('{')) {
        const parsed = JSON.parse(decodedData);
        if (parsed.token) query = parsed.token;
        if (parsed.type === 'GROUP_COLLECTION' && parsed.groupId) {
          isGroup = true;
          query = parsed.groupId;
        }
      }

      if (isGroup || query.startsWith('GRP-')) {
        setScannedGroupModalId(query);
        setScannedOrderModal(null);
      } else {
        const found = orders.find(
          (o) => o.token.toUpperCase() === query.toUpperCase() || o.id.toUpperCase() === query.toUpperCase()
        );
        if (found) {
          setScannedOrderModal(found);
          setScannedGroupModalId(null);
        } else {
          setScanMessage({ type: 'error', text: `No order found with Token/ID "${query}".` });
        }
      }
    } catch {
      const found = orders.find(
        (o) => o.token.toUpperCase() === decodedData.toUpperCase() || o.id.toUpperCase() === decodedData.toUpperCase()
      );
      if (found) {
        setScannedOrderModal(found);
      } else {
        setScanMessage({ type: 'error', text: `Unrecognized QR payload: ${decodedData}` });
      }
    }
  };

  const handleExecuteCollection = () => {
    if (scannedOrderModal) {
      const res = confirmFoodCollection(scannedOrderModal.token);
      if (res.success) {
        setScanMessage({ type: 'success', text: res.message });
        setScannedOrderModal(null);
      } else {
        setScanMessage({ type: 'error', text: res.message });
      }
    } else if (scannedGroupModalId) {
      const res = confirmGroupCollection(scannedGroupModalId);
      if (res.success) {
        setScanMessage({ type: 'success', text: res.message });
        setScannedGroupModalId(null);
      } else {
        setScanMessage({ type: 'error', text: res.message });
      }
    }
  };

  // Save new task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask({
      title: newTaskTitle.trim(),
      section: newTaskSection,
      assignedTo: newTaskAssignee,
      priority: newTaskPriority,
      status: 'pending',
    });
    setNewTaskTitle('');
  };

  // Summary counts
  const totalOrders = orders.length;
  const newOrders = orders.filter((o) => o.status === 'confirmed').length;
  const preparingOrders = orders.filter((o) => o.status === 'preparing' || o.status === 'payment_verified');
  const packingOrders = orders.filter((o) => o.status === 'packing');
  const readyOrders = orders.filter((o) => o.status === 'ready');
  const completedOrders = orders.filter((o) => o.status === 'collected');

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation - White Background */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between shrink-0 shadow-sm">
        <div className="space-y-6">
          {/* Logo & Portal Info */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-black shadow-md shadow-orange-500/20">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-slate-900 tracking-wide">
                SMART KITCHEN
              </h2>
              <span className="text-[10px] text-orange-600 font-mono block">
                Canteen Staff Station
              </span>
            </div>
          </div>

          {/* Quick Scan Order QR CTA button */}
          <div className="px-1">
            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="w-full py-2.5 px-3.5 bg-orange-600 hover:bg-orange-700 active:scale-98 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-orange-600/20 transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>SCAN ORDER QR</span>
            </button>
          </div>

          {/* Core Sidebar Menu Items */}
          <nav className="space-y-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>1. Command Centre</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('live_orders')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'live_orders'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4" />
                <span>2. Live Orders</span>
              </div>
              <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                activeTab === 'live_orders' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {totalOrders}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('token_packing')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'token_packing'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4" />
                <span>3. Token-Wise Packing</span>
              </div>
              <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                activeTab === 'token_packing' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
              }`}>
                {packingOrders.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('staff_tasks')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'staff_tasks'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <ListTodo className="w-4 h-4" />
              <span>4. Staff Tasks</span>
            </button>
          </nav>
        </div>

        {/* Staff User Card & Logout */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {currentStaff?.name || 'Chef Ramesh'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {currentStaff?.id || 'STAFF-101'} &middot; Kitchen Lead
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-slate-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Kitchen Viewport - White Background */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-white">
        {/* Top Operational Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-extrabold text-slate-900 capitalize">
              {activeTab === 'dashboard' ? 'Command Centre' : activeTab.replace('_', ' ')}
            </h1>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Kitchen Operational
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* AI Food Quantity Report CTA button */}
            <button
              type="button"
              onClick={() => setShowPrepReportModal(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Prep Quantity Calculator</span>
            </button>
          </div>
        </header>

        {/* Global Feedback Banner */}
        {scanMessage && (
          <div
            className={`mx-6 mt-4 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in fade-in ${
              scanMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {scanMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{scanMessage.text}</span>
          </div>
        )}

        {/* MODULE 1: COMMAND CENTRE (DASHBOARD) */}
        {activeTab === 'dashboard' && (
          <div className="p-6 space-y-6 animate-in fade-in">
            {/* KPI Summary Cards - White Surface */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Today</span>
                <span className="text-2xl font-black font-mono text-slate-900 mt-1 block">{totalOrders}</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">New Orders</span>
                <span className="text-2xl font-black font-mono text-amber-600 mt-1 block">{newOrders}</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Preparing</span>
                <span className="text-2xl font-black font-mono text-orange-600 mt-1 block">{preparingOrders.length}</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pending Packing</span>
                <span className="text-2xl font-black font-mono text-blue-600 mt-1 block">{packingOrders.length}</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Ready for Pickup</span>
                <span className="text-2xl font-black font-mono text-emerald-600 mt-1 block">{readyOrders.length}</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Completed</span>
                <span className="text-2xl font-black font-mono text-slate-700 mt-1 block">{completedOrders.length}</span>
              </div>
            </div>

            {/* Quick Live Queue Strip */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ready for Express Counter Dispatch */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Ready for Express Collection ({readyOrders.length})</span>
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">Counter 1 &amp; 2</span>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {readyOrders.length === 0 ? (
                    <div className="text-xs text-slate-400 italic py-6 text-center">
                      No ready orders awaiting pickup.
                    </div>
                  ) : (
                    readyOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-black font-mono text-emerald-700">{ord.token}</span>
                            <span className="text-xs text-slate-900 font-bold">{ord.studentName}</span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono">{ord.pickupSlot} &middot; ₹{ord.totalAmount}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setScannedOrderModal(ord);
                          }}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
                        >
                          Confirm Handover
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Kitchen Station: Orders In Preparation */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-orange-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-600" />
                    <span>Kitchen Prep Station ({preparingOrders.length})</span>
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">Cooking Queue</span>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {preparingOrders.length === 0 ? (
                    <div className="text-xs text-slate-400 italic py-6 text-center">
                      No orders currently being cooked.
                    </div>
                  ) : (
                    preparingOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="bg-orange-50/40 border border-orange-100 rounded-2xl p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-base font-black font-mono text-orange-600">{ord.token}</span>
                          {ord.isTwoHourFreeWindow ? (
                            <span className="text-[10px] bg-purple-100 text-purple-800 font-mono font-bold px-2 py-0.5 rounded-full">
                              ⚡ 2-Hr Free Queue ({ord.twoHourWindowExpiresAt || '2h'})
                            </span>
                          ) : (
                            <span className="text-xs text-slate-600 font-mono font-semibold">{ord.pickupSlot}</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-700 font-medium">
                          {ord.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                        </div>
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(ord.id, 'packing')}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
                          >
                            Send to Packing &rarr;
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 2: LIVE ORDERS (FILTERABLE) */}
        {activeTab === 'live_orders' && (
          <div className="p-6 space-y-4 animate-in fade-in">
            {/* Filter Bar */}
            <div className="bg-white border border-slate-200 rounded-3xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Slot:
                </span>
                <button
                  type="button"
                  onClick={() => setSlotFilter('All')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    slotFilter === 'All'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All Slots
                </button>
                {pickupSlots.slice(0, 8).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSlotFilter(s.time)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                      slotFilter === s.time
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {s.time}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter token, USN, item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Orders Table - White Design */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">Token</th>
                      <th className="py-3.5 px-4">Student &amp; USN</th>
                      <th className="py-3.5 px-4">Slot</th>
                      <th className="py-3.5 px-4">Food Items</th>
                      <th className="py-3.5 px-4 text-right">Amount</th>
                      <th className="py-3.5 px-4">Payment</th>
                      <th className="py-3.5 px-4">Prep Status</th>
                      <th className="py-3.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-black text-orange-600 text-sm">
                          {ord.token}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-900 font-bold">{ord.studentName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{ord.usn}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                          {ord.isTwoHourFreeWindow ? (
                            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold block whitespace-nowrap">
                              ⚡ 2-Hr Free Queue ({ord.twoHourWindowExpiresAt || '2h'})
                            </span>
                          ) : (
                            ord.pickupSlot
                          )}
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-slate-700">
                          {ord.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900">
                          ₹{ord.totalAmount}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              ord.paymentStatus === 'verified'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {ord.paymentStatus} ({ord.paymentMethod})
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              ord.status === 'ready'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'packing'
                                ? 'bg-blue-100 text-blue-800'
                                : ord.status === 'preparing'
                                ? 'bg-orange-100 text-orange-800'
                                : ord.status === 'collected'
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {ord.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {ord.status !== 'collected' ? (
                            <button
                              type="button"
                              onClick={() => {
                                setScannedOrderModal(ord);
                              }}
                              className="px-2.5 py-1 bg-slate-900 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                              Dispatch
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Collected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 3: TOKEN-WISE PACKING ASSISTANT */}
        {activeTab === 'token_packing' && (
          <div className="p-6 space-y-6 animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span>Token-Wise Packing Assistant</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tick packed items per token. Orders cannot be promoted to &ldquo;Ready&rdquo; until 100% of items are verified and packed!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {orders
                .filter((o) => o.status !== 'collected' && o.status !== 'cancelled')
                .map((ord) => {
                  const totalItemsCount = ord.items.length;
                  const packedCount = ord.items.filter((_, idx) => ord.packedItems?.[idx.toString()]).length;
                  const pct = totalItemsCount > 0 ? Math.round((packedCount / totalItemsCount) * 100) : 0;
                  const is100Packed = pct === 100;

                  return (
                    <div
                      key={ord.id}
                      className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-xs"
                    >
                      <div>
                        {/* Token Slip Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div>
                            <span className="text-2xl font-black font-mono text-slate-900">{ord.token}</span>
                            <div className="text-xs text-slate-500 font-medium">{ord.studentName} ({ord.usn})</div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-orange-600">{ord.pickupSlot}</span>
                            <div className="text-[10px] text-slate-400 uppercase font-semibold">{ord.status}</div>
                          </div>
                        </div>

                        {/* Packing Progress */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs font-mono mb-1 text-slate-500">
                            <span>Packing Progress</span>
                            <span className="font-bold text-slate-900">{pct}% ({packedCount}/{totalItemsCount})</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                is100Packed ? 'bg-emerald-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        {/* Items Checklist */}
                        <div className="mt-4 space-y-2">
                          {ord.items.map((item, idx) => {
                            const isPacked = ord.packedItems?.[idx.toString()] || false;
                            return (
                              <label
                                key={idx}
                                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                                  isPacked
                                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                                    : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <input
                                    type="checkbox"
                                    checked={isPacked}
                                    onChange={() => toggleItemPacked(ord.id, idx.toString())}
                                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                  />
                                  <span className="text-xs font-semibold">{item.name}</span>
                                </div>
                                <span className="text-xs font-mono font-bold">x{item.quantity}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Ready Action */}
                      <div className="pt-2 border-t border-slate-100 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (window.print) window.print();
                          }}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Print Token Label"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Label</span>
                        </button>

                        <button
                          type="button"
                          disabled={!is100Packed || ord.status === 'ready'}
                          onClick={() => updateOrderStatus(ord.id, 'ready')}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                            is100Packed
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {ord.status === 'ready' ? 'Ready at Counter 1' : 'Mark Ready for Pickup'}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* MODULE 4: STAFF TASKS ALLOCATION */}
        {activeTab === 'staff_tasks' && (
          <div className="p-6 space-y-6 animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-indigo-600" />
                  <span>Kitchen Station Tasks (Prep &middot; Packing &middot; Verification &middot; Collection)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assign responsibilities and monitor real-time kitchen execution.
                </p>
              </div>
            </div>

            {/* Task Creation Form */}
            <form onSubmit={handleCreateTask} className="bg-white border border-slate-200 rounded-3xl p-4 flex flex-col sm:flex-row gap-3 items-end shadow-xs">
              <div className="flex-1 w-full">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Task Description</label>
                <input
                  type="text"
                  placeholder="e.g. Boil fresh 25L Sambar batch for 1:00 PM rush"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="w-full sm:w-36">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Section</label>
                <select
                  value={newTaskSection}
                  onChange={(e) => setNewTaskSection(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="preparation">Food Prep</option>
                  <option value="packing">Packing</option>
                  <option value="verification">Verification</option>
                  <option value="collection">Collection</option>
                </select>
              </div>

              <div className="w-full sm:w-36">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Assignee</label>
                <input
                  type="text"
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap shadow-xs transition-colors"
              >
                Add Task
              </button>
            </form>

            {/* Tasks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(['preparation', 'packing', 'verification', 'collection'] as const).map((sec) => {
                const secTasks = staffTasks.filter((t) => t.section === sec);
                return (
                  <div key={sec} className="bg-white border border-slate-200 rounded-3xl p-4 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="text-xs font-black uppercase text-slate-800">
                        {sec}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono font-bold">{secTasks.length} tasks</span>
                    </div>

                    <div className="space-y-2">
                      {secTasks.map((t) => (
                        <div
                          key={t.id}
                          className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs space-y-2"
                        >
                          <div className="font-semibold text-slate-800">{t.title}</div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>{t.assignedTo}</span>
                            <span className="uppercase font-mono font-bold text-amber-700">{t.priority}</span>
                          </div>
                          <div className="pt-1 flex gap-1">
                            <button
                              type="button"
                              onClick={() => updateTaskStatus(t.id, 'completed')}
                              className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                                t.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-white hover:bg-slate-200 border border-slate-200 text-slate-700'
                              }`}
                            >
                              {t.status === 'completed' ? 'Completed' : 'Mark Done'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* AI FOOD QUANTITY REPORT MODAL */}
      {showPrepReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-extrabold text-base">Kitchen Preparation Quantity Report</h3>
                  <p className="text-xs text-slate-400">Deterministic slot food aggregation</p>
                </div>
              </div>
              <button
                onClick={() => setShowPrepReportModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {/* Slot Picker */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">Select Slot:</span>
                <select
                  value={selectedReportSlot}
                  onChange={(e) => setSelectedReportSlot(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold font-mono text-slate-900"
                >
                  {pickupSlots.map((s) => (
                    <option key={s.id} value={s.time}>
                      {s.time} ({s.booked} confirmed orders)
                    </option>
                  ))}
                </select>
              </div>

              {/* Exact Food Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="p-3">Food Item</th>
                      <th className="p-3 text-right">Required Quantity</th>
                      <th className="p-3 text-right">Est. Batch Prep Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {currentSlotReport.items.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-6 text-center text-slate-400 italic">
                          No confirmed orders for this slot yet.
                        </td>
                      </tr>
                    ) : (
                      currentSlotReport.items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 font-sans font-bold text-slate-900">{it.name}</td>
                          <td className="p-3 text-right font-black text-orange-600 text-sm">{it.quantity} portions</td>
                          <td className="p-3 text-right text-slate-500">{it.prepTime} mins</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
                <strong>Chef Priority Recommendation:</strong> Start steaming Idli &amp; boiling Sambar 15 mins before slot cutoff. Fire Masala Dosa 6 minutes prior to maintain crispness.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Kitchen Prep Slip</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPrepReportModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISPATCH / COLLECTION CONFIRMATION MODAL */}
      {scannedOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Verify Token Collection
                </span>
                <span className="text-3xl font-black font-mono text-orange-600">
                  {scannedOrderModal.token}
                </span>
              </div>
              <button
                onClick={() => setScannedOrderModal(null)}
                className="text-xs text-slate-400 hover:text-slate-700"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Student:</span>
                <span className="font-bold text-slate-900">{scannedOrderModal.studentName} ({scannedOrderModal.usn})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Slot:</span>
                <span className="font-mono font-bold text-slate-900">{scannedOrderModal.pickupSlot}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Payment:</span>
                <span className="font-bold text-emerald-700 uppercase">{scannedOrderModal.paymentStatus} ({scannedOrderModal.paymentMethod})</span>
              </div>
            </div>

            {/* Food items list */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs space-y-1">
              <span className="font-bold text-slate-700 block mb-1">Verify Food Items in Bag:</span>
              {scannedOrderModal.items.map((i, idx) => (
                <div key={idx} className="flex justify-between font-medium text-slate-800">
                  <span>{i.name}</span>
                  <span className="font-mono font-bold">x{i.quantity}</span>
                </div>
              ))}
            </div>

            {/* CONFIRM FOOD COLLECTION Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleExecuteCollection}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>CONFIRM FOOD COLLECTION</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real Camera QR Scanner for Staff */}
      <CameraQRScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        title="Scan Student Order QR"
        description="Point camera at student's digital receipt QR code to verify token and items"
        testOptions={orders.slice(0, 3).map((o) => ({ label: `Scan Token ${o.token}`, payload: o.token }))}
      />
    </div>
  );
};
