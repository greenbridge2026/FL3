import React, { useState } from 'react';
import { useApp, MenuItem, HotelSettings, RoomCategory } from '../context/AppContext';
import { Settings, Plus, ToggleLeft, ToggleRight, Save, UtensilsCrossed, Trash2, AlertTriangle } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, menuItems, addInventoryItem, addAudit, addMenuItem, updateSettings, rooms, addRoom, deleteRoom, resetTenantData } = useApp();

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

  const [activeSettingsTab, setActiveSettingsTab] = useState<'hotel' | 'menu' | 'rooms'>('hotel');

  // New Room States
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomFloor, setNewRoomFloor] = useState(1);
  const [newRoomCategory, setNewRoomCategory] = useState<RoomCategory>('Standard');
  const [newRoomPrice, setNewRoomPrice] = useState(1500);

  const foodCategories = ['Breakfast', 'Lunch', 'Dinner', 'Beverages', 'Desserts'];
  const barCategories = ['Beer', 'Whisky', 'Rum', 'Vodka', 'Wine', 'Cocktails', 'Snacks'];

  const handleHotelSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedSettings: HotelSettings = {
      name: hotelName,
      address,
      phone,
      email,
      gstNumber,
      taxRate,
      barTaxRate,
      invoicePrefix
    };
    
    updateSettings(updatedSettings);

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

    addMenuItem(newItem);

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

  const handleAddRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber || newRoomPrice <= 0) return;

    const exists = rooms.some(r => r.roomNumber === newRoomNumber);
    if (exists) {
      alert(`Room number ${newRoomNumber} already exists!`);
      return;
    }

    await addRoom({
      id: 'r_' + newRoomNumber + '_' + Date.now(),
      roomNumber: newRoomNumber,
      category: newRoomCategory,
      floor: newRoomFloor,
      price: newRoomPrice
    });

    alert(`Room ${newRoomNumber} created successfully!`);
    setNewRoomNumber('');
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

          <button
            onClick={() => setActiveSettingsTab('rooms')}
            className={`w-full px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
              activeSettingsTab === 'rooms' 
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 font-bold' 
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            Manage Rooms List
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

            {/* Danger Zone */}
            <div className="mt-8 p-5 border border-rose-200/60 dark:border-rose-950/40 rounded-2xl bg-rose-50/10 dark:bg-rose-950/5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" /> Danger Zone
              </h4>
              <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed">
                Clearing all records will permanently wipe all guest logs, booking records, menu item catalogs, sales logs, laundry details, stock levels, and audit logs. Your rooms will be reset to a clean, vacant list. This action cannot be undone.
              </p>
              <button
                type="button"
                onClick={async () => {
                  if (confirm("WARNING: Are you sure you want to WIPE all records? This will delete all history and reset rooms to vacant. This cannot be undone!")) {
                    const confirmText = prompt("Type 'RESET' to confirm database deletion:");
                    if (confirmText === 'RESET') {
                      await resetTenantData();
                    } else {
                      alert('Reset aborted.');
                    }
                  }
                }}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-colors text-xs flex items-center gap-1.5 active:scale-[0.99]"
              >
                <Trash2 className="w-4 h-4" /> Reset Database to Fresh State
              </button>
            </div>
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

        {/* Rooms Manager */}
        {activeSettingsTab === 'rooms' && (
          <div className="space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-455 border-b pb-2 border-slate-100 dark:border-slate-800">
              Customize Rooms Inventory & Pricing
            </h3>

            {/* Form to add Room */}
            <form onSubmit={handleAddRoomSubmit} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl space-y-3.5 text-xs">
              <span className="font-bold text-[10px] uppercase text-indigo-500 block">Create New Hotel Room</span>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Room Number *</label>
                  <input
                    type="text"
                    required
                    value={newRoomNumber}
                    onChange={e => setNewRoomNumber(e.target.value)}
                    className="w-full p-2 border dark:border-slate-800 dark:bg-slate-900 rounded-lg font-bold"
                    placeholder="e.g. 107"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Floor Number *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newRoomFloor}
                    onChange={e => setNewRoomFloor(Number(e.target.value))}
                    className="w-full p-2 border dark:border-slate-800 dark:bg-slate-900 rounded-lg font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Room Category *</label>
                  <select
                    value={newRoomCategory}
                    onChange={e => setNewRoomCategory(e.target.value as RoomCategory)}
                    className="w-full p-2 border dark:border-slate-800 dark:bg-slate-900 rounded-lg font-semibold"
                  >
                    {['Standard', 'Semi Premium', 'Premium', 'Suite', 'Family Suite', 'Dormitory'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Room Rent Price (₹/day) *</label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={newRoomPrice}
                    onChange={e => setNewRoomPrice(Number(e.target.value))}
                    className="w-full p-2 border dark:border-slate-800 dark:bg-slate-900 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-colors mt-2"
              >
                Create Room Entry
              </button>
            </form>

            {/* Rooms List preview with Delete */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Existing Rooms Catalog ({rooms.length})</span>
              <div className="max-h-[300px] overflow-y-auto border border-slate-100 dark:border-slate-800/80 rounded-xl divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-slate-900">
                {rooms.map(room => (
                  <div key={room.id} className="flex justify-between items-center p-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-850 dark:text-slate-150 flex items-center gap-2">
                        <span>Room {room.roomNumber}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">{room.category}</span>
                      </p>
                      <span className="text-[9px] text-slate-450 font-semibold">Floor {room.floor} • ₹{room.price}/day • Status: <span className="font-bold text-emerald-500">{room.status}</span></span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={async () => {
                          if (room.status !== 'Available') {
                            alert('Cannot delete an active, occupied or reserved room!');
                            return;
                          }
                          if (confirm(`Are you sure you want to delete Room ${room.roomNumber}?`)) {
                            await deleteRoom(room.id);
                          }
                        }}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                        title="Delete Room"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
