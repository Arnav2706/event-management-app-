const mongoose = require('mongoose');
const crypto = require('crypto');

const registrationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'attended'],
      default: 'confirmed',
    },
    qrTicketCode: {
      type: String,
      unique: true,
      default: () => 'TKT-' + crypto.randomUUID().slice(0, 8).toUpperCase(),
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate registrations
registrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
