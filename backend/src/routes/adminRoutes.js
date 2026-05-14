const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/users', adminController.getUsers);
router.post('/role', adminController.updateRole);
router.post('/pricing', adminController.updatePricing);
router.get('/pricing', adminController.getPricing);

module.exports = router;