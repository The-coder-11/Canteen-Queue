import React from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { ChefHat, X, Clock, Flame, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

interface LiveKitchenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveKitchenModal: React.FC<LiveKitchenModalProps> = ({ isOpen, onClose }) => {
  const { orders, pickupSlots, isRushHour } = useCanteen();

  if (!isOpen) return null;

  const preparingOrders = orders.filter((o) => o.status === 'preparing' || o.status === 'payment_verified');
  const packingOrders = orders.filter((o) => o.status === 'packing');
  const readyOrders = orders.filter((o) => o.status === 'ready');
  const upcomingSlots = pickupSlots.slice(0, 6);

  const activeWorkload = preparingOrders.length + packingOrders.length;
  const workloadPercentage = Math.min(100, Math.round((activeWorkload / 15) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>Live Kitchen Status</span>
                {isRushHour ? (
                  <span className="text-[11px] bg-red-500/30 text-red-300 border border-red-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Flame className="w-3 h-3 text-red-400 animate-pulse" />
                    <span>RUSH HOUR ACTIVE</span>
                  </span>
                ) : (
                  <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    NOMINAL LOAD
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">Real-time transparency of preparation &amp; queue</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-800 text-slate-400 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Workload Meter */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                Current Kitchen Workload
              </span>
              <span className="text-slate-900 font-mono">{workloadPercentage}% Capacity</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  workloadPercentage > 80
                    ? 'bg-red-500'
                    : workloadPercentage > 50
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${workloadPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
              <span>Estimated wait time for new orders: ~8-12 mins</span>
              <span className="font-semibold text-slate-700">{activeWorkload} active kitchen pans</span>
            </div>
          </div>

          {/* 3 Column Status Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Preparing */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-center justify-between text-amber-900 text-xs font-bold uppercase mb-2">
                <span className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-amber-600" />
                  Being Prepared
                </span>
                <span className="bg-amber-200/80 text-amber-800 px-2 py-0.5 rounded-full font-mono text-xs">
                  {preparingOrders.length}
                </span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {preparingOrders.length === 0 ? (
                  <p className="text-xs text-amber-700/70 italic py-2">No pending pans</p>
                ) : (
                  preparingOrders.map((o) => (
                    <div key={o.id} className="text-xs bg-white/80 p-2 rounded-lg border border-amber-100 flex justify-between items-center">
                      <span className="font-mono font-bold text-amber-900">{o.token}</span>
                      <span className="text-slate-500 truncate max-w-[90px]">{o.items.map((i) => i.name).join(', ')}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Packing */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4">
              <div className="flex items-center justify-between text-blue-900 text-xs font-bold uppercase mb-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Being Packed
                </span>
                <span className="bg-blue-200/80 text-blue-800 px-2 py-0.5 rounded-full font-mono text-xs">
                  {packingOrders.length}
                </span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {packingOrders.length === 0 ? (
                  <p className="text-xs text-blue-700/70 italic py-2">Packing station clear</p>
                ) : (
                  packingOrders.map((o) => (
                    <div key={o.id} className="text-xs bg-white/80 p-2 rounded-lg border border-blue-100 flex justify-between items-center">
                      <span className="font-mono font-bold text-blue-900">{o.token}</span>
                      <span className="text-slate-500 text-[11px]">{o.pickupSlot}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Ready */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
              <div className="flex items-center justify-between text-emerald-900 text-xs font-bold uppercase mb-2">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Ready at Counter
                </span>
                <span className="bg-emerald-200/80 text-emerald-800 px-2 py-0.5 rounded-full font-mono text-xs">
                  {readyOrders.length}
                </span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {readyOrders.length === 0 ? (
                  <p className="text-xs text-emerald-700/70 italic py-2">No ready tokens awaiting pickup</p>
                ) : (
                  readyOrders.map((o) => (
                    <div key={o.id} className="text-xs bg-white p-2 rounded-lg border border-emerald-100 flex justify-between items-center font-bold text-emerald-800">
                      <span className="font-mono text-emerald-950">{o.token}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Counter 1</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Upcoming Slots Load */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Upcoming Slot Capacity Distribution
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {upcomingSlots.map((slot) => {
                const isFull = slot.booked >= slot.capacity;
                const isCrowded = slot.booked >= slot.capacity * 0.75;
                return (
                  <div
                    key={slot.id}
                    className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
                      isFull
                        ? 'bg-red-50 border-red-200 text-red-900'
                        : isCrowded
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1 font-bold">
                      <span>{slot.time}</span>
                      {isFull && <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded font-semibold">FULL</span>}
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Booked:</span>
                      <span className="font-mono font-semibold">{slot.booked} / {slot.capacity}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close Kitchen View
          </button>
        </div>
      </div>
    </div>
  );
};
