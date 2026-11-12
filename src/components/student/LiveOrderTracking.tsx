import React from 'react';
import { Order, OrderStatus } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import {
  CheckCircle2,
  Clock,
  Flame,
  Package,
  BellRing,
  ShoppingBag,
  Sparkles,
  ArrowLeft,
  QrCode,
} from 'lucide-react';

interface LiveOrderTrackingProps {
  order: Order;
  onBackToDashboard: () => void;
}

export const LiveOrderTracking: React.FC<LiveOrderTrackingProps> = ({ order, onBackToDashboard }) => {
  const steps: Array<{ status: OrderStatus; label: string; desc: string; icon: any }> = [
    {
      status: 'confirmed',
      label: 'Order Confirmed',
      desc: 'Order logged into canteen database',
      icon: ShoppingBag,
    },
    {
      status: 'payment_verified',
      label: 'Payment Verified',
      desc: 'Transaction authenticated & approved',
      icon: CheckCircle2,
    },
    {
      status: 'preparing',
      label: 'Food Preparation Started',
      desc: 'Chef cooking fresh batch in kitchen',
      icon: Flame,
    },
    {
      status: 'packing',
      label: 'Food Being Packed',
      desc: 'Token-wise packing into takeaway boxes',
      icon: Package,
    },
    {
      status: 'ready',
      label: 'Ready for Pickup',
      desc: 'Food ready at express collection counter',
      icon: BellRing,
    },
    {
      status: 'collected',
      label: 'Collected',
      desc: 'Order handed over successfully',
      icon: Sparkles,
    },
  ];

  // Map order status to numeric step index
  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed':
        return 0;
      case 'payment_verified':
        return 1;
      case 'preparing':
        return 2;
      case 'packing':
        return 3;
      case 'ready':
        return 4;
      case 'collected':
        return 5;
      default:
        return 0;
    }
  };

  const currentStepIndex = getStepIndex(order.status);
  const isCollected = order.status === 'collected';
  const isReady = order.status === 'ready';

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-in fade-in pb-16">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBackToDashboard}
            className="text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors cursor-pointer mb-1 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Live Order Tracking</span>
            <span className="font-mono text-orange-600 font-black">{order.token}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Real-time kitchen updates synced with canteen kitchen stations.
          </p>
        </div>

        {/* Ready Alert */}
        {isReady && (
          <div className="bg-emerald-500 text-white px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-500/25 animate-bounce">
            <BellRing className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-wider">Ready at Counter 1!</span>
          </div>
        )}
      </div>

      {/* Hero Tracking Status Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest block mb-1">
              Token Number
            </span>
            <div className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
              {order.token}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Student: <span className="text-white font-medium">{order.studentName}</span> ({order.usn})
            </div>
          </div>

          <div className="text-left sm:text-right bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl">
            <span className="text-xs text-slate-400 font-medium block">Confirmed Pickup Window</span>
            <div className="text-xl font-black font-mono text-orange-400 flex items-center gap-1.5 sm:justify-end">
              <Clock className="w-4 h-4 text-orange-400" />
              <span>{order.pickupSlot}</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Estimated Ready: <strong className="text-white font-mono">{order.estimatedReadyTime}</strong>
            </div>
          </div>
        </div>

        {/* Visual 6-Step Tracker */}
        <div className="pt-8">
          <div className="relative">
            {/* Desktop Horizontal Line */}
            <div className="hidden sm:block absolute top-5 left-6 right-6 h-1 bg-slate-800 z-0">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 transition-all duration-700 rounded-full"
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              />
            </div>

            {/* Steps Container */}
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-6 sm:gap-2 relative z-10">
              {steps.map((st, idx) => {
                const Icon = st.icon;
                const isPassed = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={st.status} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isCurrent
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/40 ring-4 ring-orange-500/20 scale-110'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="sm:pt-1">
                      <div
                        className={`text-xs font-bold ${
                          isCurrent ? 'text-orange-400' : isPassed ? 'text-white' : 'text-slate-500'
                        }`}
                      >
                        {st.label}
                      </div>
                      <div className="text-[10px] text-slate-400 hidden sm:block mt-0.5 leading-snug">
                        {st.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Order Summary & Express QR Code */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Left: Food Items in this Order */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
            Items in Token {order.token}
          </h3>

          <div className="space-y-2.5 text-xs">
            {order.items.map((i, idx) => {
              const isPacked = order.packedItems?.[idx.toString()];
              return (
                <div key={idx} className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isPacked ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    />
                    <span className="font-semibold text-slate-800">{i.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-500 font-bold">x{i.quantity}</span>
                    <span className="font-mono font-extrabold text-slate-900">₹{i.price * i.quantity}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex justify-between items-center text-xs text-slate-500 border-t border-slate-100">
            <span>Payment: <strong className="text-slate-800 uppercase">{order.paymentMethod}</strong></span>
            <span>Total: <strong className="text-orange-600 font-mono text-sm">₹{order.totalAmount}</strong></span>
          </div>
        </div>

        {/* Right: QR Code for Collection */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 text-center flex flex-col items-center justify-center space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <QrCode className="w-4 h-4 text-orange-500" />
            <span>Counter Collection QR</span>
          </div>

          <div className="p-3 bg-white border-2 border-dashed border-slate-200 rounded-2xl shadow-sm">
            <QRCodeSVG
              value={JSON.stringify({
                orderId: order.id,
                token: order.token,
                usn: order.usn,
                slot: order.pickupSlot,
                type: 'CANTEEN_ORDER',
              })}
              size={140}
              level="H"
            />
          </div>

          <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
            Show this QR code at Counter 1 or 2 when your token is called. The staff scanner automatically validates and collects your meal.
          </p>
        </div>
      </div>
    </div>
  );
};
