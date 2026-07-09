import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Receipt, CreditCard, Landmark, DollarSign, Printer, Mail, PhoneCall, CheckCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface UnifiedBillingViewProps {
  selectedRoomNo: string;
  setSelectedRoomNo: (roomNo: string) => void;
}

export const UnifiedBillingView: React.FC<UnifiedBillingViewProps> = ({ selectedRoomNo, setSelectedRoomNo }) => {
  const { rooms, getBillSummary, checkOutRoom, settings, addAudit, orders, laundryOrders, hallBookings } = useApp();

  const [searchRoomInput, setSearchRoomInput] = useState(selectedRoomNo);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'UPI' | 'Split'>('UPI');
  
  // Split details
  const [splitCash, setSplitCash] = useState(0);
  const [splitCard, setSplitCard] = useState(0);
  const [splitUpi, setSplitUpi] = useState(0);

  // Print Invoice details
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [successAction, setSuccessAction] = useState('');

  // Sync inputs
  useEffect(() => {
    setSearchRoomInput(selectedRoomNo);
  }, [selectedRoomNo]);

  const activeOccupiedRooms = rooms.filter(r => r.status === 'Occupied');
  const matchedRoom = rooms.find(r => r.roomNumber === searchRoomInput);
  
  // Real-time bill calculations
  const summary = getBillSummary(searchRoomInput);

  const roomRentTotal = summary?.roomRentTotal || 0;
  const restaurantTotal = summary?.restaurantTotal || 0;
  const barTotal = summary?.barTotal || 0;
  const laundryTotal = summary?.laundryTotal || 0;
  const hallTotal = summary?.hallTotal || 0;
  const otherCharges = summary?.otherCharges || 0;
  
  const subtotal = roomRentTotal + restaurantTotal + barTotal + laundryTotal + hallTotal + otherCharges;
  const taxAmount = summary ? parseFloat(((subtotal * summary.taxRate) / 100).toFixed(2)) : 0;
  const grandTotal = subtotal + taxAmount;
  
  const advancePaid = summary?.advancePaid || 0;
  const outstandingAmount = Math.max(0, grandTotal - advancePaid - discount);

  const roomOrders = orders.filter(o => o.roomNumber === searchRoomInput && o.status === 'PostedToRoom');
  const roomLaundry = laundryOrders.filter(l => l.roomNumber === searchRoomInput);
  const roomHalls = hallBookings.filter(h => h.roomNumber === searchRoomInput && h.status !== 'Cancelled');

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedRoom || !summary) return;

    let splitDetails = '';
    if (paymentMethod === 'Split') {
      splitDetails = `Cash: ₹${splitCash}, Card: ₹${splitCard}, UPI: ₹${splitUpi}`;
    }

    checkOutRoom(matchedRoom.id, {
      method: paymentMethod,
      discount,
      splitDetails: paymentMethod === 'Split' ? splitDetails : undefined
    });

    // Fun confetti effect!
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });

    setSuccessAction(`Checked out Room ${searchRoomInput} successfully! Recieved ₹${outstandingAmount.toFixed(0)}`);
    setTimeout(() => setSuccessAction(''), 4000);

    // Clear inputs
    setSelectedRoomNo('');
    setSearchRoomInput('');
    setDiscount(0);
  };

  const handlePrintTrigger = () => {
    if (!summary) return;
    setShowPrintModal(true);
  };

  const handleSendEmail = () => {
    if (!summary) return;
    addAudit('Email Invoice', `Invoice sent to guest for Room ${searchRoomInput}`);
    setSuccessAction('Simulated: Invoice sent to customer Email successfully!');
    setTimeout(() => setSuccessAction(''), 3000);
  };

  const handleSendWhatsapp = () => {
    if (!summary) return;
    addAudit('WhatsApp Invoice', `Invoice dispatched to guest WhatsApp for Room ${searchRoomInput}`);
    setSuccessAction('Simulated: Invoice sent to customer WhatsApp successfully!');
    setTimeout(() => setSuccessAction(''), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Search & Bill Calculator (Left - 7 Cols) */}
      <div className="lg:col-span-7 space-y-4">
        
        {/* Search header */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Receptionist Bill Lookup (Room Check)
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              list="occupied-room-search"
              placeholder="Enter Room Number (e.g. 101, 201)..."
              value={searchRoomInput}
              onChange={e => {
                setSearchRoomInput(e.target.value);
                setSelectedRoomNo(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2.5 text-sm border dark:border-slate-800 dark:bg-slate-950 rounded-xl font-bold font-mono focus:ring-2 focus:ring-indigo-500/20"
            />
            <datalist id="occupied-room-search">
              {activeOccupiedRooms.map(r => (
                <option key={r.id} value={r.roomNumber}>{`Room ${r.roomNumber} - ${r.guestName}`}</option>
              ))}
            </datalist>
          </div>
          <p className="text-[10px] text-slate-400">
            Type any occupied room number above to aggregate charges instantly.
          </p>
        </div>

        {/* Dynamic Aggregated Bill Screen */}
        {summary ? (
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm space-y-5 animate-in fade-in slide-in-from-top-1 duration-200">
            
            {/* Guest Summary details */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-indigo-500">
                  Consolidated Room Invoice
                </h3>
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">
                  {summary.guestName}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  Stay: {summary.checkInDate} to {summary.checkOutDate} ({summary.stayDuration} Days)
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded uppercase tracking-wider">
                  Occupied
                </span>
                <p className="text-xl font-extrabold font-mono text-slate-900 dark:text-white mt-1.5">
                  Room {searchRoomInput}
                </p>
              </div>
            </div>

            {/* Departmental breakdown items */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Departmental Charges Ledger</h4>
              
              <div className="space-y-2 border dark:border-slate-800 p-4 rounded-xl font-mono text-xs">
                
                <div className="flex justify-between">
                  <span className="text-slate-500">Room rent total ({summary.stayDuration} Days @ ₹{matchedRoom?.price}/day)</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-250">₹{roomRentTotal}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Restaurant charges (F&B orders)</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-250">₹{restaurantTotal}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Bar charges (liquor orders)</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-250">₹{barTotal}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Laundry services (orders linked)</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-250">₹{laundryTotal}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Party Hall & booking services</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-250">₹{hallTotal}</span>
                </div>

                {otherCharges > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mini-bar / Misc services</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-250">₹{otherCharges}</span>
                  </div>
                )}

                <div className="border-t border-slate-100 dark:border-slate-800 my-2 pt-2 flex justify-between font-bold text-sm">
                  <span className="text-slate-600 dark:text-slate-355 font-sans">Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>

                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>General Taxes (GST @{summary.taxRate}%)</span>
                  <span>₹{taxAmount}</span>
                </div>

                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Advance Payments Logged</span>
                  <span className="text-emerald-500">-₹{advancePaid}</span>
                </div>

              </div>
            </div>

            {/* Detailed Itemized Customer Breakdown */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detailed Itemized Breakdown (Customer Copy)</h4>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/30 dark:border-slate-800/50 space-y-3 text-xs">
                
                {/* Room Rent Nights */}
                <div className="space-y-1">
                  <span className="text-[10px] text-indigo-500 font-extrabold uppercase">● Room Rent</span>
                  <div className="flex justify-between pl-3 font-mono text-[11px] text-slate-650 dark:text-slate-350">
                    <span>{summary.stayDuration} Nights @ ₹{matchedRoom?.price}/night (Room {searchRoomInput})</span>
                    <span className="font-bold">₹{roomRentTotal}</span>
                  </div>
                </div>

                {/* Restaurant Orders */}
                {roomOrders.filter(o => !o.isBar).length > 0 && (
                  <div className="space-y-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] text-emerald-600 font-extrabold uppercase">● Restaurant Orders</span>
                    {roomOrders.filter(o => !o.isBar).map(order => (
                      <div key={order.id} className="pl-3 space-y-0.5">
                        <div className="flex justify-between font-bold font-mono text-[10px] text-slate-500">
                          <span>Order {order.orderNumber} ({order.timestamp})</span>
                          <span>₹{order.total}</span>
                        </div>
                        <ul className="list-disc list-inside pl-2 space-y-0.5 text-slate-500 text-[10px]">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="font-sans">
                              {item.name} x{item.quantity} (₹{item.price} each)
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bar Orders */}
                {roomOrders.filter(o => o.isBar).length > 0 && (
                  <div className="space-y-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] text-violet-500 font-extrabold uppercase">● Bar Beverage Orders</span>
                    {roomOrders.filter(o => o.isBar).map(order => (
                      <div key={order.id} className="pl-3 space-y-0.5">
                        <div className="flex justify-between font-bold font-mono text-[10px] text-slate-500">
                          <span>Order {order.orderNumber} ({order.timestamp})</span>
                          <span>₹{order.total}</span>
                        </div>
                        <ul className="list-disc list-inside pl-2 space-y-0.5 text-slate-500 text-[10px]">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="font-sans">
                              {item.name} x{item.quantity} (₹{item.price} each)
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* Laundry Orders */}
                {roomLaundry.length > 0 && (
                  <div className="space-y-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] text-rose-500 font-extrabold uppercase">● Laundry Services</span>
                    {roomLaundry.map(order => (
                      <div key={order.id} className="pl-3 space-y-0.5 font-mono text-[11px] text-slate-650 dark:text-slate-350">
                        <div className="flex justify-between">
                          <span>
                            {order.orderNumber} ({order.items.map(it => `${it.itemType} x${it.quantity}`).join(', ')})
                            {order.isExpress && ' [EXPRESS]'}
                          </span>
                          <span className="font-bold">₹{order.totalPrice}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Hall Bookings */}
                {roomHalls.length > 0 && (
                  <div className="space-y-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] text-amber-500 font-extrabold uppercase">● Party Hall Bookings</span>
                    {roomHalls.map(booking => (
                      <div key={booking.id} className="pl-3 space-y-1 text-slate-500">
                        <div className="flex justify-between font-bold font-mono text-[10px]">
                          <span>{booking.bookingNumber} - {booking.hallType} ({booking.date})</span>
                          <span>₹{booking.totalPrice}</span>
                        </div>
                        <div className="pl-2 grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] font-sans">
                          <div>Base Hall Rent: <span className="font-mono">₹{booking.hallRent}</span></div>
                          {booking.foodPrice > 0 && <div>Catering Package: <span className="font-mono">₹{booking.foodPrice}</span></div>}
                          {booking.decorationPrice > 0 && <div>Decorations: <span className="font-mono">₹{booking.decorationPrice}</span></div>}
                          {booking.soundSystemPrice > 0 && <div>Sound/DJ: <span className="font-mono">₹{booking.soundSystemPrice}</span></div>}
                          {booking.projectorPrice > 0 && <div>Projector: <span className="font-mono">₹{booking.projectorPrice}</span></div>}
                          {booking.cleaningCharge > 0 && <div>Cleaning: <span className="font-mono">₹{booking.cleaningCharge}</span></div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>

            {/* Quick Actions Panel: PDF / WhatsApp */}
            <div className="flex flex-wrap gap-2 border-t pt-4 border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handlePrintTrigger}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold"
              >
                <Printer className="w-4 h-4" /> Print Invoice
              </button>
              
              <button
                type="button"
                onClick={handleSendEmail}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold"
              >
                <Mail className="w-4 h-4" /> Email Invoice
              </button>

              <button
                type="button"
                onClick={handleSendWhatsapp}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold"
              >
                <PhoneCall className="w-4 h-4 text-emerald-500" /> WhatsApp
              </button>
            </div>

          </div>
        ) : (
          <div className="p-12 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm text-center text-slate-400 opacity-60">
            <span className="text-4xl">🔑</span>
            <h4 className="text-xs font-bold uppercase tracking-wider mt-3">No Room Selected</h4>
            <p className="text-[10px] text-slate-500 mt-1 max-w-sm mx-auto">
              Please enter an active occupied room number in the search bar above to generate a unified bill.
            </p>
          </div>
        )}

      </div>

      {/* Checkout Payment Form (Right - 5 Cols) */}
      {summary && (
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm p-5 space-y-4 h-fit">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b pb-2 border-slate-100 dark:border-slate-800">
            Process Outstanding Settlement
          </h3>

          <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs">
            
            {/* Input Discount */}
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Apply Cashier Discount (₹)</label>
              <input
                type="number"
                min={0}
                max={outstandingAmount + discount} // limit discount to outstanding total
                value={discount}
                onChange={e => setDiscount(Number(e.target.value))}
                className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg font-bold font-mono text-indigo-500"
              />
            </div>

            {/* Selector Payment Mode */}
            <div className="space-y-2">
              <label className="font-bold text-slate-500 block">Payment Mode</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'UPI', label: 'UPI QR Pay', icon: Landmark },
                  { id: 'Cash', label: 'Cash Drawer', icon: DollarSign },
                  { id: 'Card', label: 'POS Card Swiper', icon: CreditCard },
                  { id: 'Split', label: 'Split Payment', icon: Receipt }
                ].map(mode => {
                  const Icon = mode.icon;
                  const isActive = paymentMethod === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setPaymentMethod(mode.id as any)}
                      className={`p-3 rounded-xl border flex items-center gap-2 font-bold text-left transition-all ${
                        isActive 
                          ? 'border-indigo-600 bg-indigo-50/20 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400' 
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Split Details Input */}
            {paymentMethod === 'Split' && (
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border dark:border-slate-800 space-y-2 animate-in fade-in duration-200">
                <p className="font-semibold text-slate-500 text-[10px] uppercase">Split Details Breakdowns</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-0.5">
                    <label className="text-[10px] text-slate-400">Cash Amt</label>
                    <input
                      type="number"
                      value={splitCash}
                      onChange={e => setSplitCash(Number(e.target.value))}
                      className="w-full p-1.5 border dark:border-slate-800 dark:bg-slate-900 rounded font-mono"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[10px] text-slate-400">Card Amt</label>
                    <input
                      type="number"
                      value={splitCard}
                      onChange={e => setSplitCard(Number(e.target.value))}
                      className="w-full p-1.5 border dark:border-slate-800 dark:bg-slate-900 rounded font-mono"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[10px] text-slate-400">UPI Amt</label>
                    <input
                      type="number"
                      value={splitUpi}
                      onChange={e => setSplitUpi(Number(e.target.value))}
                      className="w-full p-1.5 border dark:border-slate-800 dark:bg-slate-900 rounded font-mono"
                    />
                  </div>
                </div>
                <div className="flex justify-between text-[10px] font-bold font-mono pt-1 text-indigo-500">
                  <span>Split Sum Total:</span>
                  <span>₹{splitCash + splitCard + splitUpi}</span>
                </div>
              </div>
            )}

            {/* Outstanding Summary banner */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl text-center space-y-1 relative overflow-hidden">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Outstanding Settlement</span>
              <span className="text-3xl font-black font-mono text-rose-600 dark:text-rose-400">
                ₹{outstandingAmount.toLocaleString()}
              </span>
              <p className="text-[9px] text-slate-400 italic">Net charges minus advance deposits and discounts.</p>
            </div>

            {successAction && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 rounded-xl text-xs font-semibold flex items-center gap-1.5 animate-in slide-in-from-top-1">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> {successAction}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all text-xs"
            >
              Confirm Checkout & Release Room
            </button>

          </form>
        </div>
      )}

      {/* ==========================================
          INVOICE PRINT DIALOG (SIMULATED TICKET)
          ========================================== */}
      {showPrintModal && summary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 w-full max-w-sm rounded-lg shadow-2xl p-5 border border-slate-200 space-y-4 receipt-print animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            {/* Ticket header */}
            <div className="text-center border-b border-dashed border-slate-400 pb-3">
              <h3 className="font-extrabold text-sm uppercase tracking-wider">
                INVOICE / BILL OF CHARGES
              </h3>
              <p className="text-[11px] font-extrabold mt-0.5">{settings.name}</p>
              <p className="text-[9px] text-slate-500 leading-normal">{settings.address}</p>
              <p className="text-[9px] text-slate-500">Phone: {settings.phone}</p>
              <p className="text-[9px] text-slate-500 font-bold">GSTIN: {settings.gstNumber}</p>
              <p className="text-[10px] font-bold mt-2 bg-slate-100 inline-block px-2 py-0.5 rounded">
                Invoice No: {settings.invoicePrefix}{Math.floor(100000 + Math.random() * 900000)}
              </p>
            </div>

            {/* Guest Info */}
            <div className="text-[9px] space-y-0.5 font-mono border-b border-dashed border-slate-400 pb-2">
              <div className="flex justify-between">
                <span>Guest Name:</span>
                <span className="font-bold">{summary.guestName}</span>
              </div>
              <div className="flex justify-between">
                <span>Room Check In:</span>
                <span>{summary.checkInDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Room Check Out:</span>
                <span>{summary.checkOutDate}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Stay Room:</span>
                <span>Room {searchRoomInput}</span>
              </div>
            </div>

            {/* Itemized Charges list */}
            <div className="border-b border-dashed border-slate-400 py-2 font-mono text-[9px] space-y-2">
              <div className="flex justify-between font-bold border-b border-dashed border-slate-300 pb-1">
                <span>Description</span>
                <span>Amount</span>
              </div>
              
              {/* Room Rent */}
              <div className="flex justify-between">
                <span>ROOM RENT ({summary.stayDuration} NIGHTS @ ₹{matchedRoom?.price})</span>
                <span>₹{roomRentTotal}</span>
              </div>

              {/* Restaurant Items */}
              {roomOrders.filter(o => !o.isBar).length > 0 && (
                <div className="space-y-0.5 border-t border-dashed border-slate-200 pt-1">
                  <span className="font-bold text-[8px] uppercase tracking-wide block text-slate-500">Restaurant Orders:</span>
                  {roomOrders.filter(o => !o.isBar).map(order => (
                    <div key={order.id} className="pl-1">
                      <div className="flex justify-between text-slate-600">
                        <span>Order {order.orderNumber}</span>
                        <span>₹{order.total}</span>
                      </div>
                      <div className="pl-2 text-[8px] text-slate-500">
                        {order.items.map((it, i) => `${it.name} x${it.quantity}`).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Bar Items */}
              {roomOrders.filter(o => o.isBar).length > 0 && (
                <div className="space-y-0.5 border-t border-dashed border-slate-200 pt-1">
                  <span className="font-bold text-[8px] uppercase tracking-wide block text-slate-500">Bar Drinks:</span>
                  {roomOrders.filter(o => o.isBar).map(order => (
                    <div key={order.id} className="pl-1">
                      <div className="flex justify-between text-slate-600">
                        <span>Order {order.orderNumber}</span>
                        <span>₹{order.total}</span>
                      </div>
                      <div className="pl-2 text-[8px] text-slate-500">
                        {order.items.map((it, i) => `${it.name} x${it.quantity}`).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Laundry Items */}
              {roomLaundry.length > 0 && (
                <div className="space-y-0.5 border-t border-dashed border-slate-200 pt-1">
                  <span className="font-bold text-[8px] uppercase tracking-wide block text-slate-500">Laundry Services:</span>
                  {roomLaundry.map(order => (
                    <div key={order.id} className="flex justify-between pl-1 text-slate-600">
                      <span>
                        {order.orderNumber} ({order.items.map(it => `${it.itemType} x${it.quantity}`).join(', ')})
                      </span>
                      <span>₹{order.totalPrice}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Hall Bookings */}
              {roomHalls.length > 0 && (
                <div className="space-y-0.5 border-t border-dashed border-slate-200 pt-1">
                  <span className="font-bold text-[8px] uppercase tracking-wide block text-slate-500">Hall Events:</span>
                  {roomHalls.map(booking => (
                    <div key={booking.id} className="pl-1">
                      <div className="flex justify-between text-slate-600">
                        <span>{booking.bookingNumber} ({booking.hallType})</span>
                        <span>₹{booking.totalPrice}</span>
                      </div>
                      <div className="pl-2 text-[8px] text-slate-500 grid grid-cols-2">
                        <span>Base Rent: ₹{booking.hallRent}</span>
                        {booking.foodPrice > 0 && <span>Catering: ₹{booking.foodPrice}</span>}
                        {booking.decorationPrice > 0 && <span>Decor: ₹{booking.decorationPrice}</span>}
                        {booking.soundSystemPrice > 0 && <span>Sound: ₹{booking.soundSystemPrice}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
            </div>

            {/* Calculations summaries */}
            <div className="text-[9px] font-mono space-y-1">
              <div className="flex justify-between font-bold text-[10px]">
                <span>SUBTOTAL</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>GST Tax (18%)</span>
                <span>₹{taxAmount}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Pre-Paid Advance</span>
                <span>-₹{summary.advancePaid}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Cashier Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-xs border-t-2 border-dashed border-slate-400 pt-2 text-slate-900 mt-2">
                <span>TOTAL SETTLEMENT</span>
                <span>₹{outstandingAmount}</span>
              </div>
            </div>

            {/* Print Footer */}
            <div className="text-center text-[9px] text-slate-500 italic font-mono border-t border-slate-200 pt-3">
              Thank you for staying with us!
              <br />
              Please visit again.
            </div>

            <div className="flex gap-2 pt-2 font-sans border-t">
              <button
                onClick={() => setShowPrintModal(false)}
                className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-[10px] font-bold text-center"
              >
                Close Print View
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};
