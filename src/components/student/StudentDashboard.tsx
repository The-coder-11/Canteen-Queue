import React, { useState } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { SlotBooking } from './SlotBooking';
import { FoodMenu } from './FoodMenu';
import { CartAndPayment } from './CartAndPayment';
import { DigitalReceipt } from './DigitalReceipt';
import { LiveOrderTracking } from './LiveOrderTracking';
import { GroupOrdering } from './GroupOrdering';
import { LiveKitchenModal } from './LiveKitchenModal';
import { CameraQRScanner } from '../common/CameraQRScanner';
import { Order } from '../../types';
import {
  UtensilsCrossed,
  Users,
  QrCode,
  Clock,
  History,
  ChefHat,
  Bell,
  HelpCircle,
  LogOut,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  User,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Receipt,
  Zap,
  CheckCircle2,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const {
    currentStudent,
    logout,
    orders,
    menuItems,
    notifications,
    markNotificationRead,
    isTwoHourFreeOrder,
    setIsTwoHourFreeOrder,
    twoHourQueueOrders,
  } = useCanteen();

  // Navigation views: 'home' | 'book_slot' | 'menu' | 'cart' | 'receipt' | 'tracking' | 'group' | 'history' | 'help'
  const [currentView, setCurrentView] = useState<
    'home' | 'book_slot' | 'menu' | 'cart' | 'receipt' | 'tracking' | 'group' | 'history' | 'help'
  >('home');

  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);
  const [isKitchenModalOpen, setIsKitchenModalOpen] = useState(false);
  const [isScanToJoinOpen, setIsScanToJoinOpen] = useState(false);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);

  // Student's specific orders
  const studentOrders = orders.filter(
    (o) => o.usn.toUpperCase() === (currentStudent?.usn || '').toUpperCase()
  );
  const activeOrders = studentOrders.filter((o) => o.status !== 'collected' && o.status !== 'cancelled');

  // Student's 2-hour free window queue orders
  const studentTwoHourOrders = twoHourQueueOrders.filter(
    (o) => o.usn.toUpperCase() === (currentStudent?.usn || '').toUpperCase()
  );

  // Popular recommendations
  const recommendedItems = menuItems.slice(0, 4);

  // Handle successful order creation
  const handleOrderSuccess = (order: Order) => {
    setActiveReceiptOrder(order);
    setCurrentView('receipt');
  };

  // Normal slot booking order
  const handleStartIndividualOrder = () => {
    setIsTwoHourFreeOrder(false);
    setCurrentView('book_slot');
  };

  // 2-Hour Free Window Quick Ordering: directly opens menu without selecting any slots!
  const handleStartTwoHourFreeOrder = () => {
    setIsTwoHourFreeOrder(true);
    setCurrentView('menu');
  };

  const handleScanToJoinSuccess = (scannedData: string) => {
    setIsScanToJoinOpen(false);
    setCurrentView('group');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight block">
                SMART CAMPUS CANTEEN
              </span>
              <span className="text-[10px] text-slate-500 block -mt-1 font-medium">
                Skip the Queue &middot; Pre-Order &middot; Collect Fresh
              </span>
            </div>
          </div>

          {/* Quick Nav Links on Desktop */}
          <nav className="hidden md:flex items-center gap-5 text-xs font-bold text-slate-600">
            <button
              onClick={() => setCurrentView('home')}
              className={`hover:text-orange-600 transition-colors cursor-pointer ${
                currentView === 'home' ? 'text-orange-600' : ''
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={handleStartTwoHourFreeOrder}
              className="hover:text-amber-800 transition-colors cursor-pointer flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-extrabold border border-amber-200 hover:bg-amber-100"
              title="Free for 2 hours? Order directly without picking any slots!"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>⚡ Free for 2h Order</span>
            </button>
            <button
              onClick={handleStartIndividualOrder}
              className={`hover:text-orange-600 transition-colors cursor-pointer ${
                currentView === 'book_slot' || (currentView === 'menu' && !isTwoHourFreeOrder) ? 'text-orange-600' : ''
              }`}
            >
              Order Food (15m Slot)
            </button>
            <button
              onClick={() => setCurrentView('group')}
              className={`hover:text-orange-600 transition-colors cursor-pointer ${
                currentView === 'group' ? 'text-orange-600' : ''
              }`}
            >
              Group Order
            </button>
            <button
              onClick={() => setCurrentView('history')}
              className={`hover:text-orange-600 transition-colors cursor-pointer ${
                currentView === 'history' ? 'text-orange-600' : ''
              }`}
            >
              My Orders ({studentOrders.length})
            </button>
            <button
              onClick={() => setIsKitchenModalOpen(true)}
              className="hover:text-orange-600 transition-colors cursor-pointer flex items-center gap-1"
            >
              <ChefHat className="w-3.5 h-3.5 text-orange-500" />
              <span>Live Kitchen</span>
            </button>
          </nav>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotificationsDrawer(!showNotificationsDrawer)}
                className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-600 ring-2 ring-white" />
                )}
              </button>

              {/* Notification Popover Drawer */}
              {showNotificationsDrawer && (
                <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                    <span className="text-xs font-bold text-slate-900 uppercase">Canteen Notifications</span>
                    <button
                      onClick={() => setShowNotificationsDrawer(false)}
                      className="text-[10px] text-slate-400 hover:text-slate-700"
                    >
                      Close
                    </button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-xs text-slate-400 py-3 text-center">No notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                            n.read ? 'bg-slate-50 border-slate-100 text-slate-500' : 'bg-orange-50/60 border-orange-200 text-slate-800'
                          }`}
                        >
                          <div className="font-bold flex justify-between">
                            <span>{n.title}</span>
                            <span className="text-[10px] font-mono text-slate-400">{n.timestamp}</span>
                          </div>
                          <p className="text-[11px] mt-0.5 leading-snug">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Student Profile Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                {currentStudent?.firstName?.[0] || 'S'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-extrabold text-slate-900 leading-tight">
                  {currentStudent?.name || 'Aarav Sharma'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {currentStudent?.usn || '1RV21CS042'}
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="w-8 h-8 rounded-lg hover:bg-red-50 hover:text-red-600 text-slate-400 flex items-center justify-center transition-colors ml-1 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* VIEW: HOME DASHBOARD */}
        {currentView === 'home' && (
          <div className="space-y-8 animate-in fade-in">
            {/* Student Welcome Banner */}
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-orange-950/10 relative overflow-hidden">
              <div className="relative z-10 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>College Canteen Express Portal</span>
                </span>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                  Welcome back, {currentStudent?.firstName || 'Student'}!
                </h1>
                <p className="text-orange-100 text-xs sm:text-sm mt-1.5 leading-relaxed">
                  Pre-order your favorite breakfast, meals, and juices from class. Select an open 15-minute slot and skip canteen waiting lines completely.
                </p>

                {/* Profile Badges */}
                <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-mono">
                  <div className="bg-black/20 backdrop-blur-sm px-3 py-1 rounded-lg">
                    USN: <strong className="text-white">{currentStudent?.usn || '1RV21CS042'}</strong>
                  </div>
                  <div className="bg-black/20 backdrop-blur-sm px-3 py-1 rounded-lg">
                    Mobile: <strong className="text-white">{currentStudent?.mobile || '+91 9845012345'}</strong>
                  </div>
                  <div className="bg-black/20 backdrop-blur-sm px-3 py-1 rounded-lg">
                    Email: <strong className="text-white">{currentStudent?.email || 'student@campus.edu'}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-3">
                Quick Actions
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* 1. Free for 2 Hours (NO SLOTS REQUIRED) */}
                <button
                  type="button"
                  onClick={handleStartTwoHourFreeOrder}
                  className="bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent rounded-3xl p-5 text-left border-2 border-amber-400 hover:border-amber-500 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-amber-600 text-white rounded-full text-[9px] font-black uppercase tracking-wider shadow-xs">
                    ⚡ No Slot Needed
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md shadow-amber-500/25">
                    <Zap className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-amber-700 transition-colors">
                      Free for 2 Hours?
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      Skip slot booking! Order now and receive food within your 2-hour break.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-black text-amber-700">
                    <span>Order in 2h Window</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* 2. Order for Myself (15m Slot) */}
                <button
                  type="button"
                  onClick={handleStartIndividualOrder}
                  className="bg-white rounded-3xl p-5 text-left border border-slate-200 hover:border-orange-400 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-orange-600 transition-colors">
                      Order with Slot
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      Choose a specific 15-minute pickup slot for your meal.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-extrabold text-orange-600">
                    <span>Pick Slot</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* 3. Order with Friends (Group) */}
                <button
                  type="button"
                  onClick={() => setCurrentView('group')}
                  className="bg-white rounded-3xl p-5 text-left border border-slate-200 hover:border-amber-400 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-amber-700 transition-colors">
                      Group Order
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      Start squad order, pool friend trays, collect with 1 QR.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-extrabold text-amber-700">
                    <span>Squad Order</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* 4. Scan to Join Group */}
                <button
                  type="button"
                  onClick={() => setIsScanToJoinOpen(true)}
                  className="bg-white rounded-3xl p-5 text-left border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                      Scan to Join
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      Scan friend&apos;s squad QR code to add your items.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-extrabold text-blue-600">
                    <span>Open Scanner</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* 5. Live Kitchen View */}
                <button
                  type="button"
                  onClick={() => setIsKitchenModalOpen(true)}
                  className="bg-white rounded-3xl p-5 text-left border border-slate-200 hover:border-emerald-400 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <ChefHat className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                      Live Kitchen
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      Real-time chef queues, ready tokens, and wait times.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-extrabold text-emerald-700">
                    <span>View Queue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>
            </div>

            {/* DEDICATED 2-HOUR FLEXIBLE PRIORITY QUEUE SECTION */}
            <div className="bg-white rounded-3xl p-6 border-2 border-amber-200/80 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                    <Zap className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-extrabold text-slate-900">
                        2-Hour Flexible Priority Queue
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider">
                        ⚡ Direct Order &middot; No Slot Needed
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      For students with a 2-hour free block. Order directly anytime; receive your fresh food within those 2 hours with instant completion notification.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleStartTwoHourFreeOrder}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap transition-all"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Order in 2-Hour Window</span>
                </button>
              </div>

              {/* Active Orders in 2-Hour Queue */}
              {studentTwoHourOrders.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wider">
                    <span>Your Orders in 2-Hour Queue ({studentTwoHourOrders.length})</span>
                    <span className="text-slate-400 lowercase font-mono">
                      campus queue: {twoHourQueueOrders.length} active orders
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {studentTwoHourOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className={`rounded-2xl p-5 border transition-all space-y-3 ${
                          ord.status === 'ready'
                            ? 'bg-emerald-50/80 border-emerald-300 shadow-md shadow-emerald-500/10'
                            : ord.status === 'collected'
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-amber-50/50 border-amber-200 shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-black font-mono text-orange-600">{ord.token}</span>
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                  ord.status === 'ready'
                                    ? 'bg-emerald-600 text-white animate-pulse'
                                    : ord.status === 'collected'
                                    ? 'bg-slate-200 text-slate-700'
                                    : 'bg-amber-500 text-white'
                                }`}
                              >
                                {ord.status === 'ready' ? 'Ready for Pickup!' : ord.status.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="text-xs font-mono text-slate-600 mt-1 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>
                                Window: <strong>Within 2 Hours</strong>
                                {ord.twoHourWindowExpiresAt && ` (Expires by ${ord.twoHourWindowExpiresAt})`}
                              </span>
                            </div>
                          </div>

                          <span className="text-base font-extrabold font-mono text-slate-900">
                            ₹{ord.totalAmount}
                          </span>
                        </div>

                        {/* Completion notification alert box */}
                        {ord.status === 'ready' && (
                          <div className="p-3 bg-emerald-100/90 border border-emerald-300 rounded-xl text-emerald-950 text-xs flex items-center gap-2.5">
                            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                            <div>
                              <strong className="block font-bold">Food Ready at Counter!</strong>
                              Completion notification has been sent to your registered profile (USN: {ord.usn}). Please collect your fresh meal.
                            </div>
                          </div>
                        )}

                        {ord.status === 'collected' && (
                          <div className="p-2.5 bg-slate-100 rounded-xl text-slate-600 text-xs flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Order completed &amp; collected within your 2-hour free window.</span>
                          </div>
                        )}

                        <div className="text-xs text-slate-700 line-clamp-1 font-medium">
                          {ord.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveReceiptOrder(ord);
                              setCurrentView('receipt');
                            }}
                            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Digital Bill</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveTrackingOrder(ord);
                              setCurrentView('tracking');
                            }}
                            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <span>Track Status</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-amber-50/70 to-orange-50/70 border border-amber-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Free for 2 Hours? No Slot Selection Needed!</span>
                    </div>
                    <p className="text-xs text-slate-600 max-w-xl">
                      Have a 2-hour break or off-period? You don&apos;t need to pick any 15-minute slot. Order food directly from the menu and your meal enters our 2-Hour Priority Queue. Fresh food will be ready within 2 hours, and completion notifications are sent directly to your registered account.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleStartTwoHourFreeOrder}
                    className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-600/20 whitespace-nowrap cursor-pointer transition-all shrink-0"
                  >
                    Order Directly (Free for 2 Hours) &rarr;
                  </button>
                </div>
              )}
            </div>

            {/* Active Orders Section */}
            {activeOrders.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span>Active Orders in Preparation ({activeOrders.length})</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white rounded-3xl p-5 border border-orange-200 shadow-md shadow-orange-500/5 flex flex-col justify-between space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-black font-mono text-orange-600">
                              {ord.token}
                            </span>
                            <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                              {ord.status.replace('_', ' ')}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 mt-0.5 block">
                            Slot: <strong className="text-slate-800 font-mono">{ord.pickupSlot}</strong>
                          </span>
                        </div>

                        <span className="text-base font-extrabold font-mono text-slate-900">
                          ₹{ord.totalAmount}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 line-clamp-1">
                        {ord.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveReceiptOrder(ord);
                            setCurrentView('receipt');
                          }}
                          className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Digital Bill</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveTrackingOrder(ord);
                            setCurrentView('tracking');
                          }}
                          className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                        >
                          <span>Track Live Status</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Food Recommendations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Trending Campus Favorites
                  </h2>
                  <p className="text-xs text-slate-500">Most pre-ordered snacks and hot items today</p>
                </div>
                <button
                  type="button"
                  onClick={handleStartIndividualOrder}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <span>Explore Full Menu</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recommendedItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={handleStartIndividualOrder}
                    className="bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-800">
                        ₹{item.price}
                      </span>
                    </div>
                    <div className="p-4">
                      <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-orange-600 transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{item.description}</p>
                      <div className="mt-3 flex items-center justify-between text-xs text-orange-600 font-bold">
                        <span>Pre-Order</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Info Banner */}
            <div className="bg-slate-100 rounded-3xl p-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  All campus orders are strictly prepared on the day of reservation. Max 30 orders per 15m slot to ensure guaranteed freshness.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCurrentView('help')}
                className="text-slate-700 hover:text-slate-900 font-bold underline whitespace-nowrap cursor-pointer"
              >
                Help &amp; Support
              </button>
            </div>
          </div>
        )}

        {/* VIEW: PICKUP SLOT BOOKING */}
        {currentView === 'book_slot' && (
          <SlotBooking onProceedToMenu={() => setCurrentView('menu')} />
        )}

        {/* VIEW: FOOD MENU */}
        {currentView === 'menu' && (
          <FoodMenu
            onProceedToCart={() => setCurrentView('cart')}
            onBackToSlots={() => setCurrentView('book_slot')}
          />
        )}

        {/* VIEW: CART AND PAYMENT */}
        {currentView === 'cart' && (
          <CartAndPayment
            onOrderSuccess={handleOrderSuccess}
            onBackToMenu={() => setCurrentView('menu')}
          />
        )}

        {/* VIEW: DIGITAL RECEIPT */}
        {currentView === 'receipt' && activeReceiptOrder && (
          <DigitalReceipt
            order={activeReceiptOrder}
            onTrackOrder={() => {
              setActiveTrackingOrder(activeReceiptOrder);
              setCurrentView('tracking');
            }}
            onViewMyOrders={() => setCurrentView('history')}
          />
        )}

        {/* VIEW: LIVE TRACKING */}
        {currentView === 'tracking' && activeTrackingOrder && (
          <LiveOrderTracking
            order={activeTrackingOrder}
            onBackToDashboard={() => setCurrentView('home')}
          />
        )}

        {/* VIEW: GROUP ORDERING */}
        {currentView === 'group' && (
          <GroupOrdering onBackToDashboard={() => setCurrentView('home')} />
        )}

        {/* VIEW: ORDER HISTORY */}
        {currentView === 'history' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in pb-16">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                <button
                  onClick={() => setCurrentView('home')}
                  className="text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors cursor-pointer mb-1 block"
                >
                  &larr; Back to Dashboard
                </button>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  My Orders &amp; Receipts
                </h2>
                <p className="text-xs text-slate-500">All confirmed tokens and past order records</p>
              </div>
            </div>

            {studentOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <History className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h3 className="font-bold text-slate-800 text-base">No previous orders</h3>
                <p className="text-xs text-slate-500 mt-1">Pre-order food to skip campus queues.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {studentOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black font-mono text-orange-600">
                          {ord.token}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">({ord.id})</span>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                            ord.status === 'collected'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {ord.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 mt-1.5 space-x-2">
                        <span>Slot: <strong className="font-mono text-slate-900">{ord.pickupSlot}</strong></span>
                        <span>&middot;</span>
                        <span>Date: {ord.date}</span>
                        <span>&middot;</span>
                        <span>Payment: <strong className="uppercase">{ord.paymentMethod}</strong></span>
                      </div>

                      <div className="text-xs text-slate-500 mt-1">
                        {ord.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                      <div className="text-right">
                        <div className="text-base font-extrabold font-mono text-slate-900">
                          ₹{ord.totalAmount}
                        </div>
                        <div className="text-[10px] text-slate-400">Total Paid</div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveReceiptOrder(ord);
                            setCurrentView('receipt');
                          }}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Bill
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTrackingOrder(ord);
                            setCurrentView('tracking');
                          }}
                          className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
                        >
                          Track
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: HELP & SUPPORT */}
        {currentView === 'help' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in pb-16">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <button
                onClick={() => setCurrentView('home')}
                className="text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors cursor-pointer mb-1 block"
              >
                &larr; Back to Dashboard
              </button>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-orange-600" />
                <span>Smart Campus Canteen &ndash; Help &amp; FAQ</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">Frequently asked questions and operational policies</p>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 divide-y divide-slate-100 text-xs space-y-4">
              <div className="pt-2">
                <h4 className="font-extrabold text-sm text-slate-900">How do 15-minute pickup slots work?</h4>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  The canteen operates from 9:00 AM to 5:00 PM with 15-minute preparation windows. Each slot has a strict limit of 30 orders to prevent kitchen bottlenecks. You should arrive at the counter during your reserved slot.
                </p>
              </div>

              <div className="pt-4">
                <h4 className="font-extrabold text-sm text-slate-900">How do I collect my food at the counter?</h4>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Open your Digital Receipt or Live Tracking page and show your unique Token (e.g., T001) or present the Order QR code to the staff scanner. Once scanned, food collection is authenticated and duplicate collections are blocked.
                </p>
              </div>

              <div className="pt-4">
                <h4 className="font-extrabold text-sm text-slate-900">How does Group Ordering work?</h4>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  One student creates a squad and generates a Group Order ID. Friends scan the group QR to link their trays. The squad leader chooses a common pickup slot and can pay combined or allow individual member splits.
                </p>
              </div>

              <div className="pt-4">
                <h4 className="font-extrabold text-sm text-slate-900">Canteen Desk Contact</h4>
                <p className="text-slate-600 mt-1">
                  Manager Office: Central Canteen Block B &middot; Phone: +91 9844001122 &middot; Email: canteen.director@campus.edu
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Live Kitchen Modal */}
      <LiveKitchenModal isOpen={isKitchenModalOpen} onClose={() => setIsKitchenModalOpen(false)} />

      {/* Scan to Join Group Camera QR Scanner */}
      <CameraQRScanner
        isOpen={isScanToJoinOpen}
        onClose={() => setIsScanToJoinOpen(false)}
        onScanSuccess={handleScanToJoinSuccess}
        title="Scan Squad QR Code"
        description="Scan classmate's Group invitation QR code with camera"
        testOptions={[{ label: 'Join Demo Squad (GRP-1001)', payload: 'GRP-1001' }]}
      />
    </div>
  );
};
