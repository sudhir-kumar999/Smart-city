const Complaint = require('../models/Complaint.model');

/**
 * Create New Complaint
 * POST /api/complaints
 */
const createComplaint = async (req, res) => {
  try {
    const { title, description, category, location, image } = req.body;

    // Validate required fields
    if (!title || !description || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and location are required'
      });
    }

    // Create complaint
    const complaint = await Complaint.create({
      title,
      description,
      category: category || 'other',
      location,
      image: image || null,
      citizenId: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Complaint registered successfully',
      data: {
        complaint
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating complaint'
    });
  }
};

/**
 * Get All Complaints (with filters based on role)
 * GET /api/complaints
 */
const getAllComplaints = async (req, res) => {
  try {
    const { status, category } = req.query;
    let query = {};

    // Citizens can only see their own complaints
    if (req.user.role === 'citizen') {
      query.citizenId = req.user._id;
    }
    // Admin and Officer can see all complaints

    // Apply filters
    if (status) {
      query.status = status;
    }
    if (category) {
      query.category = category;
    }

    const complaints = await Complaint.find(query)
      .populate('citizenId', 'name email')
      .populate('assignedOfficerId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: {
        complaints
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching complaints'
    });
  }
};

/**
 * Get Single Complaint by ID
 * GET /api/complaints/:id
 */
const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    let query = { _id: id };

    // Citizens can only access their own complaints
    if (req.user.role === 'citizen') {
      query.citizenId = req.user._id;
    }

    const complaint = await Complaint.findOne(query)
      .populate('citizenId', 'name email')
      .populate('assignedOfficerId', 'name email');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        complaint
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching complaint'
    });
  }
};

/**
 * Update Complaint Status (Admin/Officer only)
 * PATCH /api/complaints/:id/status
 */
const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes, assignedOfficerId } = req.body;

    // Validate status
    const validStatuses = ['pending', 'in-progress', 'resolved'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, in-progress, resolved'
      });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Update status
    if (status) {
      complaint.status = status;
    }

    // Update resolution notes
    if (resolutionNotes !== undefined) {
      complaint.resolutionNotes = resolutionNotes;
    }

    // Assign officer (only admin can do this)
    if (assignedOfficerId && req.user.role === 'admin') {
      complaint.assignedOfficerId = assignedOfficerId;
    } else if (req.user.role === 'officer' && !complaint.assignedOfficerId) {
      // Officer can assign themselves if not already assigned
      complaint.assignedOfficerId = req.user._id;
    }

    await complaint.save();

    const updatedComplaint = await Complaint.findById(id)
      .populate('citizenId', 'name email')
      .populate('assignedOfficerId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Complaint status updated successfully',
      data: {
        complaint: updatedComplaint
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating complaint status'
    });
  }
};

/**
 * Delete Complaint (Citizen can delete their own, Admin can delete any)
 * DELETE /api/complaints/:id
 */
const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    let query = { _id: id };

    // Citizens can only delete their own complaints
    if (req.user.role === 'citizen') {
      query.citizenId = req.user._id;
    }

    const complaint = await Complaint.findOneAndDelete(query);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found or you do not have permission to delete it'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Complaint deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting complaint'
    });
  }
};

module.exports = {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint
};

