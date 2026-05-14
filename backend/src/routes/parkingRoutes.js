const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');

router.post('/enter', parkingController.enterParking);
router.post('/exit', parkingController.exitParking);
router.get('/history', parkingController.parkingHistory);
router.post('/ticket', parkingController.issueTicket);    // issue temporary ticket
router.post('/payment', parkingController.payTicket);     // process payment
router.get('/slots', parkingController.getSlotStatus);
module.exports = router;

