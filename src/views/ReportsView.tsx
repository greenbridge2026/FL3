import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart3, FileSpreadsheet, TrendingUp, DollarSign, PieChart, Landmark } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { rooms, orders, laundryOrders, hallBookings, getBillSummary } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<'sales' | 'occupancy' | 'gst' | 'outstanding'>('sales');

  // Calculations for Reports
  // 1. Departmental sales
  const roomRev = rooms.reduce((acc, r) => {
    const bill = getBillSummary(r.roomNumber);
    return acc + (bill ? bill.roomRentTotal : 0);
  }, 0);

  const restSales = orders.filter(o => !o.isBar).reduce((acc, o) => acc + o.total, 0);
  const barSales = orders.filter(o => o.isBar).reduce((acc, o) => acc + o.total, 0);
  const laundrySales = laundryOrders.reduce((acc, o) => acc + o.totalPrice, 0);
  const hallSales = hallBookings.filter(o => o.status !== 'Cancelled').reduce((acc, o) => acc + o.totalPrice, 0);

  const totalSales = roomRev + restSales + barSales + laundrySales + hallSales;

  // Outstanding bills list
  const outstandingList = rooms
    .filter(r => r.status === 'Occupied')
    .map(r => {
      const summary = getBillSummary(r.roomNumber);
      return {
        roomNumber: r.roomNumber,
        guestName: r.guestName || '',
        phone: r.guestPhone || '',
        checkInDate: r.checkInDate || '',
        pendingAmount: summary ? summary.pendingAmount : 0
      };
    })
    .filter(o => o.pendingAmount > 0);

  // GST calculations (18% for general items, 20% for bar items)
  const generalGstTax = (roomRev + restSales + laundrySales + hallSales) * 0.18;
  const barVatTax = barSales * 0.20;
  const totalTax = generalGstTax + barVatTax;

  // Occupancy rate by categories
  const categoriesCount: { [key: string]: { total: number; occupied: number } } = {
    'Standard': { total: 0, occupied: 0 },
    'Semi Premium': { total: 0, occupied: 0 },
    'Premium': { total: 0, occupied: 0 },
    'Suite': { total: 0, occupied: 0 },
    'Family Suite': { total: 0, occupied: 0 },
    'Dormitory': { total: 0, occupied: 0 }
  };

  rooms.forEach(r => {
    if (categoriesCount[r.category]) {
      categoriesCount[r.category].total += 1;
      if (r.status === 'Occupied') {
        categoriesCount[r.category].occupied += 1;
      }
    }
  });

  return (
    <div className="space-y-6">
      
      {/* KPI stats bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Sales */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Booked Sales</span>
            <span className="text-xl font-bold font-mono text-slate-800 dark:text-slate-200">
              ₹{totalSales.toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950 text-indigo-500 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* GST Tax liability */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">GST Tax Liabilities</span>
            <span className="text-xl font-bold font-mono text-slate-850 dark:text-slate-250">
              ₹{totalTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="p-3 bg-violet-50 dark:bg-violet-950 text-violet-500 rounded-xl">
            <Landmark className="w-5 h-5" />
          </div>
        </div>

        {/* Total Outstanding */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Unsettled Outstanding</span>
            <span className="text-xl font-bold font-mono text-rose-500">
              ₹{outstandingList.reduce((acc, o) => acc + o.pendingAmount, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-950 text-rose-500 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Occupancy summary */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">In-house Occupancy</span>
            <span className="text-xl font-bold font-mono text-emerald-500">
              {Math.round((rooms.filter(r => r.status === 'Occupied').length / rooms.length) * 100)}%
            </span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-500 rounded-xl">
            <PieChart className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Selector Controls for Sub Reports */}
      <div className="flex bg-slate-100 dark:bg-slate-850 p-1 rounded-xl w-fit border border-slate-200/20">
        <button
          onClick={() => setActiveReportTab('sales')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeReportTab === 'sales' 
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
              : 'text-slate-500'
          }`}
        >
          Departmental Sales Summary
        </button>
        <button
          onClick={() => setActiveReportTab('occupancy')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeReportTab === 'occupancy' 
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
              : 'text-slate-500'
          }`}
        >
          Occupancy Logs
        </button>
        <button
          onClick={() => setActiveReportTab('gst')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeReportTab === 'gst' 
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
              : 'text-slate-500'
          }`}
        >
          GST Returns Audit
        </button>
        <button
          onClick={() => setActiveReportTab('outstanding')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeReportTab === 'outstanding' 
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
              : 'text-slate-500'
          }`}
        >
          Outstanding Bills
        </button>
      </div>

      {/* Sub Report Render Area */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm">
        
        {/* TAB 1: Departmental Sales */}
        {activeReportTab === 'sales' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2 border-slate-100 dark:border-slate-800">
              Active Channel breakdown
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              
              {/* Detailed Breakdown */}
              <div className="space-y-3 text-xs font-mono">
                <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                  <span className="text-slate-500 uppercase font-semibold">1. Rooms Rent Sales</span>
                  <span className="font-bold text-slate-800 dark:text-white">₹{roomRev.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                  <span className="text-slate-500 uppercase font-semibold">2. Restaurant POS</span>
                  <span className="font-bold text-slate-800 dark:text-white">₹{restSales.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                  <span className="text-slate-500 uppercase font-semibold">3. Bar POS Terminal</span>
                  <span className="font-bold text-slate-800 dark:text-white">₹{barSales.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                  <span className="text-slate-500 uppercase font-semibold">4. Laundry Service</span>
                  <span className="font-bold text-slate-800 dark:text-white">₹{laundrySales.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                  <span className="text-slate-500 uppercase font-semibold">5. Banquet / Party Hall Rents</span>
                  <span className="font-bold text-slate-800 dark:text-white">₹{hallSales.toLocaleString()}</span>
                </div>
                
                <div className="border-t-2 border-slate-350 dark:border-slate-800 my-2 pt-3 flex justify-between font-extrabold text-sm text-indigo-500">
                  <span className="font-sans uppercase">Combined Revenues</span>
                  <span>₹{totalSales.toLocaleString()}</span>
                </div>
              </div>

              {/* Progress bar list mimicking charts */}
              <div className="space-y-4 p-4 rounded-xl border dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Visual Breakdown</span>
                {[
                  { label: 'Rooms Rent', val: roomRev, color: 'bg-indigo-500' },
                  { label: 'Restaurant', val: restSales, color: 'bg-emerald-500' },
                  { label: 'Bar Drinks', val: barSales, color: 'bg-violet-500' },
                  { label: 'Laundry Services', val: laundrySales, color: 'bg-rose-500' },
                  { label: 'Party Hall Rents', val: hallSales, color: 'bg-amber-500' }
                ].map(item => {
                  const percent = totalSales > 0 ? (item.val / totalSales) * 100 : 0;
                  return (
                    <div key={item.label} className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-650 dark:text-slate-350">{item.label}</span>
                        <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{percent.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: Occupancy Rate breakdown */}
        {activeReportTab === 'occupancy' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2 border-slate-100 dark:border-slate-800">
              Occupancy Breakdown by Room Category
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <th className="py-2">Category Category</th>
                    <th className="py-2 text-center">Total Rooms</th>
                    <th className="py-2 text-center">Occupied Rooms</th>
                    <th className="py-2 text-right">Occupancy Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {Object.entries(categoriesCount).map(([category, count]) => {
                    const rate = count.total > 0 ? Math.round((count.occupied / count.total) * 100) : 0;
                    return (
                      <tr key={category} className="text-slate-700 dark:text-slate-300">
                        <td className="py-3 font-bold text-slate-800 dark:text-slate-200">{category}</td>
                        <td className="py-3 text-center font-mono font-medium">{count.total}</td>
                        <td className="py-3 text-center font-mono font-medium">{count.occupied}</td>
                        <td className="py-3 text-right font-mono font-bold text-indigo-500">
                          {rate}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: GST Returns Audit */}
        {activeReportTab === 'gst' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2 border-slate-100 dark:border-slate-800">
              Tax returns liabilities breakdowns
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border dark:border-slate-850 space-y-2">
                <span className="font-bold text-slate-400 text-[10px] uppercase">Room / general GST (18%)</span>
                <p className="text-slate-500">Revenues: ₹{(roomRev + restSales + laundrySales + hallSales).toLocaleString()}</p>
                <p className="text-sm font-extrabold text-slate-800 dark:text-slate-150 border-t pt-1.5">GST Duty: ₹{generalGstTax.toFixed(0)}</p>
              </div>
              
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border dark:border-slate-850 space-y-2">
                <span className="font-bold text-slate-400 text-[10px] uppercase">Bar / Liquor VAT (20%)</span>
                <p className="text-slate-500">Revenues: ₹{barSales.toLocaleString()}</p>
                <p className="text-sm font-extrabold text-slate-800 dark:text-slate-150 border-t pt-1.5">Bar VAT Duty: ₹{barVatTax.toFixed(0)}</p>
              </div>

              <div className="p-4 bg-indigo-50/20 dark:bg-indigo-950/20 rounded-xl border border-indigo-500/10 space-y-2">
                <span className="font-bold text-indigo-500 text-[10px] uppercase">Total Tax Returns Liability</span>
                <p className="text-slate-400">CGST (9%) + SGST (9%) + VAT</p>
                <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 border-t pt-1.5">Total Duty: ₹{totalTax.toFixed(0)}</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Outstanding Bills */}
        {activeReportTab === 'outstanding' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2 border-slate-100 dark:border-slate-800">
              Outstanding bills checklist
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <th className="py-2">Room No</th>
                    <th className="py-2">Guest Name</th>
                    <th className="py-2 font-mono">In Date</th>
                    <th className="py-2 text-right">Outstanding Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {outstandingList.map(item => (
                    <tr key={item.roomNumber} className="text-slate-700 dark:text-slate-300">
                      <td className="py-3 font-extrabold font-mono text-indigo-500">Room {item.roomNumber}</td>
                      <td className="py-3">
                        <p className="font-bold">{item.guestName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{item.phone}</p>
                      </td>
                      <td className="py-3 font-mono text-slate-500">{item.checkInDate}</td>
                      <td className="py-3 text-right font-mono font-bold text-rose-500">
                        ₹{item.pendingAmount.toFixed(0)}
                      </td>
                    </tr>
                  ))}
                  {outstandingList.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-slate-400">All room balances have been settled. No outstandings!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
