import React from 'react';
import { Order } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import {
  Printer,
  Download,
  Clock,
  CheckCircle2,
  Share2,
  UtensilsCrossed,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface DigitalReceiptProps {
  order: Order;
  onTrackOrder: () => void;
  onViewMyOrders: () => void;
}

export const DigitalReceipt: React.FC<DigitalReceiptProps> = ({
  order,
  onTrackOrder,
  onViewMyOrders,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Smart Campus Canteen Token ${order.token}`,
          text: `My order ${order.token} is confirmed for ${order.pickupSlot}. Total: ₹${order.totalAmount}`,
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(
        `Smart Campus Canteen Token: ${order.token} | Slot: ${order.pickupSlot} | Total: ₹${order.totalAmount}`
      );
      alert('Order details copied to clipboard!');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 animate-in fade-in pb-16">
      {/* Success Notification Bar */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-4 flex items-center justify-between gap-3 text-emerald-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm">Order Confirmed &amp; Token Issued</h3>
            <p className="text-xs text-emerald-700">Present this QR code or Token at Counter during pickup.</p>
          </div>
        </div>
        <span className="font-mono font-extrabold text-lg text-emerald-800 bg-emerald-100 px-3 py-1 rounded-xl">
          {order.token}
        </span>
      </div>

      {/* Official Printable Digital Receipt Card */}
      <div
        id="printable-receipt"
        className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 relative overflow-hidden space-y-6"
      >
        {/* Receipt Header */}
        <div className="text-center border-b border-dashed border-slate-200 pb-5 space-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-500 text-white shadow-md shadow-orange-500/20 mb-2">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            SMART CAMPUS CANTEEN
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Autonomous Pre-Ordering &amp; Express Collection Receipt
          </p>
          <div className="text-[11px] text-slate-400 font-mono pt-1">
            Order Reference: {order.id} &middot; {new Date(order.createdAt).toLocaleDateString('en-IN')}
          </div>
        </div>

        {/* Large Token & Pickup Highlight */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Express Token
            </span>
            <span className="text-3xl font-black font-mono text-orange-600 tracking-tight">
              {order.token}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block flex items-center justify-end gap-1">
              <Clock className="w-3 h-3 text-orange-500" />
              {order.isTwoHourFreeWindow ? '2-Hr Free Window' : 'Pickup Slot'}
            </span>
            <span className="text-base font-extrabold font-mono text-slate-900">
              {order.pickupSlot}
            </span>
            <span className="text-[11px] text-slate-500 block">
              {order.isTwoHourFreeWindow && order.twoHourWindowExpiresAt
                ? `Valid until ${order.twoHourWindowExpiresAt}`
                : `Today (${order.date})`}
            </span>
          </div>
        </div>

        {/* Student Information */}
        <div className="grid grid-cols-2 gap-4 text-xs py-1 border-b border-slate-100 pb-4">
          <div>
            <span className="text-slate-400 font-medium">Student Name:</span>
            <div className="font-bold text-slate-900 text-sm mt-0.5">{order.studentName}</div>
          </div>
          <div>
            <span className="text-slate-400 font-medium">University Seat No (USN):</span>
            <div className="font-bold font-mono text-slate-900 text-sm mt-0.5">{order.usn}</div>
          </div>
        </div>

        {/* Ordered Food Items Table */}
        <div className="space-y-3">
          <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-1.5">
            <span>Item Description</span>
            <span className="text-center w-12">Qty</span>
            <span className="text-right w-16">Price</span>
          </div>

          <div className="space-y-2 text-xs divide-y divide-slate-50">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center pt-2">
                <div className="flex-1 font-semibold text-slate-800">{item.name}</div>
                <div className="font-mono text-slate-600 text-center w-12 font-bold">{item.quantity}</div>
                <div className="font-mono text-slate-900 font-extrabold text-right w-16">
                  ₹{item.price * item.quantity}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="pt-4 border-t border-dashed border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Items Subtotal</span>
              <span className="font-mono">₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Packaging &amp; Canteen Fee</span>
              <span className="font-mono">₹{order.taxFee}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
              <span>Grand Total Paid</span>
              <span className="text-base text-orange-600 font-mono">₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-slate-50 rounded-xl p-3 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-700 capitalize">
              {order.paymentMethod === 'online' ? 'Online Payment (Razorpay)' : 'Cash at Counter'}
            </span>
          </div>
          <span
            className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded-full ${
              order.paymentStatus === 'verified'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {order.paymentStatus}
          </span>
        </div>

        {/* Express QR Code for Collection */}
        <div className="text-center pt-2 pb-1 space-y-2">
          <div className="inline-block p-4 bg-white border-2 border-dashed border-slate-300 rounded-2xl shadow-inner">
            <QRCodeSVG
              value={JSON.stringify({
                orderId: order.id,
                token: order.token,
                usn: order.usn,
                slot: order.pickupSlot,
                total: order.totalAmount,
                type: 'CANTEEN_ORDER',
              })}
              size={150}
              level="H"
              includeMargin={false}
            />
          </div>
          <div className="text-[11px] font-bold text-slate-600 font-mono">
            Scan at Canteen Pickup Station for Express Dispatch
          </div>
          <p className="text-[10px] text-slate-400">
            Staff scans this QR code to verify packing and confirm food collection. Duplicate collection is prevented by backend transaction.
          </p>
        </div>

        {/* Watermark / Footer */}
        <div className="text-center text-[10px] text-slate-400 border-t border-slate-100 pt-3">
          Smart Campus Canteen &middot; System Token Verified &middot; Keep this slip handy
        </div>
      </div>

      {/* Action Buttons (Non-Printed) */}
      <div className="no-print space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="py-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Receipt</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="py-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-slate-500" />
            <span>Share Slip</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onTrackOrder}
          className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-extrabold rounded-xl shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>TRACK LIVE ORDER STATUS</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="text-center pt-1">
          <button
            type="button"
            onClick={onViewMyOrders}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline"
          >
            Go to My Orders History
          </button>
        </div>
      </div>
    </div>
  );
};
