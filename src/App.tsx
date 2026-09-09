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

const AppContent: React.FC = () => {
  const { userRole } = useApp();
  
  // Read initial tab from location hash or localStorage to persist on reload
  const [currentTab, setCurrentTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) return hash;
    const saved = localStorage.getItem('hotelvista_active_tab');
    return saved || 'dashboard';
  });

  const [selectedRoomForBilling, setSelectedRoomForBilling] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Sync currentTab with localStorage and URL hash
  useEffect(() => {
    if (currentTab) {
      localStorage.setItem('hotelvista_active_tab', currentTab);
      if (window.location.hash !== `#${currentTab}`) {
        window.location.hash = currentTab;
      }
    }
  }, [currentTab]);

  // Listen for browser back/forward and hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash !== currentTab) {
        setCurrentTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentTab]);

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
