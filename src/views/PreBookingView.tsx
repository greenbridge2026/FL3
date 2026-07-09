import React, { useState } from 'react';
import { useApp, PreBooking, RoomCategory } from '../context/AppContext';
import { Calendar, UserPlus, XCircle, CheckCircle, Clock } from 'lucide-react';

export const PreBookingView: React.FC = () => {
  const { preBookings, rooms, addPreBooking, cancelPreBooking, confirmPreBookingCheckIn } = useApp();

  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [idProof, setIdProof] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [roomCategory, setRoomCategory] = useState<RoomCategory>('Standard');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [noOfGuests, setNoOfGuests] = useState(1);
  const [advancePaid, setAdvancePaid] = useState(0);

  // Assignment Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<PreBooking | null>(null);
  const [assignRoomId, setAssignRoomId] = useState('');

  const categories: RoomCategory[] = ['Standard', 'Semi Premium', 'Premium', 'Suite', 'Family Suite', 'Dormitory'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !phone || !checkInDate || !checkOutDate || !idProof) return;

    addPreBooking({
      guestName,
      phone,
      email,
      address,
      idProof,
      gstNumber: gstNumber || undefined,
      roomCategory,
      checkInDate,
      checkOutDate,
      noOfGuests,
      advancePaid: Number(advancePaid)
    });

    // Reset Form
    setGuestName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setIdProof('');
    setGstNumber('');
    setCheckInDate('');
    setCheckOutDate('');
    setNoOfGuests(1);
    setAdvancePaid(0);
  };

  const handleOpenAssign = (booking: PreBooking) => {
    setSelectedBooking(booking);
    setAssignRoomId('');
    setShowAssignModal(true);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !assignRoomId) return;

    confirmPreBookingCheckIn(selectedBooking.id, assignRoomId);
    setShowAssignModal(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. Pre-Booking Form */}
      <div className="lg:col-span-1 p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b pb-2 border-slate-100 dark:border-slate-800">
          <Calendar className="w-5 h-5 text-indigo-500" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Pre-Book Future Stay
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-500">Guest Name *</label>
            <input
              type="text"
              required
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
              className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg"
              placeholder="e.g. Pooja Hegde"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Phone *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg"
                placeholder="Phone Number"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-500">Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg"
              placeholder="City, Country"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-500">ID Proof *</label>
              <input
                type="text"
                required
                value={idProof}
                onChange={e => setIdProof(e.target.value)}
                className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg"
                placeholder="Aadhaar / Passport details"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-500">GST Number</label>
              <input
                type="text"
                value={gstNumber}
                onChange={e => setGstNumber(e.target.value)}
                className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg"
                placeholder="GSTIN"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-500">Room Category *</label>
            <select
              value={roomCategory}
              onChange={e => setRoomCategory(e.target.value as RoomCategory)}
              className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg font-semibold"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Check In Date *</label>
              <input
                type="date"
                required
                value={checkInDate}
                onChange={e => setCheckInDate(e.target.value)}
                className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Check Out Date *</label>
              <input
                type="date"
                required
                value={checkOutDate}
                onChange={e => setCheckOutDate(e.target.value)}
                className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-500">No of Guests</label>
              <input
                type="number"
                min={1}
                value={noOfGuests}
                onChange={e => setNoOfGuests(Number(e.target.value))}
                className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Advance Deposit (₹)</label>
              <input
                type="number"
                min={0}
                value={advancePaid}
                onChange={e => setAdvancePaid(Number(e.target.value))}
                className="w-full p-2 border dark:border-slate-800 dark:bg-slate-950 rounded-lg font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition-colors mt-2"
          >
            Confirm Reservation
          </button>
        </form>
      </div>

      {/* 2. Reservations List */}
      <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Active Reservations / Pre Bookings
            </h3>
            <span className="text-[10px] font-bold bg-indigo-500 text-white px-2 py-0.5 rounded">
              {preBookings.filter(b => b.status === 'Confirmed').length} Confirmed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="py-2">Guest / Contact</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Stay Dates</th>
                  <th className="py-2 text-right">Deposit</th>
                  <th className="py-2 text-center">Status</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {preBookings.map(booking => (
                  <tr key={booking.id} className="text-slate-700 dark:text-slate-300">
                    <td className="py-3">
                      <p className="font-bold text-slate-800 dark:text-slate-150 leading-tight">{booking.guestName}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{booking.phone}</p>
                    </td>
                    <td className="py-3 font-semibold text-slate-500">{booking.roomCategory}</td>
                    <td className="py-3">
                      <p className="font-mono text-slate-600 dark:text-slate-300">{booking.checkInDate}</p>
                      <p className="text-[10px] text-slate-400 font-mono">to {booking.checkOutDate}</p>
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                      ₹{booking.advancePaid}
                    </td>
                    <td className="py-3 text-center">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                        booking.status === 'Confirmed' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400' :
                        booking.status === 'CheckedIn' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' :
                        'bg-slate-100 text-slate-400 dark:bg-slate-800/60 dark:text-slate-500'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {booking.status === 'Confirmed' && (
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleOpenAssign(booking)}
                            className="px-2 py-1 bg-emerald-500 text-white rounded text-[10px] font-bold flex items-center gap-1 hover:bg-emerald-600 transition-colors shadow-sm"
                            title="Assign Room and Check In"
                          >
                            <UserPlus className="w-3 h-3" /> Check In
                          </button>
                          <button
                            onClick={() => cancelPreBooking(booking.id)}
                            className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded"
                            title="Cancel Booking"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      {booking.status === 'CheckedIn' && (
                        <span className="text-[10px] text-slate-400 font-semibold font-mono">
                          Room {booking.roomNumber}
                        </span>
                      )}
                      {booking.status === 'Cancelled' && (
                        <span className="text-[10px] text-slate-400 italic">Cancelled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ==========================================
          ASSIGN ROOM & CONFIRM CHECK IN DIALOG
          ========================================== */}
      {showAssignModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-150">
                Assign Room for {selectedBooking.guestName}
              </h3>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">×</button>
            </div>
            
            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-1">
                <p><span className="text-slate-400">Required Category:</span> <strong className="text-indigo-500 font-semibold">{selectedBooking.roomCategory}</strong></p>
                <p><span className="text-slate-400">Guests headcount:</span> <strong className="text-slate-700 dark:text-slate-300 font-mono">{selectedBooking.noOfGuests} pax</strong></p>
                <p><span className="text-slate-400">Stay:</span> <strong className="text-slate-700 dark:text-slate-300 font-mono">{selectedBooking.checkInDate} to {selectedBooking.checkOutDate}</strong></p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">Select Available Room *</label>
                <select
                  required
                  value={assignRoomId}
                  onChange={e => setAssignRoomId(e.target.value)}
                  className="w-full p-2.5 border dark:border-slate-800 dark:bg-slate-950 rounded-xl font-bold"
                >
                  <option value="">-- Choose Room --</option>
                  {rooms
                    .filter(r => r.status === 'Available' && r.category === selectedBooking.roomCategory)
                    .map(r => (
                      <option key={r.id} value={r.id}>
                        Room {r.roomNumber} (Floor {r.floor} - ₹{r.price})
                      </option>
                    ))}
                  {rooms.filter(r => r.status === 'Available' && r.category === selectedBooking.roomCategory).length === 0 && (
                    <option disabled value="">⚠️ No Available Rooms in this Category!</option>
                  )}
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!assignRoomId}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-sm"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
