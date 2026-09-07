const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    bannerImage: {
      type: String,
      default: '',
    },
    venue: {
      name: {
        type: String,
        required: [true, 'Venue name is required'],
      },
      address: {
        type: String,
        required: [true, 'Venue address is required'],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: undefined,
      },
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
    },
    registrationDeadline: {
      type: Date,
      required: [true, 'Registration deadline is required'],
    },
    maxParticipants: {
      type: Number,
      required: [true, 'Maximum participant capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    currentParticipantsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'published',
    },
  },
  {
    timestamps: true,
  }
);

// Helpful index for discovery feeds
eventSchema.index({ eventDate: 1, status: 1, categoryId: 1 });

module.exports = mongoose.model('Event', eventSchema);
