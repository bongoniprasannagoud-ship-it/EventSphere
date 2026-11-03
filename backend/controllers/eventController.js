const Event = require('../models/Event');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

const removeFile = (file) => {
  try {
    if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
  } catch (e) {
    /* ignore */
  }
};
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const ALLOWED_SORTS = ['createdAt', '-createdAt', 'date', '-date', 'title', '-title'];

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const sort = ALLOWED_SORTS.includes(req.query.sort) ? req.query.sort : '-createdAt';

    const query = { isActive: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: escapeRegex(String(search)), $options: 'i' } },
        { description: { $regex: escapeRegex(String(search)), $options: 'i' } },
        { venue: { $regex: escapeRegex(String(search)), $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [events, total] = await Promise.all([
      Event.find(query)
        .populate('createdBy', 'name')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Event.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: events.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      events,
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');

    if (!event || !event.isActive) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({ success: true, event });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create event
// @route   POST /api/events
// @access  Admin only
const createEvent = async (req, res) => {
  try {
    const { title, description, category, venue, date, registrationFee, googleFormLink } = req.body;

    if (!title || !description || !category || !venue || !date || !googleFormLink) {
      // Clean up uploaded file if validation fails
      removeFile(req.file);
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (isNaN(new Date(date).getTime())) {
      removeFile(req.file);
      return res.status(400).json({ success: false, message: 'Invalid event date' });
    }

    const eventData = {
      title,
      description,
      category,
      venue,
      date: new Date(date),
      registrationFee: Number(registrationFee) || 0,
      googleFormLink,
      createdBy: req.user.id,
    };

    if (req.file) {
      eventData.posterImage = `/uploads/${req.file.filename}`;
    }

    const event = await Event.create(eventData);
    await event.populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event,
    });
  } catch (error) {
    removeFile(req.file);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    console.error('Create event error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Admin only
const updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event || !event.isActive) {
      removeFile(req.file);
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const fields = ['title', 'description', 'category', 'venue', 'date', 'registrationFee', 'googleFormLink'];
    const updateData = {};
    fields.forEach((f) => {
      if (req.body[f] !== undefined) updateData[f] = req.body[f];
    });

    if (req.file) {
      // Delete old image if exists
      if (event.posterImage) {
        const oldImagePath = path.join(__dirname, '..', event.posterImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.posterImage = `/uploads/${req.file.filename}`;
    }

    if (updateData.date) {
      updateData.date = new Date(updateData.date);
      if (isNaN(updateData.date.getTime())) {
        removeFile(req.file);
        return res.status(400).json({ success: false, message: 'Invalid event date' });
      }
    }

    event = await Event.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('createdBy', 'name');

    res.json({
      success: true,
      message: 'Event updated successfully',
      event,
    });
  } catch (error) {
    removeFile(req.file);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete event (soft delete)
// @route   DELETE /api/events/:id
// @access  Admin only
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Soft delete
    event.isActive = false;
    await event.save();

    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Register for event (track in user profile)
// @route   POST /api/events/:id/register
// @access  Private
const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || !event.isActive) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.date < new Date()) {
      return res.status(400).json({ success: false, message: 'Registration is closed for this event' });
    }

    const user = await User.findById(req.user.id);

    // Check if already registered
    if (user.registeredEvents.some((e) => e.toString() === req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered for this event',
      });
    }

    // Add to user's registered events and event's registrations
    user.registeredEvents.push(req.params.id);
    event.registrations.push(req.user.id);

    await Promise.all([user.save(), event.save()]);

    res.json({
      success: true,
      message: 'Successfully registered for the event',
      googleFormLink: event.googleFormLink,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get admin stats
// @route   GET /api/events/admin/stats
// @access  Admin only
const getAdminStats = async (req, res) => {
  try {
    const [totalEvents, upcomingEvents, totalUsers, recentEvents] = await Promise.all([
      Event.countDocuments({ isActive: true }),
      Event.countDocuments({ isActive: true, date: { $gte: new Date() } }),
      User.countDocuments({ role: 'student' }),
      Event.find({ isActive: true })
        .populate('createdBy', 'name')
        .sort('-createdAt')
        .limit(5),
    ]);

    const categoryStats = await Event.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalEvents,
        upcomingEvents,
        totalUsers,
        categoryStats,
        recentEvents,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getAdminStats,
};
