import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  LogIn, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Crown, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Key,
  Globe,
  ArrowRight
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { loginUser, userAccounts } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginType, setLoginType] = useState<'client' | 'superadmin'>('client');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = loginUser(email, password);
    if (!res.success) {
      setError(res.error || 'Invalid credentials');
    }
  };

  const handleQuickLogin = (accEmail: string, accPass: string) => {
    setEmail(accEmail);
    setPassword(accPass);
    setError(null);
    const res = loginUser(accEmail, accPass);
    if (!res.success) {
      setError(res.error || 'Invalid quick login credentials');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-slate-100 overflow-y-auto p-4 sm:p-6 font-sans">
      
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 bg-slate-900/90 border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl z-10 my-auto">
        
        {/* LEFT PANEL: SAAS BRANDING & MULTI-TENANT PROMO */}
        <div className="md:col-span-5 bg-gradient-to-br from-indigo-900/90 via-slate-900 to-violet-950 p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 relative overflow-hidden">
          
          <div className="relative z-10 space-y-6">
            
            {/* Brand Identity */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/30">
                HV
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-white">HotelVista ERP</h1>
                <p className="text-xs text-indigo-300 font-semibold">Multi-Tenant Hotel Platform</p>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-4 pt-4">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                SaaS Enterprise Capabilities
              </h2>
              
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">Multi-Property Tenant Isolation & Cloud Billing</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">Integrated Front Desk, Restaurant, Bar & Laundry POS</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">Super Admin Global Control & Property Onboarding</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">Role-Based Access Security & Audit Logging</span>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Badge */}
          <div className="pt-8 relative z-10">
            <div className="p-3 bg-slate-900/60 rounded-2xl border border-indigo-500/20 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Status: <strong className="text-emerald-400">All Servers Online</strong></span>
              <span className="font-mono text-[10px] text-indigo-400">v1.0.4 Enterprise</span>
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: LOGIN FORM & DEMO ACCOUNTS */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-between space-y-6">
          
          <div>
            
            {/* Login Type Switcher */}
            <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setLoginType('client');
                  setEmail('merridien@hotel.com');
                  setPassword('123456');
                  setError(null);
                }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                  loginType === 'client' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Tenant Client Login</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginType('superadmin');
                  setEmail('superadmin@hotelvista.com');
                  setPassword('super123');
                  setError(null);
                }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                  loginType === 'superadmin' 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Crown className="w-4 h-4" />
                <span>Super Admin SaaS</span>
              </button>
            </div>

            {/* Header Title */}
            <div>
              <h2 className="text-xl font-black text-white">
                {loginType === 'superadmin' ? 'Super Admin Portal Access' : 'Sign In to Your Property'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {loginType === 'superadmin' 
                  ? 'Access global multi-tenant controls, properties & subscriptions.' 
                  : 'Enter your account credentials to access your hotel ERP terminal.'}
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mt-4 p-3 bg-rose-950/60 border border-rose-500/30 text-rose-300 rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 mt-6 text-xs">
              
              <div className="space-y-1.5">
                <label className="font-bold text-slate-400 block">Email ID / Username *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={loginType === 'superadmin' ? 'superadmin@hotelvista.com' : 'merridien@hotel.com'}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-400 block">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3.5 font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
                  loginType === 'superadmin'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-amber-500/20'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>{loginType === 'superadmin' ? 'Authenticate Super Admin' : 'Sign In to Hotel ERP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>

          </div>

          {/* QUICK-LOGIN DEMO ACCOUNTS SECTION */}
          <div className="pt-4 border-t border-slate-800 space-y-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              ⚡ One-Click Instant Demo Login Accounts
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {userAccounts.map(acc => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleQuickLogin(acc.email, acc.password)}
                  className="p-3 rounded-xl border border-slate-800 hover:border-indigo-500/50 bg-slate-950/80 hover:bg-indigo-950/40 text-left transition-all flex items-start justify-between group"
                >
                  <div className="min-w-0 pr-2 space-y-0.5">
                    <p className="font-bold text-slate-200 text-[11px] truncate group-hover:text-indigo-300">
                      {acc.name}
                    </p>
                    <p className="text-[10px] font-mono text-indigo-400 truncate">
                      <span className="text-slate-500 font-sans">Email:</span> {acc.email}
                    </p>
                    <p className="text-[10px] font-mono text-emerald-400 truncate">
                      <span className="text-slate-500 font-sans">Pass:</span> {acc.password}
                    </p>
                  </div>
                  <span className="text-[9px] px-2 py-1 bg-slate-800 group-hover:bg-indigo-600 text-slate-300 group-hover:text-white rounded-lg font-bold shrink-0 mt-0.5">
                    {acc.role === 'super_admin' ? 'SUPER' : acc.role.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
