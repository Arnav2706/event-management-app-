const Registration = require('../models/Registration');
const Event = require('../models/Event');

// @desc    Register for an event
// @route   POST /api/registrations/events/:eventId
// @access  Private (Authenticated users)
exports.registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    // 1. Fetch event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.status !== 'published') {
      return res.status(400).json({ success: false, message: 'Event is not accepting registrations' });
    }

    // 2. Deadline check
    if (new Date() > new Date(event.registrationDeadline)) {
      return res.status(409).json({ success: false, message: 'Registration deadline has passed' });
    }

    // 3. Existing registration check
    const existing = await Registration.findOne({ userId, eventId, status: 'confirmed' });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You are already registered for this event' });
    }

    // 4. Atomic capacity check and update
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        currentParticipantsCount: { $lt: event.maxParticipants },
      },
      {
        $inc: { currentParticipantsCount: 1 },
      },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(409).json({ success: false, message: 'Event has reached maximum capacity' });
    }

    // 5. Create or reactivate registration
    let registration = await Registration.findOne({ userId, eventId });
    if (registration) {
      registration.status = 'confirmed';
      registration.registrationDate = new Date();
      await registration.save();
    } else {
      registration = await Registration.create({
        userId,
        eventId,
        status: 'confirmed',
      });
    }

    await registration.populate('eventId', 'title eventDate venue startTime endTime');

    res.status(201).json({
      success: true,
      message: 'Successfully registered for event',
      registration,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel registration
// @route   PUT /api/registrations/:id/cancel
// @access  Private (Registration owner or Admin)
exports.cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    // Check ownership
    if (registration.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this registration' });
    }

    if (registration.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Registration is already cancelled' });
    }

    registration.status = 'cancelled';
    await registration.save();

    // Decrement participant count
    await Event.findByIdAndUpdate(registration.eventId, {
      $inc: { currentParticipantsCount: -1 },
    });

    res.json({
      success: true,
      message: 'Registration cancelled successfully',
      registration,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's registered events (tickets)
// @route   GET /api/registrations/my-tickets
// @access  Private (Authenticated users)
exports.getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ userId: req.user._id, status: 'confirmed' })
      .populate({
        path: 'eventId',
        populate: { path: 'categoryId', select: 'name slug' },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get attendees for a specific event
// @route   GET /api/registrations/events/:eventId/participants
// @access  Private (Organizer of the event or Admin)
exports.getEventParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.organizerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view attendees for this event' });
    }

    const participants = await Registration.find({ eventId, status: 'confirmed' })
      .populate('userId', 'name email phone avatarUrl')
      .sort({ createdAt: 1 });

    res.json({ success: true, count: participants.length, participants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
