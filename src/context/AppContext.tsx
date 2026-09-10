import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch 
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase';

// ==========================================
// TYPES DEFINITIONS
// ==========================================

export type UserRole = 'super_admin' | 'admin' | 'reception' | 'restaurant' | 'bar' | 'store_manager';

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
  maxRooms: number;
  adminEmail: string;
}

export type RoomCategory = 'Standard' | 'Premium' | 'Semi Premium' | 'Suite' | 'Family Suite' | 'Dormitory';

export type RoomStatus = 'Available' | 'Occupied' | 'Reserved' | 'Cleaning' | 'Maintenance';

export interface Room {
  id: string;
  roomNumber: string;
  category: RoomCategory;
  floor: number;
  price: number;
  status: RoomStatus;
  guestName?: string;
  guestPhone?: string;
  checkInDate?: string;
  checkOutDate?: string;
  noOfGuests?: number;
  advancePaid?: number;
  // Charges posted to room
  restaurantCharges: number;
  barCharges: number;
  laundryCharges: number;
  hallCharges: number;
  otherCharges: number;
}

export interface PreBooking {
  id: string;
  guestName: string;
  phone: string;
  email: string;
  address: string;
  idProof: string;
  gstNumber?: string;
  roomCategory: RoomCategory;
  roomNumber?: string; // Optional if assigned later
  bookingDate: string;
  checkInDate: string;
  checkOutDate: string;
  noOfGuests: number;
  advancePaid: number;
  status: 'Pending' | 'Confirmed' | 'CheckedIn' | 'Cancelled';
}

export interface MenuItem {
  id: string;
  name: string;
  category: string; // Food categories: Breakfast, Lunch, Dinner, Beverages, Desserts. Bar: Beer, Whisky, Rum, Vodka, Wine, Cocktails, Snacks
  price: number;
  isBar: boolean;
  isAvailable: boolean;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  type: 'WalkIn' | 'Room';
  roomNumber?: string;
  guestName?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'Pending' | 'Paid' | 'PostedToRoom';
  isBar: boolean;
  timestamp: string;
}

export interface LaundryOrder {
  id: string;
  orderNumber: string;
  roomNumber: string;
  guestName: string;
  items: {
    itemType: 'Clothes' | 'Blanket' | 'Bedsheet' | 'Iron Only' | 'Dry Clean';
    quantity: number;
    price: number;
  }[];
  isExpress: boolean;
  totalPrice: number;
  status: 'Pending' | 'Delivered' | 'Completed';
  timestamp: string;
}

export interface HallBooking {
  id: string;
  bookingNumber: string;
  hallType: 'Meeting Room' | 'Conference Hall' | 'Banquet Hall' | 'Marriage Hall';
  guestName: string;
  phone: string;
  date: string;
  timeSlot: 'Morning' | 'Evening' | 'Full Day';
  advancePaid: number;
  foodPackage: string;
  foodPrice: number;
  decorationPrice: number;
  soundSystemPrice: number;
  projectorPrice: number;
  cleaningCharge: number;
  hallRent: number;
  totalPrice: number;
  roomNumber?: string; // If guest wants hall charge linked to room
  status: 'Confirmed' | 'Completed' | 'Cancelled';
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Liquor' | 'Food' | 'Cleaning' | 'Laundry' | 'Room Supplies' | 'Kitchen' | 'Housekeeping';
  stock: number;
  minStock: number; // Low stock threshold
  unit: string; // bottle, kg, pcs, liters, packet
  expiryDate?: string;
  barcode?: string;
}

export interface PurchaseLog {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  supplier: string;
  pricePerUnit: number;
  gstAmount: number;
  totalAmount: number;
  date: string;
}

export interface StockAdjustmentLog {
  id: string;
  itemId: string;
  itemName: string;
  category: string;
  amount: number;
  unit: string;
  direction: 'in' | 'out';
  description: string;
  date: string;
}

export interface ClientUserAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  tenantName: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  username: string;
  role: UserRole;
  action: string;
  details: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  type: 'checkout' | 'stock' | 'booking' | 'birthday' | 'payment';
  message: string;
  timestamp: string;
  read: boolean;
}

export interface HotelSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  gstNumber: string;
  taxRate: number; // general GST % e.g. 18
  barTaxRate: number; // bar specific tax % e.g. 20
  invoicePrefix: string;
  logoUrl?: string;
}

export interface BillSummary {
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  stayDuration: number; // in days
  roomRentTotal: number;
  restaurantTotal: number;
  barTotal: number;
  laundryTotal: number;
  hallTotal: number;
  otherCharges: number;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  advancePaid: number;
  grandTotal: number;
  pendingAmount: number;
}

// ==========================================
// CONTEXT TYPE DEFINITION
// ==========================================

interface AppContextType {
  userRole: UserRole;
  switchRole: (role: UserRole) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  rooms: Room[];
  preBookings: PreBooking[];
  menuItems: MenuItem[];
  orders: Order[];
  laundryOrders: LaundryOrder[];
  hallBookings: HallBooking[];
  inventory: InventoryItem[];
  purchaseLogs: PurchaseLog[];
  stockAdjustmentLogs: StockAdjustmentLog[];
  userAccounts: ClientUserAccount[];
  currentUser: ClientUserAccount | null;
  tenants: TenantAccount[];
  activeTenantId: string;
  auditLogs: AuditLog[];
  notifications: AppNotification[];
  settings: HotelSettings;

  // Firebase Auth Integrations
  user: User | null;
  loadingAuth: boolean;
  tenantId: string | null;
  logout: () => Promise<void>;
  
  // State mutations
  checkInRoom: (roomId: string, guestInfo: { name: string; phone: string; email?: string; address?: string; idProof: string; gstNumber?: string; noOfGuests: number; advancePaid: number }) => Promise<void>;
  checkOutRoom: (roomId: string, paymentDetails: { method: 'Cash' | 'Card' | 'UPI' | 'Split'; discount: number; splitDetails?: string }) => Promise<void>;
  transferRoom: (fromRoomId: string, toRoomId: string) => Promise<void>;
  updateHousekeeping: (roomId: string, status: RoomStatus) => Promise<void>;
  extendStay: (roomId: string, days: number) => Promise<void>;
  
  addPreBooking: (booking: Omit<PreBooking, 'id' | 'status' | 'bookingDate'>) => Promise<void>;
  cancelPreBooking: (id: string) => Promise<void>;
  confirmPreBookingCheckIn: (id: string, roomId: string) => Promise<void>;
  
  addRestaurantBarOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'timestamp' | 'tax' | 'total' | 'status'>) => Promise<void>;
  addLaundryOrder: (order: Omit<LaundryOrder, 'id' | 'orderNumber' | 'timestamp' | 'status'>) => Promise<void>;
  updateLaundryStatus: (id: string, status: 'Pending' | 'Delivered' | 'Completed') => Promise<void>;
  
  addHallBooking: (booking: Omit<HallBooking, 'id' | 'bookingNumber' | 'status' | 'totalPrice'>) => Promise<void>;
  cancelHallBooking: (id: string) => Promise<void>;
  
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => any;
  recordPurchase: (purchase: Omit<PurchaseLog, 'id' | 'date'>) => any;
  updateStockLevel: (itemId: string, amount: number, direction: 'in' | 'out', category?: string, description?: string) => any;
  
  getBillSummary: (roomNumber: string) => BillSummary | null;
  addAudit: (action: string, details: string, oldValue?: string, newValue?: string) => any;
  clearNotification: (id: string) => any;
  addUserAccount: (user: Omit<ClientUserAccount, 'id' | 'createdAt'>) => void;
  deleteUserAccount: (id: string) => void;
  addTenantAccount: (tenant: Omit<TenantAccount, 'id' | 'createdAt'>, adminPassword?: string) => void;
  updateTenantStatus: (id: string, status: 'Active' | 'Provisioning' | 'Suspended') => void;
  deleteTenantAccount: (id: string) => void;
  switchTenantContext: (tenantId: string) => void;
  loginUser: (email: string, password: string) => { success: boolean; error?: string };
  logoutUser: () => void;

  addMenuItem: (item: MenuItem) => Promise<void>;
  updateSettings: (settings: HotelSettings) => Promise<void>;
  addRoom: (room: Omit<Room, 'status' | 'restaurantCharges' | 'barCharges' | 'laundryCharges' | 'hallCharges' | 'otherCharges'>) => Promise<void>;
  deleteRoom: (roomId: string) => Promise<void>;
  resetTenantData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ==========================================
// PRE-POPULATED INITIAL DATA FOR SEEDING
// ==========================================

const defaultRooms: Room[] = [
  { id: 'r101', roomNumber: '101', category: 'Standard', floor: 1, price: 1500, status: 'Available', restaurantCharges: 0, barCharges: 0, laundryCharges: 0, hallCharges: 0, otherCharges: 0 },
  { id: 'r102', roomNumber: '102', category: 'Standard', floor: 1, price: 1500, status: 'Available', restaurantCharges: 0, barCharges: 0, laundryCharges: 0, hallCharges: 0, otherCharges: 0 },
  { id: 'r103', roomNumber: '103', category: 'Standard', floor: 1, price: 1500, status: 'Available', restaurantCharges: 0, barCharges: 0, laundryCharges: 0, hallCharges: 0, otherCharges: 0 },
  { id: 'r104', roomNumber: '104', category: 'Standard', floor: 1, price: 1500, status: 'Available', restaurantCharges: 0, barCharges: 0, laundryCharges: 0, hallCharges: 0, otherCharges: 0 },
  { id: 'r105', roomNumber: '105', category: 'Standard', floor: 1, price: 1500, status: 'Available', restaurantCharges: 0, barCharges: 0, laundryCharges: 0, hallCharges: 0, otherCharges: 0 },
  { id: 'r106', roomNumber: '106', category: 'Standard', floor: 1, price: 1500, status: 'Available', restaurantCharges: 0, barCharges: 0, laundryCharges: 0, hallCharges: 0, otherCharges: 0 },
  { id: 'r201', roomNumber: '201', category: 'Semi Premium', floor: 2, price: 2500, status: 'Available', restaurantCharges: 0, barCharges: 0, laundryCharges: 0, hallCharges: 0, otherCharges: 0 },
  { id: 'r202', roomNumber: '202', category: 'Semi Premium', floor: 2, price: 2500, status: 'Available', restaurantCharges: 0, barCharges: 0, laundryCharges: 0, hallCharges: 0, otherCharges: 0 },
  { id: 'r203', roomNumber: '203', category: 'Semi Premium', floor: 2, price: 2500, status: 'Available', restaurantCharges: 0, barCharges: 0, laundryCharges: 0, hallCharges: 0, otherCharges: 0 },
  { id: 'r204', roomNumber: '204', category: 'Semi Premium', floor: 2, price: 2500, status: 'Available', restaurantCharges: 0, barCharges: 0, laundryCharges: 0, hallCharges: 0, otherCharges: 0 },
  { id: 'r205', roomNumber: '205', category: 'Semi Premium', floor: 2, price: 2500, status: 'Available', restaurantCharges: 0, barCharges: 0, laundryCharges: 0, hallCharges: 0, otherCharges: 0 },
  { id: 'r301', roomNumber: '301', category: 'Premium', floor: 3, price: 4000, status: 'Available', restaurantCharges: 0, barCharges: 0, laundryCharges: 0, hallCharges: 0, otherCharges: 0 },
  { id: 'r302', roomNumber: '302', category: 'Premium', floor: 3, price: 4000, status: 'Available', restaurantCharges: 0, barCharges: 0, laundryCharges: 0, hallCharges: 0, otherCharges: 0 },
  { id: 'r303', roomNumber: '303', category: 'Suite', floor: 3, price: 6500, status: 'Available', restaurantCharges: 0, barCharges: 0, laundryCharges: 0, hallCharges: 0, otherCharges: 0 },
  { id: 'r304', roomNumber: '304', category: 'Suite', floor: 3, price: 6500, status: 'Available', restaurantCharges: 0, barCharges: 0, laundryCharges: 0, hallCharges: 0, otherCharges: 0 },
  { id: 'r401', roomNumber: '401', category: 'Family Suite', floor: 4, price: 8000, status: 'Available', restaurantCharges: 0, barCharges: 0, laundryCharges: 0, hallCharges: 0, otherCharges: 0 },
  { id: 'r402', roomNumber: '402', category: 'Dormitory', floor: 4, price: 800, status: 'Available', restaurantCharges: 0, barCharges: 0, laundryCharges: 0, hallCharges: 0, otherCharges: 0 }
];

const defaultSettings: HotelSettings = {
  name: 'HotelVista Resort & Spa',
  address: '45, Hill View Road, Ooty, Tamil Nadu - 643001',
  phone: '+91 98765 43210',
  email: 'bookings@hotelvistaresort.com',
  gstNumber: '33AAAAA1111A1ZA',
  taxRate: 18,
  barTaxRate: 20,
  invoicePrefix: 'HV-2026-'
};

