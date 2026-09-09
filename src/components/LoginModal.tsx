import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LogIn, Lock, Mail, Eye, EyeOff, ShieldCheck, Key, AlertCircle, Building2, UserCheck } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginUser, userAccounts, currentUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = loginUser(email, password);
    if (res.success) {
      setEmail('');
      setPassword('');
      onClose();
    } else {
      setError(res.error || 'Invalid credentials');
    }
  };

  const handleQuickFill = (accEmail: string, accPass: string) => {
    setEmail(accEmail);
    setPassword(accPass);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Client Account Login
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                HotelVista ERP Multi-Tenant Portal
              </p>
            </div>
          </div>

          {currentUser && (
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold p-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Current Active Account Banner */}
        {currentUser && (
          <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-500/20 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Currently Signed In As:</span>
              <p className="font-bold text-slate-850 dark:text-slate-150">{currentUser.name}</p>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">{currentUser.email}</p>
            </div>
            <span className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[10px] font-bold">
              {currentUser.role.toUpperCase()}
            </span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-900/40 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="space-y-1">
            <label className="font-bold text-slate-500">Email ID / Username *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="merridien@hotel.com"
                className="w-full pl-9 pr-3 py-2.5 border dark:border-slate-800 dark:bg-slate-950 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-500">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="123456"
                className="w-full pl-9 pr-9 py-2.5 border dark:border-slate-800 dark:bg-slate-950 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-500/20 text-xs transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Client Account</span>
          </button>
        </form>

        {/* Quick Demo Fill Accounts List */}
        <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            One-Click Quick Login Accounts
          </span>

          <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
            {userAccounts.map(acc => (
              <button
                key={acc.id}
                type="button"
                onClick={() => handleQuickFill(acc.email, acc.password)}
                className="w-full p-2 text-left rounded-xl border border-slate-200/60 dark:border-slate-800 hover:border-indigo-500/40 bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">{acc.name}</p>
                  <p className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">{acc.email} / {acc.password}</p>
                </div>
                <span className="text-[9px] px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-semibold text-slate-600 dark:text-slate-300">
                  Fill
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
