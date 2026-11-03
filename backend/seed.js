// Usage: npm run seed
// Creates an admin account and a few sample events (idempotent: skips if they exist).
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');

const ADMIN = {
  name: 'Admin User',
  email: process.env.SEED_ADMIN_EMAIL || 'admin@college.edu',
  password: process.env.SEED_ADMIN_PASSWORD || 'admin123',
};

const day = 24 * 60 * 60 * 1000;
const samples = [
  { title: 'CodeSprint Hackathon', category: 'Tech', venue: 'Main Auditorium', daysFromNow: 10, fee: 200,
    description: '24-hour hackathon. Build something amazing with your team and win prizes.' },
  { title: 'Cultural Night 2026', category: 'Cultural', venue: 'Open Air Theatre', daysFromNow: 20, fee: 0,
    description: 'Music, dance and drama performances from every department.' },
  { title: 'Inter-Department Cricket Cup', category: 'Sports', venue: 'College Ground', daysFromNow: 5, fee: 100,
    description: 'Knockout cricket tournament between departments.' },
  { title: 'Intro to Cloud Workshop', category: 'Workshop', venue: 'Lab 3, CS Block', daysFromNow: 14, fee: 0,
    description: 'Hands-on beginner workshop on deploying apps to the cloud.' },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    let admin = await User.findOne({ email: ADMIN.email });
    if (!admin) {
      admin = await User.create({ ...ADMIN, role: 'admin' });
      console.log(`Created admin: ${ADMIN.email} / ${ADMIN.password}`);
    } else {
      console.log(`Admin already exists: ${ADMIN.email}`);
    }
    for (const s of samples) {
      if (await Event.findOne({ title: s.title })) continue;
      await Event.create({
        title: s.title, description: s.description, category: s.category, venue: s.venue,
        date: new Date(Date.now() + s.daysFromNow * day), registrationFee: s.fee,
        googleFormLink: 'https://forms.google.com/', createdBy: admin._id,
      });
      console.log(`Created event: ${s.title}`);
    }
    console.log('Seed complete.');
  } catch (e) {
    console.error('Seed failed:', e.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
