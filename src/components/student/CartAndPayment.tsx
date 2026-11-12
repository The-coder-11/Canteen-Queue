import React, { useState } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { Order } from '../../types';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  Banknote,
  ShieldCheck,
  Clock,
  User,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Lock,
} from 'lucide-react';

interface CartAndPaymentProps {
  onOrderSuccess: (order: Order) => void;
  onBackToMenu: () => void;
}

export const CartAndPayment: React.FC<CartAndPaymentProps> = ({ onOrderSuccess, onBackToMenu }) => {
  const {
    currentStudent,
    cart,
    updateCartQty,
    removeFromCart,
    clearCart,
    cartTotal,
    selectedSlot,
    isTwoHourFreeOrder,
    placeOrder,
  } = useCanteen();

  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('online');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Razorpay sandbox modal state
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [onlineGatewayStep, setOnlineGatewayStep] = useState<'select' | 'processing' | 'verified'>('select');
  const [upiId, setUpiId] = useState('student@okaxis');
  const [selectedGatewayMethod, setSelectedGatewayMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const subtotal = cartTotal;
  const taxFee = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + taxFee;

  const handlePlaceOrderClick = async () => {
    setErrorMsg(null);

    if (cart.length === 0) {
      setErrorMsg('Your cart is empty. Please select food items.');
      return;
    }

    if (!currentStudent) {
      setErrorMsg('Please register or sign in as a student to proceed.');
      return;
    }

    if (paymentMethod === 'online') {
      // Open Razorpay sandbox checkout simulation
      setShowRazorpayModal(true);
      setOnlineGatewayStep('select');
    } else {
      // Cash at Canteen
      setIsProcessing(true);
      try {
        const res = await placeOrder('cash');
        setIsProcessing(false);
        if (res.success && res.order) {
          triggerCelebration();
          onOrderSuccess(res.order);
        } else {
          setErrorMsg(res.error || 'Failed to place order.');
        }
      } catch (err: any) {
        setIsProcessing(false);
        setErrorMsg(err.message || 'Error communicating with server.');
      }
    }
  };

  const handleVerifyRazorpayPayment = async () => {
    setOnlineGatewayStep('processing');
    setErrorMsg(null);

    try {
      // Call backend payment verification route
      const verifyRes = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: `rzp_order_${Date.now()}`,
          paymentId: `pay_rzp_live_${Date.now()}`,
          method: selectedGatewayMethod.toUpperCase(),
        }),
      });

      const verifyData = await verifyRes.json();

      if (verifyData.success) {
        setOnlineGatewayStep('verified');
        setTimeout(async () => {
          const orderRes = await placeOrder('online', verifyData.paymentId);
          setShowRazorpayModal(false);
          if (orderRes.success && orderRes.order) {
            triggerCelebration();
            onOrderSuccess(orderRes.order);
          } else {
            setErrorMsg(orderRes.error || 'Payment recorded but order creation encountered an error.');
          }
        }, 800);
      } else {
        setOnlineGatewayStep('select');
        setErrorMsg('Payment verification failed. Please try again.');
      }
    } catch (err) {
      setOnlineGatewayStep('select');
      setErrorMsg('Payment gateway network error.');
    }
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // optional
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in pb-16">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBackToMenu}
            className="text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors cursor-pointer mb-1 block"
          >
            &larr; Back to Food Menu
          </button>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Review Order &amp; Checkout
          </h2>
          <p className="text-sm text-slate-600">
            Confirm your scheduled pre-order and complete secure transaction.
          </p>
        </div>

        {cart.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Cart Items & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student & Slot Info Summary Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Student &amp; Booking Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900">{currentStudent?.name || 'Registered Student'}</div>
                  <div className="text-xs text-slate-500 font-mono">USN: {currentStudent?.usn || '1RV21CS042'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 font-mono">
                    {isTwoHourFreeOrder ? '⚡ Flexible 2-Hour Window' : selectedSlot}
                  </div>
                  <div className="text-xs text-slate-500">
                    {isTwoHourFreeOrder ? 'Direct order &middot; Ready within 2 hours' : `${currentDate} (Today)`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cart Food Items List */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
              Selected Food Items ({cart.length})
            </h3>

            {cart.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No items in your tray. Return to menu to select food.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {cart.map((item) => (
                  <div key={item.menuItemId} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-slate-900">{item.name}</h4>
                      <span className="text-xs text-slate-500 font-mono">₹{item.price} per plate</span>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.menuItemId, -1)}
                        className="w-6 h-6 rounded-lg bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center shadow-sm cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-bold text-xs text-slate-900 w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.menuItemId, 1)}
                        className="w-6 h-6 rounded-lg bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center shadow-sm cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right font-extrabold font-mono text-sm text-slate-900 w-16">
                      ₹{item.price * item.quantity}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.menuItemId)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Payment Method & Breakdown */}
        <div className="space-y-6">
          {/* Payment Method Selector */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Payment Method
            </h3>

            <div className="space-y-2.5">
              {/* Online Payment (Razorpay sandbox) */}
              <label
                className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'online'
                    ? 'border-orange-500 bg-orange-50/70 ring-2 ring-orange-500 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="payMethod"
                  value="online"
                  checked={paymentMethod === 'online'}
                  onChange={() => setPaymentMethod('online')}
                  className="mt-1 text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900">Online Payment</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Razorpay Sandbox
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    UPI (Google Pay, PhonePe, Paytm), Cards &amp; NetBanking. Instant digital verification.
                  </p>
                </div>
              </label>

              {/* Cash at Canteen */}
              <label
                className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-orange-500 bg-orange-50/70 ring-2 ring-orange-500 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="payMethod"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                  className="mt-1 text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="font-extrabold text-sm text-slate-900">Cash at Canteen Counter</div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pay physical cash when collecting food using your generated Token.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Price Summary
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Food Items Subtotal</span>
                <span className="font-mono font-semibold text-slate-800">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Canteen Packaging &amp; GST (5%)</span>
                <span className="font-mono font-semibold text-slate-800">₹{taxFee}</span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                <span className="text-base font-extrabold text-slate-900">Grand Total</span>
                <span className="text-xl font-extrabold text-orange-600 font-mono">₹{grandTotal}</span>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="button"
                disabled={isProcessing || cart.length === 0}
                onClick={handlePlaceOrderClick}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-base py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <span>CONFIRM &amp; PAY ₹{grandTotal}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            <div className="text-center pt-1 text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>PCI-DSS Compliant &middot; Instant Token Issuance</span>
            </div>
          </div>
        </div>
      </div>

      {/* RAZORPAY SANDBOX CHECKOUT MODAL */}
      {showRazorpayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
            {/* Razorpay Brand Header */}
            <div className="bg-[#0c2340] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center font-black text-white text-base">
                  R
                </div>
                <div>
                  <h4 className="font-extrabold text-sm tracking-wide">Razorpay Trusted Sandbox</h4>
                  <p className="text-[10px] text-blue-200">Smart Campus Canteen Payment Gateway</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-blue-200 font-medium">Amount Due</div>
                <div className="text-lg font-black font-mono text-white">₹{grandTotal}</div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {onlineGatewayStep === 'select' && (
                <>
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Select Payment Mode
                    </div>

                    {/* UPI Option */}
                    <button
                      type="button"
                      onClick={() => setSelectedGatewayMethod('upi')}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                        selectedGatewayMethod === 'upi'
                          ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Smartphone className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="font-bold text-xs text-slate-900">Instant UPI (GPay / PhonePe)</div>
                          <div className="text-[11px] text-slate-500">Fast zero-fee campus transaction</div>
                        </div>
                      </div>
                      {selectedGatewayMethod === 'upi' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </button>

                    {/* Card Option */}
                    <button
                      type="button"
                      onClick={() => setSelectedGatewayMethod('card')}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                        selectedGatewayMethod === 'card'
                          ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <CreditCard className="w-4 h-4 text-indigo-600" />
                        <div>
                          <div className="font-bold text-xs text-slate-900">Debit / Credit Card</div>
                          <div className="text-[11px] text-slate-500">RuPay, Visa, Mastercard</div>
                        </div>
                      </div>
                      {selectedGatewayMethod === 'card' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </button>

                    {/* NetBanking Option */}
                    <button
                      type="button"
                      onClick={() => setSelectedGatewayMethod('netbanking')}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                        selectedGatewayMethod === 'netbanking'
                          ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Banknote className="w-4 h-4 text-emerald-600" />
                        <div>
                          <div className="font-bold text-xs text-slate-900">Net Banking</div>
                          <div className="text-[11px] text-slate-500">SBI, HDFC, ICICI, Canara Bank</div>
                        </div>
                      </div>
                      {selectedGatewayMethod === 'netbanking' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </button>
                  </div>

                  {selectedGatewayMethod === 'upi' && (
                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Virtual Payment Address (VPA / UPI ID)
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="pt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRazorpayModal(false)}
                      className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleVerifyRazorpayPayment}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>AUTHORIZE &amp; PAY</span>
                    </button>
                  </div>
                </>
              )}

              {onlineGatewayStep === 'processing' && (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Connecting with Payment Gateway...
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Verifying authorization signature and securing transaction token. Please do not close or refresh.
                  </p>
                </div>
              )}

              {onlineGatewayStep === 'verified' && (
                <div className="py-8 text-center space-y-3 animate-in fade-in">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-extrabold text-base text-emerald-950">
                    Payment Verified Successfully!
                  </h4>
                  <p className="text-xs text-slate-500">
                    Generating official Digital Bill and Kitchen Preparation Token...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
