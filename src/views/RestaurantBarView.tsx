import React, { useState } from 'react';
import { useApp, MenuItem, OrderItem } from '../context/AppContext';
import { 
  ShoppingBag, 
  UtensilsCrossed, 
  Wine, 
  Search, 
  Plus, 
  Minus, 
  Printer, 
  X, 
  Check, 
  CheckSquare,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RestaurantBarView: React.FC = () => {
  const { menuItems, rooms, addRestaurantBarOrder, settings } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Cart state
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<'WalkIn' | 'Room'>('Room');
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('');
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');

  // Modals
  const [showKotModal, setShowKotModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Determine if this view should act as Bar or Restaurant based on context
  // Wait, let's allow the user to select either Restaurant or Bar at the top of this POS view, or automatically filter based on the active URL/tab!
  // Since we have a combined view, let's render a Toggle at the top of the POS: "Restaurant POS" vs "Bar POS"
  // This is extremely convenient and lets the Admin/user test both!
  const [isBarMode, setIsBarMode] = useState(false);

  // Active categories based on mode
  const foodCategories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Beverages', 'Desserts'];
  const liquorCategories = ['All', 'Beer', 'Whisky', 'Rum', 'Vodka', 'Wine', 'Cocktails', 'Snacks'];
  
  const categories = isBarMode ? liquorCategories : foodCategories;

  // Filter menu items by Mode (Bar/Restaurant) and category
  const filteredMenuItems = (menuItems || []).filter(item => {
    if (!item) return false;
    const term = (searchTerm || '').toLowerCase().trim();
    const matchesMode = item.isBar === isBarMode;
    const matchesSearch = !term || (item.name || '').toLowerCase().includes(term);
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesMode && matchesSearch && matchesCategory;
  });

  const activeOccupiedRooms = rooms.filter(r => r.status === 'Occupied');
  const activeGuestName = rooms.find(r => r.roomNumber === selectedRoomNumber)?.guestName || '';

  // Cart operations
  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const match = prev.find(i => i.menuItemId === item.id);
      if (match) {
        return prev.map(i => i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(prev => prev.map(i => {
      if (i.menuItemId === menuItemId) {
        return { ...i, quantity: i.quantity - 1 };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const taxRate = isBarMode ? settings.barTaxRate : settings.taxRate;
  const taxAmount = parseFloat(((subtotal * taxRate) / 100).toFixed(2));
  const total = parseFloat((subtotal + taxAmount).toFixed(2));

  // KOT Printing Simulation
  const handlePrintKOT = () => {
    if (cart.length === 0) return;
    setShowKotModal(true);
  };

  // Submit POS Order
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (orderType === 'Room' && !selectedRoomNumber) return;
    if (orderType === 'WalkIn' && !walkInName) return;

    addRestaurantBarOrder({
      type: orderType,
      roomNumber: orderType === 'Room' ? selectedRoomNumber : undefined,
      guestName: orderType === 'Room' ? activeGuestName : walkInName,
      items: cart,
      subtotal,
      isBar: isBarMode
    });

    // Success effect
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.8 }
    });

    setSuccessMessage(`Order posted successfully to ${orderType === 'Room' ? `Room ${selectedRoomNumber}` : 'Walk-in'}`);
    setTimeout(() => setSuccessMessage(''), 3000);
    
    // Clear inputs
    clearCart();
    setSelectedRoomNumber('');
    setWalkInName('');
    setWalkInPhone('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
      
      {/* 1. Item Selection Area (Left - 7 Cols) */}
      <div className="lg:col-span-7 flex flex-col justify-between space-y-4 h-full overflow-hidden">
        
        {/* Toggle Mode & Search */}
        <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Mode switch */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
              <button
                type="button"
                onClick={() => {
                  setIsBarMode(false);
                  setSelectedCategory('All');
                  clearCart();
                }}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  !isBarMode 
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <UtensilsCrossed className="w-3.5 h-3.5" /> Restaurant POS
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsBarMode(true);
                  setSelectedCategory('All');
                  clearCart();
                }}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isBarMode 
                    ? 'bg-violet-600 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Wine className="w-3.5 h-3.5" /> Bar POS
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${isBarMode ? 'drinks' : 'dishes'}...`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border dark:border-slate-800 dark:bg-slate-950 rounded-xl"
              />
            </div>

          </div>

          {/* Categories select list */}
          <div className="flex flex-wrap gap-1 pt-1 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-500 dark:bg-slate-800/40 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Menu Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {filteredMenuItems.map(item => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm text-left group hover:border-indigo-500/30 transition-all flex flex-col justify-between min-h-[110px]"
              >
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                    {item.category}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight group-hover:text-indigo-500 transition-colors">
                    {item.name}
                  </h4>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                    ₹{item.price}
                  </span>
                  <span className="p-1 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            ))}
          </div>
          {filteredMenuItems.length === 0 && (
            <div className="text-center py-12 text-xs text-slate-400 font-medium">
              No items matching search filter.
            </div>
          )}
        </div>

      </div>

      {/* 2. Active Cart & Link Form (Right - 5 Cols) */}
      <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm h-full flex flex-col overflow-hidden">
        
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-indigo-500" /> Active Basket
          </h3>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-[10px] text-slate-400 hover:text-rose-500 font-bold"
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* Cart Items list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          
          {successMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 rounded-xl text-xs font-semibold flex items-center gap-1.5 animate-in slide-in-from-top-1">
              <Sparkles className="w-4 h-4" /> {successMessage}
            </div>
          )}

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 opacity-60">
              <span className="text-3xl mb-2">🍽️</span>
              <p className="text-xs font-semibold uppercase">Basket is Empty</p>
              <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">Click menu items on the left to start building order.</p>
            </div>
          ) : (
            cart.map(item => (
              <div 
                key={item.menuItemId} 
                className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200/20 dark:border-slate-800/20 rounded-xl"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-250 truncate">{item.name}</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">₹{item.price} each</p>
                </div>
                
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border dark:border-slate-800 p-0.5 rounded-lg">
                    <button 
                      onClick={() => removeFromCart(item.menuItemId)} 
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => {
                        const match = menuItems.find(i => i.id === item.menuItemId);
                        if (match) addToCart(match);
                      }} 
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="w-16 text-right text-xs font-bold font-mono text-slate-950 dark:text-white">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Customer Routing & Calculations Panel */}
        {cart.length > 0 && (
          <form onSubmit={handlePlaceOrder} className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
            
            {/* Routing Tabs */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bill Destination</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-200/50 dark:bg-slate-900 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setOrderType('Room')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    orderType === 'Room' 
                      ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' 
                      : 'text-slate-500'
                  }`}
                >
                  Link to Room
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('WalkIn')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    orderType === 'WalkIn' 
                      ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' 
                      : 'text-slate-500'
                  }`}
                >
                  Walk-In Bill
                </button>
              </div>
            </div>

            {/* Sub-form fields */}
            {orderType === 'Room' ? (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Select Room *</label>
                  <select
                    required
                    value={selectedRoomNumber}
                    onChange={e => setSelectedRoomNumber(e.target.value)}
                    className="w-full p-2 border dark:border-slate-850 dark:bg-slate-900 rounded-lg font-bold"
                  >
                    <option value="">-- Room Number --</option>
                    {activeOccupiedRooms.map(r => (
                      <option key={r.id} value={r.roomNumber}>
                        Room {r.roomNumber} ({r.guestName})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Guest Name</label>
                  <input
                    type="text"
                    disabled
                    value={activeGuestName}
                    className="w-full p-2 border dark:border-slate-850 bg-slate-100 dark:bg-slate-900/50 rounded-lg text-slate-400"
                    placeholder="Guest details auto-filled"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Guest Name *</label>
                  <input
                    type="text"
                    required
                    value={walkInName}
                    onChange={e => setWalkInName(e.target.value)}
                    className="w-full p-2 border dark:border-slate-850 dark:bg-slate-900 rounded-lg"
                    placeholder="Customer Name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Phone Number</label>
                  <input
                    type="tel"
                    value={walkInPhone}
                    onChange={e => setWalkInPhone(e.target.value)}
                    className="w-full p-2 border dark:border-slate-850 dark:bg-slate-900 rounded-lg"
                    placeholder="Optional"
                  />
                </div>
              </div>
            )}

            {/* Calculations Summary */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200/50 dark:border-slate-800/50 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">POS Subtotal</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>GST Tax (@{taxRate}%)</span>
                <span>₹{taxAmount}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-slate-200/30">
                <span className="text-slate-800 dark:text-slate-200 font-sans">Total Bill</span>
                <span className="text-indigo-600 dark:text-indigo-400">₹{total}</span>
              </div>
            </div>

            {/* Actions: Print KOT / Send Charges */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handlePrintKOT}
                className="px-3.5 py-2.5 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center justify-center gap-1.5 transition-all text-xs font-semibold"
                title="Print Kitchen Order Ticket"
              >
                <Printer className="w-4 h-4" /> KOT
              </button>
              
              <button
                type="submit"
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all text-xs"
              >
                <CheckSquare className="w-4 h-4" />
                {orderType === 'Room' ? `Post to Room ${selectedRoomNumber}` : 'Record Cash Payment'}
              </button>
            </div>

          </form>
        )}

      </div>

      {/* ==========================================
          KOT PRINT DIALOG (SIMULATED TICKET)
          ========================================== */}
      {showKotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 w-full max-w-xs rounded-lg shadow-2xl p-5 border border-slate-200 space-y-4 receipt-print animate-in zoom-in-95 duration-200">
            
            {/* Ticket header */}
            <div className="text-center border-b border-dashed border-slate-400 pb-3">
              <h3 className="font-extrabold text-sm uppercase tracking-wider">
                *** KITCHEN ORDER ***
              </h3>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                HOTELVISTA RESORT & SPA
              </p>
              <p className="text-[10px] font-bold mt-1 bg-slate-100 inline-block px-2 py-0.5 rounded">
                Ticket No: KOT-{Math.floor(1000 + Math.random() * 9000)}
              </p>
            </div>

            {/* Ticket details */}
            <div className="text-[10px] space-y-0.5 font-mono">
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Order Source:</span>
                <span>{orderType === 'Room' ? `Room ${selectedRoomNumber}` : 'Walk-in'}</span>
              </div>
              {orderType === 'Room' && (
                <div className="flex justify-between text-slate-600">
                  <span>Guest:</span>
                  <span className="truncate max-w-[120px]">{activeGuestName}</span>
                </div>
              )}
            </div>

            {/* Order Items list */}
            <div className="border-t border-b border-dashed border-slate-400 py-2.5 font-mono text-[10px]">
              <div className="flex justify-between font-bold pb-1.5">
                <span>Item Name</span>
                <span>Qty</span>
              </div>
              <div className="space-y-1">
                {cart.map(item => (
                  <div key={item.menuItemId} className="flex justify-between">
                    <span className="truncate max-w-[170px] uppercase font-bold">● {item.name}</span>
                    <span className="font-bold">x{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ticket footer */}
            <div className="text-center text-[9px] text-slate-500 italic font-mono pt-1">
              Sent to Kitchen Queue successfully.
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100 font-sans">
              <button
                onClick={() => setShowKotModal(false)}
                className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-[10px] font-bold text-center"
              >
                Close Ticket View
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};
