import React, { createContext, useContext, useState, useEffect } from 'react';

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
  
  // State mutations
  checkInRoom: (roomId: string, guestInfo: { name: string; phone: string; email?: string; address?: string; idProof: string; gstNumber?: string; noOfGuests: number; advancePaid: number }) => void;
  checkOutRoom: (roomId: string, paymentDetails: { method: 'Cash' | 'Card' | 'UPI' | 'Split'; discount: number; splitDetails?: string }) => void;
  transferRoom: (fromRoomId: string, toRoomId: string) => void;
  updateHousekeeping: (roomId: string, status: RoomStatus) => void;
  extendStay: (roomId: string, days: number) => void;
  
  addPreBooking: (booking: Omit<PreBooking, 'id' | 'status' | 'bookingDate'>) => void;
  cancelPreBooking: (id: string) => void;
  confirmPreBookingCheckIn: (id: string, roomId: string) => void;
  
  addRestaurantBarOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'timestamp' | 'tax' | 'total' | 'status'>) => void;
  addLaundryOrder: (order: Omit<LaundryOrder, 'id' | 'orderNumber' | 'timestamp' | 'status'>) => void;
  updateLaundryStatus: (id: string, status: 'Pending' | 'Delivered' | 'Completed') => void;
  
  addHallBooking: (booking: Omit<HallBooking, 'id' | 'bookingNumber' | 'status' | 'totalPrice'>) => void;
  cancelHallBooking: (id: string) => void;
  
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  recordPurchase: (purchase: Omit<PurchaseLog, 'id' | 'date'>) => void;
  updateStockLevel: (itemId: string, amount: number, direction: 'in' | 'out', category?: string, description?: string) => void;
  
  getBillSummary: (roomNumber: string) => BillSummary | null;
  addAudit: (action: string, details: string, oldValue?: string, newValue?: string) => void;
  clearNotification: (id: string) => void;
  addUserAccount: (user: Omit<ClientUserAccount, 'id' | 'createdAt'>) => void;
  deleteUserAccount: (id: string) => void;
  addTenantAccount: (tenant: Omit<TenantAccount, 'id' | 'createdAt'>, adminPassword?: string) => void;
  updateTenantStatus: (id: string, status: 'Active' | 'Provisioning' | 'Suspended') => void;
  deleteTenantAccount: (id: string) => void;
  switchTenantContext: (tenantId: string) => void;
  loginUser: (email: string, password: string) => { success: boolean; error?: string };
  logoutUser: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ==========================================
// PRE-POPULATED INITIAL DATA
// ==========================================

