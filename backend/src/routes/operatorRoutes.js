const express = require('express');
const router = express.Router();
const operatorController = require('../controllers/operatorController');

router.get('/slots', operatorController.getSlotStatus);
router.post('/update', operatorController.updateSlot);
router.get('/logs', operatorController.viewLogs);

module.exports = router;