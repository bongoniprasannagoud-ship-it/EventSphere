const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getAdminStats,
} = require('../controllers/eventController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Admin stats
router.get('/admin/stats', protect, adminOnly, getAdminStats);

// Public routes
router.get('/', getEvents);
router.get('/:id', getEvent);

// Protected routes
router.post('/:id/register', protect, registerForEvent);

// Admin only routes
router.post('/', protect, adminOnly, upload.single('posterImage'), createEvent);
router.put('/:id', protect, adminOnly, upload.single('posterImage'), updateEvent);
router.delete('/:id', protect, adminOnly, deleteEvent);

module.exports = router;