const defaultRooms: Room[] = [
  // 1st Floor - Standard Rooms (101 - 106)
  { id: 'r101', roomNumber: '101', category: 'Standard', floor: 1, price: 1500, status: 'Occupied', guestName: 'Rajesh Kumar', guestPhone: '9876543210', checkInDate: '2026-07-04', checkOutDate: '2026-07-07', noOfGuests: 2, advancePaid: 1000, restaurantCharges: 450, barCharges: 800, laundryCharges: 120, hallCharges: 0, otherCharges: 0 },
  { id: 'r102', roomNumber: '102', category: 'Standard', floor: 1, price: 1500, status: 'Reserved', guestName: 'Sarah Smith', guestPhone: '9844332211', checkInDate: '2026-07-07', checkOutDate: '2026-07-10', noOfGuests: 1, advancePaid: 500, restaurantCharges: 0, barCharges: 0, laundryCharges: 0, hallCharges: 0, otherCharges: 0 },
  { id: 'r103', roomNumber: '103', category: 'Standard', floor: 1, price: 1500, status: 'Available', restaurantCharges: 0, barCharges: 0, laundryCharges: 0, hallCharges: 0, otherCharges: 0 },
  { id: 'r104', roomNumber: '104', category: 'Standard', floor: 1, price: 1500, status: 'Cleaning', restaurantCharges: 0, barCharges: 0, laundryCharges: 0, hallCharges: 0, otherCharges: 0 },
  { id: 'r105', roomNumber: '105', category: 'Standard', floor: 1, price: 1500, status: 'Maintenance', restaurantCharges: 0, barCharges: 0, laundryCharges: 0, hallCharges: 0, otherCharges: 0 },
  { id: 'r106', roomNumber: '106', category: 'Standard', floor: 1, price: 1500, status: 'Available', restaurantCharges: 0, barCharges: 0, laundryCharges: 0, hallCharges: 0, otherCharges: 0 },
  
  // 2nd Floor - Semi Premium Rooms (201 - 206)
  { id: 'r201', roomNumber: '201', category: 'Semi Premium', floor: 2, price: 2500, status: 'Occupied', guestName: 'Amit Patel', guestPhone: '9123456789', checkInDate: '2026-07-05', checkOutDate: '2026-07-09', noOfGuests: 2, advancePaid: 2000, restaurantCharges: 1250, barCharges: 0, laundryCharges: 350, hallCharges: 0, otherCharges: 200 },
  { id: 'r202', roomNumber: '202', category: 'Semi Premium', floor: 2, price: 2500, status: 'Available', restaurantCharges: 0, barCharges: 0, laundryCharges: 0, hallCharges: 0, otherCharges: 0 },
  { id: 'r203', roomNumber: '203', category: 'Semi Premium', floor: 2, price: 2500, status: 'Available', restaurantCharges: 0, barCharges: 0, laundryCharges: 0, hallCharges: 0, otherCharges: 0 },
  { id: 'r204', roomNumber: '204', category: 'Semi Premium', floor: 2, price: 2500, status: 'Cleaning', restaurantCharges: 0, barCharges: 0, laundryCharges: 0, hallCharges: 0, otherCharges: 0 },
  { id: 'r205', roomNumber: '205', category: 'Semi Premium', floor: 2, price: 2500, status: 'Available', restaurantCharges: 0, barCharges: 0, laundryCharges: 0, hallCharges: 0, otherCharges: 0 },
  
  // 3rd Floor - Premium Rooms & Suites (301 - 304)
  { id: 'r301', roomNumber: '301', category: 'Premium', floor: 3, price: 4000, status: 'Occupied', guestName: 'Vikram Seth', guestPhone: '9898989898', checkInDate: '2026-07-06', checkOutDate: '2026-07-08', noOfGuests: 3, advancePaid: 3000, restaurantCharges: 600, barCharges: 2600, laundryCharges: 0, hallCharges: 5000, otherCharges: 0 },
  { id: 'r302', roomNumber: '302', category: 'Premium', floor: 3, price: 4000, status: 'Available', restaurantCharges: 0, barCharges: 0, laundryCharges: 0, hallCharges: 0, otherCharges: 0 },
  { id: 'r303', roomNumber: '303', category: 'Suite', floor: 3, price: 6500, status: 'Occupied', guestName: 'Dr. John Doe', guestPhone: '9555666777', checkInDate: '2026-07-03', checkOutDate: '2026-07-07', noOfGuests: 2, advancePaid: 5000, restaurantCharges: 2200, barCharges: 4100, laundryCharges: 850, hallCharges: 0, otherCharges: 100 },
  { id: 'r304', roomNumber: '304', category: 'Suite', floor: 3, price: 6500, status: 'Available', restaurantCharges: 0, barCharges: 0, laundryCharges: 0, hallCharges: 0, otherCharges: 0 },
  
  // 4th Floor - Family Suites & Dormitory (401 - 402)
  { id: 'r401', roomNumber: '401', category: 'Family Suite', floor: 4, price: 8000, status: 'Available', restaurantCharges: 0, barCharges: 0, laundryCharges: 0, hallCharges: 0, otherCharges: 0 },
  { id: 'r402', roomNumber: '402', category: 'Dormitory', floor: 4, price: 800, status: 'Occupied', guestName: 'Rahul & Group (4 pax)', guestPhone: '8765432109', checkInDate: '2026-07-05', checkOutDate: '2026-07-07', noOfGuests: 4, advancePaid: 1500, restaurantCharges: 980, barCharges: 0, laundryCharges: 150, hallCharges: 0, otherCharges: 0 }
];

