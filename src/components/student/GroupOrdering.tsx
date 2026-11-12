import React, { useState, useMemo } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { GroupOrder, OrderItem, MenuItem, FoodCategory } from '../../types';
import { CameraQRScanner } from '../common/CameraQRScanner';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import {
  Users,
  QrCode,
  UserPlus,
  Trash2,
  Share2,
  CheckCircle2,
  Clock,
  Plus,
  Minus,
  Sparkles,
  CreditCard,
  AlertCircle,
  Copy,
  UtensilsCrossed,
  Search,
  Leaf,
  Coffee,
  X,
  Check,
} from 'lucide-react';

interface GroupOrderingProps {
  onBackToDashboard: () => void;
}

export const GroupOrdering: React.FC<GroupOrderingProps> = ({ onBackToDashboard }) => {
  const {
    currentStudent,
    menuItems,
    pickupSlots,
    selectedSlot,
    groupOrders,
    createGroupOrder,
    joinGroupOrderByCode,
    addMemberToGroup,
    removeMemberFromGroup,
    updateGroupMemberItems,
    confirmGroupOrder,
  } = useCanteen();

  // Find active group where current student is member or leader
  const activeGroup = currentStudent
    ? groupOrders.find((g) => g.members.some((m) => m.usn.toUpperCase() === currentStudent.usn.toUpperCase()))
    : groupOrders[0];

  // Modals & form state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [friendUsn, setFriendUsn] = useState('');
  const [friendName, setFriendName] = useState('');
  const [groupSlot, setGroupSlot] = useState(activeGroup?.pickupSlot || selectedSlot);
  const [paymentChoice, setPaymentChoice] = useState<'combined' | 'individual'>('combined');
  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Full Canteen Menu Selector Modal for Squad
  const [showFoodPicker, setShowFoodPicker] = useState(false);
  const [selectedMemberUsn, setSelectedMemberUsn] = useState<string>('');
  const [menuModalCategory, setMenuModalCategory] = useState<FoodCategory | 'All'>('All');
  const [menuModalSearch, setMenuModalSearch] = useState('');

  const menuCategories: Array<FoodCategory | 'All'> = [
    'All',
    'Breakfast',
    'Rice and Lunch',
    'Chats and Snacks',
    'Juices',
    'Milkshakes',
    'Beverages',
  ];

  // Group creation
  const handleCreateNewGroup = () => {
    const newGrp = createGroupOrder(groupSlot);
    setNotificationMsg({
      type: 'success',
      text: `Group Order ${newGrp.id} created! Share the Group QR or invitation code with friends.`,
    });
  };

  // Add friend by leader
  const handleAddFriendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup) return;

    if (!friendUsn.trim()) {
      setNotificationMsg({ type: 'error', text: 'Please enter friend USN.' });
      return;
    }

    const added = addMemberToGroup(activeGroup.id, friendUsn.trim(), friendName.trim() || friendUsn.trim());
    if (added) {
      setNotificationMsg({ type: 'success', text: `Friend ${friendUsn.toUpperCase()} added to group!` });
      setFriendUsn('');
      setFriendName('');
      setShowAddFriendModal(false);
    } else {
      setNotificationMsg({ type: 'error', text: 'This student is already a member of this group.' });
    }
  };

  // Scan QR code result
  const handleQRScanResult = (scannedData: string) => {
    setIsScannerOpen(false);
    try {
      let codeToJoin = scannedData.trim();
      // Parse JSON payload if encoded as JSON
      if (scannedData.includes('{')) {
        const parsed = JSON.parse(scannedData);
        if (parsed.groupId) {
          codeToJoin = parsed.groupId;
        }
      }

      const res = joinGroupOrderByCode(codeToJoin);
      if (res.success && res.group) {
        setNotificationMsg({
          type: 'success',
          text: `Successfully joined Group ${res.group.id}! You can now select your food tray.`,
        });
      } else {
        setNotificationMsg({
          type: 'error',
          text: res.error || 'Invalid or expired Group invitation code.',
        });
      }
    } catch {
      // Direct group ID match
      const res = joinGroupOrderByCode(scannedData.trim());
      if (res.success) {
        setNotificationMsg({ type: 'success', text: `Successfully joined Group ${scannedData}!` });
      } else {
        setNotificationMsg({ type: 'error', text: 'Failed to parse group QR payload.' });
      }
    }
  };

  // Open Menu Selector for a specific member or default
  const handleOpenMenuForMember = (usnToEdit?: string) => {
    if (!activeGroup) return;
    const targetUsn =
      usnToEdit ||
      currentStudent?.usn ||
      activeGroup.members[0]?.usn ||
      '';
    setSelectedMemberUsn(targetUsn);
    setMenuModalCategory('All');
    setMenuModalSearch('');
    setShowFoodPicker(true);
  };

  // Add Item to a specific member's tray
  const handleAddItemToMember = (targetUsn: string, item: MenuItem) => {
    if (!activeGroup) return;
    const member = activeGroup.members.find((m) => m.usn.toUpperCase() === targetUsn.toUpperCase());
    if (!member) return;

    const existing = [...member.items];
    const idx = existing.findIndex((i) => i.menuItemId === item.id);
    if (idx > -1) {
      existing[idx] = { ...existing[idx], quantity: existing[idx].quantity + 1 };
    } else {
      existing.push({ menuItemId: item.id, name: item.name, price: item.price, quantity: 1 });
    }
    updateGroupMemberItems(activeGroup.id, member.usn, existing);
  };

  // Update item quantity for a specific member
  const handleUpdateMemberQty = (targetUsn: string, menuItemId: string, delta: number) => {
    if (!activeGroup) return;
    const member = activeGroup.members.find((m) => m.usn.toUpperCase() === targetUsn.toUpperCase());
    if (!member) return;

    const next = member.items
      .map((i) => {
        if (i.menuItemId === menuItemId) {
          const newQ = i.quantity + delta;
          return newQ > 0 ? { ...i, quantity: newQ } : null;
        }
        return i;
      })
      .filter(Boolean) as OrderItem[];
    updateGroupMemberItems(activeGroup.id, member.usn, next);
  };

  // Remove specific item from member
  const handleRemoveMemberItem = (targetUsn: string, menuItemId: string) => {
    if (!activeGroup) return;
    const member = activeGroup.members.find((m) => m.usn.toUpperCase() === targetUsn.toUpperCase());
    if (!member) return;

    const next = member.items.filter((i) => i.menuItemId !== menuItemId);
    updateGroupMemberItems(activeGroup.id, member.usn, next);
  };

  // Confirm group order
  const handleConfirmGroup = () => {
    if (!activeGroup) return;
    const res = confirmGroupOrder(activeGroup.id, paymentChoice);
    if (res.success) {
      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      } catch {}
      setNotificationMsg({
        type: 'success',
        text: `Group Order ${activeGroup.id} successfully confirmed! All member orders are locked.`,
      });
    } else {
      setNotificationMsg({ type: 'error', text: res.error || 'Failed to confirm group order.' });
    }
  };

  const isLeader = activeGroup && currentStudent ? activeGroup.leaderUsn.toUpperCase() === currentStudent.usn.toUpperCase() : true;
  const groupGrandTotal = activeGroup
    ? activeGroup.members.reduce((acc, m) => acc + m.individualTotal, 0)
    : 0;

  // Active member being edited in modal
  const activeEditingMember = activeGroup?.members.find(
    (m) => m.usn.toUpperCase() === selectedMemberUsn.toUpperCase()
  ) || activeGroup?.members[0];

  // Filtered items in menu selector
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCat = menuModalCategory === 'All' || item.category === menuModalCategory;
      const matchSearch =
        item.name.toLowerCase().includes(menuModalSearch.toLowerCase()) ||
        item.description.toLowerCase().includes(menuModalSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menuItems, menuModalCategory, menuModalSearch]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in pb-20">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBackToDashboard}
            className="text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors cursor-pointer mb-1 block"
          >
            &larr; Back to Student Dashboard
          </button>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-orange-600" />
            <span>Group Ordering &amp; Express Friend Squad</span>
          </h2>
          <p className="text-sm text-slate-600">
            Order together from class, customize individual food trays from the canteen menu, and collect with a single group QR.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-orange-400" />
            <span>Scan to Join Group</span>
          </button>

          {!activeGroup && (
            <button
              type="button"
              onClick={handleCreateNewGroup}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold rounded-xl flex items-center gap-2 shadow-md shadow-orange-600/20 transition-all cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Create New Group</span>
            </button>
          )}
        </div>
      </div>

      {notificationMsg && (
        <div
          className={`p-4 rounded-2xl text-sm flex items-center gap-3 animate-in fade-in ${
            notificationMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {notificationMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span className="font-medium">{notificationMsg.text}</span>
        </div>
      )}

      {/* No Active Group View */}
      {!activeGroup ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No Active Group Order</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Initiate a group order as squad leader or scan a classmate&apos;s QR code to pool selections together for lunch.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              type="button"
              onClick={handleCreateNewGroup}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white text-sm font-extrabold rounded-xl shadow-lg shadow-orange-600/20 transition-all cursor-pointer"
            >
              Start Squad Order
            </button>
            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold rounded-xl transition-all cursor-pointer"
            >
              Scan Squad QR
            </button>
          </div>
        </div>
      ) : (
        /* Active Group Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Squad Overview & Member Trays */}
          <div className="lg:col-span-2 space-y-6">
            {/* Squad Leader & ID Banner */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-orange-100 uppercase tracking-widest block mb-1">
                    Squad Group Order ID
                  </span>
                  <div className="text-3xl font-black font-mono tracking-tight flex items-center gap-2">
                    <span>{activeGroup.id}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(activeGroup.id);
                        alert(`Copied ${activeGroup.id} to clipboard!`);
                      }}
                      className="p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                      title="Copy Group ID"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-orange-100 mt-1">
                    Leader: <strong className="text-white">{activeGroup.leaderName}</strong> ({activeGroup.leaderUsn})
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 text-right">
                  <div className="text-[11px] text-orange-100 uppercase tracking-wider font-semibold">
                    Squad Size
                  </div>
                  <div className="text-2xl font-black font-mono text-white">
                    {activeGroup.members.length} Members
                  </div>
                  <div className="text-[11px] text-orange-100 flex items-center justify-end gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>Slot: {activeGroup.pickupSlot}</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs">
                <span className="text-orange-100">
                  Status: <strong className="uppercase font-mono text-white">{activeGroup.status}</strong>
                </span>
                <span className="bg-white text-orange-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                  {activeGroup.paymentType === 'combined' ? 'Combined Leader Bill' : 'Split Member Payment'}
                </span>
              </div>
            </div>

            {/* Members & Individual Food Trays */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-500" />
                    <span>Member Food Trays ({activeGroup.members.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Everyone has full access to browse the menu, add items, and adjust quantities.
                  </p>
                </div>

                {activeGroup.status === 'forming' && (
                  <div className="flex items-center gap-2">
                    {/* Primary Button to Open Squad Menu Selector */}
                    <button
                      type="button"
                      onClick={() => handleOpenMenuForMember()}
                      className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-orange-600/20 transition-all cursor-pointer"
                    >
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                      <span>Select Menu Items</span>
                    </button>

                    {isLeader && (
                      <button
                        type="button"
                        onClick={() => setShowAddFriendModal(true)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Add Friends</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Member Trays List */}
              <div className="space-y-4">
                {activeGroup.members.map((member) => {
                  const isCurrent = currentStudent?.usn.toUpperCase() === member.usn.toUpperCase();
                  const isLeaderMember = activeGroup.leaderUsn.toUpperCase() === member.usn.toUpperCase();

                  return (
                    <div
                      key={member.usn}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'border-orange-400 bg-orange-50/20 ring-1 ring-orange-400'
                          : 'border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      {/* Member Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-slate-900">{member.name}</span>
                          <span className="text-xs text-slate-500 font-mono">({member.usn})</span>
                          {isLeaderMember && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-md">
                              Squad Leader
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[10px] bg-orange-600 text-white font-bold px-1.5 py-0.5 rounded-md">
                              You
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono font-extrabold text-sm text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                            Tray: ₹{member.individualTotal}
                          </span>

                          {isLeader && !isLeaderMember && activeGroup.status === 'forming' && (
                            <button
                              type="button"
                              onClick={() => removeMemberFromGroup(activeGroup.id, member.usn)}
                              className="text-slate-400 hover:text-red-500 transition-colors p-1"
                              title="Remove member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Items in this member's tray */}
                      {member.items.length === 0 ? (
                        <div className="text-xs text-slate-400 italic py-2 bg-white/70 rounded-xl px-3 border border-dashed border-slate-200">
                          No items added yet. Click &ldquo;+ Select / Add Items from Menu&rdquo; to pick food!
                        </div>
                      ) : (
                        <div className="space-y-1.5 pt-1">
                          {member.items.map((it, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center text-xs bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs"
                            >
                              <div className="flex-1 pr-2">
                                <span className="font-bold text-slate-800 block">{it.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">₹{it.price} each</span>
                              </div>

                              <div className="flex items-center gap-3">
                                {/* Interactive Stepper: Accessible to everyone while group is forming */}
                                {activeGroup.status === 'forming' ? (
                                  <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateMemberQty(member.usn, it.menuItemId, -1)}
                                      className="w-5 h-5 bg-white rounded flex items-center justify-center font-bold text-slate-700 hover:bg-orange-100 hover:text-orange-700 transition-colors cursor-pointer"
                                      title="Decrease quantity"
                                    >
                                      <Minus className="w-2.5 h-2.5" />
                                    </button>
                                    <span className="w-5 text-center font-bold font-mono text-slate-900 text-xs">
                                      {it.quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateMemberQty(member.usn, it.menuItemId, 1)}
                                      className="w-5 h-5 bg-white rounded flex items-center justify-center font-bold text-slate-700 hover:bg-orange-100 hover:text-orange-700 transition-colors cursor-pointer"
                                      title="Increase quantity"
                                    >
                                      <Plus className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-slate-500 font-mono">x{it.quantity}</span>
                                )}

                                <span className="font-extrabold font-mono text-slate-900 w-14 text-right">
                                  ₹{it.price * it.quantity}
                                </span>

                                {activeGroup.status === 'forming' && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveMemberItem(member.usn, it.menuItemId)}
                                    className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                                    title="Remove item"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action to select and add more items from the canteen menu for THIS member */}
                      {activeGroup.status === 'forming' && (
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenMenuForMember(member.usn)}
                            className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Select &amp; Add Items from Menu</span>
                          </button>
                          <span className="text-[11px] text-slate-400">
                            (For {member.name.split(' ')[0]})
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Group QR & Checkout */}
          <div className="space-y-6">
            {/* Squad Invitation QR Code */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 text-center space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Invite Squad to Join
              </h3>
              <div className="inline-block p-4 bg-white border-2 border-dashed border-orange-300 rounded-2xl shadow-inner">
                <QRCodeSVG
                  value={JSON.stringify({
                    type: 'GROUP_INVITE',
                    groupId: activeGroup.id,
                    slot: activeGroup.pickupSlot,
                  })}
                  size={150}
                  level="H"
                />
              </div>
              <div className="font-mono text-xs font-bold text-slate-700">
                Squad Code: <strong className="text-orange-600 text-sm">{activeGroup.id}</strong>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Friends can scan this QR code with their mobile cameras to automatically link trays and select food.
              </p>
            </div>

            {/* Squad Pickup Slot & Bill Summary */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Common Pickup Slot
              </h3>

              {isLeader && activeGroup.status === 'forming' ? (
                <div>
                  <select
                    value={groupSlot}
                    onChange={(e) => setGroupSlot(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold font-mono text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    {pickupSlots.map((s) => (
                      <option
                        key={s.id}
                        value={s.time}
                        disabled={s.booked + activeGroup.members.length > s.capacity}
                      >
                        {s.time} ({s.capacity - s.booked} spots left)
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    All {activeGroup.members.length} squad trays will be ready simultaneously at this slot.
                  </p>
                </div>
              ) : (
                <div className="text-sm font-extrabold font-mono text-orange-600 bg-orange-50 p-3 rounded-xl border border-orange-200">
                  {activeGroup.pickupSlot}
                </div>
              )}

              {/* Payment Type Selection */}
              {isLeader && activeGroup.status === 'forming' && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-600 block">Payment Scheme</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentChoice('combined')}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                        paymentChoice === 'combined'
                          ? 'border-orange-500 bg-orange-50 text-orange-900 ring-1 ring-orange-500'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Leader Pays All
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentChoice('individual')}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                        paymentChoice === 'individual'
                          ? 'border-orange-500 bg-orange-50 text-orange-900 ring-1 ring-orange-500'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Split per Member
                    </button>
                  </div>
                </div>
              )}

              {/* Total Calculation */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Squad Items Subtotal:</span>
                  <span className="font-mono font-semibold">₹{groupGrandTotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Group Service Fee (5%):</span>
                  <span className="font-mono font-semibold">₹{Math.round(groupGrandTotal * 0.05)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Combined Grand Total:</span>
                  <span className="text-base text-orange-600 font-mono">
                    ₹{groupGrandTotal + Math.round(groupGrandTotal * 0.05)}
                  </span>
                </div>
              </div>

              {/* Confirm Group Button */}
              {isLeader && activeGroup.status === 'forming' && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleConfirmGroup}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>CONFIRM &amp; LOCK SQUAD ORDER</span>
                  </button>
                </div>
              )}

              {activeGroup.status === 'confirmed' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-bold text-emerald-800">
                  Squad order confirmed! Present group collection QR to staff at {activeGroup.pickupSlot}.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Friend Modal */}
      {showAddFriendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-orange-500" />
              <span>Add Friend to Squad</span>
            </h3>

            <form onSubmit={handleAddFriendSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Friend USN *</label>
                <input
                  type="text"
                  placeholder="e.g. 1RV21EC088"
                  value={friendUsn}
                  onChange={(e) => setFriendUsn(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono uppercase text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Friend Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Pooja Hegde"
                  value={friendName}
                  onChange={(e) => setFriendName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddFriendModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/20 transition-all cursor-pointer"
                >
                  Add to Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL CANTEEN MENU SELECTOR MODAL FOR SQUAD MEMBERS */}
      {showFoodPicker && activeGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                      Select Menu Items for Squad
                    </h3>
                    <p className="text-xs text-slate-500">
                      Browse categories and add or update food items for any member.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowFoodPicker(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                  title="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Squad Member Switcher Dropdown */}
              <div className="bg-white p-3 rounded-2xl border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Selecting Food For Member:
                  </span>
                  <select
                    value={selectedMemberUsn}
                    onChange={(e) => setSelectedMemberUsn(e.target.value)}
                    className="bg-orange-50 border border-orange-300 rounded-xl px-3 py-1.5 text-xs font-bold text-orange-950 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  >
                    {activeGroup.members.map((m) => (
                      <option key={m.usn} value={m.usn}>
                        {m.name} ({m.usn}) {activeGroup.leaderUsn === m.usn ? '- Leader' : ''} (₹{m.individualTotal})
                      </option>
                    ))}
                  </select>
                </div>

                {activeEditingMember && (
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>Tray Items: <strong className="text-slate-900 font-mono font-bold">{activeEditingMember.items.length}</strong></span>
                    <span>&middot;</span>
                    <span>Total: <strong className="text-orange-600 font-mono font-bold">₹{activeEditingMember.individualTotal}</strong></span>
                  </div>
                )}
              </div>

              {/* Search & Category Filter Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {menuCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setMenuModalCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        menuModalCategory === cat
                          ? 'bg-orange-600 text-white shadow-sm'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search menu..."
                    value={menuModalSearch}
                    onChange={(e) => setMenuModalSearch(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {filteredMenuItems.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No food items matching &ldquo;{menuModalSearch}&rdquo; in this category.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredMenuItems.map((item) => {
                    // Check quantity in selected member's tray
                    const memberItem = activeEditingMember?.items.find((i) => i.menuItemId === item.id);
                    const qtyInTray = memberItem ? memberItem.quantity : 0;

                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl border border-slate-200 hover:border-orange-300 p-3.5 flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-md transition-all"
                      >
                        <div className="flex gap-3">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-100"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="font-extrabold text-xs text-slate-900 truncate">
                                {item.name}
                              </h4>
                              <span className="font-mono font-bold text-xs text-slate-900 shrink-0">
                                ₹{item.price}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{item.category}</span>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {/* Quantity Controls & Add Button for Selected Member */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-[10px] font-mono text-slate-400">{item.prepTimeMinutes}m prep</span>

                          {qtyInTray > 0 ? (
                            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl p-1">
                              <button
                                type="button"
                                onClick={() => handleUpdateMemberQty(selectedMemberUsn, item.id, -1)}
                                className="w-5 h-5 rounded-lg bg-white text-orange-700 hover:bg-orange-100 flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-mono font-bold text-xs text-orange-950 w-4 text-center">
                                {qtyInTray}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateMemberQty(selectedMemberUsn, item.id, 1)}
                                className="w-5 h-5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAddItemToMember(selectedMemberUsn, item)}
                              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow-2xs cursor-pointer transition-all"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add to Tray</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                Squad Total: <strong className="font-mono font-bold text-slate-900 text-sm">₹{groupGrandTotal}</strong> across <strong className="text-orange-600">{activeGroup.members.length} member trays</strong>.
              </div>

              <button
                type="button"
                onClick={() => setShowFoodPicker(false)}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Done Selecting Items</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real Camera QR Scanner */}
      <CameraQRScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleQRScanResult}
        title="Scan Group QR Code"
        description="Scan squad leader's QR code to join group order"
        testOptions={
          activeGroup
            ? [{ label: `Join Group ${activeGroup.id}`, payload: activeGroup.id }]
            : [{ label: 'Join GRP-1001', payload: 'GRP-1001' }]
        }
      />
    </div>
  );
};
