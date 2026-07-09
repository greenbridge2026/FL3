import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  DollarSign, 
  Bed, 
  Users, 
  Utensils, 
  GlassWater, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight,
  PlusCircle,
  Receipt,
  LogOut,
  Sparkles,
  Wine,
  Package
} from 'lucide-react';

interface DashboardViewProps {
  setTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setTab }) => {
  const { rooms, orders, laundryOrders, hallBookings, preBookings, getBillSummary } = useApp();

  // CALCULATE STATS
  // 1. Rooms counters
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length;
  const availableRooms = rooms.filter(r => r.status === 'Available').length;
  const cleaningRooms = rooms.filter(r => r.status === 'Cleaning').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'Maintenance').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  
  // Active guest headcount
  const guestsCheckedIn = rooms.reduce((acc, r) => acc + (r.noOfGuests || 0), 0);

  // 2. Sales totals
  // Restaurant Sales (isBar === false)
  const restaurantSales = orders
    .filter(o => !o.isBar)
    .reduce((acc, o) => acc + o.total, 0);

  // Bar Sales (isBar === true)
  const barSales = orders
    .filter(o => o.isBar)
    .reduce((acc, o) => acc + o.total, 0);

  // Hall Booking total sales
  const hallSales = hallBookings
    .filter(h => h.status !== 'Cancelled')
    .reduce((acc, h) => acc + h.totalPrice, 0);

  // Laundry pending orders count
  const laundryPending = laundryOrders.filter(l => l.status === 'Pending').length;

  // 3. Today's Revenue (Simple Simulation: advance paid + cash/upi POS orders + completed transactions)
  // Let's sum Room Advance Paid + Direct POS Sales (Paid) + Laundry direct + Hall booking advance
  const roomAdvances = rooms.reduce((acc, r) => acc + (r.advancePaid || 0), 0);
  const directPaidPOS = orders.filter(o => o.status === 'Paid').reduce((acc, o) => acc + o.total, 0);
  const hallAdvances = hallBookings.reduce((acc, h) => acc + h.advancePaid, 0);
  const todayRevenue = roomAdvances + directPaidPOS + hallAdvances + laundryOrders.reduce((acc, l) => acc + (l.status === 'Completed' ? l.totalPrice : 0), 0);

  // 4. Outstanding Payments
  // Sum of pending amounts for all occupied rooms
  const outstandingPayments = rooms
    .filter(r => r.status === 'Occupied')
    .reduce((acc, r) => {
      const summary = getBillSummary(r.roomNumber);
      return acc + (summary ? summary.pendingAmount : 0);
    }, 0);

  // Today's Check-ins / Check-outs lists
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCheckIns = rooms.filter(r => r.status === 'Occupied' && r.checkInDate === todayStr);
  const todayCheckOuts = rooms.filter(r => r.status === 'Occupied' && r.checkOutDate === todayStr);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-700/30 relative overflow-hidden">
        <div className="space-y-1 z-10">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Welcome to HotelVista Control Terminal <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
          </h2>
          <p className="text-xs text-slate-300">
            Real-time status overview, booking details, and cashier logs.
          </p>
        </div>
        <div className="text-right z-10">
          <p className="text-xs text-slate-400">Current Server Date</p>
          <p className="text-sm font-semibold font-mono text-indigo-400">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-gradient from-indigo-500/10 to-transparent opacity-60 pointer-events-none"></div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* STAT 1: Today's Revenue */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center justify-between group hover:shadow-md hover:border-indigo-500/20 transition-all duration-300">
          <div className="space-y-2">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Today's Revenue</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                ₹{todayRevenue.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-emerald-500 flex items-center bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded">
                <ArrowUpRight className="w-3 h-3" /> +12%
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl transition-transform group-hover:scale-105 duration-200">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* STAT 2: Occupancy Rate */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center justify-between group hover:shadow-md hover:border-indigo-500/20 transition-all duration-300">
          <div className="space-y-2">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Occupancy Rate</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {occupancyRate}%
              </span>
              <span className="text-xs text-slate-400">
                {occupiedRooms}/{totalRooms} Rooms
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xl transition-transform group-hover:scale-105 duration-200">
            <Bed className="w-6 h-6" />
          </div>
        </div>

        {/* STAT 3: Active Guest Count */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center justify-between group hover:shadow-md hover:border-indigo-500/20 transition-all duration-300">
          <div className="space-y-2">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Guests Checked In</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {guestsCheckedIn}
              </span>
              <span className="text-xs text-slate-400">In-house guests</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl transition-transform group-hover:scale-105 duration-200">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* STAT 4: Outstanding Bills */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center justify-between group hover:shadow-md hover:border-indigo-500/20 transition-all duration-300">
          <div className="space-y-2">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Outstanding Bal</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
                ₹{outstandingPayments.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-rose-500 flex items-center bg-rose-50 dark:bg-rose-950/20 px-1.5 py-0.5 rounded">
                <Clock className="w-3 h-3 mr-0.5" /> Due
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xl transition-transform group-hover:scale-105 duration-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Secondary statistics dashboard for F&B + Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Restaurant Sales */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded-xl flex items-center gap-3 shadow-sm">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Restaurant Sales</p>
            <p className="text-base font-bold font-mono text-slate-800 dark:text-slate-200">₹{restaurantSales.toLocaleString()}</p>
          </div>
        </div>

        {/* Bar Sales */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded-xl flex items-center gap-3 shadow-sm">
          <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-950/30 text-violet-500">
            <GlassWater className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bar Sales</p>
            <p className="text-base font-bold font-mono text-slate-800 dark:text-slate-200">₹{barSales.toLocaleString()}</p>
          </div>
        </div>

        {/* Hall Rent Booked */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded-xl flex items-center gap-3 shadow-sm">
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-500">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hall Bookings</p>
            <p className="text-base font-bold font-mono text-slate-800 dark:text-slate-200">₹{hallSales.toLocaleString()}</p>
          </div>
        </div>

        {/* Laundry Pending */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded-xl flex items-center gap-3 shadow-sm">
          <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-500">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Laundry Pending</p>
            <p className="text-base font-bold font-mono text-slate-800 dark:text-slate-200">
              {laundryPending} <span className="text-[10px] text-slate-400 font-normal font-sans">orders</span>
            </p>
          </div>
        </div>

      </div>

      {/* Quick Actions Panel */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          
          <button 
            onClick={() => setTab('rooms')} 
            className="flex flex-col items-center justify-center p-4 bg-indigo-50/40 hover:bg-indigo-50 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/35 border border-indigo-100 dark:border-indigo-900/30 rounded-xl transition-all duration-200"
          >
            <PlusCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-2" />
            <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">New Booking</span>
          </button>

          <button 
            onClick={() => setTab('restaurant')} 
            className="flex flex-col items-center justify-center p-4 bg-emerald-50/40 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/35 border border-emerald-100 dark:border-emerald-900/30 rounded-xl transition-all duration-200"
          >
            <Utensils className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-2" />
            <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">Restaurant POS</span>
          </button>

          <button 
            onClick={() => setTab('bar')} 
            className="flex flex-col items-center justify-center p-4 bg-violet-50/40 hover:bg-violet-50 dark:bg-violet-950/20 dark:hover:bg-violet-950/35 border border-violet-100 dark:border-violet-900/30 rounded-xl transition-all duration-200"
          >
            <Wine className="w-5 h-5 text-violet-600 dark:text-violet-400 mb-2" />
            <span className="text-xs font-semibold text-violet-900 dark:text-violet-200">Bar POS</span>
          </button>

          <button 
            onClick={() => setTab('hall')} 
            className="flex flex-col items-center justify-center p-4 bg-amber-50/40 hover:bg-amber-50 dark:bg-amber-950/20 dark:hover:bg-amber-950/35 border border-amber-100 dark:border-amber-900/30 rounded-xl transition-all duration-200"
          >
            <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-2" />
            <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">Hall Booking</span>
          </button>

          <button 
            onClick={() => setTab('billing')} 
            className="flex flex-col items-center justify-center p-4 bg-rose-50/40 hover:bg-rose-50 dark:bg-rose-950/20 dark:hover:bg-rose-950/35 border border-rose-100 dark:border-rose-900/30 rounded-xl transition-all duration-200"
          >
            <Receipt className="w-5 h-5 text-rose-600 dark:text-rose-400 mb-2" />
            <span className="text-xs font-semibold text-rose-900 dark:text-rose-200">Check Out Bill</span>
          </button>

          <button 
            onClick={() => setTab('stock')} 
            className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-xl transition-all duration-200"
          >
            <Package className="w-5 h-5 text-slate-600 dark:text-slate-400 mb-2" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Inventory</span>
          </button>

        </div>
      </div>

      {/* Grid of Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Today's Check-ins */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Today's Checked In
            </h3>
            <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded">
              {todayCheckIns.length} Guests
            </span>
          </div>
          {todayCheckIns.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">No rooms checked in today yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <th className="py-2">Room</th>
                    <th className="py-2">Guest Name</th>
                    <th className="py-2">Out Date</th>
                    <th className="py-2 text-right">Advance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {todayCheckIns.map(r => (
                    <tr key={r.id} className="text-slate-700 dark:text-slate-300">
                      <td className="py-2 font-bold font-mono text-indigo-500">Room {r.roomNumber}</td>
                      <td className="py-2 font-semibold">{r.guestName}</td>
                      <td className="py-2 text-slate-400">{r.checkOutDate}</td>
                      <td className="py-2 text-right font-mono font-medium">₹{r.advancePaid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Outstanding Overviews / High Pending Balances */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              High Outstanding Balance
            </h3>
            <span className="text-[10px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded">
              Action Required
            </span>
          </div>
          {rooms.filter(r => r.status === 'Occupied').length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">No rooms currently occupied.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <th className="py-2">Room</th>
                    <th className="py-2">Guest Name</th>
                    <th className="py-2">In Date</th>
                    <th className="py-2 text-right">Outstanding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {rooms
                    .filter(r => r.status === 'Occupied')
                    .map(r => {
                      const summary = getBillSummary(r.roomNumber);
                      return { room: r, summary };
                    })
                    .sort((a, b) => (b.summary?.pendingAmount || 0) - (a.summary?.pendingAmount || 0))
                    .slice(0, 4)
                    .map(({ room, summary }) => (
                      <tr key={room.id} className="text-slate-700 dark:text-slate-300">
                        <td className="py-2 font-bold font-mono text-indigo-500">Room {room.roomNumber}</td>
                        <td className="py-2 font-semibold">{room.guestName}</td>
                        <td className="py-2 text-slate-400">{room.checkInDate}</td>
                        <td className="py-2 text-right font-bold text-rose-500 font-mono">
                          ₹{summary ? summary.pendingAmount.toFixed(0) : '0'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