const defaultPreBookings: PreBooking[] = [
  { id: 'pb1', guestName: 'Pooja Hegde', phone: '9888777666', email: 'pooja@gmail.com', address: 'Mumbai, India', idProof: 'Aadhaar: 4455-6677-8899', gstNumber: '27AAAAA1111A1Z1', roomCategory: 'Suite', roomNumber: '304', bookingDate: '2026-07-05', checkInDate: '2026-07-08', checkOutDate: '2026-07-11', noOfGuests: 2, advancePaid: 2000, status: 'Confirmed' },
  { id: 'pb2', guestName: 'Mark Wood', phone: '9444111222', email: 'mark@wood.co.uk', address: 'London, UK', idProof: 'Passport: Z898989', roomCategory: 'Premium', bookingDate: '2026-07-06', checkInDate: '2026-07-12', checkOutDate: '2026-07-15', noOfGuests: 1, advancePaid: 1500, status: 'Confirmed' }
];

const defaultMenuItems: MenuItem[] = [
  // Restaurant items
  { id: 'm1', name: 'Masala Dosa', category: 'Breakfast', price: 120, isBar: false, isAvailable: true },
  { id: 'm2', name: 'Idli Vada Plate', category: 'Breakfast', price: 90, isBar: false, isAvailable: true },
  { id: 'm3', name: 'Aloo Paratha (2 Pcs)', category: 'Breakfast', price: 110, isBar: false, isAvailable: true },
  { id: 'm4', name: 'Butter Paneer Masala', category: 'Lunch', price: 280, isBar: false, isAvailable: true },
  { id: 'm5', name: 'Dal Makhani', category: 'Lunch', price: 220, isBar: false, isAvailable: true },
  { id: 'm6', name: 'Tandoori Roti', category: 'Lunch', price: 30, isBar: false, isAvailable: true },
  { id: 'm7', name: 'Veg Biryani', category: 'Dinner', price: 260, isBar: false, isAvailable: true },
  { id: 'm8', name: 'Chicken Dum Biryani', category: 'Dinner', price: 350, isBar: false, isAvailable: true },
  { id: 'm9', name: 'Fresh Lime Soda', category: 'Beverages', price: 80, isBar: false, isAvailable: true },
  { id: 'm10', name: 'Espresso Coffee', category: 'Beverages', price: 70, isBar: false, isAvailable: true },
  { id: 'm11', name: 'Hot Chocolate Fudge', category: 'Desserts', price: 160, isBar: false, isAvailable: true },
  { id: 'm12', name: 'Gulab Jamun (2 Pcs)', category: 'Desserts', price: 80, isBar: false, isAvailable: true },
  
  // Bar items
  { id: 'b1', name: 'Kingfisher Premium 650ml', category: 'Beer', price: 220, isBar: true, isAvailable: true },
  { id: 'b2', name: 'Budweiser Mild 330ml', category: 'Beer', price: 150, isBar: true, isAvailable: true },
  { id: 'b3', name: 'Johnnie Walker Black Label 30ml', category: 'Whisky', price: 320, isBar: true, isAvailable: true },
  { id: 'b4', name: 'Jack Daniels 30ml', category: 'Whisky', price: 300, isBar: true, isAvailable: true },
  { id: 'b5', name: 'Old Monk Dark Rum 30ml', category: 'Rum', price: 120, isBar: true, isAvailable: true },
  { id: 'b6', name: 'Smirnoff Vodka 30ml', category: 'Vodka', price: 160, isBar: true, isAvailable: true },
  { id: 'b7', name: 'Jacob Creek Red Wine (Glass)', category: 'Wine', price: 350, isBar: true, isAvailable: true },
  { id: 'b8', name: 'Sula Shiraz White Wine (Glass)', category: 'Wine', price: 320, isBar: true, isAvailable: true },
  { id: 'b9', name: 'Classic Mojito', category: 'Cocktails', price: 280, isBar: true, isAvailable: true },
  { id: 'b10', name: 'LIIT (Long Island Ice Tea)', category: 'Cocktails', price: 420, isBar: true, isAvailable: true },
  { id: 'b11', name: 'Masala Peanut Fry', category: 'Snacks', price: 100, isBar: true, isAvailable: true },
  { id: 'b12', name: 'Chicken Tikka Dry (Bar)', category: 'Snacks', price: 290, isBar: true, isAvailable: true }
];

