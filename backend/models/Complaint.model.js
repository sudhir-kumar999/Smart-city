const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Complaint title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Complaint description is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['infrastructure', 'sanitation', 'traffic', 'safety', 'utilities', 'other'],
    default: 'other'
  },
  image: {
    type: String, // URL or path to image
    default: null
  },
  location: {
    type: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: { type: String, default: '' }
    },
    required: [true, 'Location is required']
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved'],
    default: 'pending'
  },
  citizenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedOfficerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  resolutionNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient queries
complaintSchema.index({ citizenId: 1, createdAt: -1 });
complaintSchema.index({ status: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);

