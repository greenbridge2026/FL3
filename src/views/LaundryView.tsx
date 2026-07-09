import React, { useState } from 'react';
import { useApp, LaundryOrder, Room } from '../context/AppContext';
import { Shirt, Plus, CheckCircle, Clock, Send, Sparkles } from 'lucide-react';

export const LaundryView: React.FC = () => {
  const { laundryOrders, rooms, addLaundryOrder, updateLaundryStatus } = useApp();

  const [selectedRoomNumber, setSelectedRoomNumber] = useState('');
  const [isExpress, setIsExpress] = useState(false);

  // Items quantity tracker
  const [quantities, setQuantities] = useState({
    Clothes: 0,
    Blanket: 0,
    Bedsheet: 0,
    'Iron Only': 0,
    'Dry Clean': 0
  });

  const itemPrices = {
    Clothes: 40,
    Blanket: 150,
    Bedsheet: 80,
    'Iron Only': 20,
    'Dry Clean': 100
  };

  const occupiedRooms = rooms.filter(r => r.status === 'Occupied');
  const activeGuestName = rooms.find(r => r.roomNumber === selectedRoomNumber)?.guestName || '';

  // Quantity updates
  const updateQty = (item: keyof typeof quantities, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [item]: Math.max(0, prev[item] + change)
    }));
  };

  // Calculation
  const subtotal = Object.entries(quantities).reduce((acc, [item, qty]) => {
    const price = itemPrices[item as keyof typeof itemPrices];
    return acc + (price * qty);
  }, 0);

  const expressSurcharge = isExpress ? parseFloat((subtotal * 0.5).toFixed(2)) : 0; // 50% surcharge
  const totalPrice = subtotal + expressSurcharge;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomNumber || totalPrice === 0) return;

    // Compile items array
    const compiledItems = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([item, qty]) => ({
        itemType: item as any,
        quantity: qty,
        price: itemPrices[item as keyof typeof itemPrices]
      }));

    addLaundryOrder({
      roomNumber: selectedRoomNumber,
      guestName: activeGuestName,
      items: compiledItems,
      isExpress,
      totalPrice
    });

    // Reset Form
    setSelectedRoomNumber('');
    setIsExpress(false);
    setQuantities({
      Clothes: 0,
      Blanket: 0,
      Bedsheet: 0,
      'Iron Only': 0,
      'Dry Clean': 0
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. Create Laundry Order Form */}
      <div className="lg:col-span-1 p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b pb-2 border-slate-100 dark:border-slate-800">
          <Shirt className="w-5 h-5 text-indigo-500" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Create Laundry Order
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Select Room */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Room Number *</label>
              <select
                required
                value={selectedRoomNumber}
                onChange={e => setSelectedRoomNumber(e.target.value)}
                className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg font-bold"
              >
                <option value="">-- Choose Room --</option>
                {occupiedRooms.map(r => (
                  <option key={r.id} value={r.roomNumber}>Room {r.roomNumber}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Guest Name</label>
              <input
                type="text"
                disabled
                value={activeGuestName}
                className="w-full p-2 border dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 rounded-lg text-slate-400 font-semibold"
                placeholder="Select room first"
              />
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="space-y-2.5">
            <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">Select Items & Quantities</label>
            <div className="space-y-2 divide-y divide-slate-100 dark:divide-slate-800/50">
              {Object.entries(itemPrices).map(([item, price]) => {
                const qtyKey = item as keyof typeof quantities;
                return (
                  <div key={item} className="flex items-center justify-between pt-2">
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-350">{item}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">₹{price} / item</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQty(qtyKey, -1)}
                        className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center font-bold text-slate-500 dark:text-slate-300"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold font-mono text-slate-800 dark:text-slate-200">
                        {quantities[qtyKey]}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(qtyKey, 1)}
                        className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center font-bold text-slate-500 dark:text-slate-300"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Surcharge Option */}
          <div className="flex items-center justify-between p-3 bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-500/10 rounded-xl">
            <div>
              <span className="font-semibold text-indigo-950 dark:text-indigo-300">Express Delivery</span>
              <p className="text-[10px] text-slate-400">Same-day turnaround (+50% Fee)</p>
            </div>
            <input
              type="checkbox"
              checked={isExpress}
              onChange={e => setIsExpress(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          {/* Pricing Calculations Summary */}
          {totalPrice > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Service Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {isExpress && (
                <div className="flex justify-between text-indigo-500">
                  <span className="font-sans">Express Surcharge</span>
                  <span>+₹{expressSurcharge}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-slate-200 dark:border-slate-850">
                <span className="text-slate-700 dark:text-slate-200 font-sans">Estimated Charges</span>
                <span className="text-indigo-600 dark:text-indigo-400">₹{totalPrice}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedRoomNumber || totalPrice === 0}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Send className="w-4 h-4" /> Post Laundry to Room
          </button>

        </form>
      </div>

      {/* 2. Laundry Orders Queue */}
      <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Laundry Service Records & Queue
          </h3>
          <span className="text-[10px] font-bold bg-indigo-500 text-white px-2 py-0.5 rounded">
            {laundryOrders.filter(l => l.status === 'Pending').length} Pending
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <th className="py-2">Order No / Room</th>
                <th className="py-2">Guest Name</th>
                <th className="py-2">Service Items Details</th>
                <th className="py-2 text-right">Cost</th>
                <th className="py-2 text-center">Status</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {laundryOrders.map(order => (
                <tr key={order.id} className="text-slate-700 dark:text-slate-300">
                  <td className="py-3">
                    <p className="font-extrabold text-slate-800 dark:text-slate-150 leading-tight">{order.orderNumber}</p>
                    <p className="text-[10px] font-bold text-indigo-500 font-mono mt-0.5">Room {order.roomNumber}</p>
                  </td>
                  <td className="py-3 font-semibold text-slate-600 dark:text-slate-350">{order.guestName}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      {order.items.map((it, idx) => (
                        <span key={idx} className="bg-slate-100 dark:bg-slate-800/60 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-500">
                          {it.itemType} x{it.quantity}
                        </span>
                      ))}
                      {order.isExpress && (
                        <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                          Express
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono block mt-1">{order.timestamp}</span>
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                    ₹{order.totalPrice}
                  </td>
                  <td className="py-3 text-center">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      order.status === 'Completed' ? 'bg-emerald-500 text-white shadow-sm' :
                      order.status === 'Delivered' ? 'bg-sky-500 text-white' :
                      'bg-amber-500 text-slate-900 font-medium'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {order.status === 'Pending' && (
                      <button
                        onClick={() => updateLaundryStatus(order.id, 'Delivered')}
                        className="px-2 py-1 bg-sky-500 text-white rounded text-[10px] font-bold hover:bg-sky-600 transition-colors shadow-sm"
                      >
                        Mark Delivered
                      </button>
                    )}
                    {order.status === 'Delivered' && (
                      <button
                        onClick={() => updateLaundryStatus(order.id, 'Completed')}
                        className="px-2 py-1 bg-emerald-500 text-white rounded text-[10px] font-bold hover:bg-emerald-600 transition-colors shadow-sm"
                      >
                        Complete Order
                      </button>
                    )}
                    {order.status === 'Completed' && (
                      <span className="text-slate-400 italic text-[10px] font-medium flex items-center justify-end gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Done
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {laundryOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400">No laundry orders listed.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
