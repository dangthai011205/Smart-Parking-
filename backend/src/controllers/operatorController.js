const parkingSlots = require('../models/parkingSlot');
const tickets = require('../models/ticket');

// Lấy trạng thái toàn bộ slot
exports.getSlotStatus = (req, res) => {
  res.json({ success: true, slots: parkingSlots });
};

// Cập nhật trạng thái slot (occupied/free)
exports.updateSlot = (req, res) => {
  const { slotId, occupied, vehicleNumber } = req.body;
  const slot = parkingSlots.find(s => s.id === slotId);
  if (!slot) return res.status(400).json({ success: false, message: 'Slot not found' });

  slot.occupied = occupied;
  slot.vehicle = occupied ? vehicleNumber : null;
  res.json({ success: true, slot });
};

// Xem logs / ticket history
exports.viewLogs = (req, res) => {
  res.json({ success: true, tickets });
};