import React, { useState } from 'react';
import { useApp, InventoryItem } from '../context/AppContext';
import { Package, Plus, AlertTriangle, FileSpreadsheet, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export const StockView: React.FC = () => {
  const { inventory, purchaseLogs, addInventoryItem, recordPurchase, updateStockLevel } = useApp();

  // Purchase Form
  const [supplier, setSupplier] = useState('');
  const [purchaseItemName, setPurchaseItemName] = useState('');
  const [purchaseCategory, setPurchaseCategory] = useState<'Liquor' | 'Food' | 'Cleaning' | 'Laundry' | 'Room Supplies' | 'Kitchen' | 'Housekeeping'>('Room Supplies');
  const [qty, setQty] = useState(0);
  const [pricePerUnit, setPricePerUnit] = useState(0);
  const [unit, setUnit] = useState('pcs');
  const [gstPercent, setGstPercent] = useState(18);
  const [expiryDate, setExpiryDate] = useState('');

  // Stock Adjust Form (In / Out)
  const [adjustItemId, setAdjustItemId] = useState('');
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [adjustDirection, setAdjustDirection] = useState<'in' | 'out'>('out');

  // New Item Track Form
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'Liquor' | 'Food' | 'Cleaning' | 'Laundry' | 'Room Supplies' | 'Kitchen' | 'Housekeeping'>('Room Supplies');
  const [newItemMinStock, setNewItemMinStock] = useState(5);
  const [newItemUnit, setNewItemUnit] = useState('pcs');

  // Tabs for sub-views
  const [activeSubTab, setActiveSubTab] = useState<'ledger' | 'purchases' | 'adjust'>('ledger');

  const categories = ['Liquor', 'Food', 'Cleaning', 'Laundry', 'Room Supplies', 'Kitchen', 'Housekeeping'];

  // Calculate totals for purchases
  const subtotal = qty * pricePerUnit;
  const gstAmount = parseFloat(((subtotal * gstPercent) / 100).toFixed(2));
  const totalPurchaseCost = subtotal + gstAmount;

  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier || !purchaseItemName || qty <= 0 || pricePerUnit <= 0) return;

    // Check if item exists in inventory tracker first. If not, automatically add it.
    const exists = inventory.find(i => i.name.toLowerCase() === purchaseItemName.toLowerCase());
    if (!exists) {
      addInventoryItem({
        name: purchaseItemName,
        category: purchaseCategory,
        stock: 0,
        minStock: 5,
        unit: unit,
        expiryDate: expiryDate || undefined,
        barcode: 'BAR-' + Math.floor(100000 + Math.random() * 900000)
      });
    }

    recordPurchase({
      itemName: purchaseItemName,
      category: purchaseCategory,
      quantity: qty,
      unit,
      supplier,
      pricePerUnit,
      gstAmount,
      totalAmount: totalPurchaseCost
    });

    // Reset Form
    setSupplier('');
    setPurchaseItemName('');
    setQty(0);
    setPricePerUnit(0);
    setExpiryDate('');
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItemId || adjustAmount <= 0) return;

    updateStockLevel(adjustItemId, adjustAmount, adjustDirection);
    
    // Reset Form
    setAdjustItemId('');
    setAdjustAmount(0);
  };

  const handleNewItemTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName) return;

    addInventoryItem({
      name: newItemName,
      category: newItemCategory,
      stock: 0,
      minStock: newItemMinStock,
      unit: newItemUnit,
      barcode: 'BAR-' + Math.floor(100000 + Math.random() * 900000)
    });

    setNewItemName('');
  };

  const lowStockItems = inventory.filter(item => item.stock < item.minStock);

  return (
    <div className="space-y-6">
      
      {/* Low Stock Alerts Banner */}
      {lowStockItems.length > 0 && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30 rounded-2xl flex items-start gap-3 animate-in fade-in duration-200 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
          <div className="text-xs space-y-1">
            <span className="font-extrabold uppercase tracking-wider block">Low Stock Alert Notifications</span>
            <p className="font-medium">
              The following inventory items are below minimum replenishment threshold. Please log stock purchases to restore levels:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1.5">
              {lowStockItems.map(item => (
                <span key={item.id} className="bg-rose-500 text-white font-bold px-2 py-0.5 rounded font-mono">
                  {item.name} ({item.stock}/{item.minStock} {item.unit})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stock Sub tabs & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        
        {/* Toggle list tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveSubTab('ledger')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'ledger' 
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500'
            }`}
          >
            Inventory Ledger
          </button>
          <button
            onClick={() => setActiveSubTab('purchases')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'purchases' 
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500'
            }`}
          >
            Purchase Entries
          </button>
          <button
            onClick={() => setActiveSubTab('adjust')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'adjust' 
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500'
            }`}
          >
            Stock Adjustment
          </button>
        </div>

        {/* Counter */}
        <div className="text-right">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Managed SKU Items</span>
          <span className="text-base font-bold font-mono text-slate-850 dark:text-slate-200">{inventory.length} SKUs</span>
        </div>

      </div>

      {/* Grid: Forms / Table based on tab */}
      {activeSubTab === 'ledger' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Tracking Form (Left - 1 Col) */}
          <div className="lg:col-span-1 p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm space-y-4 h-fit">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-350 flex items-center gap-1.5 border-b pb-2 border-slate-100 dark:border-slate-800">
              <Package className="w-4 h-4 text-indigo-500" /> Track New SKU
            </h3>
            
            <form onSubmit={handleNewItemTrackSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Item / SKU Name *</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg"
                  placeholder="e.g. Rice Basmati"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">Category *</label>
                <select
                  value={newItemCategory}
                  onChange={e => setNewItemCategory(e.target.value as any)}
                  className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg font-bold"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Min Threshold</label>
                  <input
                    type="number"
                    min={1}
                    value={newItemMinStock}
                    onChange={e => setNewItemMinStock(Number(e.target.value))}
                    className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Stock Unit</label>
                  <input
                    type="text"
                    required
                    value={newItemUnit}
                    onChange={e => setNewItemUnit(e.target.value)}
                    className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg"
                    placeholder="bottle, kg, etc."
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-colors mt-2"
              >
                Create SKU Track
              </button>
            </form>
          </div>

          {/* Table (Right - 3 Cols) */}
          <div className="lg:col-span-3 p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-350 border-b pb-2 border-slate-100 dark:border-slate-800">
              Active Stock Levels
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <th className="py-2">Item Name / Barcode</th>
                    <th className="py-2">Category</th>
                    <th className="py-2 text-center">Min Level</th>
                    <th className="py-2 text-right">In Stock</th>
                    <th className="py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {inventory.map(item => {
                    const isLow = item.stock < item.minStock;
                    return (
                      <tr key={item.id} className="text-slate-700 dark:text-slate-300">
                        <td className="py-3">
                          <p className="font-bold text-slate-800 dark:text-slate-150 leading-tight">{item.name}</p>
                          <p className="text-[9px] font-mono text-slate-400 mt-0.5">{item.barcode || 'NO-BARCODE'}</p>
                        </td>
                        <td className="py-3 font-semibold text-slate-500">{item.category}</td>
                        <td className="py-3 text-center font-mono text-slate-400">{item.minStock} {item.unit}</td>
                        <td className={`py-3 text-right font-mono font-bold ${isLow ? 'text-rose-600 dark:text-rose-400 animate-pulse-soft' : 'text-slate-800 dark:text-slate-200'}`}>
                          {item.stock} {item.unit}
                        </td>
                        <td className="py-3 text-center">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                            isLow ? 'bg-rose-500 text-white shadow-sm' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                          }`}>
                            {isLow ? 'Low Stock' : 'Good'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {activeSubTab === 'purchases' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Purchase Log Form (Left - 1 Col) */}
          <div className="lg:col-span-1 p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-350 border-b pb-2 border-slate-100 dark:border-slate-800">
              New Purchase Entry
            </h3>

            <form onSubmit={handlePurchaseSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Supplier Name *</label>
                <input
                  type="text"
                  required
                  value={supplier}
                  onChange={e => setSupplier(e.target.value)}
                  className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg"
                  placeholder="e.g. United Beverages Ltd"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Item Name *</label>
                  <input
                    type="text"
                    required
                    list="inventory-suggestions"
                    value={purchaseItemName}
                    onChange={e => {
                      setPurchaseItemName(e.target.value);
                      const matched = inventory.find(i => i.name.toLowerCase() === e.target.value.toLowerCase());
                      if (matched) {
                        setPurchaseCategory(matched.category);
                        setUnit(matched.unit);
                      }
                    }}
                    className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg"
                    placeholder="Item SKU Name"
                  />
                  <datalist id="inventory-suggestions">
                    {inventory.map(i => <option key={i.id} value={i.name} />)}
                  </datalist>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Category *</label>
                  <select
                    value={purchaseCategory}
                    onChange={e => setPurchaseCategory(e.target.value as any)}
                    className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg font-semibold"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Quantity *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={qty}
                    onChange={e => setQty(Number(e.target.value))}
                    className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Price / Unit *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={pricePerUnit}
                    onChange={e => setPricePerUnit(Number(e.target.value))}
                    className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Unit Type</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg"
                    placeholder="pcs/kg/bottle"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">GST Percent (%)</label>
                  <input
                    type="number"
                    min={0}
                    value={gstPercent}
                    onChange={e => setGstPercent(Number(e.target.value))}
                    className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={e => setExpiryDate(e.target.value)}
                    className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Purchase total calculation */}
              {totalPurchaseCost > 0 && (
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border dark:border-slate-800 font-mono text-[10px] space-y-1">
                  <div className="flex justify-between">
                    <span>Purchase Cost:</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>GST Tax ({gstPercent}%):</span>
                    <span>₹{gstAmount}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-200 mt-1">
                    <span className="font-sans">Grand Total:</span>
                    <span className="text-indigo-600 dark:text-indigo-400">₹{totalPurchaseCost}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handlePurchaseSubmit}
                type="button"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors"
              >
                Log Stock-In Purchase
              </button>

            </form>
          </div>

          {/* Ledger of Purchases (Right - 2 Cols) */}
          <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-350 border-b pb-2 border-slate-100 dark:border-slate-800">
              Stock In / Purchase History Ledger
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <th className="py-2">Purchase Date / Item</th>
                    <th className="py-2">Supplier details</th>
                    <th className="py-2 text-center">Quantity</th>
                    <th className="py-2 text-right">Total Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {purchaseLogs.map(log => (
                    <tr key={log.id} className="text-slate-700 dark:text-slate-300">
                      <td className="py-3">
                        <span className="text-[10px] font-mono text-indigo-500 font-semibold">{log.date}</span>
                        <p className="font-bold text-slate-800 dark:text-slate-150 leading-tight mt-0.5">{log.itemName}</p>
                      </td>
                      <td className="py-3 font-semibold text-slate-500 leading-tight">{log.supplier}</td>
                      <td className="py-3 text-center font-mono font-medium">{log.quantity} {log.unit}</td>
                      <td className="py-3 text-right font-mono font-bold text-slate-850 dark:text-slate-150">
                        ₹{log.totalAmount}
                      </td>
                    </tr>
                  ))}
                  {purchaseLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-slate-400">No purchase entry logs.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {activeSubTab === 'adjust' && (
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm max-w-md mx-auto space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-350 border-b pb-2 border-slate-100 dark:border-slate-800">
            Manual Stock Adjustments
          </h3>
          
          <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Select Stock Item *</label>
              <select
                required
                value={adjustItemId}
                onChange={e => setAdjustItemId(e.target.value)}
                className="w-full p-2.5 border dark:border-slate-850 dark:bg-slate-900 rounded-xl font-bold"
              >
                <option value="">-- Select SKU --</option>
                {inventory.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.name} (Current: {i.stock} {i.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Adjustment Type</label>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setAdjustDirection('in')}
                    className={`flex-1 py-1.5 rounded flex items-center justify-center gap-1 ${adjustDirection === 'in' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-450'}`}
                  >
                    <ArrowUpCircle className="w-3.5 h-3.5" /> Stock In
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustDirection('out')}
                    className={`flex-1 py-1.5 rounded flex items-center justify-center gap-1 ${adjustDirection === 'out' ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-450'}`}
                  >
                    <ArrowDownCircle className="w-3.5 h-3.5" /> Stock Out
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Quantity Amount *</label>
                <input
                  type="number"
                  required
                  min={0.1}
                  step="any"
                  value={adjustAmount}
                  onChange={e => setAdjustAmount(Number(e.target.value))}
                  className="w-full p-2.5 border dark:border-slate-850 dark:bg-slate-900 rounded-xl font-bold font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!adjustItemId || adjustAmount <= 0}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md"
            >
              Commit Adjustment
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
