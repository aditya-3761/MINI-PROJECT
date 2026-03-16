const express = require('express');
const router = express.Router();
const { createTicket, getAllTickets } = require('../controllers/supportController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', createTicket);
router.get('/',  protect, adminOnly, getAllTickets);

module.exports = router;
