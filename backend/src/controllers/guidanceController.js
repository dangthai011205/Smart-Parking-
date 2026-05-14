const tickets = require('../models/ticket');
const parkingSlots = require('../models/parkingSlot');
const pricingService = require('../services/pricingService');
const bkpayService = require('../services/bkpayService');

// --------------------
// 1. Zone Status
// --------------------
exports.getZonesStatus = (req,res) => {
  const zoneDistances = { A: 50, B: 120, C: 200 };
  const zones = ['A','B','C'].map(zoneName=>{
    const slotsInZone = parkingSlots.filter(s=>s.zone===zoneName);
    const total = slotsInZone.length;
    const occupied = slotsInZone.filter(s=>s.occupied).length;
    const available = total - occupied;
    return {
      name: zoneName,
      total,
      occupied,
      available,
      distance: zoneDistances[zoneName]
    }
  });

  res.json({ success:true, zones });
};

// --------------------
// 2. Calculate Fee
// --------------------
exports.calculateFee = (req,res)=>{
  const { licensePlate } = req.body;
  const ticket = tickets.find(t=>t.vehicleNumber===licensePlate && !t.exitTime);
  if(!ticket) return res.status(400).json({ success:false, message:'Ticket not found' });

  const fee = pricingService.calculateFee(ticket);
  res.json({ success:true, fee });
};

  // --------------------
  // 3. Generate Payment
// --------------------
exports.generatePayment = async (req,res)=>{
  const { licensePlate, amount, method } = req.body;
  const ticket = tickets.find(t=>t.vehicleNumber===licensePlate && !t.exitTime);
  if(!ticket) return res.status(400).json({ success:false, message:'Ticket not found' });

  try{
    const result = await bkpayService.processPayment(ticket.id, amount, method);
    ticket.paid = result.success;
    ticket.amountPaid = amount;
    res.json({ success: result.success, ticket });
  }catch(err){
    res.status(500).json({ success:false, message: err.message });
  }
};

// --------------------
// 4. Recent Payments
// --------------------
exports.getRecentPayments = (req,res)=>{
  const payments = tickets.filter(t=>t.paid).map(t=>({
    vehicleNumber: t.vehicleNumber,
    amount: t.amountPaid || 0,
    status: 'Paid'
  }));
  res.json({ success:true, payments });
};