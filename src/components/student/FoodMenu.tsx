import React, { useState, useMemo } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { FoodCategory, MenuItem } from '../../types';
import {
  Search,
  Plus,
  Minus,
  ShoppingCart,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  Leaf,
  Coffee,
} from 'lucide-react';

interface FoodMenuProps {
  onProceedToCart: () => void;
  onBackToSlots: () => void;
}

export const FoodMenu: React.FC<FoodMenuProps> = ({ onProceedToCart, onBackToSlots }) => {
  const { menuItems, cart, addToCart, updateCartQty, cartTotal, selectedSlot, isTwoHourFreeOrder } = useCanteen();
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: Array<FoodCategory | 'All'> = [
    'All',
    'Breakfast',
    'Rice and Lunch',
    'Chats and Snacks',
    'Juices',
    'Milkshakes',
    'Beverages',
  ];

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Lookup quantity in cart
  const getItemCartQty = (menuItemId: string) => {
    const found = cart.find((i) => i.menuItemId === menuItemId);
    return found ? found.quantity : 0;
  };

  const totalCartCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in pb-24">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isTwoHourFreeOrder ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>⚡ 2-Hour Free Window Quick Ordering</span>
              </span>
            ) : (
              <button
                onClick={onBackToSlots}
                className="text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors cursor-pointer"
              >
                &larr; Step 1: Change Slot ({selectedSlot})
              </button>
            )}
            <span className="text-slate-300">&middot;</span>
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
              {isTwoHourFreeOrder ? 'Direct Menu Selection (No Slot Required)' : 'Step 2 of 3: Food Selection'}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Canteen Food Menu
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            {isTwoHourFreeOrder ? (
              <span>
                Free for 2 hours! Select any items and place your order directly. Your meal will be freshly prepared within 2 hours.
              </span>
            ) : (
              <span>
                Prepared fresh for your confirmed pickup at <strong className="text-orange-600 font-mono">{selectedSlot}</strong>.
              </span>
            )}
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search dosas, meals, juices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Food Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Filter className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 text-base">No food items found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query or select another food category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map((item) => {
            const qty = getItemCartQty(item.id);
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-orange-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
              >
                {/* Image Container with Fallback */}
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback gradient if image fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {/* Category overlay */}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-800 shadow-sm">
                    {item.category}
                  </span>

                  {/* Dietary Veg / Beverage icon */}
                  <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm">
                    {item.dietary === 'veg' ? (
                      <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Coffee className="w-3.5 h-3.5 text-amber-700" />
                    )}
                  </span>

                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex items-center justify-center text-white font-bold text-xs uppercase tracking-wider">
                      Currently Unavailable
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
                        {item.name}
                      </h3>
                      <span className="font-extrabold text-base text-slate-900 font-mono shrink-0">
                        ₹{item.price}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{item.prepTimeMinutes}m prep</span>
                    </span>

                    {/* Quantity Stepper or Add to Cart Button */}
                    {item.isAvailable ? (
                      qty > 0 ? (
                        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl p-1">
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.id, -1)}
                            className="w-6 h-6 rounded-lg bg-white hover:bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm shadow-sm transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono font-bold text-xs text-orange-950 w-4 text-center">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.id, 1)}
                            className="w-6 h-6 rounded-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center font-bold text-sm shadow-sm transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addToCart(item)}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-orange-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      )
                    ) : (
                      <span className="text-xs text-slate-400 font-semibold italic">Out of Stock</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Cart Bar */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-40 animate-in slide-in-from-bottom-5">
          <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <span className="absolute -top-1 -right-1 bg-white text-slate-900 text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center font-mono">
                  {totalCartCount}
                </span>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Slot: {selectedSlot}</div>
                <div className="text-base font-extrabold font-mono text-white">
                  ₹{cartTotal} <span className="text-xs font-normal text-slate-400">({totalCartCount} items)</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onProceedToCart}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-orange-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>VIEW CART &amp; PAY</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
