import React, { useState, useEffect } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { PickupSlot } from '../../types';
import { LiveKitchenModal } from './LiveKitchenModal';
import {
  Calendar,
  Clock,
  Sparkles,
  ChefHat,
  CheckCircle2,
  AlertCircle,
  Users,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface SlotBookingProps {
  onProceedToMenu: () => void;
  isGroupOrderMode?: boolean;
  groupMemberCount?: number;
}

export const SlotBooking: React.FC<SlotBookingProps> = ({
  onProceedToMenu,
  isGroupOrderMode = false,
  groupMemberCount = 1,
}) => {
  const { pickupSlots, selectedSlot, setSelectedSlot, orders } = useCanteen();
  const [isKitchenModalOpen, setIsKitchenModalOpen] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<{
    recommendedSlot: string;
    reason: string;
    avoidSlot?: string;
    avoidReason?: string;
    estimatedWaitMin?: number;
  }>({
    recommendedSlot: '10:30 AM',
    reason: '10:30 AM is currently less crowded (6/30 orders). Recommended for faster pickup.',
    avoidSlot: '12:00 PM',
    avoidReason: '12:00 PM has reached full capacity.',
    estimatedWaitMin: 4,
  });

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const currentDateISO = new Date().toISOString().split('T')[0];

  // Fetch AI smart pickup recommendation
  useEffect(() => {
    const fetchRecommendation = async () => {
      try {
        const res = await fetch('/api/gemini/smart-recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slots: pickupSlots.map((s) => ({ time: s.time, booked: s.booked, capacity: s.capacity })),
            prepTimeMinutes: 10,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.recommendedSlot) {
            setAiRecommendation(data);
          }
        }
      } catch (e) {
        // Fallback already pre-set
      }
    };
    fetchRecommendation();
  }, [pickupSlots]);

  const handleSelectSlot = (slot: PickupSlot) => {
    const neededSpots = isGroupOrderMode ? groupMemberCount : 1;
    if (slot.booked + neededSpots > slot.capacity) {
      return; // disabled
    }
    setSelectedSlot(slot.time);
  };

  const currentSelectedObj = pickupSlots.find((s) => s.time === selectedSlot);
  const isSelectedFull = currentSelectedObj
    ? currentSelectedObj.booked + (isGroupOrderMode ? groupMemberCount : 1) > currentSelectedObj.capacity
    : false;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in">
      {/* Top Banner / Breadcrumb info */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider block mb-1">
            Step 1 of 3: Smart Slot Scheduling
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Select Your Food Pickup Slot
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Pre-book exact 15-minute pickup windows. Prepared fresh just in time for your break.
          </p>
        </div>

        {/* View Live Kitchen button */}
        <button
          type="button"
          onClick={() => setIsKitchenModalOpen(true)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <ChefHat className="w-4 h-4 text-orange-400" />
          <span>View Live Kitchen</span>
        </button>
      </div>

      {/* Date Selection Box (Enforced: Current Day Only) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span>Pickup Date Selection</span>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            Current Day Service Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Select Booking Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={currentDateISO}
                min={currentDateISO}
                max={currentDateISO}
                disabled
                className="w-full bg-slate-100 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 cursor-not-allowed"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-medium">
                (Today Only)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Fresh preparation policy: Pre-orders are strictly booked for today, <strong className="text-slate-700">{currentDate}</strong>.
            </p>
          </div>

          {/* Group Capacity Indicator if Group Mode */}
          {isGroupOrderMode && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900 text-xs">
              <div className="font-bold flex items-center gap-1.5 mb-1">
                <Users className="w-4 h-4 text-amber-600" />
                <span>Group Order Allocation Rule</span>
              </div>
              <p>
                Your group has <span className="font-bold font-mono text-amber-950">{groupMemberCount} members</span>.
                Each member occupies 1 individual capacity slot. Selecting a slot will verify that at least {groupMemberCount} spots are open.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* AI SMART PICKUP RECOMMENDATION CARD */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200/80 rounded-3xl p-5 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-extrabold text-orange-950 flex items-center gap-2">
                <span>AI Smart Pickup Recommendation</span>
                <span className="text-[10px] bg-orange-200 text-orange-900 px-2 py-0.5 rounded-full font-mono uppercase">
                  Powered by Gemini 3.8
                </span>
              </h3>
              {aiRecommendation.estimatedWaitMin && (
                <span className="text-xs font-semibold text-slate-700 bg-white/80 px-2.5 py-1 rounded-lg border border-orange-100">
                  Est. Wait: ~{aiRecommendation.estimatedWaitMin} mins
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-orange-900 font-medium mt-1 leading-relaxed">
              &ldquo;{aiRecommendation.reason}&rdquo;
            </p>
            {aiRecommendation.avoidSlot && (
              <p className="text-xs text-amber-800/80 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Avoid <strong className="font-semibold">{aiRecommendation.avoidSlot}</strong>: {aiRecommendation.avoidReason}</span>
              </p>
            )}

            {/* Quick apply AI recommendation button */}
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setSelectedSlot(aiRecommendation.recommendedSlot)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  selectedSlot === aiRecommendation.recommendedSlot
                    ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                    : 'bg-white text-orange-700 border-orange-300 hover:bg-orange-100'
                }`}
              >
                {selectedSlot === aiRecommendation.recommendedSlot
                  ? 'Selected Recommended Slot'
                  : `Choose Recommended ${aiRecommendation.recommendedSlot}`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 15-MINUTE PICKUP SLOTS GRID */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>Available 15-Minute Slots</span>
            </h3>
            <p className="text-xs text-slate-500">
              Canteen operational hours: 09:00 AM &ndash; 05:00 PM &middot; Capacity limit: 30 confirmed orders per slot
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Available
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Filling Fast
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Full
            </span>
          </div>
        </div>

        {/* Slot Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
          {pickupSlots.map((slot) => {
            const availableCount = Math.max(0, slot.capacity - slot.booked);
            const neededSpots = isGroupOrderMode ? groupMemberCount : 1;
            const isFull = availableCount < neededSpots;
            const isSelected = selectedSlot === slot.time;
            const isFilling = availableCount <= 8 && !isFull;
            const isAiRecommended = slot.time === aiRecommendation.recommendedSlot;

            return (
              <button
                key={slot.id}
                type="button"
                disabled={isFull}
                onClick={() => handleSelectSlot(slot)}
                className={`relative p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50/80 ring-2 ring-orange-500 shadow-md shadow-orange-500/10'
                    : isFull
                    ? 'border-slate-200 bg-slate-100/70 text-slate-400 cursor-not-allowed opacity-60'
                    : isFilling
                    ? 'border-amber-200 bg-amber-50/40 hover:border-amber-400 text-slate-800'
                    : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-slate-50 text-slate-800'
                }`}
              >
                {/* AI tag if recommended */}
                {isAiRecommended && !isFull && (
                  <span className="absolute -top-2 right-2 bg-orange-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider shadow">
                    AI Pick
                  </span>
                )}

                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-extrabold font-mono tracking-tight text-slate-900">
                    {slot.time}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-600" />}
                </div>

                {/* Progress bar of slot booking */}
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden my-1">
                  <div
                    className={`h-full ${
                      isFull ? 'bg-red-500' : isFilling ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, (slot.booked / slot.capacity) * 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] mt-1">
                  {isFull ? (
                    <span className="font-bold text-red-600 uppercase">FULL</span>
                  ) : (
                    <span className="text-slate-500 font-medium">
                      <strong className="text-slate-800 font-mono">{availableCount}</strong> left
                    </span>
                  )}
                  <span className="font-mono text-slate-400 text-[10px]">{slot.booked}/30</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500">Selected Pickup Window:</div>
          <div className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <span className="font-mono text-orange-600">{selectedSlot}</span>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
              Today, {currentDate}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onProceedToMenu}
          disabled={isSelectedFull || !selectedSlot}
          className="w-full sm:w-auto px-8 py-3.5 bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          <span>PROCEED TO FOOD MENU</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Live Kitchen Modal */}
      <LiveKitchenModal isOpen={isKitchenModalOpen} onClose={() => setIsKitchenModalOpen(false)} />
    </div>
  );
};