// ==========================================
// CONTEXT PROVIDER COMPONENT
// ==========================================

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication states
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);

  // Local ERP states, initialized to empty and filled via Firestore subscriptions
  const [rooms, setRooms] = useState<Room[]>([]);
  const [preBookings, setPreBookings] = useState<PreBooking[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [laundryOrders, setLaundryOrders] = useState<LaundryOrder[]>([]);
  const [hallBookings, setHallBookings] = useState<HallBooking[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [purchaseLogs, setPurchaseLogs] = useState<PurchaseLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [settings, setSettings] = useState<HotelSettings>(defaultSettings);

  const [userRole, setUserRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('hv_user_role');
    return (saved as UserRole) || 'admin';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('hv_dark_mode');
    return saved === 'true';
  });

  // Track Auth state changes
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoadingAuth(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setTenantId(firebaseUser ? firebaseUser.uid : null);
      setLoadingAuth(false);
    });
    return unsub;
  }, []);

  // Theme Sync effect (remains local)
  useEffect(() => {
    localStorage.setItem('hv_dark_mode', String(darkMode));
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('hv_user_role', userRole);
  }, [userRole]);

  // Firestore subscriptions (active only when user is logged in / tenantId is set)
  
  // Settings sync
  useEffect(() => {
    if (!tenantId) return;
    const unsub = onSnapshot(doc(db, 'tenants', tenantId, 'settings', 'hotel'), (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data() as HotelSettings);
      } else {
        setDoc(doc(db, 'tenants', tenantId, 'settings', 'hotel'), defaultSettings);
      }
    });
    return unsub;
  }, [tenantId]);

  // Rooms sync
  useEffect(() => {
    if (!tenantId) return;
    const unsub = onSnapshot(collection(db, 'tenants', tenantId, 'rooms'), (snapshot) => {
      if (snapshot.empty) {
        // Seed default rooms
        const batch = writeBatch(db);
        defaultRooms.forEach((r) => {
          batch.set(doc(db, 'tenants', tenantId, 'rooms', r.id), r);
        });
        batch.commit();
      } else {
        const data = snapshot.docs.map(doc => doc.data() as Room);
        data.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true }));
        setRooms(data);
      }
    });
    return unsub;
  }, [tenantId]);

  // Pre-Bookings sync
  useEffect(() => {
    if (!tenantId) return;
    const unsub = onSnapshot(collection(db, 'tenants', tenantId, 'preBookings'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as PreBooking);
      data.sort((a, b) => b.bookingDate.localeCompare(a.bookingDate));
      setPreBookings(data);
    });
    return unsub;
  }, [tenantId]);

  // Menu items sync
  useEffect(() => {
    if (!tenantId) return;
    const unsub = onSnapshot(collection(db, 'tenants', tenantId, 'menuItems'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as MenuItem);
      setMenuItems(data);
    });
    return unsub;
  }, [tenantId]);

  // Orders sync
  useEffect(() => {
    if (!tenantId) return;
    const unsub = onSnapshot(collection(db, 'tenants', tenantId, 'orders'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Order);
      data.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      setOrders(data);
    });
    return unsub;
  }, [tenantId]);

  // Laundry Orders sync
  useEffect(() => {
    if (!tenantId) return;
    const unsub = onSnapshot(collection(db, 'tenants', tenantId, 'laundryOrders'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as LaundryOrder);
      data.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      setLaundryOrders(data);
    });
    return unsub;
  }, [tenantId]);

  // Hall Bookings sync
  useEffect(() => {
    if (!tenantId) return;
    const unsub = onSnapshot(collection(db, 'tenants', tenantId, 'hallBookings'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as HallBooking);
      setHallBookings(data);
    });
    return unsub;
  }, [tenantId]);

  // Inventory sync
  useEffect(() => {
    if (!tenantId) return;
    const unsub = onSnapshot(collection(db, 'tenants', tenantId, 'inventory'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as InventoryItem);
      setInventory(data);
    });
    return unsub;
  }, [tenantId]);

  // Purchase logs sync
  useEffect(() => {
    if (!tenantId) return;
    const unsub = onSnapshot(collection(db, 'tenants', tenantId, 'purchaseLogs'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as PurchaseLog);
      data.sort((a, b) => b.date.localeCompare(a.date));
      setPurchaseLogs(data);
    });
    return unsub;
  }, [tenantId]);

  // Audit Logs sync
  useEffect(() => {
    if (!tenantId) return;
    const unsub = onSnapshot(collection(db, 'tenants', tenantId, 'auditLogs'), (snapshot) => {
      if (snapshot.empty) {
        // Seed only a single system init audit log rather than mock guest records
        const id = 'a_init';
        const initLog: AuditLog = {
          id,
          username: 'System',
          role: 'admin',
          action: 'Workspace Init',
          details: 'Your real-time tenant environment is successfully initialized.',
          timestamp: new Date().toLocaleString()
        };
        setDoc(doc(db, 'tenants', tenantId, 'auditLogs', id), initLog);
      } else {
        const data = snapshot.docs.map(doc => doc.data() as AuditLog);
        data.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        setAuditLogs(data);
      }
    });
    return unsub;
  }, [tenantId]);

  // Notifications sync
  useEffect(() => {
    if (!tenantId) return;
    const unsub = onSnapshot(collection(db, 'tenants', tenantId, 'notifications'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as AppNotification);
      data.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      setNotifications(data);
    });
    return unsub;
  }, [tenantId]);

  // ==========================================
  // STATE MUTATION FUNCTIONS (FIRESTORE)
  // ==========================================

  const logout = async () => {
    if (isFirebaseConfigured) {
      await signOut(auth);
      // Clear local states immediately for security/UX
      setRooms([]);
      setPreBookings([]);
      setMenuItems([]);
      setOrders([]);
      setLaundryOrders([]);
      setHallBookings([]);
      setInventory([]);
      setPurchaseLogs([]);
      setAuditLogs([]);
      setNotifications([]);
    }
  };

  const switchRole = (role: UserRole) => {
    setUserRole(role);
    addAudit('Role Switch', `User switched role to ${role.toUpperCase()}`);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const addAudit = async (action: string, details: string, oldValue?: string, newValue?: string) => {
    if (!tenantId) return;
    const id = 'a_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newLog: AuditLog = {
      id,
      username: userRole === 'admin' ? 'Admin User' : `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Staff`,
      role: userRole,
      action,
      details,
      oldValue: oldValue || '',
      newValue: newValue || '',
      timestamp: new Date().toLocaleString()
    };
    try {
      await setDoc(doc(db, 'tenants', tenantId, 'auditLogs', id), newLog);
    } catch (e) {
      console.error('Failed to write audit log:', e);
    }
  };

  // CHECK IN
  const checkInRoom = async (roomId: string, guestInfo: { name: string; phone: string; email?: string; address?: string; idProof: string; gstNumber?: string; noOfGuests: number; advancePaid: number }) => {
    if (!tenantId) return;
    try {
      const roomRef = doc(db, 'tenants', tenantId, 'rooms', roomId);
      await updateDoc(roomRef, {
        status: 'Occupied',
        guestName: guestInfo.name,
        guestPhone: guestInfo.phone,
        checkInDate: new Date().toISOString().split('T')[0],
        checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // default 1 day later
        noOfGuests: guestInfo.noOfGuests,
        advancePaid: guestInfo.advancePaid,
        restaurantCharges: 0,
        barCharges: 0,
        laundryCharges: 0,
        hallCharges: 0,
        otherCharges: 0
      });
      await addAudit('Check-In', `Guest ${guestInfo.name} checked into Room ${rooms.find(r => r.id === roomId)?.roomNumber}`, undefined, 'Occupied');
    } catch (e) {
      console.error(e);
    }
  };

  // CHECK OUT & PAYMENT RECEIVE
  const checkOutRoom = async (roomId: string, paymentDetails: { method: 'Cash' | 'Card' | 'UPI' | 'Split'; discount: number; splitDetails?: string }) => {
    if (!tenantId) return;
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    try {
      const batch = writeBatch(db);

      // Reset Room
      const roomRef = doc(db, 'tenants', tenantId, 'rooms', roomId);
      batch.update(roomRef, {
        status: 'Cleaning',
        guestName: '',
        guestPhone: '',
        checkInDate: '',
        checkOutDate: '',
        noOfGuests: 0,
        advancePaid: 0,
        restaurantCharges: 0,
        barCharges: 0,
        laundryCharges: 0,
        hallCharges: 0,
        otherCharges: 0
      });

      // Clear notifications related to this room checkout
      const roomNotifications = notifications.filter(n => n.message.includes(`Room ${room.roomNumber} guest`));
      roomNotifications.forEach(n => {
        batch.delete(doc(db, 'tenants', tenantId, 'notifications', n.id));
      });

      await batch.commit();
      await addAudit('Check-Out', `Guest ${room.guestName} checked out of Room ${room.roomNumber}. Paid via ${paymentDetails.method}. Discount: ₹${paymentDetails.discount}`, 'Occupied', 'Cleaning');
    } catch (e) {
      console.error(e);
    }
  };

  // ROOM TRANSFER
  const transferRoom = async (fromRoomId: string, toRoomId: string) => {
    if (!tenantId) return;
    const sourceRoom = rooms.find(r => r.id === fromRoomId);
    const destRoom = rooms.find(r => r.id === toRoomId);
    if (!sourceRoom || !destRoom) return;

    try {
      const batch = writeBatch(db);

      batch.update(doc(db, 'tenants', tenantId, 'rooms', fromRoomId), {
        status: 'Cleaning',
        guestName: '',
        guestPhone: '',
        checkInDate: '',
        checkOutDate: '',
        noOfGuests: 0,
        advancePaid: 0,
        restaurantCharges: 0,
        barCharges: 0,
        laundryCharges: 0,
        hallCharges: 0,
        otherCharges: 0
      });

      batch.update(doc(db, 'tenants', tenantId, 'rooms', toRoomId), {
        status: 'Occupied',
        guestName: sourceRoom.guestName || '',
        guestPhone: sourceRoom.guestPhone || '',
        checkInDate: sourceRoom.checkInDate || '',
        checkOutDate: sourceRoom.checkOutDate || '',
        noOfGuests: sourceRoom.noOfGuests || 0,
        advancePaid: sourceRoom.advancePaid || 0,
        restaurantCharges: sourceRoom.restaurantCharges || 0,
        barCharges: sourceRoom.barCharges || 0,
        laundryCharges: sourceRoom.laundryCharges || 0,
        hallCharges: sourceRoom.hallCharges || 0,
        otherCharges: sourceRoom.otherCharges || 0
      });

      await batch.commit();
      await addAudit('Room Transfer', `Transferred guest ${sourceRoom.guestName} from Room ${sourceRoom.roomNumber} to Room ${destRoom.roomNumber}`);
    } catch (e) {
      console.error(e);
    }
  };

  // UPDATE HOUSEKEEPING/CLEANING
  const updateHousekeeping = async (roomId: string, status: RoomStatus) => {
    if (!tenantId) return;
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    const oldStatus = room.status;

    try {
      await updateDoc(doc(db, 'tenants', tenantId, 'rooms', roomId), { status });
      await addAudit('Housekeeping Change', `Room ${room.roomNumber} status changed to ${status}`, oldStatus, status);
    } catch (e) {
      console.error(e);
    }
  };

  // EXTEND STAY
  const extendStay = async (roomId: string, days: number) => {
    if (!tenantId) return;
    const room = rooms.find(r => r.id === roomId);
    if (!room || !room.checkOutDate) return;

    const oldDate = room.checkOutDate;
    const currentOutDate = new Date(room.checkOutDate);
    currentOutDate.setDate(currentOutDate.getDate() + days);
    const newDate = currentOutDate.toISOString().split('T')[0];

    try {
      await updateDoc(doc(db, 'tenants', tenantId, 'rooms', roomId), { checkOutDate: newDate });
      await addAudit('Extend Stay', `Room ${room.roomNumber} checkout date extended by ${days} days`, oldDate, newDate);
    } catch (e) {
      console.error(e);
    }
  };

  // PRE-BOOKING ACTIONS
  const addPreBooking = async (booking: Omit<PreBooking, 'id' | 'status' | 'bookingDate'>) => {
    if (!tenantId) return;
    const id = 'pb_' + Date.now();
    const newBooking: PreBooking = {
      ...booking,
      id,
      status: 'Confirmed',
      bookingDate: new Date().toISOString().split('T')[0]
    };
    try {
      await setDoc(doc(db, 'tenants', tenantId, 'preBookings', id), newBooking);
      await addAudit('Pre-Booking', `Created reservation for ${booking.guestName} in ${booking.roomCategory}`);
    } catch (e) {
      console.error(e);
    }
  };

  const cancelPreBooking = async (id: string) => {
    if (!tenantId) return;
    const booking = preBookings.find(b => b.id === id);
    if (!booking) return;

    try {
      await updateDoc(doc(db, 'tenants', tenantId, 'preBookings', id), { status: 'Cancelled' });
      await addAudit('Cancel Pre-Booking', `Cancelled reservation for ${booking.guestName}`);
    } catch (e) {
      console.error(e);
    }
  };

  const confirmPreBookingCheckIn = async (id: string, roomId: string) => {
    if (!tenantId) return;
    const booking = preBookings.find(b => b.id === id);
    const room = rooms.find(r => r.id === roomId);
    if (!booking || !room) return;

    try {
      const batch = writeBatch(db);

      batch.update(doc(db, 'tenants', tenantId, 'preBookings', id), {
        status: 'CheckedIn',
        roomNumber: room.roomNumber
      });

      batch.update(doc(db, 'tenants', tenantId, 'rooms', roomId), {
        status: 'Occupied',
        guestName: booking.guestName,
        guestPhone: booking.phone,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        noOfGuests: booking.noOfGuests,
        advancePaid: booking.advancePaid,
        restaurantCharges: 0,
        barCharges: 0,
        laundryCharges: 0,
        hallCharges: 0,
        otherCharges: 0
      });

      await batch.commit();
      await addAudit('Check-In (Pre-Booking)', `Checked in reserved guest ${booking.guestName} to Room ${room.roomNumber}`, 'Reserved', 'Occupied');
    } catch (e) {
      console.error(e);
    }
  };

  // ADD RESTAURANT OR BAR ORDER
  const addRestaurantBarOrder = async (order: Omit<Order, 'id' | 'orderNumber' | 'timestamp' | 'tax' | 'total' | 'status'>) => {
    if (!tenantId) return;
    const newId = 'o_' + Date.now();
    const prefix = order.isBar ? 'BAR-' : 'KOT-';
    const orderNo = prefix + Math.floor(1000 + Math.random() * 9000);
    
    const taxRate = order.isBar ? settings.barTaxRate : settings.taxRate;
    const taxAmount = parseFloat(((order.subtotal * taxRate) / 100).toFixed(2));
    const grandTotal = parseFloat((order.subtotal + taxAmount).toFixed(2));
    
    const isPostedToRoom = order.type === 'Room' && order.roomNumber;
    
    const finalOrder: Order = {
      ...order,
      id: newId,
      orderNumber: orderNo,
      timestamp: new Date().toLocaleString(),
      tax: taxAmount,
      total: grandTotal,
      status: isPostedToRoom ? 'PostedToRoom' : 'Paid'
    };

    try {
      const batch = writeBatch(db);

      batch.set(doc(db, 'tenants', tenantId, 'orders', newId), finalOrder);

      // If linked to Room, post charges immediately
      if (isPostedToRoom) {
        const roomMatch = rooms.find(r => r.roomNumber === order.roomNumber);
        if (roomMatch) {
          batch.update(doc(db, 'tenants', tenantId, 'rooms', roomMatch.id), {
            restaurantCharges: order.isBar ? roomMatch.restaurantCharges : roomMatch.restaurantCharges + grandTotal,
            barCharges: order.isBar ? roomMatch.barCharges + grandTotal : roomMatch.barCharges
          });
        }
      }

      await batch.commit();

      if (isPostedToRoom) {
        await addAudit('POS Link to Room', `Posted ${order.isBar ? 'Bar' : 'Restaurant'} order ${orderNo} (₹${grandTotal}) to Room ${order.roomNumber}`);
      } else {
        await addAudit('POS Sale', `Cash/Direct Sale ${orderNo} of ₹${grandTotal}`);
      }

      // Update stock levels based on menu items sold
      order.items.forEach(async (orderItem) => {
        const match = inventory.find(inv => inv.name.toLowerCase() === orderItem.name.toLowerCase());
        if (match) {
          await updateStockLevel(match.id, orderItem.quantity, 'out');
        }
      });
    } catch (e) {
      console.error(e);
    }
  };

  // LAUNDRY ORDERS
  const addLaundryOrder = async (order: Omit<LaundryOrder, 'id' | 'orderNumber' | 'timestamp' | 'status'>) => {
    if (!tenantId) return;
    const newId = 'lnd_' + Date.now();
    const orderNo = 'LND-' + Math.floor(1000 + Math.random() * 9000);

    const finalOrder: LaundryOrder = {
      ...order,
      id: newId,
      orderNumber: orderNo,
      timestamp: new Date().toLocaleString(),
      status: 'Pending'
    };

    try {
      const batch = writeBatch(db);

      batch.set(doc(db, 'tenants', tenantId, 'laundryOrders', newId), finalOrder);

      // Automatically route to Room Bill
      const roomMatch = rooms.find(r => r.roomNumber === order.roomNumber);
      if (roomMatch) {
        batch.update(doc(db, 'tenants', tenantId, 'rooms', roomMatch.id), {
          laundryCharges: roomMatch.laundryCharges + order.totalPrice
        });
      }

      await batch.commit();

      await addAudit('Laundry Post', `Created laundry ticket ${orderNo} (₹${order.totalPrice}) and added to Room ${order.roomNumber}`);
      
      // Notify room supply use
      const detergent = inventory.find(i => i.name.toLowerCase().includes('detergent'));
      if (detergent) {
        const detergentUsage = 0.2 * order.items.reduce((acc, it) => acc + it.quantity, 0);
        await updateStockLevel(detergent.id, detergentUsage, 'out');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateLaundryStatus = async (id: string, status: 'Pending' | 'Delivered' | 'Completed') => {
    if (!tenantId) return;
    const order = laundryOrders.find(o => o.id === id);
    if (!order) return;

    try {
      await updateDoc(doc(db, 'tenants', tenantId, 'laundryOrders', id), { status });
      await addAudit('Laundry Update', `Laundry order ${order.orderNumber} status changed to ${status}`);
    } catch (e) {
      console.error(e);
    }
  };

  // PARTY HALL BOOKING
  const addHallBooking = async (booking: Omit<HallBooking, 'id' | 'bookingNumber' | 'status' | 'totalPrice'>) => {
    if (!tenantId) return;
    const newId = 'h_' + Date.now();
    const bookingNo = 'HAL-' + Math.floor(1000 + Math.random() * 9000);

    // Calculate total price based on features selected
    const total = booking.hallRent + booking.foodPrice + booking.decorationPrice + booking.soundSystemPrice + booking.projectorPrice + booking.cleaningCharge;

    const finalBooking: HallBooking = {
      ...booking,
      id: newId,
      bookingNumber: bookingNo,
      status: 'Confirmed',
      totalPrice: total
    };

    try {
      const batch = writeBatch(db);

      batch.set(doc(db, 'tenants', tenantId, 'hallBookings', newId), finalBooking);

      // If Room number is specified and active, link the Rent/Charges
      if (booking.roomNumber) {
        const roomMatch = rooms.find(r => r.roomNumber === booking.roomNumber);
        if (roomMatch) {
          batch.update(doc(db, 'tenants', tenantId, 'rooms', roomMatch.id), {
            hallCharges: roomMatch.hallCharges + total
          });
        }
      }

      await batch.commit();

      if (booking.roomNumber) {
        await addAudit('Hall Link to Room', `Linked Hall Booking ${bookingNo} (₹${total}) to Room ${booking.roomNumber}`);
      } else {
        await addAudit('Hall Booking', `Created Hall Booking ${bookingNo} for ${booking.guestName}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const cancelHallBooking = async (id: string) => {
    if (!tenantId) return;
    const booking = hallBookings.find(h => h.id === id);
    if (!booking) return;

    try {
      await updateDoc(doc(db, 'tenants', tenantId, 'hallBookings', id), { status: 'Cancelled' });
      await addAudit('Cancel Hall Booking', `Cancelled hall booking ${booking.bookingNumber}`);
    } catch (e) {
      console.error(e);
    }
  };

  // INVENTORY ITEMS
  const addInventoryItem = async (item: Omit<InventoryItem, 'id'>) => {
    if (!tenantId) return;
    const id = 'i_' + Date.now();
    const newItem: InventoryItem = {
      ...item,
      id
    };
    try {
      await setDoc(doc(db, 'tenants', tenantId, 'inventory', id), newItem);
      await addAudit('Add Stock Item', `Created inventory track for ${item.name}`);
    } catch (e) {
      console.error(e);
    }
  };

  const recordPurchase = async (purchase: Omit<PurchaseLog, 'id' | 'date'>) => {
    if (!tenantId) return;
    const id = 'p_' + Date.now();
    const newPurchase: PurchaseLog = {
      ...purchase,
      id,
      date: new Date().toISOString().split('T')[0]
    };

    try {
      const batch = writeBatch(db);

      batch.set(doc(db, 'tenants', tenantId, 'purchaseLogs', id), newPurchase);

      // Update stock levels
      const itemMatch = inventory.find(item => item.name.toLowerCase() === purchase.itemName.toLowerCase());
      if (itemMatch) {
        const newStock = itemMatch.stock + purchase.quantity;
        
        batch.update(doc(db, 'tenants', tenantId, 'inventory', itemMatch.id), { stock: newStock });

        // Remove low stock alert notification if stock rose above threshold
        if (newStock >= itemMatch.minStock) {
          const matchedNotifs = notifications.filter(n => n.message.includes(itemMatch.name));
          matchedNotifs.forEach(n => {
            batch.delete(doc(db, 'tenants', tenantId, 'notifications', n.id));
          });
        }
      }

      await batch.commit();
      await addAudit('Stock Purchase', `Stock In: ${purchase.quantity} ${purchase.unit} of ${purchase.itemName} from ${purchase.supplier}`);
    } catch (e) {
      console.error(e);
    }
  };

  const [stockAdjustmentLogs, setStockAdjustmentLogs] = useState<StockAdjustmentLog[]>([
    {
      id: 'adj_1',
      itemId: 'inv_1',
      itemName: 'Basmati Rice 25kg Bag',
      category: 'Kitchen',
      amount: 2,
      unit: 'kg',
      direction: 'out',
      description: 'Kitchen dinner preparation usage',
      date: new Date().toISOString().split('T')[0] + ' 10:15'
    },
    {
      id: 'adj_2',
      itemId: 'inv_2',
      itemName: 'Kingfisher Premium Beer 650ml',
      category: 'Liquor',
      amount: 6,
      unit: 'bottle',
      direction: 'in',
      description: 'Bar counter stock replenishment',
      date: new Date().toISOString().split('T')[0] + ' 11:30'
    }
  ]);

  const updateStockLevel = async (itemId: string, amount: number, direction: 'in' | 'out', category?: string, description?: string) => {
    let adjustedItem: InventoryItem | undefined = inventory.find(i => i.id === itemId);

    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        adjustedItem = item;
        const change = direction === 'in' ? amount : -amount;
        return { ...item, stock: Math.max(0, item.stock + change) };
      }
      return item;
    }));

    if (tenantId && adjustedItem) {
      const change = direction === 'in' ? amount : -amount;
      const newStock = Math.max(0, adjustedItem.stock + change);

      try {
        const batch = writeBatch(db);

        batch.update(doc(db, 'tenants', tenantId, 'inventory', itemId), {
          stock: parseFloat(newStock.toFixed(1))
        });

        if (newStock < adjustedItem.minStock && adjustedItem.stock >= adjustedItem.minStock) {
          const notifId = 'n_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
          const newNotif: AppNotification = {
            id: notifId,
            type: 'stock',
            message: `Low Stock Alert: ${adjustedItem.name} is below threshold (${newStock.toFixed(1)}${adjustedItem.unit} remaining, min ${adjustedItem.minStock}${adjustedItem.unit})`,
            timestamp: new Date().toLocaleString(),
            read: false
          };
          batch.set(doc(db, 'tenants', tenantId, 'notifications', notifId), newNotif);
        }
        await batch.commit();
      } catch (e) {
        console.error(e);
      }
    }

    if (adjustedItem) {
      const itemCat = category || adjustedItem.category;
      const desc = description || (direction === 'in' ? 'Manual Stock In adjustment' : 'Manual Stock Out adjustment');
      const newLog: StockAdjustmentLog = {
        id: 'adj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        itemId,
        itemName: adjustedItem.name,
        category: itemCat,
        amount,
        unit: adjustedItem.unit,
        direction,
        description: desc,
        date: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setStockAdjustmentLogs(prev => [newLog, ...prev]);

      addAudit('Stock Adjustment', `Manual ${direction === 'in' ? 'Stock-In' : 'Stock-Out'} of ${amount} ${adjustedItem.unit} for ${adjustedItem.name} (${itemCat}) - Note: ${desc}`);
    }
  };

  const [userAccounts, setUserAccounts] = useState<ClientUserAccount[]>(() => {
    const saved = localStorage.getItem('hv_user_accounts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'u_superadmin',
        name: 'Super Admin (SaaS Owner)',
        email: 'superadmin@hotelvista.com',
        password: 'super123',
        role: 'super_admin',
        tenantName: 'HotelVista Central SaaS',
        status: 'Active',
        createdAt: '2026-01-01'
      },
      {
        id: 'u_merridien',
        name: 'Le Merridien Admin',
        email: 'merridien@hotel.com',
        password: '123456',
        role: 'admin',
        tenantName: 'Hotel Le Merridien',
        status: 'Active',
        createdAt: '2026-01-01'
      },
      {
        id: 'u_admin',
        name: 'HotelVista System Admin',
        email: 'admin@hotelvista.com',
        password: 'admin123',
        role: 'admin',
        tenantName: 'HotelVista Grand',
        status: 'Active',
        createdAt: '2026-01-01'
      },
      {
        id: 'u_reception',
        name: 'Front Desk Reception',
        email: 'reception@hotelvista.com',
        password: 'reception123',
        role: 'reception',
        tenantName: 'HotelVista Grand',
        status: 'Active',
        createdAt: '2026-01-01'
      }
    ];
  });

  // MULTI-TENANT ACCOUNTS STATE
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
        createdAt: '2026-01-01',
        maxRooms: 150,
        adminEmail: 'merridien@hotel.com'
      },
      {
        id: 't_main',
        slug: 'hotelvista-grand',
        name: 'HotelVista Grand',
        email: 'admin@hotelvista.com',
        phone: '+91 98765 43210',
        gstNumber: '36AAACH7412K1Z9',
        subdomain: 'grand.hotelvista.com',
        currency: 'INR (₹)',
        tier: 'Enterprise Multi-Property',
        status: 'Active',
        createdAt: '2026-01-01',
        maxRooms: 100,
        adminEmail: 'admin@hotelvista.com'
      },
      {
        id: 't_royal',
        slug: 'royal-orchid-resort',
        name: 'Royal Orchid Resort & Spa',
        email: 'royal@resort.com',
        phone: '+91 91234 56789',
        gstNumber: '29AAACR9988P1Z3',
        subdomain: 'royal.hotelvista.com',
        currency: 'INR (₹)',
        tier: 'Standard ERP',
        status: 'Active',
        createdAt: '2026-02-10',
        maxRooms: 60,
        adminEmail: 'royal@resort.com'
      }
    ];
  });

  const [activeTenantId, setActiveTenantId] = useState<string>(() => {
    return localStorage.getItem('hv_active_tenant_id') || 't_merridien';
  });

  const addTenantAccount = (tenantData: Omit<TenantAccount, 'id' | 'createdAt'>, adminPassword?: string) => {
    const newTenant: TenantAccount = {
      ...tenantData,
      id: 't_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updatedTenants = [newTenant, ...tenants];
    setTenants(updatedTenants);
    localStorage.setItem('hv_tenants', JSON.stringify(updatedTenants));

    // Provision default Admin account for this tenant
    if (tenantData.adminEmail) {
      const adminPass = adminPassword || 'tenant123';
      const existingUser = userAccounts.find(u => u.email.toLowerCase() === tenantData.adminEmail.toLowerCase());
      if (!existingUser) {
        const newAdminUser: ClientUserAccount = {
          id: 'u_' + Date.now(),
          name: `${tenantData.name} Admin`,
          email: tenantData.adminEmail,
          password: adminPass,
          role: 'admin',
          tenantName: tenantData.name,
          status: 'Active',
          createdAt: new Date().toISOString().split('T')[0]
        };
        const updatedUsers = [newAdminUser, ...userAccounts];
        setUserAccounts(updatedUsers);
        localStorage.setItem('hv_user_accounts', JSON.stringify(updatedUsers));
      }
    }

    addAudit('Tenant Onboarded', `Created new Multi-Tenant property account "${tenantData.name}" (${tenantData.tier})`);
  };

  const updateTenantStatus = (id: string, status: 'Active' | 'Provisioning' | 'Suspended') => {
    const updated = tenants.map(t => t.id === id ? { ...t, status } : t);
    setTenants(updated);
    localStorage.setItem('hv_tenants', JSON.stringify(updated));
    addAudit('Tenant Status Updated', `Updated tenant ${id} status to ${status}`);
  };

  const deleteTenantAccount = (id: string) => {
    const updated = tenants.filter(t => t.id !== id);
    setTenants(updated);
    localStorage.setItem('hv_tenants', JSON.stringify(updated));
    addAudit('Tenant Deleted', `Deleted tenant account ${id}`);
  };

  const switchTenantContext = (tenantId: string) => {
    const matched = tenants.find(t => t.id === tenantId);
    if (matched) {
      setActiveTenantId(tenantId);
      localStorage.setItem('hv_active_tenant_id', tenantId);
      addAudit('Tenant Context Switch', `Super Admin switched view context to tenant "${matched.name}"`);
    }
  };

  const addUserAccount = (user: Omit<ClientUserAccount, 'id' | 'createdAt'>) => {
    const newUser: ClientUserAccount = {
      ...user,
      id: 'u_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updated = [newUser, ...userAccounts];
    setUserAccounts(updated);
    localStorage.setItem('hv_user_accounts', JSON.stringify(updated));
    addAudit('User Account Created', `Created client account ${user.email} (${user.role}) for ${user.tenantName}`);
  };

  const deleteUserAccount = (id: string) => {
    const updated = userAccounts.filter(u => u.id !== id);
    setUserAccounts(updated);
    localStorage.setItem('hv_user_accounts', JSON.stringify(updated));
  };

  const [currentUser, setCurrentUser] = useState<ClientUserAccount | null>(() => {
    const saved = localStorage.getItem('hv_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      id: 'u_merridien',
      name: 'Le Merridien Admin',
      email: 'merridien@hotel.com',
      password: '123456',
      role: 'admin',
      tenantName: 'Hotel Le Merridien',
      status: 'Active',
      createdAt: '2026-01-01'
    };
  });

  const loginUser = (emailInput: string, passwordInput: string) => {
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    const matched = userAccounts.find(u => 
      u.email.toLowerCase() === cleanEmail && u.password === cleanPassword
    );

    if (matched) {
      setCurrentUser(matched);
      setUserRole(matched.role);
      localStorage.setItem('hv_current_user', JSON.stringify(matched));
      localStorage.setItem('hv_user_role', matched.role);
      addAudit('User Login', `User ${matched.email} (${matched.name}) logged in successfully as ${matched.role}`);
      return { success: true };
    }

    return { success: false, error: 'Invalid Email ID or Password. Please check your credentials.' };
  };

  const logoutUser = () => {
    if (currentUser) {
      addAudit('User Logout', `User ${currentUser.email} logged out.`);
    }
    setCurrentUser(null);
    localStorage.removeItem('hv_current_user');
  };

  // UNIFIED BILLING CALCULATIONS
  const getBillSummary = (roomNumber: string): BillSummary | null => {
    const room = rooms.find(r => r.roomNumber === roomNumber);
    if (!room || room.status !== 'Occupied' || !room.checkInDate) return null;

    // Calculate stay duration
    const checkIn = new Date(room.checkInDate);
    const today = new Date();
    // Clear hours to count dates
    checkIn.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    
    let stayDuration = Math.ceil((today.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    if (stayDuration <= 0) stayDuration = 1; // Minimum 1 day rent

    const roomRentTotal = stayDuration * room.price;
    const subtotal = roomRentTotal + room.restaurantCharges + room.barCharges + room.laundryCharges + room.hallCharges + room.otherCharges;
    
    const taxRate = settings.taxRate;
    const taxAmount = parseFloat(((subtotal * taxRate) / 100).toFixed(2));
    const grandTotal = subtotal + taxAmount;
    const pendingAmount = Math.max(0, grandTotal - (room.advancePaid || 0));

    return {
      guestName: room.guestName || 'Valued Guest',
      checkInDate: room.checkInDate,
      checkOutDate: new Date().toISOString().split('T')[0],
      stayDuration,
      roomRentTotal,
      restaurantTotal: room.restaurantCharges,
      barTotal: room.barCharges,
      laundryTotal: room.laundryCharges,
      hallTotal: room.hallCharges,
      otherCharges: room.otherCharges,
      subtotal,
      taxRate,
      taxAmount,
      discount: 0,
      advancePaid: room.advancePaid || 0,
      grandTotal,
      pendingAmount
    };
  };

  const clearNotification = async (id: string) => {
    if (!tenantId) return;
    try {
      await updateDoc(doc(db, 'tenants', tenantId, 'notifications', id), { read: true });
    } catch (e) {
      console.error(e);
    }
  };

  const addMenuItem = async (item: MenuItem) => {
    if (!tenantId) return;
    try {
      await setDoc(doc(db, 'tenants', tenantId, 'menuItems', item.id), item);
    } catch (e) {
      console.error(e);
    }
  };

  const updateSettings = async (newSettings: HotelSettings) => {
    if (!tenantId) return;
    try {
      await setDoc(doc(db, 'tenants', tenantId, 'settings', 'hotel'), newSettings);
    } catch (e) {
      console.error(e);
    }
  };

  const addRoom = async (room: Omit<Room, 'status' | 'restaurantCharges' | 'barCharges' | 'laundryCharges' | 'hallCharges' | 'otherCharges'>) => {
    if (!tenantId) return;
    const newRoom: Room = {
      ...room,
      status: 'Available',
      restaurantCharges: 0,
      barCharges: 0,
      laundryCharges: 0,
      hallCharges: 0,
      otherCharges: 0
    };
    try {
      await setDoc(doc(db, 'tenants', tenantId, 'rooms', newRoom.id), newRoom);
      await addAudit('Create Room', `Added new room ${room.roomNumber} (${room.category}) at ₹${room.price}`);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteRoom = async (roomId: string) => {
    if (!tenantId) return;
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    try {
      await deleteDoc(doc(db, 'tenants', tenantId, 'rooms', roomId));
      await addAudit('Delete Room', `Deleted room ${room.roomNumber} (${room.category})`);
    } catch (e) {
      console.error(e);
    }
  };

  const resetTenantData = async () => {
    if (!tenantId) return;
    try {
      const batch = writeBatch(db);

      // 1. Delete all pre-bookings
      preBookings.forEach(pb => {
        batch.delete(doc(db, 'tenants', tenantId, 'preBookings', pb.id));
      });

      // 2. Delete all menu items
      menuItems.forEach(item => {
        batch.delete(doc(db, 'tenants', tenantId, 'menuItems', item.id));
      });

      // 3. Delete all orders
      orders.forEach(o => {
        batch.delete(doc(db, 'tenants', tenantId, 'orders', o.id));
      });

      // 4. Delete all laundry orders
      laundryOrders.forEach(lo => {
        batch.delete(doc(db, 'tenants', tenantId, 'laundryOrders', lo.id));
      });

      // 5. Delete all hall bookings
      hallBookings.forEach(hb => {
        batch.delete(doc(db, 'tenants', tenantId, 'hallBookings', hb.id));
      });

      // 6. Delete all inventory
      inventory.forEach(inv => {
        batch.delete(doc(db, 'tenants', tenantId, 'inventory', inv.id));
      });

      // 7. Delete all purchase logs
      purchaseLogs.forEach(p => {
        batch.delete(doc(db, 'tenants', tenantId, 'purchaseLogs', p.id));
      });

      // 8. Delete all audit logs
      auditLogs.forEach(a => {
        batch.delete(doc(db, 'tenants', tenantId, 'auditLogs', a.id));
      });

      // 9. Delete all notifications
      notifications.forEach(n => {
        batch.delete(doc(db, 'tenants', tenantId, 'notifications', n.id));
      });

      // 10. Delete all current rooms and re-seed clean room templates
      rooms.forEach(r => {
        batch.delete(doc(db, 'tenants', tenantId, 'rooms', r.id));
      });
      defaultRooms.forEach(r => {
        batch.set(doc(db, 'tenants', tenantId, 'rooms', r.id), r);
      });

      await batch.commit();

      // Write a fresh audit log entry
      const logId = 'a_reset_' + Date.now();
      const resetLog: AuditLog = {
        id: logId,
        username: 'System',
        role: 'admin',
        action: 'Database Reset',
        details: 'All transactional records have been wiped and rooms reset to standard vacant list.',
        timestamp: new Date().toLocaleString()
      };
      await setDoc(doc(db, 'tenants', tenantId, 'auditLogs', logId), resetLog);

      alert('Database successfully reset to a fresh state!');
    } catch (e) {
      console.error(e);
      alert('Failed to reset database: ' + (e as Error).message);
    }
  };

  return (
    <AppContext.Provider value={{
      userRole,
      switchRole,
      darkMode,
      toggleDarkMode,
      rooms,
      preBookings,
      menuItems,
      orders,
      laundryOrders,
      hallBookings,
      inventory,
      purchaseLogs,
      stockAdjustmentLogs,
      userAccounts,
      auditLogs,
      notifications,
      settings,

      // Auth values
      user,
      loadingAuth,
      tenantId,
      logout,
      
      checkInRoom,
      checkOutRoom,
      transferRoom,
      updateHousekeeping,
      extendStay,
      
      addPreBooking,
      cancelPreBooking,
      confirmPreBookingCheckIn,
      
      addRestaurantBarOrder,
      addLaundryOrder,
      updateLaundryStatus,
      
      addHallBooking,
      cancelHallBooking,
      
      addInventoryItem,
      recordPurchase,
      updateStockLevel,
      
      getBillSummary,
      addAudit,
      clearNotification,
      addUserAccount,
      deleteUserAccount,
      tenants,
      activeTenantId,
      addTenantAccount,
      updateTenantStatus,
      deleteTenantAccount,
      switchTenantContext,
      currentUser,
      loginUser,
      logoutUser,

      addMenuItem,
      updateSettings,
      addRoom,
      deleteRoom,
      resetTenantData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