const defaultOrders: Order[] = [
  { id: 'o1', orderNumber: 'ORD-1001', type: 'Room', roomNumber: '101', guestName: 'Rajesh Kumar', items: [{ menuItemId: 'm4', name: 'Butter Paneer Masala', price: 280, quantity: 1 }, { menuItemId: 'm6', name: 'Tandoori Roti', price: 30, quantity: 3 }], subtotal: 370, tax: 66.6, total: 436.6, status: 'PostedToRoom', isBar: false, timestamp: '2026-07-06 09:30 AM' },
  { id: 'o2', orderNumber: 'ORD-1002', type: 'Room', roomNumber: '301', guestName: 'Vikram Seth', items: [{ menuItemId: 'b3', name: 'Johnnie Walker Black Label 30ml', price: 320, quantity: 4 }, { menuItemId: 'b11', name: 'Masala Peanut Fry', price: 100, quantity: 2 }], subtotal: 1480, tax: 296, total: 1776, status: 'PostedToRoom', isBar: true, timestamp: '2026-07-06 08:45 PM' }
];

const defaultLaundryOrders: LaundryOrder[] = [
  { id: 'l1', orderNumber: 'LND-2001', roomNumber: '101', guestName: 'Rajesh Kumar', items: [{ itemType: 'Clothes', quantity: 3, price: 40 }], isExpress: false, totalPrice: 120, status: 'Completed', timestamp: '2026-07-05 11:00 AM' },
  { id: 'l2', orderNumber: 'LND-2002', roomNumber: '201', guestName: 'Amit Patel', items: [{ itemType: 'Blanket', quantity: 1, price: 150 }, { itemType: 'Dry Clean', quantity: 2, price: 100 }], isExpress: false, totalPrice: 350, status: 'Pending', timestamp: '2026-07-06 02:00 PM' }
];

const defaultHallBookings: HallBooking[] = [
  { id: 'hb1', bookingNumber: 'HAL-5001', hallType: 'Banquet Hall', guestName: 'Vikram Seth', phone: '9898989898', date: '2026-07-06', timeSlot: 'Evening', advancePaid: 2000, foodPackage: 'Gold (Veg + Non-Veg)', foodPrice: 2500, decorationPrice: 1500, soundSystemPrice: 1000, projectorPrice: 0, cleaningCharge: 500, hallRent: 1500, totalPrice: 7000, roomNumber: '301', status: 'Confirmed' },
  { id: 'hb2', bookingNumber: 'HAL-5002', hallType: 'Marriage Hall', guestName: 'Mehta Family', phone: '9333222111', date: '2026-07-15', timeSlot: 'Full Day', advancePaid: 10000, foodPackage: 'Platinum Premium', foodPrice: 12000, decorationPrice: 8000, soundSystemPrice: 3000, projectorPrice: 1000, cleaningCharge: 2000, hallRent: 20000, totalPrice: 46000, status: 'Confirmed' }
];

const defaultInventory: InventoryItem[] = [
  { id: 'i1', name: 'Johnnie Walker Black Label', category: 'Liquor', stock: 12, minStock: 5, unit: 'bottle' },
  { id: 'i2', name: 'Kingfisher Premium 650ml', category: 'Liquor', stock: 45, minStock: 20, unit: 'bottle' },
  { id: 'i3', name: 'Rice Basmati', category: 'Food', stock: 8, minStock: 10, unit: 'kg' }, // LOW STOCK
  { id: 'i4', name: 'Liquid Detergent Premium', category: 'Laundry', stock: 4, minStock: 5, unit: 'liters' }, // LOW STOCK
  { id: 'i5', name: 'Toiletries Kit Set', category: 'Room Supplies', stock: 120, minStock: 30, unit: 'pcs' },
  { id: 'i6', name: 'Bleach Solution', category: 'Cleaning', stock: 15, minStock: 5, unit: 'liters' },
  { id: 'i7', name: 'Bed Sheets King Size', category: 'Room Supplies', stock: 50, minStock: 15, unit: 'pcs' }
];

const defaultPurchaseLogs: PurchaseLog[] = [
  { id: 'p1', itemName: 'Johnnie Walker Black Label', category: 'Liquor', quantity: 6, unit: 'bottle', supplier: 'United Beverages Ltd', pricePerUnit: 2200, gstAmount: 2376, totalAmount: 15576, date: '2026-07-02' },
  { id: 'p2', itemName: 'Rice Basmati', category: 'Food', quantity: 20, unit: 'kg', supplier: 'Agro Foods Distributor', pricePerUnit: 110, gstAmount: 110, totalAmount: 2310, date: '2026-07-03' }
];

