import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  UserRole,
  StudentProfile,
  StaffProfile,
  MenuItem,
  PickupSlot,
  OrderItem,
  Order,
  OrderStatus,
  GroupOrder,
  InventoryItem,
  FoodWasteRecord,
  StaffTask,
  CanteenNotification,
  KitchenMetrics,
} from '../types';
import {
  INITIAL_MENU_ITEMS,
  GENERATE_INITIAL_SLOTS,
  INITIAL_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_FOOD_WASTE,
  INITIAL_STAFF_TASKS,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';

interface CanteenContextType {
  // Auth
  currentRole: UserRole | null;
  currentStudent: StudentProfile | null;
  currentStaff: StaffProfile | null;
  registerStudent: (data: Omit<StudentProfile, 'registeredAt'>) => { success: boolean; error?: string };
  loginStudent: (usnOrEmail: string, password?: string) => { success: boolean; error?: string };
  loginStaff: (id: string, pin?: string) => { success: boolean; error?: string };
  loginManager: (id: string, pin?: string) => { success: boolean; error?: string };
  logout: () => void;
  setCurrentRoleDirect: (role: UserRole | null) => void;

  // Menu & Slots
  menuItems: MenuItem[];
  pickupSlots: PickupSlot[];
  selectedSlot: string;
  setSelectedSlot: (slot: string) => void;
  updateMenuItem: (item: MenuItem) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  deleteMenuItem: (id: string) => void;
  toggleFoodAvailability: (id: string) => void;
  updateSlotCapacity: (slotId: string, newCapacity: number) => void;

  // Cart
  cart: OrderItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (menuItemId: string) => void;
  updateCartQty: (menuItemId: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;

  // Orders
  orders: Order[];
  placeOrder: (paymentMethod: 'cash' | 'online', paymentId?: string, isTwoHourFreeWindow?: boolean) => Promise<{ success: boolean; order?: Order; error?: string }>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  toggleItemPacked: (orderId: string, itemKey: string) => void;
  confirmFoodCollection: (tokenOrId: string) => { success: boolean; message: string; order?: Order };
  confirmGroupCollection: (groupId: string) => { success: boolean; message: string; group?: GroupOrder };
  getOrderByIdOrToken: (query: string) => Order | undefined;

  // 2-Hour Free Window Quick Ordering
  isTwoHourFreeOrder: boolean;
  setIsTwoHourFreeOrder: (val: boolean) => void;
  twoHourQueueOrders: Order[];

  // Group Ordering
  groupOrders: GroupOrder[];
  activeGroupOrder: GroupOrder | null;
  createGroupOrder: (slot: string) => GroupOrder;
  joinGroupOrderByCode: (groupOrderId: string, studentProfile?: StudentProfile) => { success: boolean; error?: string; group?: GroupOrder };
  addMemberToGroup: (groupOrderId: string, usn: string, name: string) => boolean;
  removeMemberFromGroup: (groupOrderId: string, usn: string) => boolean;
  updateGroupMemberItems: (groupOrderId: string, usn: string, items: OrderItem[]) => void;
  confirmGroupOrder: (groupOrderId: string, paymentType: 'individual' | 'combined') => { success: boolean; error?: string; group?: GroupOrder };

  // Kitchen & Operations
  inventory: InventoryItem[];
  updateInventoryStock: (id: string, amount: number) => void;
  foodWasteRecords: FoodWasteRecord[];
  addFoodWasteRecord: (record: Omit<FoodWasteRecord, 'id' | 'timestamp'>) => void;
  staffTasks: StaffTask[];
  updateTaskStatus: (taskId: string, status: StaffTask['status']) => void;
  addTask: (task: Omit<StaffTask, 'id' | 'createdAt'>) => void;
  isRushHour: boolean;
  toggleRushHour: () => void;

  // Notifications
  notifications: CanteenNotification[];
  markNotificationRead: (id: string) => void;
  sendNotification: (notif: Omit<CanteenNotification, 'id' | 'timestamp' | 'read'>) => void;

  // Metrics
  kitchenMetrics: KitchenMetrics;
}

const CanteenContext = createContext<CanteenContextType | undefined>(undefined);

// Helper for local storage
const loadStorage = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(`scc_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

const saveStorage = <T,>(key: string, data: T) => {
  try {
    localStorage.setItem(`scc_${key}`, JSON.stringify(data));
  } catch (e) {
    // ignore
  }
};

export const CanteenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [currentRole, setCurrentRole] = useState<UserRole | null>(() => loadStorage('role', null));
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(() => loadStorage('curr_student', null));
  const [currentStaff, setCurrentStaff] = useState<StaffProfile | null>(() => loadStorage('curr_staff', null));

  // Registered students database
  const [registeredStudents, setRegisteredStudents] = useState<StudentProfile[]>(() =>
    loadStorage('students', [
      {
        firstName: 'Aarav',
        lastName: 'Sharma',
        name: 'Aarav Sharma',
        usn: '1RV21CS042',
        mobile: '+91 9845012345',
        email: 'aarav.sharma@campus.edu',
        passwordHash: 'pass123',
        registeredAt: new Date().toISOString(),
      },
      {
        firstName: 'Pooja',
        lastName: 'Hegde',
        name: 'Pooja Hegde',
        usn: '1RV21EC088',
        mobile: '+91 9876543210',
        email: 'pooja.h@campus.edu',
        passwordHash: 'pass123',
        registeredAt: new Date().toISOString(),
      },
    ])
  );

  // Operational states
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => loadStorage('menu', INITIAL_MENU_ITEMS));
  const [pickupSlots, setPickupSlots] = useState<PickupSlot[]>(() => loadStorage('slots', GENERATE_INITIAL_SLOTS()));
  const [selectedSlot, setSelectedSlot] = useState<string>('10:30 AM');
  const [cart, setCart] = useState<OrderItem[]>(() => loadStorage('cart', []));
  const [orders, setOrders] = useState<Order[]>(() => loadStorage('orders', INITIAL_ORDERS));
  const [groupOrders, setGroupOrders] = useState<GroupOrder[]>(() => loadStorage('group_orders', []));
  const [inventory, setInventory] = useState<InventoryItem[]>(() => loadStorage('inventory', INITIAL_INVENTORY));
  const [foodWasteRecords, setFoodWasteRecords] = useState<FoodWasteRecord[]>(() =>
    loadStorage('waste', INITIAL_FOOD_WASTE)
  );
  const [staffTasks, setStaffTasks] = useState<StaffTask[]>(() => loadStorage('tasks', INITIAL_STAFF_TASKS));
  const [notifications, setNotifications] = useState<CanteenNotification[]>(() =>
    loadStorage('notifications', INITIAL_NOTIFICATIONS)
  );
  const [isRushHour, setIsRushHour] = useState<boolean>(() => loadStorage('rush_hour', false));
  const [isTwoHourFreeOrder, setIsTwoHourFreeOrder] = useState<boolean>(() => loadStorage('2hr_order', false));

  // Sync to localStorage
  useEffect(() => saveStorage('role', currentRole), [currentRole]);
  useEffect(() => saveStorage('curr_student', currentStudent), [currentStudent]);
  useEffect(() => saveStorage('curr_staff', currentStaff), [currentStaff]);
  useEffect(() => saveStorage('students', registeredStudents), [registeredStudents]);
  useEffect(() => saveStorage('menu', menuItems), [menuItems]);
  useEffect(() => saveStorage('slots', pickupSlots), [pickupSlots]);
  useEffect(() => saveStorage('cart', cart), [cart]);
  useEffect(() => saveStorage('orders', orders), [orders]);
  useEffect(() => saveStorage('group_orders', groupOrders), [groupOrders]);
  useEffect(() => saveStorage('inventory', inventory), [inventory]);
  useEffect(() => saveStorage('waste', foodWasteRecords), [foodWasteRecords]);
  useEffect(() => saveStorage('tasks', staffTasks), [staffTasks]);
  useEffect(() => saveStorage('notifications', notifications), [notifications]);
  useEffect(() => saveStorage('rush_hour', isRushHour), [isRushHour]);
  useEffect(() => saveStorage('2hr_order', isTwoHourFreeOrder), [isTwoHourFreeOrder]);

  // Two-Hour Free Window Queue orders
  const twoHourQueueOrders = useMemo(() => {
    return orders.filter((o) => o.isTwoHourFreeWindow && o.status !== 'cancelled');
  }, [orders]);

  // Auth Functions
  const registerStudent = useCallback(
    (data: Omit<StudentProfile, 'registeredAt'>) => {
      // Validate unique USN
      const normalizedUsn = data.usn.trim().toUpperCase();
      const existingUsn = registeredStudents.find(
        (s) => s.usn.trim().toUpperCase() === normalizedUsn
      );
      if (existingUsn) {
        return { success: false, error: 'A student with this USN is already registered.' };
      }

      // Validate unique Email
      const normalizedEmail = data.email.trim().toLowerCase();
      const existingEmail = registeredStudents.find(
        (s) => s.email.trim().toLowerCase() === normalizedEmail
      );
      if (existingEmail) {
        return { success: false, error: 'A student with this Email ID is already registered.' };
      }

      const newStudent: StudentProfile = {
        ...data,
        usn: normalizedUsn,
        email: normalizedEmail,
        name: `${data.firstName.trim()} ${data.lastName.trim()}`,
        registeredAt: new Date().toISOString(),
      };

      setRegisteredStudents((prev) => [...prev, newStudent]);
      setCurrentStudent(newStudent);
      setCurrentRole('student');
      return { success: true };
    },
    [registeredStudents]
  );

  const loginStudent = useCallback(
    (usnOrEmail: string, password?: string) => {
      const q = usnOrEmail.trim().toLowerCase();
      const found = registeredStudents.find(
        (s) => s.usn.toLowerCase() === q || s.email.toLowerCase() === q
      );

      if (!found) {
        return { success: false, error: 'Student not found with this USN or Email. Please register first.' };
      }

      if (password && found.passwordHash && found.passwordHash !== password) {
        return { success: false, error: 'Incorrect password entered.' };
      }

      setCurrentStudent(found);
      setCurrentRole('student');
      return { success: true };
    },
    [registeredStudents]
  );

  const loginStaff = useCallback((id: string, _pin?: string) => {
    const staffUser: StaffProfile = {
      id: id || 'STAFF-101',
      name: 'Chef Ramesh (Head Kitchen Lead)',
      role: 'staff',
      section: 'preparation',
      phone: '+91 9988776655',
    };
    setCurrentStaff(staffUser);
    setCurrentRole('staff');
    return { success: true };
  }, []);

  const loginManager = useCallback((id: string, _pin?: string) => {
    const managerUser: StaffProfile = {
      id: id || 'MGR-01',
      name: 'Dr. K. Srinivas (Campus Canteen Director)',
      role: 'manager',
      section: 'verification',
      phone: '+91 9844001122',
    };
    setCurrentStaff(managerUser);
    setCurrentRole('manager');
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setCurrentRole(null);
    setCurrentStudent(null);
    setCurrentStaff(null);
    localStorage.removeItem('scc_role');
    localStorage.removeItem('scc_curr_student');
    localStorage.removeItem('scc_curr_staff');
  }, []);

  const setCurrentRoleDirect = useCallback((role: UserRole | null) => {
    setCurrentRole(role);
    if (role === 'staff' && !currentStaff) {
      setCurrentStaff({
        id: 'STAFF-101',
        name: 'Chef Ramesh (Kitchen Operations)',
        role: 'staff',
        section: 'preparation',
      });
    } else if (role === 'manager' && !currentStaff) {
      setCurrentStaff({
        id: 'MGR-01',
        name: 'Dr. K. Srinivas (Canteen Director)',
        role: 'manager',
        section: 'verification',
      });
    } else if (role === 'student' && !currentStudent) {
      setCurrentStudent(registeredStudents[0] || null);
    }
  }, [currentStaff, currentStudent, registeredStudents]);

  // Cart operations
  const addToCart = useCallback((item: MenuItem) => {
    if (!item.isAvailable) return;
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.menuItemId === item.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((menuItemId: string) => {
    setCart((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  }, []);

  const updateCartQty = useCallback((menuItemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((i) => {
          if (i.menuItemId === menuItemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as OrderItem[];
    });
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  // Generate next sequential token e.g. T005
  const generateNextToken = useCallback(() => {
    const existingTokens = orders
      .map((o) => {
        const match = o.token.match(/T(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const maxNum = existingTokens.length > 0 ? Math.max(...existingTokens) : 0;
    const nextNum = maxNum + 1;
    return `T${nextNum.toString().padStart(3, '0')}`;
  }, [orders]);

  // Place individual order (with 2-Hour Free Window support)
  const placeOrder = useCallback(
    async (paymentMethod: 'cash' | 'online', paymentId?: string, isTwoHourFreeWindow?: boolean) => {
      if (!currentStudent) {
        return { success: false, error: 'Student registration is required to place orders.' };
      }
      if (cart.length === 0) {
        return { success: false, error: 'Your cart is empty. Add food items before booking.' };
      }

      const is2Hr = isTwoHourFreeWindow !== undefined ? isTwoHourFreeWindow : isTwoHourFreeOrder;
      let targetSlot = selectedSlot;
      let expiresWindowTime: string | undefined = undefined;

      if (is2Hr) {
        // Free for 2 hours: Do NOT require or check fixed 15-minute slot capacity!
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        expiresWindowTime = expiresAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        targetSlot = 'Flexible 2-Hour Window';
      } else {
        // Normal slot booking: check slot capacity
        const slot = pickupSlots.find((s) => s.time === selectedSlot);
        if (!slot) {
          return { success: false, error: 'Please choose an available pickup slot.' };
        }
        if (slot.booked >= slot.capacity) {
          return { success: false, error: `Pickup slot ${slot.time} has reached maximum capacity (30 orders). Please choose another slot.` };
        }
      }

      const token = generateNextToken();
      const orderId = `ORD-${Date.now().toString().slice(-5)}`;
      const subtotal = cartTotal;
      const taxFee = Math.round(subtotal * 0.05); // 5% fee
      const grandTotal = subtotal + taxFee;

      const initialPackedState: Record<string, boolean> = {};
      cart.forEach((_, idx) => {
        initialPackedState[idx.toString()] = false;
      });

      const newOrder: Order = {
        id: orderId,
        token,
        studentName: currentStudent.name,
        usn: currentStudent.usn,
        mobile: currentStudent.mobile,
        email: currentStudent.email,
        date: new Date().toISOString().split('T')[0],
        pickupSlot: targetSlot,
        items: [...cart],
        subtotal,
        taxFee,
        totalAmount: grandTotal,
        paymentMethod,
        paymentStatus: paymentMethod === 'online' ? 'verified' : 'pending',
        paymentId: paymentId || (paymentMethod === 'online' ? `pay_sim_${Date.now()}` : undefined),
        status: paymentMethod === 'online' ? 'payment_verified' : 'confirmed',
        createdAt: new Date().toISOString(),
        estimatedReadyTime: is2Hr ? `Within 2 Hours (by ${expiresWindowTime})` : selectedSlot,
        packedItems: initialPackedState,
        prepDurationSeconds: 600, // 10 minutes default
        isTwoHourFreeWindow: is2Hr,
        twoHourWindowExpiresAt: expiresWindowTime,
      };

      // Atomic updates
      setOrders((prev) => [newOrder, ...prev]);

      // Increment slot booked count only for fixed slots
      if (!is2Hr) {
        setPickupSlots((prev) =>
          prev.map((s) => (s.time === selectedSlot ? { ...s, booked: s.booked + 1 } : s))
        );
      }

      // Decrement inventory stocks proportionally
      setInventory((prev) =>
        prev.map((inv) => {
          if (inv.name.includes('Packaging') || inv.name.includes('Paper')) {
            return { ...inv, currentStock: Math.max(0, inv.currentStock - 1) };
          }
          return inv;
        })
      );

      // Add real notification for registered student
      const notif: CanteenNotification = {
        id: `notif-${Date.now()}`,
        recipientRole: 'student',
        recipientUsn: currentStudent.usn,
        title: is2Hr ? `⚡ 2-Hour Order ${token} in Queue!` : `Order ${token} Confirmed!`,
        message: is2Hr
          ? `Order ${token} has joined the 2-Hour Flexible Queue! Prepared fresh within your 2-hour window (by ${expiresWindowTime}).`
          : `Order ${token} placed for slot ${selectedSlot}. Grand Total: ₹${grandTotal}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        type: 'order',
      };
      setNotifications((prev) => [notif, ...prev]);

      // Clear cart after placing order & reset 2-hr mode
      setCart([]);
      setIsTwoHourFreeOrder(false);

      return { success: true, order: newOrder };
    },
    [cart, cartTotal, currentStudent, generateNextToken, isTwoHourFreeOrder, pickupSlots, selectedSlot]
  );

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updated = { ...o, status };
          if (status === 'preparing' && !o.prepTimerStartedAt) {
            updated.prepTimerStartedAt = Date.now();
          }
          if (status === 'collected' && !o.collectedAt) {
            updated.collectedAt = new Date().toISOString();
          }

          // Trigger completion notification for registered student
          if (status === 'ready' || status === 'collected') {
            const notifTitle = status === 'ready'
              ? (o.isTwoHourFreeWindow ? `🎉 2-Hour Order Ready for Collection!` : `🎉 Order ${o.token} Ready!`)
              : (o.isTwoHourFreeWindow ? `✅ 2-Hour Order Completed!` : `✅ Order Completed!`);

            const notifMsg = status === 'ready'
              ? (o.isTwoHourFreeWindow
                  ? `Your 2-Hour Window order (Token ${o.token}) for ${o.studentName} is freshly prepared and ready for pickup at Counter!`
                  : `Token ${o.token} is packed and ready for collection at Counter.`)
              : (o.isTwoHourFreeWindow
                  ? `Your 2-Hour Window order (Token ${o.token}) has been completed and collected within your 2-hour free window!`
                  : `Token ${o.token} collected at Counter. Enjoy your fresh meal!`);

            const completionNotif: CanteenNotification = {
              id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              recipientRole: 'student',
              recipientUsn: o.usn,
              title: notifTitle,
              message: notifMsg,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              read: false,
              type: 'order',
            };
            setNotifications((prevNotifs) => [completionNotif, ...prevNotifs]);
          }

          return updated;
        }
        return o;
      })
    );
  }, []);

  const toggleItemPacked = useCallback((orderId: string, itemKey: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const nextPacked = { ...o.packedItems, [itemKey]: !o.packedItems[itemKey] };
          const allPacked = o.items.every((_, idx) => nextPacked[idx.toString()]);
          const newStatus = allPacked ? 'ready' : o.status === 'preparing' ? 'packing' : o.status;

          if (allPacked && o.status !== 'ready') {
            const notifTitle = o.isTwoHourFreeWindow ? `🎉 2-Hour Order Ready for Collection!` : `🎉 Order ${o.token} Ready!`;
            const notifMsg = o.isTwoHourFreeWindow
              ? `Your 2-Hour Window order (Token ${o.token}) for ${o.studentName} is freshly prepared and ready for pickup at Counter!`
              : `Token ${o.token} is packed and ready for collection at Counter.`;

            const readyNotif: CanteenNotification = {
              id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              recipientRole: 'student',
              recipientUsn: o.usn,
              title: notifTitle,
              message: notifMsg,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              read: false,
              type: 'order',
            };
            setNotifications((prevNotifs) => [readyNotif, ...prevNotifs]);
          }

          return {
            ...o,
            packedItems: nextPacked,
            status: newStatus,
          };
        }
        return o;
      })
    );
  }, []);

  // Confirm Food Collection with duplicate prevention
  const confirmFoodCollection = useCallback(
    (tokenOrId: string) => {
      const target = orders.find(
        (o) =>
          o.token.toUpperCase() === tokenOrId.trim().toUpperCase() ||
          o.id.toUpperCase() === tokenOrId.trim().toUpperCase()
      );

      if (!target) {
        return { success: false, message: `No order found with Token/ID "${tokenOrId}".` };
      }

      if (target.status === 'collected') {
        return {
          success: false,
          message: `Warning: Order ${target.token} has already been collected on ${new Date(
            target.collectedAt || target.createdAt
          ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Duplicate collection prevented!`,
          order: target,
        };
      }

      // Check if all items are packed
      const allPacked = target.items.every((_, idx) => target.packedItems[idx.toString()]);
      if (!allPacked && target.status !== 'ready') {
        // Can still collect if kitchen staff overrides, but warn
      }

      const collectedTime = new Date().toISOString();
      setOrders((prev) =>
        prev.map((o) => (o.id === target.id ? { ...o, status: 'collected' as const, collectedAt: collectedTime } : o))
      );

      // Notification
      const notif: CanteenNotification = {
        id: `notif-${Date.now()}`,
        recipientRole: 'student',
        recipientUsn: target.usn,
        title: `Food Collected!`,
        message: `Token ${target.token} collected at Counter. Enjoy your fresh meal!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        type: 'order',
      };
      setNotifications((prev) => [notif, ...prev]);

      return {
        success: true,
        message: `Order ${target.token} successfully verified and marked COLLECTED.`,
        order: { ...target, status: 'collected' as const, collectedAt: collectedTime },
      };
    },
    [orders]
  );

  const confirmGroupCollection = useCallback(
    (groupId: string) => {
      const grp = groupOrders.find((g) => g.id.toUpperCase() === groupId.trim().toUpperCase());
      if (!grp) {
        return { success: false, message: `Group Order ${groupId} not found.` };
      }
      if (grp.status === 'collected') {
        return {
          success: false,
          message: `Group Order ${grp.id} has already been collected! Duplicate prevented.`,
          group: grp,
        };
      }

      const collectedTime = new Date().toISOString();
      setGroupOrders((prev) =>
        prev.map((g) => (g.id === grp.id ? { ...g, status: 'collected' as const, collectedAt: collectedTime } : g))
      );

      // Also mark any individual orders linked to this group as collected
      setOrders((prev) =>
        prev.map((o) => (o.groupOrderId === grp.id ? { ...o, status: 'collected' as const, collectedAt: collectedTime } : o))
      );

      return {
        success: true,
        message: `Group Order ${grp.id} (${grp.members.length} members) confirmed and collected!`,
        group: { ...grp, status: 'collected' as const, collectedAt: collectedTime },
      };
    },
    [groupOrders]
  );

  const getOrderByIdOrToken = useCallback(
    (query: string) => {
      const q = query.trim().toUpperCase();
      return orders.find((o) => o.token.toUpperCase() === q || o.id.toUpperCase() === q);
    },
    [orders]
  );

  // Group Ordering implementations
  const createGroupOrder = useCallback(
    (slot: string): GroupOrder => {
      const id = `GRP-${Math.floor(1000 + Math.random() * 9000)}`;
      const leader = currentStudent || {
        firstName: 'Student',
        lastName: 'Leader',
        name: 'Group Leader',
        usn: '1RV21CS001',
        mobile: '+91 9845011111',
        email: 'leader@campus.edu',
        registeredAt: new Date().toISOString(),
      };

      const newGroup: GroupOrder = {
        id,
        leaderUsn: leader.usn,
        leaderName: leader.name,
        pickupSlot: slot || selectedSlot,
        date: new Date().toISOString().split('T')[0],
        members: [
          {
            usn: leader.usn,
            name: leader.name,
            status: 'joined',
            items: cart.length > 0 ? [...cart] : [{ menuItemId: 'bf-2', name: 'Masala Dosa', price: 60, quantity: 1 }],
            individualTotal: cartTotal > 0 ? cartTotal : 60,
            isPaid: false,
          },
        ],
        paymentType: 'combined',
        status: 'forming',
        groupQrPayload: JSON.stringify({ type: 'GROUP_INVITE', groupId: id, slot: slot || selectedSlot }),
        createdAt: new Date().toISOString(),
      };

      setGroupOrders((prev) => [newGroup, ...prev]);
      return newGroup;
    },
    [cart, cartTotal, currentStudent, selectedSlot]
  );

  const joinGroupOrderByCode = useCallback(
    (groupOrderId: string, studentProfile?: StudentProfile) => {
      const student = studentProfile || currentStudent;
      if (!student) {
        return { success: false, error: 'Please register or sign in to join this group order.' };
      }

      const targetGroup = groupOrders.find((g) => g.id.toUpperCase() === groupOrderId.trim().toUpperCase());
      if (!targetGroup) {
        return { success: false, error: `Group order "${groupOrderId}" does not exist or has expired.` };
      }

      if (targetGroup.status !== 'forming') {
        return { success: false, error: `Group order ${targetGroup.id} has already been closed/confirmed.` };
      }

      // Check if already member
      const isMember = targetGroup.members.some((m) => m.usn.toUpperCase() === student.usn.toUpperCase());
      if (isMember) {
        return { success: true, group: targetGroup };
      }

      const newMember = {
        usn: student.usn,
        name: student.name,
        status: 'joined' as const,
        items: [],
        individualTotal: 0,
        isPaid: false,
      };

      const updated = {
        ...targetGroup,
        members: [...targetGroup.members, newMember],
      };

      setGroupOrders((prev) => prev.map((g) => (g.id === targetGroup.id ? updated : g)));
      return { success: true, group: updated };
    },
    [currentStudent, groupOrders]
  );

  const addMemberToGroup = useCallback(
    (groupOrderId: string, usn: string, name: string) => {
      const cleanUsn = usn.trim().toUpperCase();
      let added = false;
      setGroupOrders((prev) =>
        prev.map((g) => {
          if (g.id === groupOrderId) {
            if (g.members.some((m) => m.usn.toUpperCase() === cleanUsn)) {
              return g;
            }
            added = true;
            return {
              ...g,
              members: [
                ...g.members,
                {
                  usn: cleanUsn,
                  name: name || cleanUsn,
                  status: 'joined',
                  items: [],
                  individualTotal: 0,
                  isPaid: false,
                },
              ],
            };
          }
          return g;
        })
      );
      return added;
    },
    []
  );

  const removeMemberFromGroup = useCallback((groupOrderId: string, usn: string) => {
    let removed = false;
    setGroupOrders((prev) =>
      prev.map((g) => {
        if (g.id === groupOrderId) {
          if (g.leaderUsn.toUpperCase() === usn.toUpperCase()) {
            return g; // cannot remove leader
          }
          removed = true;
          return {
            ...g,
            members: g.members.filter((m) => m.usn.toUpperCase() !== usn.toUpperCase()),
          };
        }
        return g;
      })
    );
    return removed;
  }, []);

  const updateGroupMemberItems = useCallback(
    (groupOrderId: string, usn: string, items: OrderItem[]) => {
      const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
      setGroupOrders((prev) =>
        prev.map((g) => {
          if (g.id === groupOrderId) {
            return {
              ...g,
              members: g.members.map((m) => {
                if (m.usn.toUpperCase() === usn.toUpperCase()) {
                  return { ...m, items, individualTotal: total };
                }
                return m;
              }),
            };
          }
          return g;
        })
      );
    },
    []
  );

  const confirmGroupOrder = useCallback(
    (groupOrderId: string, paymentType: 'individual' | 'combined') => {
      const grp = groupOrders.find((g) => g.id === groupOrderId);
      if (!grp) {
        return { success: false, error: 'Group order not found.' };
      }

      // Validate capacity: each member counts individually
      const slot = pickupSlots.find((s) => s.time === grp.pickupSlot);
      if (!slot) {
        return { success: false, error: 'Invalid pickup slot selected for group.' };
      }

      const memberCount = grp.members.length;
      if (slot.booked + memberCount > slot.capacity) {
        return {
          success: false,
          error: `Slot ${slot.time} cannot accommodate ${memberCount} members (available: ${slot.capacity - slot.booked}). Please choose a less busy slot.`,
        };
      }

      // Check if all members have items
      const hasEmptyMembers = grp.members.some((m) => m.items.length === 0);
      if (hasEmptyMembers) {
        return {
          success: false,
          error: 'All group members must select at least one food item before confirming.',
        };
      }

      // Update slot booked count
      setPickupSlots((prev) =>
        prev.map((s) => (s.time === grp.pickupSlot ? { ...s, booked: s.booked + memberCount } : s))
      );

      // Create individual sub-orders for tracking
      const updatedMembers = grp.members.map((m) => {
        const token = generateNextToken();
        const subOrder: Order = {
          id: `ORD-GRP-${Date.now().toString().slice(-4)}-${m.usn.slice(-3)}`,
          token,
          studentName: m.name,
          usn: m.usn,
          mobile: '+91 9900011222',
          date: grp.date,
          pickupSlot: grp.pickupSlot,
          items: m.items,
          subtotal: m.individualTotal,
          taxFee: Math.round(m.individualTotal * 0.05),
          totalAmount: m.individualTotal + Math.round(m.individualTotal * 0.05),
          paymentMethod: 'online',
          paymentStatus: 'verified',
          paymentId: `pay_grp_${Date.now()}`,
          status: 'confirmed',
          createdAt: new Date().toISOString(),
          estimatedReadyTime: grp.pickupSlot,
          packedItems: m.items.reduce((acc, _, i) => ({ ...acc, [i.toString()]: false }), {}),
          isGroupOrder: true,
          groupOrderId: grp.id,
          groupMemberCount: memberCount,
        };
        setOrders((prev) => [subOrder, ...prev]);
        return { ...m, isPaid: true };
      });

      const updatedGroup: GroupOrder = {
        ...grp,
        members: updatedMembers,
        paymentType,
        status: 'confirmed',
        groupQrPayload: JSON.stringify({ type: 'GROUP_COLLECTION', groupId: grp.id, membersCount: memberCount }),
      };

      setGroupOrders((prev) => prev.map((g) => (g.id === grp.id ? updatedGroup : g)));

      return { success: true, group: updatedGroup };
    },
    [generateNextToken, groupOrders, pickupSlots]
  );

  const activeGroupOrder = useMemo(() => {
    if (!currentStudent) return groupOrders[0] || null;
    return (
      groupOrders.find((g) => g.members.some((m) => m.usn.toUpperCase() === currentStudent.usn.toUpperCase())) ||
      null
    );
  }, [currentStudent, groupOrders]);

  // Operational management
  const updateMenuItem = useCallback((item: MenuItem) => {
    setMenuItems((prev) => prev.map((m) => (m.id === item.id ? item : m)));
  }, []);

  const addMenuItem = useCallback((item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `custom-${Date.now()}`,
    };
    setMenuItems((prev) => [newItem, ...prev]);
  }, []);

  const deleteMenuItem = useCallback((id: string) => {
    setMenuItems((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const toggleFoodAvailability = useCallback((id: string) => {
    setMenuItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isAvailable: !m.isAvailable } : m))
    );
  }, []);

  const updateSlotCapacity = useCallback((slotId: string, newCapacity: number) => {
    setPickupSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, capacity: Math.max(1, newCapacity) } : s))
    );
  }, []);

  const updateInventoryStock = useCallback((id: string, amount: number) => {
    setInventory((prev) =>
      prev.map((inv) => {
        if (inv.id === id) {
          const nextStock = Math.max(0, inv.currentStock + amount);
          const status = nextStock <= inv.minimumRequired * 0.5 ? 'critical' : nextStock <= inv.minimumRequired ? 'low' : 'sufficient';
          return { ...inv, currentStock: nextStock, status, lastUpdated: 'Just now' };
        }
        return inv;
      })
    );
  }, []);

  const addFoodWasteRecord = useCallback((record: Omit<FoodWasteRecord, 'id' | 'timestamp'>) => {
    const newRecord: FoodWasteRecord = {
      ...record,
      id: `fw-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setFoodWasteRecords((prev) => [newRecord, ...prev]);
  }, []);

  const updateTaskStatus = useCallback((taskId: string, status: StaffTask['status']) => {
    setStaffTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
  }, []);

  const addTask = useCallback((task: Omit<StaffTask, 'id' | 'createdAt'>) => {
    const newTask: StaffTask = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setStaffTasks((prev) => [newTask, ...prev]);
  }, []);

  const toggleRushHour = useCallback(() => {
    setIsRushHour((prev) => !prev);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const sendNotification = useCallback((notif: Omit<CanteenNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: CanteenNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  // Compute real kitchen metrics
  const kitchenMetrics: KitchenMetrics = useMemo(() => {
    const totalOrdersToday = orders.length;
    const newOrders = orders.filter((o) => o.status === 'confirmed').length;
    const ordersPreparing = orders.filter((o) => o.status === 'preparing' || o.status === 'payment_verified').length;
    const ordersPacking = orders.filter((o) => o.status === 'packing').length;
    const ordersReady = orders.filter((o) => o.status === 'ready').length;
    const ordersCompleted = orders.filter((o) => o.status === 'collected').length;
    const delayedOrders = orders.filter((o) => o.status !== 'collected' && o.status !== 'ready' && o.status !== 'cancelled').length > 5 ? 2 : 0;
    const revenueToday = orders
      .filter((o) => o.paymentStatus === 'verified')
      .reduce((acc, o) => acc + o.totalAmount, 0);

    return {
      totalOrdersToday,
      newOrders,
      ordersPreparing,
      ordersPacking,
      ordersReady,
      ordersCompleted,
      delayedOrders,
      revenueToday,
      activeStudents: registeredStudents.length,
    };
  }, [orders, registeredStudents.length]);

  return (
    <CanteenContext.Provider
      value={{
        currentRole,
        currentStudent,
        currentStaff,
        registerStudent,
        loginStudent,
        loginStaff,
        loginManager,
        logout,
        setCurrentRoleDirect,
        menuItems,
        pickupSlots,
        selectedSlot,
        setSelectedSlot,
        updateMenuItem,
        addMenuItem,
        deleteMenuItem,
        toggleFoodAvailability,
        updateSlotCapacity,
        cart,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        cartTotal,
        orders,
        placeOrder,
        updateOrderStatus,
        toggleItemPacked,
        confirmFoodCollection,
        confirmGroupCollection,
        getOrderByIdOrToken,
        isTwoHourFreeOrder,
        setIsTwoHourFreeOrder,
        twoHourQueueOrders,
        groupOrders,
        activeGroupOrder,
        createGroupOrder,
        joinGroupOrderByCode,
        addMemberToGroup,
        removeMemberFromGroup,
        updateGroupMemberItems,
        confirmGroupOrder,
        inventory,
        updateInventoryStock,
        foodWasteRecords,
        addFoodWasteRecord,
        staffTasks,
        updateTaskStatus,
        addTask,
        isRushHour,
        toggleRushHour,
        notifications,
        markNotificationRead,
        sendNotification,
        kitchenMetrics,
      }}
    >
      {children}
    </CanteenContext.Provider>
  );
};

export const useCanteen = () => {
  const context = useContext(CanteenContext);
  if (!context) {
    throw new Error('useCanteen must be used within a CanteenProvider');
  }
  return context;
};
