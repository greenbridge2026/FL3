import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { RoleHeader } from './components/RoleHeader';
import { DashboardView } from './views/DashboardView';
import { RoomsView } from './views/RoomsView';
import { PreBookingView } from './views/PreBookingView';
import { RestaurantBarView } from './views/RestaurantBarView';
import { LaundryView } from './views/LaundryView';
import { PartyHallView } from './views/PartyHallView';
import { StockView } from './views/StockView';
import { UnifiedBillingView } from './views/UnifiedBillingView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';
import { AuditLogView } from './views/AuditLogView';
import { Auth } from './components/Auth';

const AppContent: React.FC = () => {
  const { userRole, user, loadingAuth } = useApp();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedRoomForBilling, setSelectedRoomForBilling] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Role Tab Authorization Checks & Auto-Redirects
  useEffect(() => {
    const roleRoutes: Record<string, string[]> = {
      admin: [
        'dashboard', 'rooms', 'prebookings', 'restaurant', 'bar', 
        'laundry', 'hall', 'stock', 'billing', 'reports', 'settings', 'audit'
      ],
      reception: [
        'dashboard', 'rooms', 'prebookings', 'laundry', 'hall', 'billing', 'reports'
      ],
      restaurant: ['restaurant'],
      bar: ['bar'],
      store_manager: ['laundry', 'stock']
    };

    const allowed = roleRoutes[userRole] || [];
    if (!allowed.includes(currentTab)) {
      // Redirect to the first allowed tab for this role
      setCurrentTab(allowed[0] || 'dashboard');
    }
  }, [userRole, currentTab]);

  if (loadingAuth) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-slate-200">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500/20 border-t-indigo-500 mb-4" />
        <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Loading HotelVista console...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Sidebar navigation */}
      <Sidebar currentTab={currentTab} setTab={setCurrentTab} collapsed={sidebarCollapsed} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header bar with status & role switchers */}
        <RoleHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />

        {/* Dynamic viewport */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/20">
          
          {currentTab === 'dashboard' && (
            <DashboardView setTab={setCurrentTab} />
          )}

          {currentTab === 'rooms' && (
            <RoomsView 
              setTab={setCurrentTab} 
              setSelectedRoomForBilling={setSelectedRoomForBilling} 
            />
          )}

          {currentTab === 'prebookings' && (
            <PreBookingView />
          )}

          {currentTab === 'restaurant' && (
            <RestaurantBarView />
          )}

          {currentTab === 'bar' && (
            <RestaurantBarView />
          )}

          {currentTab === 'laundry' && (
            <LaundryView />
          )}

          {currentTab === 'hall' && (
            <PartyHallView />
          )}

          {currentTab === 'stock' && (
            <StockView />
          )}

          {currentTab === 'billing' && (
            <UnifiedBillingView 
              selectedRoomNo={selectedRoomForBilling} 
              setSelectedRoomNo={setSelectedRoomForBilling} 
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView />
          )}

          {currentTab === 'settings' && (
            <SettingsView />
          )}

          {currentTab === 'audit' && (
            <AuditLogView />
          )}

        </main>
      </div>

    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