const defaultAuditLogs: AuditLog[] = [
  { id: 'a1', username: 'System', role: 'admin', action: 'System Init', details: 'HotelVista ERP initialization completed with default templates.', timestamp: '2026-07-06 10:00 AM' }
];

const defaultNotifications: AppNotification[] = [
  { id: 'n1', type: 'stock', message: 'Low Stock Alert: Rice Basmati is below threshold (8kg remaining, min 10kg)', timestamp: '2026-07-06 11:30 AM', read: false },
  { id: 'n2', type: 'stock', message: 'Low Stock Alert: Liquid Detergent Premium is low (4L remaining, min 5L)', timestamp: '2026-07-06 12:45 PM', read: false },
  { id: 'n3', type: 'checkout', message: 'Room 101 guest (Rajesh Kumar) checkout due today', timestamp: '2026-07-06 02:00 PM', read: false }
];

const defaultSettings: HotelSettings = {
  name: 'HotelVista Resort & Spa',
  address: '45, Hill View Road, Ooty, Tamil Nadu - 643001',
  phone: '+91 98765 43210',
  email: 'bookings@hotelvistaresort.com',
  gstNumber: '33AAAAA1111A1ZA',
  taxRate: 18, // 18% GST (9% CGST + 9% SGST)
  barTaxRate: 20, // 20% Vat/Bar Tax
  invoicePrefix: 'HV-2026-'
};

