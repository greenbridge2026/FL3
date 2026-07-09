import React, { useState } from 'react';
import { useApp, MenuItem } from '../context/AppContext';
import { Settings, Plus, ToggleLeft, ToggleRight, Save, UtensilsCrossed } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, menuItems, addInventoryItem, addAudit } = useApp();

  // Hotel settings local copy
  const [hotelName, setHotelName] = useState(settings.name);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [gstNumber, setGstNumber] = useState(settings.gstNumber);
  const [taxRate, setTaxRate] = useState(settings.taxRate);
  const [barTaxRate, setBarTaxRate] = useState(settings.barTaxRate);
  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoicePrefix);

  // New Menu Item
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuPrice, setNewMenuPrice] = useState(0);
  const [newMenuCategory, setNewMenuCategory] = useState('Breakfast');
  const [isBarItem, setIsBarItem] = useState(false);

  const [activeSettingsTab, setActiveSettingsTab] = useState<'hotel' | 'menu'>('hotel');

  const foodCategories = ['Breakfast', 'Lunch', 'Dinner', 'Beverages', 'Desserts'];
  const barCategories = ['Beer', 'Whisky', 'Rum', 'Vodka', 'Wine', 'Cocktails', 'Snacks'];

  const handleHotelSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to context settings
    settings.name = hotelName;
    settings.address = address;
    settings.phone = phone;
    settings.email = email;
    settings.gstNumber = gstNumber;
    settings.taxRate = taxRate;
    settings.barTaxRate = barTaxRate;
    settings.invoicePrefix = invoicePrefix;
    
    // Save settings to LocalStorage manually to persist
    localStorage.setItem('hv_settings', JSON.stringify(settings));

    addAudit('Save Settings', 'Updated hotel metadata details and general taxation structures.');
    alert('Hotel settings updated successfully!');
  };

  const handleAddMenuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuName || newMenuPrice <= 0) return;

    const newItem: MenuItem = {
      id: 'menu_' + Date.now(),
      name: newMenuName,
      price: newMenuPrice,
      category: newMenuCategory,
      isBar: isBarItem,
      isAvailable: true
    };

    menuItems.push(newItem);
    localStorage.setItem('hv_menu_items', JSON.stringify(menuItems));

    // Automatically seed inventory tracking if it's food or liquor
    addInventoryItem({
      name: newMenuName,
      category: isBarItem ? 'Liquor' : 'Food',
      stock: 10, // default opening stock
      minStock: 3,
      unit: isBarItem ? 'bottle' : 'packet',
      barcode: 'BAR-' + Math.floor(100000 + Math.random() * 900000)
    });

    addAudit('Create Menu Item', `Added ${newMenuName} (₹${newMenuPrice}) to ${newMenuCategory} menu.`);

    // Reset Form
    setNewMenuName('');
    setNewMenuPrice(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. Sub Tabs Panel */}
      <div className="lg:col-span-1 p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm space-y-4 h-fit">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-350 flex items-center gap-1.5 border-b pb-2 border-slate-100 dark:border-slate-800">
          <Settings className="w-4 h-4 text-indigo-500" /> ERP Settings Configuration
        </h3>

        <div className="space-y-1.5 flex flex-col">
          <button
            onClick={() => setActiveSettingsTab('hotel')}
            className={`w-full px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
              activeSettingsTab === 'hotel' 
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 font-bold' 
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            Hotel Details & Taxation Settings
          </button>
          
          <button
            onClick={() => {
              setActiveSettingsTab('menu');
              setNewMenuCategory(isBarItem ? 'Beer' : 'Breakfast');
            }}
            className={`w-full px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
              activeSettingsTab === 'menu' 
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 font-bold' 
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            Manage Restaurant & Bar Menu List
          </button>
        </div>
      </div>

      {/* 2. Detail view panel */}
      <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm">
        
        {/* Hotel Details Edit Form */}
        {activeSettingsTab === 'hotel' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-455 border-b pb-2 border-slate-100 dark:border-slate-800">
              Hotel Information Metadata & Taxes config
            </h3>

            <form onSubmit={handleHotelSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Hotel Name *</label>
                  <input
                    type="text"
                    required
                    value={hotelName}
                    onChange={e => setHotelName(e.target.value)}
                    className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">GST Registration Number *</label>
                  <input
                    type="text"
                    required
                    value={gstNumber}
                    onChange={e => setGstNumber(e.target.value)}
                    className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500">Complete Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t pt-4 border-slate-100 dark:border-slate-800/80">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">General GST Tax (%)</label>
                  <input
                    type="number"
                    min={0}
                    value={taxRate}
                    onChange={e => setTaxRate(Number(e.target.value))}
                    className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Bar VAT / Tax (%)</label>
                  <input
                    type="number"
                    min={0}
                    value={barTaxRate}
                    onChange={e => setBarTaxRate(Number(e.target.value))}
                    className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Invoice Prefix *</label>
                  <input
                    type="text"
                    required
                    value={invoicePrefix}
                    onChange={e => setInvoicePrefix(e.target.value)}
                    className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all text-xs"
              >
                <Save className="w-4 h-4" /> Save Metadata Settings
              </button>
            </form>
          </div>
        )}

        {/* Menu Items Manager */}
        {activeSettingsTab === 'menu' && (
          <div className="space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-455 border-b pb-2 border-slate-100 dark:border-slate-800">
              Customize POS Menu & Catalog Items
            </h3>

            {/* Form to add item */}
            <form onSubmit={handleAddMenuSubmit} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl space-y-3.5 text-xs">
              <span className="font-bold text-[10px] uppercase text-indigo-500 block">Create New Dish / Drink Record</span>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Catalog Item Name *</label>
                  <input
                    type="text"
                    required
                    value={newMenuName}
                    onChange={e => setNewMenuName(e.target.value)}
                    className="w-full p-2 border dark:border-slate-800 dark:bg-slate-900 rounded-lg"
                    placeholder="e.g. Garlic Naan"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Item Unit Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newMenuPrice}
                    onChange={e => setNewMenuPrice(Number(e.target.value))}
                    className="w-full p-2 border dark:border-slate-800 dark:bg-slate-900 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-end">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Target Category *</label>
                  <select
                    value={newMenuCategory}
                    onChange={e => setNewMenuCategory(e.target.value)}
                    className="w-full p-2 border dark:border-slate-800 dark:bg-slate-900 rounded-lg font-semibold"
                  >
                    {(isBarItem ? barCategories : foodCategories).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                {/* Bar vs Food Toggle */}
                <div className="flex items-center justify-between p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900">
                  <span className="font-semibold text-slate-550 pl-1">Is this Liquor / Bar?</span>
                  <button
                    type="button"
                    onClick={() => {
                      const nextMode = !isBarItem;
                      setIsBarItem(nextMode);
                      setNewMenuCategory(nextMode ? 'Beer' : 'Breakfast');
                    }}
                    className="p-1 rounded text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {isBarItem ? <ToggleRight className="w-7 h-7 text-violet-500" /> : <ToggleLeft className="w-7 h-7 text-slate-400" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-colors mt-2"
              >
                Create Menu Entry
              </button>

            </form>

            {/* Menu List preview */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Existing Menu Items Preview</span>
              <div className="max-h-[300px] overflow-y-auto border border-slate-100 dark:border-slate-800/80 rounded-xl divide-y divide-slate-100 dark:divide-slate-800/50">
                {menuItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-850 dark:text-slate-150">{item.name}</p>
                      <span className="text-[9px] text-slate-400 font-semibold uppercase">{item.category} ● {item.isBar ? 'Bar Liquor' : 'Restaurant Food'}</span>
                    </div>
                    <span className="font-bold font-mono text-indigo-500">₹{item.price}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
