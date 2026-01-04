const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint
} = require('../controllers/complaint.controller');
const { authenticate, authorize} = require('../middleware/auth.middleware');

// All complaint routes require authentication and 2FA
router.use(authenticate);
// router.use(require2FA);

// Routes
router.post('/', createComplaint);
router.get('/', getAllComplaints);
router.get('/:id', getComplaintById);
router.patch('/:id/status', authorize('admin', 'officer'), updateComplaintStatus);
router.delete('/:id', deleteComplaint);

module.exports = router;

