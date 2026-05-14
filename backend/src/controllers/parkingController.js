// src/controllers/parkingController.js
const parkingSlots = require('../models/parkingSlot'); // mỗi slot có id, zone, occupied
const tickets = require('../models/ticket');
const bkpayService = require('../services/bkpayService');

// =====================
// Enter parking (chọn zone)
// =====================
exports.enterParking = (req, res) => {
  const { vehicleNumber, vehicleType, zone } = req.body;

  // tìm slot trống trong zone
  const freeSlot = parkingSlots.find(slot => slot.zone === zone && !slot.occupied);
  if (!freeSlot)
    return res.status(400).json({ success: false, message: `No free slot in Zone ${zone}` });

  freeSlot.occupied = true;
  freeSlot.vehicle = vehicleNumber;

  const ticket = {
    id: tickets.length + 1,
    vehicleNumber,
    vehicleType: vehicleType || 'Car',
    slotId: freeSlot.id,
    zone: freeSlot.zone,
    enterTime: new Date(),
    exitTime: null,
    status: 'Active',
    paid: false
  };

  tickets.push(ticket);

  res.json({ success: true, ticket });
};

// =====================
// Exit parking
// =====================
exports.exitParking = (req, res) => {
  const { ticketId } = req.body;

  const ticket = tickets.find(t => t.id === ticketId);
  if (!ticket || ticket.exitTime)
    return res.status(400).json({ success: false, message: 'Invalid ticket' });

  const slot = parkingSlots.find(s => s.id === ticket.slotId);
  if (slot) {
    slot.occupied = false;
    slot.vehicle = null;
  }

  ticket.exitTime = new Date();
  ticket.status = 'Exit';

  res.json({ success: true, ticket });
};

// =====================
// View parking history
// =====================
exports.parkingHistory = (req, res) => {
  res.json({ success: true, tickets });
};

// =====================
// Issue temporary ticket (chưa gán slot)
// =====================
exports.issueTicket = (req, res) => {
  const { vehicleNumber } = req.body;
  const ticket = {
    id: tickets.length + 1,
    vehicleNumber,
    slotId: null,
    zone: null,
    enterTime: new Date(),
    exitTime: null,
    status: 'Active',
    paid: false
  };
  tickets.push(ticket);
  res.json({ success: true, ticket });
};

// =====================
// Process payment via BKPay
// =====================
exports.payTicket = async (req, res) => {
  const { ticketId, amount } = req.body;
  const ticket = tickets.find(t => t.id === ticketId);

  if (!ticket)
    return res.status(400).json({ success: false, message: 'Ticket not found' });

  try {
    const result = await bkpayService.processPayment(ticketId, amount);
    ticket.paid = result.success;
    res.json({ success: result.success, ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// =====================
// Get slot status for Parking Monitoring
// =====================
exports.getSlotStatus = (req, res) => {
  const { zone } = req.query; // zone = "A" hoặc "B"

  if (!zone) return res.status(400).json({ success: false, message: 'Zone is required' });

  const slotsInZone = parkingSlots
    .filter(s => s.zone === zone)
    .map(s => ({
      id: s.id,
      status: s.occupied ? 'Occupied' : 'Available'
    }));

  const total = slotsInZone.length;
  const occupied = slotsInZone.filter(s => s.status === 'Occupied').length;
  const available = total - occupied;

  res.json({
    success: true,
    zone,
    total,
    occupied,
    available,
    slots: slotsInZone
  });
};