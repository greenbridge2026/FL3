import React, { useState } from 'react';
import { useApp, TenantAccount, UserRole } from '../context/AppContext';
import { 
  Building2, 
  Plus, 
  ShieldCheck, 
  Users, 
  Activity, 
  Search, 
  ExternalLink, 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Lock, 
  Key, 
  Zap, 
  Server, 
  Crown,
  UserPlus,
  RefreshCw
} from 'lucide-react';

export const SuperAdminView: React.FC = () => {
  const { 
    tenants, 
    addTenantAccount, 
    updateTenantStatus, 
    deleteTenantAccount, 
    userAccounts, 
    addUserAccount, 
    deleteUserAccount, 
    auditLogs, 
    switchTenantContext,
    switchRole
  } = useApp();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Provisioning' | 'Suspended'>('All');
  
  // Modal States
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // New Tenant Form State
  const [tenantName, setTenantName] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantGst, setTenantGst] = useState('');
  const [tenantSubdomain, setTenantSubdomain] = useState('');
  const [tenantTier, setTenantTier] = useState<'Boutique' | 'Standard ERP' | 'Enterprise Multi-Property'>('Enterprise Multi-Property');
  const [maxRooms, setMaxRooms] = useState(100);
  const [adminPassword, setAdminPassword] = useState('tenant123');

  // New User Account Form State
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('reception');
  const [userTenantName, setUserTenantName] = useState('');

  // Handle New Tenant Submission
  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName || !tenantEmail) return;

    const slug = tenantSlug || tenantName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const subdomain = tenantSubdomain || `${slug}.hotelvista.com`;

    addTenantAccount({
      name: tenantName,
      slug,
      email: tenantEmail,
      phone: tenantPhone || '+91 98765 00000',
      gstNumber: tenantGst || '36AAACH0000K1Z0',
      subdomain,
      currency: 'INR (₹)',
      tier: tenantTier,
      status: 'Active',
      maxRooms: Number(maxRooms) || 100,
      adminEmail: tenantEmail
    }, adminPassword);

    // Reset Form
    setTenantName('');
    setTenantSlug('');
    setTenantEmail('');
    setTenantPhone('');
    setTenantGst('');
    setTenantSubdomain('');
    setAdminPassword('tenant123');
    setShowAddTenantModal(false);
  };

  // Handle New User Account Submission
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userEmail || !userPassword) return;

    const targetTenant = userTenantName || (tenants[0] ? tenants[0].name : 'HotelVista Grand');

    addUserAccount({
      name: userName,
      email: userEmail,
      password: userPassword,
      role: userRole,
      tenantName: targetTenant,
      status: 'Active'
    });

    setUserName('');
    setUserEmail('');
    setUserPassword('');
    setShowAddUserModal(false);
  };

  // Filtered Tenants
  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.subdomain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black rounded-full uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" /> Super Admin SaaS Portal
              </span>
              <span className="text-xs text-indigo-300 font-mono">Multi-Tenant Central Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-3 tracking-tight text-white">
              Global Tenant & Organization Management
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Create, configure, and monitor multi-tenant hotel accounts across the HotelVista ERP SaaS network.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddTenantModal(true)}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 text-xs transition-all flex items-center gap-2 transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Onboard New Tenant Property</span>
            </button>
          </div>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Hotel Tenants</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{tenants.length}</span>
            <span className="text-xs font-semibold text-emerald-500">100% Online</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Multi-Tenant Hotel Properties</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Provisioned User Accounts</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{userAccounts.length}</span>
            <span className="text-xs font-semibold text-indigo-500">Active Licenses</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Staff & Admin Logins</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Network Uptime</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">99.99%</span>
            <span className="text-xs font-semibold text-emerald-500">Healthy</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Isolated Tenant Databases</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated SaaS MRR</span>
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
              <Crown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">₹1.85L</span>
            <span className="text-xs font-semibold text-emerald-500">/ month</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Enterprise Subscription Volume</p>
        </div>

      </div>

      {/* MULTI-TENANT PROPERTY DIRECTORY */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-500" />
              <span>Multi-Tenant Property Directory</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage client organizations, subscription tiers, and tenant admin access.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search tenant name or domain..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none w-64"
              />
            </div>

            {/* Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Provisioning">Provisioning</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                <th className="py-3 px-4">Hotel Property & Domain</th>
                <th className="py-3 px-4">Contact Admin</th>
                <th className="py-3 px-4">Subscription Tier</th>
                <th className="py-3 px-4">Room Limit</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No matching multi-tenant accounts found.
                  </td>
                </tr>
              ) : (
                filteredTenants.map(tenant => (
                  <tr key={tenant.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{tenant.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Globe className="w-3 h-3 text-indigo-500" />
                          <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">{tenant.subdomain}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{tenant.email}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{tenant.phone}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-300 border border-violet-500/20">
                        <Crown className="w-3 h-3" />
                        {tenant.tier}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                        {tenant.maxRooms || 100} Rooms
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {tenant.status === 'Active' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      )}
                      {tenant.status === 'Provisioning' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1 w-max">
                          <RefreshCw className="w-3 h-3 animate-spin" /> Provisioning
                        </span>
                      )}
                      {tenant.status === 'Suspended' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1 w-max">
                          <AlertTriangle className="w-3 h-3" /> Suspended
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      {tenant.createdAt}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        
                        {/* Impersonate / Launch Tenant View */}
                        <button
                          onClick={() => {
                            switchTenantContext(tenant.id);
                            switchRole('admin');
                          }}
                          className="px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 font-bold rounded-lg text-[10px] transition-all flex items-center gap-1"
                          title="Impersonate & View Tenant ERP Dashboard"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View ERP</span>
                        </button>

                        {/* Status Toggle */}
                        <button
                          onClick={() => updateTenantStatus(tenant.id, tenant.status === 'Active' ? 'Suspended' : 'Active')}
                          className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-[10px] transition-all"
                          title="Toggle Tenant Account Status"
                        >
                          {tenant.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>

                        {/* Delete Tenant */}
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete multi-tenant account "${tenant.name}"?`)) {
                              deleteTenantAccount(tenant.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Delete Tenant Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* USER ACCOUNTS MANAGEMENT */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              <span>Global Client User Accounts Directory</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active staff and administrator accounts across all hotel property tenants.
            </p>
          </div>

          <button
            onClick={() => setShowAddUserModal(true)}
            className="px-4 py-2 bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New User Account</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                <th className="py-3 px-4">User Name</th>
                <th className="py-3 px-4">Email ID</th>
                <th className="py-3 px-4">Password</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Property Tenant</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {userAccounts.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{user.name}</td>
                  <td className="py-3 px-4 font-mono text-indigo-600 dark:text-indigo-400">{user.email}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{user.password}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-bold uppercase text-[10px] text-slate-700 dark:text-slate-300">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">{user.tenantName}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{user.createdAt}</td>
                  <td className="py-3 px-4 text-right">
                    {user.role !== 'super_admin' && (
                      <button
                        onClick={() => deleteUserAccount(user.id)}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                        title="Delete User Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* CREATE NEW TENANT MODAL */}
      {showAddTenantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5">
            
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Onboard New Hotel Property Tenant
                  </h3>
                  <p className="text-xs text-slate-500">Configure multi-tenant organization & credentials</p>
                </div>
              </div>
              <button onClick={() => setShowAddTenantModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-500 block mb-1">Hotel Property Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grand Palace Resort"
                    value={tenantName}
                    onChange={e => setTenantName(e.target.value)}
                    className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 block mb-1">Subdomain Slug</label>
                  <input
                    type="text"
                    placeholder="grandpalace"
                    value={tenantSlug}
                    onChange={e => setTenantSlug(e.target.value)}
                    className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-500 block mb-1">Admin Email ID *</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@grandpalace.com"
                    value={tenantEmail}
                    onChange={e => setTenantEmail(e.target.value)}
                    className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 block mb-1">Initial Admin Password</label>
                  <input
                    type="text"
                    required
                    placeholder="tenant123"
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-500 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={tenantPhone}
                    onChange={e => setTenantPhone(e.target.value)}
                    className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 block mb-1">GST Number</label>
                  <input
                    type="text"
                    placeholder="36AAACH1234M1Z5"
                    value={tenantGst}
                    onChange={e => setTenantGst(e.target.value)}
                    className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl font-mono uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-500 block mb-1">Subscription Tier</label>
                  <select
                    value={tenantTier}
                    onChange={e => setTenantTier(e.target.value as any)}
                    className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Boutique">Boutique (Basic)</option>
                    <option value="Standard ERP">Standard ERP</option>
                    <option value="Enterprise Multi-Property">Enterprise Multi-Property</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-500 block mb-1">Max Room Capacity</label>
                  <input
                    type="number"
                    value={maxRooms}
                    onChange={e => setMaxRooms(Number(e.target.value))}
                    className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTenantModal(false)}
                  className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20"
                >
                  Provision Tenant Account
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* CREATE NEW USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Create Tenant User Account</h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-500 block mb-1">Select Property Tenant</label>
                <select
                  value={userTenantName}
                  onChange={e => setUserTenantName(e.target.value)}
                  className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl font-bold"
                >
                  {tenants.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-500 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 block mb-1">Email ID</label>
                <input
                  type="email"
                  required
                  placeholder="john@hotel.com"
                  value={userEmail}
                  onChange={e => setUserEmail(e.target.value)}
                  className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 block mb-1">Password</label>
                <input
                  type="text"
                  required
                  placeholder="123456"
                  value={userPassword}
                  onChange={e => setUserPassword(e.target.value)}
                  className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 block mb-1">Role Permission</label>
                <select
                  value={userRole}
                  onChange={e => setUserRole(e.target.value as any)}
                  className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl font-bold"
                >
                  <option value="admin">Administrator</option>
                  <option value="reception">Receptionist</option>
                  <option value="restaurant">Restaurant Staff</option>
                  <option value="bar">Bar Staff</option>
                  <option value="store_manager">Store Manager</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowAddUserModal(false)} className="px-4 py-2 text-slate-500 font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl">Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
