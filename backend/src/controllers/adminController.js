const users = require('../models/users');
const pricingService = require('../services/pricingService');

// Xem danh sách user
exports.getUsers = (req, res) => {
  const safeUsers = users.map(({ id, name, email, role, status }) => ({ id, name, email, role, status }));
  res.json({ success: true, users: safeUsers });
};

// Cập nhật role user
exports.updateRole = (req, res) => {
  const { userId, role } = req.body;
  const parsedId = Number(userId);
  const user = users.find(u => u.id === parsedId);
  if (!user) return res.status(400).json({ success: false, message: 'User not found' });

  user.role = role;
  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status } });
};

// Cập nhật chính sách giá
exports.updatePricing = (req, res) => {
  const { pricePerHour } = req.body;
  pricingService.setPrice(pricePerHour);
  res.json({ success: true, pricePerHour: pricingService.getPrice() });
};

// Lấy chính sách giá hiện tại
exports.getPricing = (req, res) => {
  res.json({ success: true, pricePerHour: pricingService.getPrice() });
};