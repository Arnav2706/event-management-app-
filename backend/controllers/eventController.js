const Event = require('../models/Event');

// @desc    Get all published events with filtering & pagination
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res) => {
  try {
    const { category, search, date, page = 1, limit = 10 } = req.query;

    const query = { status: 'published' };

    if (category) {
      query.categoryId = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'venue.name': { $regex: search, $options: 'i' } },
      ];
    }

    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.eventDate = { $gte: searchDate, $lt: nextDay };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Event.countDocuments(query);

    const events = await Event.find(query)
      .populate('categoryId', 'name slug iconUrl')
      .populate('organizerId', 'name email avatarUrl')
      .sort({ eventDate: 1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      events,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('categoryId', 'name slug iconUrl')
      .populate('organizerId', 'name email avatarUrl phone');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Organizer, Admin)
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      categoryId,
      bannerImage,
      venue,
      eventDate,
      startTime,
      endTime,
      registrationDeadline,
      maxParticipants,
    } = req.body;

    const event = await Event.create({
      title,
      description,
      categoryId,
      bannerImage,
      venue,
      eventDate,
      startTime,
      endTime,
      registrationDeadline,
      maxParticipants,
      organizerId: req.user._id,
      status: 'published',
    });

    res.status(201).json({ success: true, event });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Event Organizer, Admin)
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Verify ownership or admin role
    if (event.organizerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this event' });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, event });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Event Organizer, Admin)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Verify ownership or admin role
    if (event.organizerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
    }

    await event.deleteOne();

    res.json({ success: true, message: 'Event removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get events created by current organizer
// @route   GET /api/events/organizer/my-events
// @access  Private (Organizer, Admin)
exports.getMyOrganizedEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizerId: req.user._id })
      .populate('categoryId', 'name slug')
      .sort({ createdAt: -1 });

    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
