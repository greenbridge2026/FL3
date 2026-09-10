import React, { useState } from 'react';
import { useApp, UserRole } from '../context/AppContext';
import { Bell, Sun, Moon, Shield, Award, Landmark, Eye, Check, Menu, LogIn, LogOut, UserCheck } from 'lucide-react';
import { LoginModal } from './LoginModal';

interface RoleHeaderProps {
  onToggleSidebar: () => void;
}

export const RoleHeader: React.FC<RoleHeaderProps> = ({ onToggleSidebar }) => {
  const { 
    userRole, 
    switchRole, 
    darkMode, 
    toggleDarkMode, 
    notifications, 
    clearNotification, 
    currentUser, 
    logoutUser,
    user,
    logout,
    settings 
  } = useApp();
  const [showRoles, setShowRoles] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const activeNotifications = notifications.filter(n => !n.read);

  const roles: { value: UserRole; label: string; icon: string; desc: string }[] = [
    { value: 'super_admin', label: 'Super Admin', icon: '👑', desc: 'Global multi-tenant SaaS management & property onboarding' },
    { value: 'admin', label: 'Administrator', icon: '⚡', desc: 'Full access to all property systems & configuration' },
    { value: 'reception', label: 'Receptionist', icon: '🔑', desc: 'Room bookings, Check-In, Unified billing' },
    { value: 'restaurant', label: 'Restaurant Staff', icon: '🍳', desc: 'Create restaurant orders, KOT printing' },
    { value: 'bar', label: 'Bar Staff', icon: '🍷', desc: 'Create bar orders, Bar billing' },
    { value: 'store_manager', label: 'Store Manager', icon: '📦', desc: 'Stock inventory, Purchase logging' }
  ];

  const currentRoleInfo = roles.find(r => r.value === userRole);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 border-b glass bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-800/50 transition-all duration-300">
        
        {/* Brand & Toggle & Active Area Indicator */}
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={onToggleSidebar}
            className="p-2 -ml-2 text-slate-650 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
            title="Toggle Sidebar Layout"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold shadow-md shadow-indigo-500/20 flex-shrink-0">
            <span>{settings?.name ? settings.name.substring(0, 2).toUpperCase() : 'HV'}</span>
          </div>
          <div className="max-w-[200px] md:max-w-xs">
            <h1 className="text-sm md:text-base font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent truncate" title={settings?.name || 'HotelVista ERP'}>
              {settings?.name || 'HotelVista ERP'}
            </h1>
            <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold flex items-center gap-1">
              <span>●</span> {currentUser ? currentUser.tenantName : 'Active Role'}: {currentRoleInfo?.label}
            </p>
          </div>
        </div>

        {/* Action buttons (Right) */}
        <div className="flex items-center gap-3">
          
          {/* CLIENT LOGIN / SIGN IN BUTTON */}
          <button
            onClick={() => setShowLoginModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all"
            title="Switch Account & Login Portal"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{currentUser ? 'Switch User' : 'Sign In'}</span>
          </button>

          {/* DEV ROLE SWITCHER */}
          <div className="relative">
            <button
              onClick={() => setShowRoles(!showRoles)}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-300 dark:bg-slate-800/60 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400 rounded-lg transition-all border border-transparent hover:border-indigo-500/20"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Switch Role ({currentRoleInfo?.label})</span>
              <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded">DEV</span>
            </button>

            {showRoles && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowRoles(false)} />
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Role Simulation Panel</h3>
                    <p className="text-[10px] text-slate-500">Test different views and access control levels.</p>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto px-1 py-1">
                    {roles.map(r => (
                      <button
                        key={r.value}
                        onClick={() => {
                          switchRole(r.value);
                          setShowRoles(false);
                        }}
                        className={`flex w-full items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                          userRole === r.value 
                            ? 'bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400' 
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="text-lg mt-0.5">{r.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between font-semibold text-xs">
                            <span>{r.label}</span>
                            {userRole === r.value && <Check className="w-3.5 h-3.5 text-indigo-500" />}
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{r.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* DARK MODE TOGGLE */}
          <button
            onClick={toggleDarkMode}
            className="p-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
            title="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* NOTIFICATIONS BELL */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
            >
              <Bell className="w-5 h-5" />
              {activeNotifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alerts & Notifications</h3>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {activeNotifications.length} Active
                    </span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto px-2 py-1">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No notifications or warnings.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`flex gap-3 p-2.5 rounded-lg border border-transparent mb-1 transition-all ${
                            n.read 
                              ? 'opacity-60 bg-transparent' 
                              : 'bg-indigo-50/20 dark:bg-indigo-950/10 border-indigo-500/10'
                          }`}
                        >
                          <div className="mt-0.5">
                            {n.type === 'stock' && <span className="text-amber-500 text-sm">⚠️</span>}
                            {n.type === 'checkout' && <span className="text-indigo-500 text-sm">🔑</span>}
                            {n.type === 'booking' && <span className="text-emerald-500 text-sm">📅</span>}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-slate-700 dark:text-slate-350 font-medium leading-relaxed">
                              {n.message}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[9px] text-slate-400">{n.timestamp}</span>
                              {!n.read && (
                                <button
                                  onClick={() => clearNotification(n.id)}
                                  className="text-[9px] text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold"
                                >
                                  Mark Read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* STAFF SIGNATURE PROFILE / CURRENT USER */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200/50 dark:border-slate-800/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white text-xs shadow-sm">
              {currentUser ? currentUser.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : userRole.charAt(0).toUpperCase())}
            </div>
            <div className="hidden md:block max-w-[120px]">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight truncate" title={currentUser?.name || user?.email || 'Staff'}>
                {currentUser ? currentUser.name : (user?.email ? user.email.split('@')[0] : 'Staff On-Duty')}
              </p>
              <p className="text-[9px] font-mono text-indigo-500 truncate">
                {currentUser ? currentUser.email : (user?.email || currentRoleInfo?.label)}
              </p>
            </div>

            {(currentUser || user) && (
              <button
                onClick={() => {
                  if (logoutUser) logoutUser();
                  if (logout) logout();
                }}
                className="flex items-center gap-1 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors ml-1"
                title="Log Out Account"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
              </button>
            )}
          </div>

        </div>
      </header>

      {/* LOGIN MODAL */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  );
};