// ==========================================
// CONTEXT PROVIDER COMPONENT
// ==========================================

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('hv_user_role');
    return (saved as UserRole) || 'admin';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('hv_dark_mode');
    return saved === 'true';
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('hv_rooms');
    return saved ? JSON.parse(saved) : defaultRooms;
  });

  const [preBookings, setPreBookings] = useState<PreBooking[]>(() => {
    const saved = localStorage.getItem('hv_pre_bookings');
    return saved ? JSON.parse(saved) : defaultPreBookings;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('hv_menu_items');
    return saved ? JSON.parse(saved) : defaultMenuItems;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('hv_orders');
    return saved ? JSON.parse(saved) : defaultOrders;
  });

  const [laundryOrders, setLaundryOrders] = useState<LaundryOrder[]>(() => {
    const saved = localStorage.getItem('hv_laundry_orders');
    return saved ? JSON.parse(saved) : defaultLaundryOrders;
  });

  const [hallBookings, setHallBookings] = useState<HallBooking[]>(() => {
    const saved = localStorage.getItem('hv_hall_bookings');
    return saved ? JSON.parse(saved) : defaultHallBookings;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('hv_inventory');
    return saved ? JSON.parse(saved) : defaultInventory;
  });

  const [purchaseLogs, setPurchaseLogs] = useState<PurchaseLog[]>(() => {
    const saved = localStorage.getItem('hv_purchase_logs');
    return saved ? JSON.parse(saved) : defaultPurchaseLogs;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('hv_audit_logs');
    return saved ? JSON.parse(saved) : defaultAuditLogs;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('hv_notifications');
    return saved ? JSON.parse(saved) : defaultNotifications;
  });

  const [settings, setSettings] = useState<HotelSettings>(() => {
    const saved = localStorage.getItem('hv_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  // Save changes to LocalStorage
  useEffect(() => {
    localStorage.setItem('hv_user_role', userRole);
  }, [userRole]);

  useEffect(() => {
    localStorage.setItem('hv_dark_mode', String(darkMode));
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('hv_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('hv_pre_bookings', JSON.stringify(preBookings));
  }, [preBookings]);

  useEffect(() => {
    localStorage.setItem('hv_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('hv_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('hv_laundry_orders', JSON.stringify(laundryOrders));
  }, [laundryOrders]);

  useEffect(() => {
    localStorage.setItem('hv_hall_bookings', JSON.stringify(hallBookings));
  }, [hallBookings]);

  useEffect(() => {
    localStorage.setItem('hv_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('hv_purchase_logs', JSON.stringify(purchaseLogs));
  }, [purchaseLogs]);

  useEffect(() => {
    localStorage.setItem('hv_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('hv_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('hv_settings', JSON.stringify(settings));
  }, [settings]);

  // ==========================================
  // STATE MUTATION FUNCTIONS
  // ==========================================

  const switchRole = (role: UserRole) => {
    setUserRole(role);
    addAudit('Role Switch', `User switched role to ${role.toUpperCase()}`);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const addAudit = (action: string, details: string, oldValue?: string, newValue?: string) => {
    const newLog: AuditLog = {
      id: 'a_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      username: userRole === 'admin' ? 'Admin User' : `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Staff`,
      role: userRole,
      action,
      details,
      oldValue,
      newValue,
      timestamp: new Date().toLocaleString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // CHECK IN
  const checkInRoom = (roomId: string, guestInfo: { name: string; phone: string; email?: string; address?: string; idProof: string; gstNumber?: string; noOfGuests: number; advancePaid: number }) => {
    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
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
        };
      }
      return room;
    }));
    addAudit('Check-In', `Guest ${guestInfo.name} checked into Room ${rooms.find(r => r.id === roomId)?.roomNumber}`, undefined, 'Occupied');
  };

  // CHECK OUT & PAYMENT RECEIVE
  const checkOutRoom = (roomId: string, paymentDetails: { method: 'Cash' | 'Card' | 'UPI' | 'Split'; discount: number; splitDetails?: string }) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          status: 'Cleaning', // Send to cleaning immediately
          guestName: undefined,
          guestPhone: undefined,
          checkInDate: undefined,
          checkOutDate: undefined,
          noOfGuests: undefined,
          advancePaid: 0,
          restaurantCharges: 0,
          barCharges: 0,
          laundryCharges: 0,
          hallCharges: 0,
          otherCharges: 0
        };
      }
      return r;
    }));

    // Add checkout notification if needed
    setNotifications(prev => prev.filter(n => !n.message.includes(`Room ${room.roomNumber} guest`)));

    addAudit('Check-Out', `Guest ${room.guestName} checked out of Room ${room.roomNumber}. Paid via ${paymentDetails.method}. Discount: ₹${paymentDetails.discount}`, 'Occupied', 'Cleaning');
  };

  // ROOM TRANSFER
  const transferRoom = (fromRoomId: string, toRoomId: string) => {
    const sourceRoom = rooms.find(r => r.id === fromRoomId);
    const destRoom = rooms.find(r => r.id === toRoomId);
    if (!sourceRoom || !destRoom) return;

    setRooms(prev => prev.map(r => {
      if (r.id === fromRoomId) {
        return {
          ...r,
          status: 'Cleaning',
          guestName: undefined,
          guestPhone: undefined,
          checkInDate: undefined,
          checkOutDate: undefined,
          noOfGuests: undefined,
          advancePaid: 0,
          restaurantCharges: 0,
          barCharges: 0,
          laundryCharges: 0,
          hallCharges: 0,
          otherCharges: 0
        };
      }
      if (r.id === toRoomId) {
        return {
          ...r,
          status: 'Occupied',
          guestName: sourceRoom.guestName,
          guestPhone: sourceRoom.guestPhone,
          checkInDate: sourceRoom.checkInDate,
          checkOutDate: sourceRoom.checkOutDate,
          noOfGuests: sourceRoom.noOfGuests,
          advancePaid: sourceRoom.advancePaid,
          restaurantCharges: sourceRoom.restaurantCharges,
          barCharges: sourceRoom.barCharges,
          laundryCharges: sourceRoom.laundryCharges,
          hallCharges: sourceRoom.hallCharges,
          otherCharges: sourceRoom.otherCharges
        };
      }
      return r;
    }));

    addAudit('Room Transfer', `Transferred guest ${sourceRoom.guestName} from Room ${sourceRoom.roomNumber} to Room ${destRoom.roomNumber}`);
  };

  // UPDATE HOUSEKEEPING/CLEANING
  const updateHousekeeping = (roomId: string, status: RoomStatus) => {
    const room = rooms.find(r => r.id === roomId);
    const oldStatus = room?.status;
    
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        return { ...r, status };
      }
      return r;
    }));
    
    addAudit('Housekeeping Change', `Room ${room?.roomNumber} status changed to ${status}`, oldStatus, status);
  };

  // EXTEND STAY
  const extendStay = (roomId: string, days: number) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room || !room.checkOutDate) return;

    const oldDate = room.checkOutDate;
    const currentOutDate = new Date(room.checkOutDate);
    currentOutDate.setDate(currentOutDate.getDate() + days);
    const newDate = currentOutDate.toISOString().split('T')[0];

    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        return { ...r, checkOutDate: newDate };
      }
      return r;
    }));

    addAudit('Extend Stay', `Room ${room.roomNumber} checkout date extended by ${days} days`, oldDate, newDate);
  };

  // PRE-BOOKING ACTIONS
  const addPreBooking = (booking: Omit<PreBooking, 'id' | 'status' | 'bookingDate'>) => {
    const newBooking: PreBooking = {
      ...booking,
      id: 'pb_' + Date.now(),
      status: 'Confirmed',
      bookingDate: new Date().toISOString().split('T')[0]
    };
    setPreBookings(prev => [newBooking, ...prev]);
    addAudit('Pre-Booking', `Created reservation for ${booking.guestName} in ${booking.roomCategory}`);
  };

  const cancelPreBooking = (id: string) => {
    setPreBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Cancelled' as const } : b));
    const booking = preBookings.find(b => b.id === id);
    addAudit('Cancel Pre-Booking', `Cancelled reservation for ${booking?.guestName}`);
  };

  const confirmPreBookingCheckIn = (id: string, roomId: string) => {
    const booking = preBookings.find(b => b.id === id);
    const room = rooms.find(r => r.id === roomId);
    if (!booking || !room) return;

    setPreBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CheckedIn' as const, roomNumber: room.roomNumber } : b));
    
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
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
        };
      }
      return r;
    }));

    addAudit('Check-In (Pre-Booking)', `Checked in reserved guest ${booking.guestName} to Room ${room.roomNumber}`, 'Reserved', 'Occupied');
  };

  // ADD RESTAURANT OR BAR ORDER
  const addRestaurantBarOrder = (order: Omit<Order, 'id' | 'orderNumber' | 'timestamp' | 'tax' | 'total' | 'status'>) => {
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

    setOrders(prev => [finalOrder, ...prev]);

    // If linked to Room, post charges immediately
    if (isPostedToRoom) {
      setRooms(prev => prev.map(r => {
        if (r.roomNumber === order.roomNumber) {
          return {
            ...r,
            restaurantCharges: order.isBar ? r.restaurantCharges : r.restaurantCharges + grandTotal,
            barCharges: order.isBar ? r.barCharges + grandTotal : r.barCharges
          };
        }
        return r;
      }));
      addAudit('POS Link to Room', `Posted ${order.isBar ? 'Bar' : 'Restaurant'} order ${orderNo} (₹${grandTotal}) to Room ${order.roomNumber}`);
    } else {
      addAudit('POS Sale', `Cash/Direct Sale ${orderNo} of ₹${grandTotal}`);
    }

    // Update stock levels based on menu items sold
    order.items.forEach(orderItem => {
      const match = inventory.find(inv => inv.name.toLowerCase() === orderItem.name.toLowerCase());
      if (match) {
        updateStockLevel(match.id, orderItem.quantity, 'out');
      }
    });
  };

  // LAUNDRY ORDERS
  const addLaundryOrder = (order: Omit<LaundryOrder, 'id' | 'orderNumber' | 'timestamp' | 'status'>) => {
    const newId = 'lnd_' + Date.now();
    const orderNo = 'LND-' + Math.floor(1000 + Math.random() * 9000);

    const finalOrder: LaundryOrder = {
      ...order,
      id: newId,
      orderNumber: orderNo,
      timestamp: new Date().toLocaleString(),
      status: 'Pending'
    };

    setLaundryOrders(prev => [finalOrder, ...prev]);

    // Automatically route to Room Bill
    setRooms(prev => prev.map(r => {
      if (r.roomNumber === order.roomNumber) {
        return {
          ...r,
          laundryCharges: r.laundryCharges + order.totalPrice
        };
      }
      return r;
    }));

    addAudit('Laundry Post', `Created laundry ticket ${orderNo} (₹${order.totalPrice}) and added to Room ${order.roomNumber}`);
    
    // Notify room supply use
    const detergent = inventory.find(i => i.name.toLowerCase().includes('detergent'));
    if (detergent) {
      updateStockLevel(detergent.id, 0.2 * order.items.reduce((acc, it) => acc + it.quantity, 0), 'out'); // simulate laundry detergent use
    }
  };

  const updateLaundryStatus = (id: string, status: 'Pending' | 'Delivered' | 'Completed') => {
    setLaundryOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    const order = laundryOrders.find(o => o.id === id);
    addAudit('Laundry Update', `Laundry order ${order?.orderNumber} status changed to ${status}`);
  };

  // PARTY HALL BOOKING
  const addHallBooking = (booking: Omit<HallBooking, 'id' | 'bookingNumber' | 'status' | 'totalPrice'>) => {
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

    setHallBookings(prev => [finalBooking, ...prev]);

    // If Room number is specified and active, link the Rent/Charges
    if (booking.roomNumber) {
      setRooms(prev => prev.map(r => {
        if (r.roomNumber === booking.roomNumber) {
          // Link non-advance total to room
          return {
            ...r,
            hallCharges: r.hallCharges + total
          };
        }
        return r;
      }));
      addAudit('Hall Link to Room', `Linked Hall Booking ${bookingNo} (₹${total}) to Room ${booking.roomNumber}`);
    } else {
      addAudit('Hall Booking', `Created Hall Booking ${bookingNo} for ${booking.guestName}`);
    }
  };

  const cancelHallBooking = (id: string) => {
    setHallBookings(prev => prev.map(h => h.id === id ? { ...h, status: 'Cancelled' as const } : h));
    const booking = hallBookings.find(h => h.id === id);
    addAudit('Cancel Hall Booking', `Cancelled hall booking ${booking?.bookingNumber}`);
  };

  // INVENTORY ITEMS
  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: 'i_' + Date.now()
    };
    setInventory(prev => [...prev, newItem]);
    addAudit('Add Stock Item', `Created inventory track for ${item.name}`);
  };

  const recordPurchase = (purchase: Omit<PurchaseLog, 'id' | 'date'>) => {
    const newPurchase: PurchaseLog = {
      ...purchase,
      id: 'p_' + Date.now(),
      date: new Date().toISOString().split('T')[0]
    };
    
    setPurchaseLogs(prev => [newPurchase, ...prev]);

    // Update stock levels
    setInventory(prev => prev.map(item => {
      if (item.name.toLowerCase() === purchase.itemName.toLowerCase()) {
        const newStock = item.stock + purchase.quantity;
        
        // Remove low stock alert notification if stock rose above threshold
        if (newStock >= item.minStock) {
          setNotifications(prevNotif => prevNotif.filter(n => !n.message.includes(item.name)));
        }

        return { ...item, stock: newStock };
      }
      return item;
    }));

    addAudit('Stock Purchase', `Stock In: ${purchase.quantity} ${purchase.unit} of ${purchase.itemName} from ${purchase.supplier}`);
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

  const updateStockLevel = (itemId: string, amount: number, direction: 'in' | 'out', category?: string, description?: string) => {
    let adjustedItem: InventoryItem | undefined;

    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        adjustedItem = item;
        const change = direction === 'in' ? amount : -amount;
        const newStock = Math.max(0, item.stock + change);

        // Check low stock condition
        if (newStock < item.minStock && item.stock >= item.minStock) {
          // Trigger low stock notification
          const newNotif: AppNotification = {
            id: 'n_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            type: 'stock',
            message: `Low Stock Alert: ${item.name} is below threshold (${newStock.toFixed(1)}${item.unit} remaining, min ${item.minStock}${item.unit})`,
            timestamp: new Date().toLocaleString(),
            read: false
          };
          setNotifications(prevN => [newNotif, ...prevN]);
        }

        return { ...item, stock: parseFloat(newStock.toFixed(1)) };
      }
      return item;
    }));

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
    
    // Average overall tax rate for room billing (or detailed itemized tax)
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
      discount: 0, // default starts at 0, reception applies custom discounts
      advancePaid: room.advancePaid || 0,
      grandTotal,
      pendingAmount
    };
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
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
      logoutUser
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
