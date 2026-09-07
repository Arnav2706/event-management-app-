const express = require('express');
const router = express.Router();
const {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventParticipants,
} = require('../controllers/registrationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Register for an event
router.post('/events/:eventId', protect, registerForEvent);

// Cancel registration
router.put('/:id/cancel', protect, cancelRegistration);

// Get current user's tickets
router.get('/my-tickets', protect, getMyRegistrations);

// Get event attendees (Organizer / Admin)
router.get('/events/:eventId/participants', protect, authorize('organizer', 'admin'), getEventParticipants);

module.exports = router;
