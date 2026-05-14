const parkingSlots = require('../models/parkingSlot');
const tickets = require('../models/ticket');

// Lấy dữ liệu dashboard
exports.getDashboard = (req, res) => {
  // Tổng slot
  const totalSlots = parkingSlots.length;

  // Đếm Occupied / Available
  const occupied = parkingSlots.filter(s => s.occupied).length;
  const available = totalSlots - occupied;

  // Revenue hôm nay
  const today = new Date();
  const todayPayments = tickets.filter(t => t.paid && new Date(t.enterTime).toDateString() === today.toDateString());
  const revenue = todayPayments.reduce((sum, t) => sum + (t.amountPaid || 0), 0);

  // Recent Activity: những ticket Active (chưa exit)
  const recentActivity = tickets
    .filter(t => !t.exitTime)
    .slice(-5) // lấy 5 ticket mới nhất
    .map(t => ({
      vehicleNumber: t.vehicleNumber,
      zone: t.zone,
      slotId: t.slotId,
      status: t.status
    }));

  // Zone Status: tổng số xe theo từng zone
  const zones = ['A', 'B', 'C'].map(zoneName => {
    const slotsInZone = parkingSlots.filter(s => s.zone === zoneName);
    return {
      name: zoneName,
      total: slotsInZone.length,
      occupied: slotsInZone.filter(s => s.occupied).length,
      available: slotsInZone.filter(s => !s.occupied).length
    };
  });

  res.json({
    success: true,
    data: {
      totalSlots,
      occupied,
      available,
      revenue,
      recentActivity,
      zones
    }
  });
};