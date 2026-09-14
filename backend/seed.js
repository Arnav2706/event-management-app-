const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const User = require('./models/User');
const Category = require('./models/Category');
const Event = require('./models/Event');
const Registration = require('./models/Registration');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // 1. Create or ensure demo users
    let participant = await User.findOne({ email: 'participant@example.com' });
    if (!participant) {
      participant = await User.create({
        name: 'Julian Vance',
        email: 'participant@example.com',
        password: 'password123',
        role: 'participant',
      });
      console.log('Created demo participant:', participant.email);
    }

    let organizer = await User.findOne({ email: 'organizer@example.com' });
    if (!organizer) {
      organizer = await User.create({
        name: 'Elena Rostova',
        email: 'organizer@example.com',
        password: 'password123',
        role: 'organizer',
      });
      console.log('Created demo organizer:', organizer.email);
    }

    // 2. Ensure luxury categories
    const categoriesData = [
      { name: 'Private Salon', slug: 'private-salon' },
      { name: 'Acoustic & Chamber', slug: 'acoustic-chamber' },
      { name: 'Culinary Atelier', slug: 'culinary-atelier' },
      { name: 'Art & Design', slug: 'art-design' },
      { name: 'Technology & AI', slug: 'technology-ai' },
    ];

    const categoryMap = {};
    for (const cat of categoriesData) {
      let existing = await Category.findOne({ slug: cat.slug });
      if (!existing) {
        existing = await Category.create(cat);
        console.log('Created category:', cat.name);
      }
      categoryMap[cat.slug] = existing._id;
    }

    // 3. Ensure curated sample events
    const eventsData = [
      {
        title: 'Candlelight Salon: Nocturnal Strings & Amber Spirits',
        description:
          'An intimate chamber performance illuminated entirely by five hundred beeswax tapers. Featuring bespoke cello improvisations paired with single-cask aged spirits and artisanal botanical infusions.',
        categoryId: categoryMap['private-salon'],
        bannerImage:
          'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80',
        venue: {
          name: 'The Glasshouse Conservatory, Pavilion 4',
          address: '88 Belvedere Heights, District 1',
        },
        eventDate: new Date('2026-10-24T19:30:00.000Z'),
        startTime: '19:30',
        endTime: '23:00',
        registrationDeadline: new Date('2026-10-23T23:59:59.000Z'),
        maxParticipants: 30,
        currentParticipantsCount: 0,
        organizerId: organizer._id,
        status: 'published',
      },
      {
        title: 'The Omakase Table: Twelve Course Modernism',
        description:
          'A singular culinary exploration exploring seasonal Nordic and Japanese cross-currents. Private dinner strictly limited to sixteen guests seated around the black granite counter.',
        categoryId: categoryMap['culinary-atelier'],
        bannerImage:
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
        venue: {
          name: 'Atelier Umami, Penthouse Suite',
          address: '12 Marina Boulevard, Level 48',
        },
        eventDate: new Date('2026-11-05T20:00:00.000Z'),
        startTime: '20:00',
        endTime: '23:30',
        registrationDeadline: new Date('2026-11-04T23:59:59.000Z'),
        maxParticipants: 16,
        currentParticipantsCount: 0,
        organizerId: organizer._id,
        status: 'published',
      },
      {
        title: 'Contemporary Sculpture & Spatial Architecture Preview',
        description:
          'Private twilight vernissage showcasing monumental brutalist sculptures and atmospheric light installations prior to public opening.',
        categoryId: categoryMap['art-design'],
        bannerImage:
          'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
        venue: {
          name: 'Kurogane Pavilion',
          address: '104 Arts District West',
        },
        eventDate: new Date('2026-11-18T18:00:00.000Z'),
        startTime: '18:00',
        endTime: '21:00',
        registrationDeadline: new Date('2026-11-17T23:59:59.000Z'),
        maxParticipants: 45,
        currentParticipantsCount: 0,
        organizerId: organizer._id,
        status: 'published',
      },
      {
        title: 'Autonomous Frontiers: Intelligent Systems Symposium',
        description:
          'Executive summit on agentic workflows, emergent reasoning architectures, and next-generation neural foundation systems.',
        categoryId: categoryMap['technology-ai'],
        bannerImage:
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
        venue: {
          name: 'Nexus Quantum Auditorium',
          address: '500 Horizon Boulevard, Technology Quad',
        },
        eventDate: new Date('2026-12-02T09:30:00.000Z'),
        startTime: '09:30',
        endTime: '17:30',
        registrationDeadline: new Date('2026-12-01T23:59:59.000Z'),
        maxParticipants: 75,
        currentParticipantsCount: 0,
        organizerId: organizer._id,
        status: 'published',
      },
    ];

    for (const evt of eventsData) {
      const existing = await Event.findOne({ title: evt.title });
      if (!existing) {
        await Event.create(evt);
        console.log('Created event:', evt.title);
      }
    }

    // 4. Register demo participant for the first event so passes screen is populated
    const firstEvent = await Event.findOne({ title: eventsData[0].title });
    if (firstEvent) {
      const existingReg = await Registration.findOne({
        userId: participant._id,
        eventId: firstEvent._id,
      });
      if (!existingReg) {
        await Registration.create({
          userId: participant._id,
          eventId: firstEvent._id,
          status: 'confirmed',
        });
        await Event.findByIdAndUpdate(firstEvent._id, { $inc: { currentParticipantsCount: 1 } });
        console.log('Registered demo participant for Candlelight Salon');
      }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
