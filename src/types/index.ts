export type UserRole = 'student' | 'staff' | 'manager';

export interface StudentProfile {
  firstName: string;
  lastName: string;
  name: string;
  usn: string;
  mobile: string;
  email: string;
  passwordHash?: string;
  registeredAt: string;
}

export interface StaffProfile {
  id: string;
  name: string;
  role: 'staff' | 'manager';
  section: 'preparation' | 'packing' | 'verification' | 'collection';
  phone?: string;
}

export type FoodCategory =
  | 'Breakfast'
  | 'Rice and Lunch'
  | 'Chats and Snacks'
  | 'Juices'
  | 'Milkshakes'
  | 'Beverages';

export interface MenuItem {
  id: string;
  name: string;
  category: FoodCategory;
  description: string;
  price: number; // in INR ₹
  imageUrl: string;
  isAvailable: boolean;
  prepTimeMinutes: number;
  dietary: 'veg' | 'beverage';
  ingredients?: string[];
  popularityRank?: number;
}

export interface PickupSlot {
  id: string;
  time: string; // e.g. "09:00 AM"
  capacity: number; // default 30
  booked: number; // current confirmed orders
  isActive: boolean;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export type OrderStatus =
  | 'confirmed'
  | 'payment_verified'
  | 'preparing'
  | 'packing'
  | 'ready'
  | 'collected'
  | 'cancelled';

export interface Order {
  id: string; // e.g. "ORD-9421"
  token: string; // e.g. "T001"
  studentName: string;
  usn: string;
  mobile: string;
  email?: string;
  date: string; // YYYY-MM-DD (current day)
  pickupSlot: string; // e.g. "10:30 AM"
  items: OrderItem[];
  subtotal: number;
  taxFee: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'online';
  paymentStatus: 'pending' | 'verified' | 'failed';
  paymentId?: string;
  status: OrderStatus;
  createdAt: string;
  estimatedReadyTime: string;
  packedItems: Record<string, boolean>; // item index or id -> packed state
  isGroupOrder?: boolean;
  groupOrderId?: string;
  groupMemberCount?: number;
  collectedAt?: string;
  prepTimerStartedAt?: number;
  prepDurationSeconds?: number;
  isTwoHourFreeWindow?: boolean; // When student is free for 2 hours and orders directly without slot booking
  twoHourWindowExpiresAt?: string; // Target expiration window timestamp (current time + 2 hours)
}

export interface GroupMember {
  usn: string;
  name: string;
  status: 'joined' | 'pending';
  items: OrderItem[];
  individualTotal: number;
  isPaid: boolean;
  paymentId?: string;
}

export interface GroupOrder {
  id: string; // e.g. "GRP-8421"
  leaderUsn: string;
  leaderName: string;
  pickupSlot: string;
  date: string;
  members: GroupMember[];
  paymentType: 'individual' | 'combined';
  status: 'forming' | 'confirmed' | 'preparing' | 'ready' | 'collected';
  groupQrPayload: string;
  createdAt: string;
  collectedAt?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string; // kg, L, units
  minimumRequired: number;
  status: 'sufficient' | 'low' | 'critical';
  costPerUnit: number;
  lastUpdated: string;
}

export interface FoodWasteRecord {
  id: string;
  date: string;
  slot: string;
  foodItem: string;
  quantityPrepared: number;
  quantityOrdered: number;
  quantityCollected: number;
  remainingQuantity: number;
  unit: string;
  wastageKg: number;
  recordedBy: string;
  timestamp: string;
}

export interface StaffTask {
  id: string;
  title: string;
  section: 'preparation' | 'packing' | 'verification' | 'collection';
  assignedTo: string;
  priority: 'normal' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  slot?: string;
}

export interface CanteenNotification {
  id: string;
  recipientRole: 'student' | 'staff' | 'manager' | 'all';
  recipientUsn?: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'order' | 'kitchen' | 'stock' | 'system';
}

export interface KitchenMetrics {
  totalOrdersToday: number;
  newOrders: number;
  ordersPreparing: number;
  ordersPacking: number;
  ordersReady: number;
  ordersCompleted: number;
  delayedOrders: number;
  revenueToday: number;
  activeStudents: number;
}
