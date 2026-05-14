const express = require('express');
const router = express.Router();
const guidanceController = require('../controllers/guidanceController');

router.get('/zones-status', guidanceController.getZonesStatus);
router.post('/calculate-fee', guidanceController.calculateFee);
router.post('/generate-payment', guidanceController.generatePayment);
router.get('/recent-payments', guidanceController.getRecentPayments);

module.exports = router;