const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyOrganizedEvents,
} = require('../controllers/eventController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.route('/')
  .get(getEvents)
  .post(protect, authorize('organizer', 'admin'), createEvent);

router.get('/organizer/my-events', protect, authorize('organizer', 'admin'), getMyOrganizedEvents);

router.route('/:id')
  .get(getEventById)
  .put(protect, authorize('organizer', 'admin'), updateEvent)
  .delete(protect, authorize('organizer', 'admin'), deleteEvent);

module.exports = router;
