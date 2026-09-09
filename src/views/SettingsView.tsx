import React, { useState } from 'react';
import { useApp, MenuItem, UserRole } from '../context/AppContext';
import { 
  Settings, 
  Plus, 
  ToggleLeft, 
  ToggleRight, 
  Building2, 
  Users, 
  Globe, 
  ShieldCheck, 
  CheckCircle, 
  UtensilsCrossed, 
  Landmark, 
  Check, 
  Key,
  Trash2,
  Lock,
  UserCheck
} from 'lucide-react';

export interface TenantAccount {
  id: string;
  slug: string;
  name: string;
  email: string;
  phone: string;
  gstNumber: string;
  subdomain: string;
  currency: string;
  tier: 'Boutique' | 'Standard ERP' | 'Enterprise Multi-Property';
  status: 'Active' | 'Provisioning' | 'Suspended';
  createdAt: string;
}

export const SettingsView: React.FC = () => {
  const { 
    settings, 
    menuItems, 
    userAccounts, 
    addUserAccount, 
    deleteUserAccount, 
    switchRole, 
    addInventoryItem, 
    addAudit 
  } = useApp();

  // Hotel settings local copy
  const [hotelName, setHotelName] = useState(settings.name);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [gstNumber, setGstNumber] = useState(settings.gstNumber);
  const [taxRate, setTaxRate] = useState(settings.taxRate);
  const [barTaxRate, setBarTaxRate] = useState(settings.barTaxRate);
  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoicePrefix);

  // New Menu Item Form
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuPrice, setNewMenuPrice] = useState(0);
  const [newMenuCategory, setNewMenuCategory] = useState('Breakfast');
  const [isBarItem, setIsBarItem] = useState(false);

  // Settings Sub-Tabs
  const [activeSettingsTab, setActiveSettingsTab] = useState<'hotel' | 'tenants' | 'users' | 'menu'>('hotel');

  // Multi-Tenant Accounts List State
  const [tenants, setTenants] = useState<TenantAccount[]>(() => {
    const saved = localStorage.getItem('hv_tenants');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 't_merridien',
        slug: 'hotel-le-merridien',
        name: 'Hotel Le Merridien',
        email: 'merridien@hotel.com',
        phone: '+91 98765 11223',
        gstNumber: '36AAACH1234M1Z5',
        subdomain: 'merridien.hotelvista.com',
        currency: 'INR (₹)',
        tier: 'Enterprise Multi-Property',
        status: 'Active',
        createdAt: '2026-01-01'
      },
      {
        id: 't_main',
        slug: 'hotelvista-main',
        name: settings.name || 'HotelVista Grand - Main Property',
        email: settings.email || 'admin@hotelvista.com',
        phone: settings.phone || '+91 98765 43210',
        gstNumber: settings.gstNumber || '36AAACH7412K1Z9',
        subdomain: 'main.hotelvista.com',
        currency: 'INR (₹)',
        tier: 'Enterprise Multi-Property',
        status: 'Active',
        createdAt: '2026-01-01'
      }
    ];
  });

  const [activeTenantId, setActiveTenantId] = useState<string>(() => {
    return localStorage.getItem('hv_active_tenant_id') || 't_merridien';
  });

  // New Tenant Registration Form State
  const [tenantName, setTenantName] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantGst, setTenantGst] = useState('');
  const [tenantSubdomain, setTenantSubdomain] = useState('');
  const [tenantCurrency, setTenantCurrency] = useState('INR (₹)');
  const [tenantTier, setTenantTier] = useState<'Boutique' | 'Standard ERP' | 'Enterprise Multi-Property'>('Standard ERP');

  // New Client User Account Form State
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [clientRole, setClientRole] = useState<UserRole>('admin');
  const [clientTenantName, setClientTenantName] = useState('Hotel Le Merridien');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const foodCategories = ['Breakfast', 'Lunch', 'Dinner', 'Beverages', 'Desserts'];
  const barCategories = ['Beer', 'Whisky', 'Rum', 'Vodka', 'Wine', 'Cocktails', 'Snacks'];

  const handleHotelSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    settings.name = hotelName;
    settings.address = address;
    settings.phone = phone;
    settings.email = email;
    settings.gstNumber = gstNumber;
    settings.taxRate = taxRate;
    settings.barTaxRate = barTaxRate;
    settings.invoicePrefix = invoicePrefix;
    
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

    addInventoryItem({
      name: newMenuName,
      category: isBarItem ? 'Liquor' : 'Food',
      stock: 10,
      minStock: 3,
      unit: isBarItem ? 'bottle' : 'packet',
      barcode: 'BAR-' + Math.floor(100000 + Math.random() * 900000)
    });

    addAudit('Create Menu Item', `Added ${newMenuName} (₹${newMenuPrice}) to ${newMenuCategory} menu.`);

    setNewMenuName('');
    setNewMenuPrice(0);
  };

  // Create New Multi-Tenant Account
  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName || !tenantEmail) return;

    const generatedSlug = tenantSlug || tenantName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const generatedSubdomain = tenantSubdomain || `${generatedSlug}.hotelvista.com`;

    const newTenant: TenantAccount = {
      id: 't_' + Date.now(),
      slug: generatedSlug,
      name: tenantName,
      email: tenantEmail,
      phone: tenantPhone || '+91 90000 00000',
      gstNumber: tenantGst || 'UNREGISTERED-GST',
      subdomain: generatedSubdomain,
      currency: tenantCurrency,
      tier: tenantTier,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updated = [newTenant, ...tenants];
    setTenants(updated);
    localStorage.setItem('hv_tenants', JSON.stringify(updated));

    setActiveTenantId(newTenant.id);
    localStorage.setItem('hv_active_tenant_id', newTenant.id);

    // Automatically create admin client credentials for the new tenant
    addUserAccount({
      name: `${tenantName} Admin`,
      email: tenantEmail,
      password: '123456',
      role: 'admin',
      tenantName: tenantName,
      status: 'Active'
    });

    addAudit('Multi-Tenant Provision', `Created & provisioned new tenant: ${tenantName} (${generatedSubdomain}) with admin user ${tenantEmail}`);

    setTenantName('');
    setTenantSlug('');
    setTenantEmail('');
    setTenantPhone('');
    setTenantGst('');
    setTenantSubdomain('');

    alert(`Tenant account "${newTenant.name}" and client login (${tenantEmail} / 123456) created successfully!`);
  };

  const handleSwitchTenant = (tenant: TenantAccount) => {
    setActiveTenantId(tenant.id);
    localStorage.setItem('hv_active_tenant_id', tenant.id);
    
    setHotelName(tenant.name);
    setEmail(tenant.email);
    setPhone(tenant.phone);
    setGstNumber(tenant.gstNumber);

    settings.name = tenant.name;
    settings.email = tenant.email;
    settings.phone = tenant.phone;
    settings.gstNumber = tenant.gstNumber;
    localStorage.setItem('hv_settings', JSON.stringify(settings));

    addAudit('Tenant Switch', `Switched active property account context to ${tenant.name}`);
  };

  // Create New Client User Credentials
  const handleCreateUserAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientEmail || !clientPassword) return;

    addUserAccount({
      name: clientName || `${clientRole.toUpperCase()} User`,
      email: clientEmail,
      password: clientPassword,
      role: clientRole,
      tenantName: clientTenantName,
      status: 'Active'
    });

    setClientName('');
    setClientEmail('');
    setClientPassword('');
    alert(`Client user credentials for ${clientEmail} created successfully!`);
  };

  const toggleShowPassword = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
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
            onClick={() => setActiveSettingsTab('tenants')}
            className={`w-full px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition-all flex items-center justify-between ${
              activeSettingsTab === 'tenants' 
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 font-bold' 
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <span>Multi-Tenant Organizations</span>
            <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-full text-[10px] font-mono">
              {tenants.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSettingsTab('users')}
            className={`w-full px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition-all flex items-center justify-between ${
              activeSettingsTab === 'users' 
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 font-bold' 
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <span>User Accounts & Credentials</span>
            <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-mono">
              {userAccounts.length}
            </span>
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

        {/* Active Property Account Card */}
        {(() => {
          const currentTenant = tenants.find(t => t.id === activeTenantId) || tenants[0];
          return (
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border dark:border-slate-800 space-y-1.5 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Property Context</span>
              <p className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {currentTenant.name}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">{currentTenant.subdomain}</p>
            </div>
          );
        })()}

      </div>

      {/* 2. Detail View Panel */}
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
                className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors"
              >
                Save Hotel Settings
              </button>
            </form>
          </div>
        )}

        {/* Multi-Tenant Organizations Management */}
        {activeSettingsTab === 'tenants' && (
          <div className="space-y-6">
            
            <div className="border-b pb-3 border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-500" />
                  Multi-Tenant Property Organizations & Account Management
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Create and manage isolated multi-tenant property accounts, domain slugs, and license tiers
                </p>
              </div>
            </div>

            {/* List of Registered Tenants */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Registered Property Accounts ({tenants.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tenants.map(t => {
                  const isActive = t.id === activeTenantId;
                  return (
                    <div 
                      key={t.id} 
                      className={`p-4 rounded-xl border transition-all space-y-2 ${
                        isActive 
                          ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-sm' 
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-xs">{t.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{t.subdomain}</p>
                        </div>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                          t.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {t.status}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-500 space-y-0.5 font-mono">
                        <p>Owner: {t.email}</p>
                        <p>GSTIN: {t.gstNumber}</p>
                        <p>Tier: {t.tier} ({t.currency})</p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex justify-between items-center">
                        {isActive ? (
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Currently Active Account
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSwitchTenant(t)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition-all"
                          >
                            Switch to this Tenant
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Create New Multi-Tenant Account Form */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border dark:border-slate-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-indigo-500" /> Provision New Multi-Tenant Property Account
              </h4>

              <form onSubmit={handleCreateTenant} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Property / Tenant Name *</label>
                    <input
                      type="text"
                      required
                      value={tenantName}
                      onChange={e => {
                        setTenantName(e.target.value);
                        if (!tenantSlug) {
                          setTenantSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                        }
                      }}
                      className="w-full p-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                      placeholder="e.g. Hotel Le Merridien"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Tenant Slug / ID *</label>
                    <input
                      type="text"
                      required
                      value={tenantSlug}
                      onChange={e => setTenantSlug(e.target.value)}
                      className="w-full p-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl font-mono text-xs"
                      placeholder="hotel-le-merridien"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Owner / Admin Email *</label>
                    <input
                      type="email"
                      required
                      value={tenantEmail}
                      onChange={e => setTenantEmail(e.target.value)}
                      className="w-full p-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                      placeholder="merridien@hotel.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Phone Contact</label>
                    <input
                      type="text"
                      value={tenantPhone}
                      onChange={e => setTenantPhone(e.target.value)}
                      className="w-full p-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                      placeholder="+91 98765 11223"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Subdomain</label>
                    <input
                      type="text"
                      value={tenantSubdomain}
                      onChange={e => setTenantSubdomain(e.target.value)}
                      className="w-full p-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl font-mono text-[11px]"
                      placeholder="merridien.hotelvista.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">License Tier</label>
                    <select
                      value={tenantTier}
                      onChange={e => setTenantTier(e.target.value as any)}
                      className="w-full p-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl font-semibold"
                    >
                      <option value="Boutique">Boutique Hotel</option>
                      <option value="Standard ERP">Standard ERP</option>
                      <option value="Enterprise Multi-Property">Enterprise Multi-Property</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Currency</label>
                    <select
                      value={tenantCurrency}
                      onChange={e => setTenantCurrency(e.target.value)}
                      className="w-full p-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl font-semibold"
                    >
                      <option value="INR (₹)">INR (₹)</option>
                      <option value="USD ($)">USD ($)</option>
                      <option value="EUR (€)">EUR (€)</option>
                      <option value="AED (🇦🇪)">AED (🇦🇪)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  Create & Provision Tenant Account
                </button>
              </form>
            </div>

          </div>
        )}

        {/* User Accounts & Client Credentials Management */}
        {activeSettingsTab === 'users' && (
          <div className="space-y-6">
            
            <div className="border-b pb-3 border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-500" />
                  Client User Accounts & Login Credentials Management
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Create and manage client email IDs, passwords, roles, and assigned property tenants
                </p>
              </div>
            </div>

            {/* List of Client User Accounts */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Active Client Accounts ({userAccounts.length})
              </h4>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      <th className="py-2.5 px-3">Client / User Name</th>
                      <th className="py-2.5 px-3">Email ID (Username)</th>
                      <th className="py-2.5 px-3 font-mono">Password</th>
                      <th className="py-2.5 px-3">Assigned Role</th>
                      <th className="py-2.5 px-3">Property / Tenant</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {userAccounts.map(u => {
                      const isShown = showPasswords[u.id];
                      return (
                        <tr key={u.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                          <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                            {u.name}
                          </td>
                          <td className="py-3 px-3 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                            {u.email}
                          </td>
                          <td className="py-3 px-3 font-mono">
                            <div className="flex items-center gap-1.5">
                              <span>{isShown ? u.password : '••••••••'}</span>
                              <button
                                onClick={() => toggleShowPassword(u.id)}
                                className="text-[10px] text-slate-400 hover:text-slate-600 underline"
                              >
                                {isShown ? 'Hide' : 'Show'}
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-semibold">
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] uppercase font-mono">
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-500">
                            {u.tenantName}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  switchRole(u.role);
                                  alert(`Switched context to ${u.name} (${u.email})!`);
                                }}
                                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold transition-all flex items-center gap-1"
                              >
                                <UserCheck className="w-3 h-3" />
                                Switch Role
                              </button>

                              {u.email !== 'admin@hotelvista.com' && (
                                <button
                                  onClick={() => deleteUserAccount(u.id)}
                                  className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Create New Client User Account Form */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border dark:border-slate-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-500" /> Create New Client Credentials & User Account
              </h4>

              <form onSubmit={handleCreateUserAccount} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Client / Full Name *</label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      className="w-full p-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                      placeholder="e.g. Le Merridien Manager"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Email ID (Username) *</label>
                    <input
                      type="email"
                      required
                      value={clientEmail}
                      onChange={e => setClientEmail(e.target.value)}
                      className="w-full p-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl font-mono text-xs"
                      placeholder="merridien@hotel.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Password *</label>
                    <input
                      type="text"
                      required
                      value={clientPassword}
                      onChange={e => setClientPassword(e.target.value)}
                      className="w-full p-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl font-mono text-xs"
                      placeholder="123456"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Assigned Role *</label>
                    <select
                      value={clientRole}
                      onChange={e => setClientRole(e.target.value as UserRole)}
                      className="w-full p-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl font-semibold"
                    >
                      <option value="admin">Administrator</option>
                      <option value="reception">Receptionist</option>
                      <option value="restaurant">Restaurant Staff</option>
                      <option value="bar">Bar Staff</option>
                      <option value="store_manager">Store Manager</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Property / Tenant *</label>
                    <input
                      type="text"
                      required
                      value={clientTenantName}
                      onChange={e => setClientTenantName(e.target.value)}
                      className="w-full p-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl font-semibold"
                      placeholder="Hotel Le Merridien"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  Create & Provision Client Account
                </button>
              </form>
            </div>

          </div>
        )}

        {/* Manage Restaurant & Bar Menu List */}
        {activeSettingsTab === 'menu' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-455 border-b pb-2 border-slate-100 dark:border-slate-800">
              Master Food & Beverage Menu Items
            </h3>

            <form onSubmit={handleAddMenuSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={newMenuName}
                    onChange={e => setNewMenuName(e.target.value)}
                    className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg"
                    placeholder="e.g. Chicken Biryani"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Unit Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newMenuPrice}
                    onChange={e => setNewMenuPrice(Number(e.target.value))}
                    className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Category *</label>
                  <select
                    value={newMenuCategory}
                    onChange={e => setNewMenuCategory(e.target.value)}
                    className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg font-semibold"
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

            {/* Menu List Preview */}
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
