import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, set, get } from 'firebase/database';
import * as dotenv from 'dotenv';
import { VENDOR_CATALOG, CatalogVendor } from '../server/vendorCatalog';
import { EventItem } from '../src/types/event';
import { UserProfile } from '../src/types/user';

// Load environment variables
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyD0crZtQIt5nFJBAjitbeK0SeGVeaM8hkE',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'eventwise-3b649.firebaseapp.com',
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL || 'https://eventwise-3b649-default-rtdb.firebaseio.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'eventwise-3b649',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:335282399891:web:eee7c24f80e8d51f797b66',
};

console.log('--- Initializing Firebase Realtime Database ---');
console.log(`Database URL: ${firebaseConfig.databaseURL}`);

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const database = getDatabase(app);

// Helper to ensure phone is strictly in 91XXXXXX format
export function formatPhone91(rawPhone?: string): string {
  if (!rawPhone) return '919876543210';
  // Strip non-digits
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length >= 12) {
    return digits.slice(0, 12);
  }
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.startsWith('0') && digits.length === 11) {
    return `91${digits.slice(1)}`;
  }
  return digits.startsWith('91') ? digits : `91${digits}`;
}

export function buildDummyVendorCatalog(): Record<string, CatalogVendor> {
  const map: Record<string, CatalogVendor> = {};
  for (const v of VENDOR_CATALOG) {
    map[v.id] = {
      ...v,
      phone: formatPhone91(v.phone),
    };
  }
  return map;
}

export function buildDummyRoyalWeddingEvent(ownerId: string = 'demo_google_user'): EventItem {
  const now = Date.now();
  const eventId = 'demo_royal_wedding';

  return {
    id: eventId,
    ownerId,
    name: "Aarav & Meera's Royal Wedding Celebration",
    category: 'wedding',
    description: 'A magnificent 3-day royal heritage destination wedding celebration at Jaigarh Valley, Jaipur.',
    location: 'Jaipur, Rajasthan',
    eventDate: '2027-02-18',
    endDate: '2027-02-20',
    guestCount: 350,
    totalBudget: 2500000,
    currency: 'INR',
    theme: 'Royal Rajasthani Heritage & Sunset Marigold',
    status: 'planning',
    createdAt: now - 86400000 * 14,
    updatedAt: now,
    budget: {
      total: 2500000,
      categories: {
        cat_venue: {
          id: 'cat_venue',
          name: 'Venue & Stay',
          allocatedAmount: 850000,
          color: '#E07A5F',
        },
        cat_catering: {
          id: 'cat_catering',
          name: 'Catering & Beverages',
          allocatedAmount: 650000,
          color: '#F4A261',
        },
        cat_decor: {
          id: 'cat_decor',
          name: 'Decor & Production',
          allocatedAmount: 350000,
          color: '#2A9D8F',
        },
        cat_photo: {
          id: 'cat_photo',
          name: 'Photography & Cinema',
          allocatedAmount: 250000,
          color: '#264653',
        },
        cat_music: {
          id: 'cat_music',
          name: 'Music & DJ Entertainment',
          allocatedAmount: 150000,
          color: '#E76F51',
        },
        cat_attire: {
          id: 'cat_attire',
          name: 'Attire & Makeup',
          allocatedAmount: 150000,
          color: '#9C6644',
        },
        cat_invites: {
          id: 'cat_invites',
          name: 'Invitations & Gifting',
          allocatedAmount: 50000,
          color: '#6B705C',
        },
        cat_misc: {
          id: 'cat_misc',
          name: 'Logistics & Permissions',
          allocatedAmount: 50000,
          color: '#A5A58D',
        },
      },
      expenses: {
        exp_01: {
          id: 'exp_01',
          categoryId: 'cat_venue',
          title: 'Jaigarh Valley Resort Initial Booking Advance (50%)',
          amount: 425000,
          paidDate: '2026-10-15',
          status: 'paid',
          notes: 'Covered banquets, royal lawns, and 30 deluxe rooms for immediate family.',
        },
        exp_02: {
          id: 'exp_02',
          categoryId: 'cat_catering',
          title: 'Royal Shahi Rasoi Catering Token Advance',
          amount: 250000,
          paidDate: '2026-10-22',
          status: 'paid',
          notes: 'Menu finalized with 12 Rajasthani live counters, chaat street, and dessert buffet.',
        },
        exp_03: {
          id: 'exp_03',
          categoryId: 'cat_decor',
          title: 'Marigold & Mirrors Mandap & Lighting Deposit',
          amount: 150000,
          paidDate: '2026-11-01',
          status: 'pending',
          notes: 'Awaiting floral procurement sign-off.',
        },
        exp_04: {
          id: 'exp_04',
          categoryId: 'cat_photo',
          title: 'LensCraft Studios Cinematic Teaser Advance',
          amount: 100000,
          paidDate: '2026-10-28',
          status: 'paid',
          notes: 'Includes 4K drone videography and candid teaser reel.',
        },
        exp_05: {
          id: 'exp_05',
          categoryId: 'cat_invites',
          title: 'Shubh Sandesh Foil Invitations & WhatsApp Animation',
          amount: 45000,
          paidDate: '2026-10-30',
          status: 'paid',
          notes: '350 gold foil boxed cards plus customized 4K WhatsApp invitation video.',
        },
      },
    },
    vendors: {
      vnd_01: {
        id: 'vnd_01',
        name: 'Jaigarh Valley Royal Resort & Lawns',
        category: 'venue',
        contactName: 'Kunwar Ranvijay Singh',
        phone: '919414088990',
        email: 'weddings@jaigarhvalleyresort.com',
        website: 'https://jaigarhvalleyresort.com',
        address: 'Amer-Jaipur Bypass, Jaipur',
        quotation: 950000,
        negotiatedPrice: 850000,
        bookingStatus: 'booked',
        paymentStatus: 'partially_paid',
        notes: 'Hilltop lawn with Aravalli mountain views. Valet parking for 250 cars and fireworks clearance approved.',
        rating: 5,
        createdAt: now - 86400000 * 12,
        updatedAt: now,
      },
      vnd_02: {
        id: 'vnd_02',
        name: 'Royal Rajputana Shahi Rasoi',
        category: 'catering',
        contactName: 'Maharaj Virendra Rathore',
        phone: '919828012345',
        email: 'taste@royalrajputanarasoi.com',
        website: 'https://royalrajputanarasoi.com',
        address: 'MI Road, Jaipur',
        quotation: 700000,
        negotiatedPrice: 650000,
        bookingStatus: 'booked',
        paymentStatus: 'partially_paid',
        notes: 'Dal Baati Churma, Ker Sangri, Jodhpur Kachori live stalls, plus separate pure Jain kitchen setup.',
        rating: 5,
        createdAt: now - 86400000 * 10,
        updatedAt: now,
      },
      vnd_03: {
        id: 'vnd_03',
        name: 'LensCraft Heritage Wedding Studios',
        category: 'photography',
        contactName: 'Arjun Mathur',
        phone: '919829123890',
        email: 'contact@lenscraftstudios.in',
        website: 'https://lenscraftstudios.in',
        address: 'C-Scheme, Ashok Nagar, Jaipur',
        quotation: 275000,
        negotiatedPrice: 250000,
        bookingStatus: 'booked',
        paymentStatus: 'partially_paid',
        notes: 'Team of 4 (2 candid, 1 traditional, 1 drone pilot). Includes same-day 60-second Instagram reel.',
        rating: 5,
        createdAt: now - 86400000 * 8,
        updatedAt: now,
      },
      vnd_04: {
        id: 'vnd_04',
        name: 'Marigold & Mirrors Wedding Stylists',
        category: 'decoration',
        contactName: 'Kavita Chawla',
        phone: '919828877665',
        email: 'hello@marigoldmirrors.com',
        website: 'https://marigoldmirrors.com',
        address: 'Bani Park, Jaipur',
        quotation: 380000,
        negotiatedPrice: 350000,
        bookingStatus: 'shortlisted',
        paymentStatus: 'unpaid',
        notes: 'Authentic Marigold tassels, hanging brass bells, hand-painted mirror backdrop for sangeet stage.',
        rating: 4,
        createdAt: now - 86400000 * 5,
        updatedAt: now,
      },
      vnd_05: {
        id: 'vnd_05',
        name: 'DJ Aakash & The Desert Beats',
        category: 'music_dj',
        contactName: 'DJ Aakash Goyal',
        phone: '919829334455',
        email: 'bookings@djaakash.in',
        website: 'https://djaakash.in',
        address: 'Vaishali Nagar, Jaipur',
        quotation: 160000,
        negotiatedPrice: 150000,
        bookingStatus: 'booked',
        paymentStatus: 'unpaid',
        notes: 'Equipped with cold fire sparks, dry ice low fog machine, and Punjabi dhol troupe for Baarat.',
        rating: 5,
        createdAt: now - 86400000 * 4,
        updatedAt: now,
      },
      vnd_06: {
        id: 'vnd_06',
        name: 'Shubh Sandesh Royal Invitations',
        category: 'invitations',
        contactName: 'Narendra Jain',
        phone: '919829221100',
        email: 'orders@shubh-sandesh.com',
        website: 'https://shubh-sandesh.com',
        address: 'Johari Bazaar, Jaipur',
        quotation: 55000,
        negotiatedPrice: 50000,
        bookingStatus: 'booked',
        paymentStatus: 'paid',
        notes: 'Gold foil embossed hardboard boxes with dry fruit compartments & WhatsApp video invites dispatched.',
        rating: 5,
        createdAt: now - 86400000 * 6,
        updatedAt: now,
      },
    },
    guests: {
      gst_01: {
        id: 'gst_01',
        name: 'Vikramaditya Sharma',
        category: 'family',
        plusOnes: 3,
        rsvpStatus: 'confirmed',
        dietaryNotes: 'Pure Vegetarian, Traditional Sweets Lover',
        phone: '919829112233',
        email: 'vikram.sharma@example.com',
        inviteSent: true,
        tableNumber: 'Royal Table 1',
        createdAt: now - 86400000 * 10,
        updatedAt: now,
      },
      gst_02: {
        id: 'gst_02',
        name: 'Sunita Singhania',
        category: 'family',
        plusOnes: 2,
        rsvpStatus: 'confirmed',
        dietaryNotes: 'Strict Jain Food (No Root Vegetables / Onion / Garlic)',
        phone: '919811445566',
        email: 'sunita.singhania@example.com',
        inviteSent: true,
        tableNumber: 'Royal Table 2',
        createdAt: now - 86400000 * 10,
        updatedAt: now,
      },
      gst_03: {
        id: 'gst_03',
        name: 'Rohan Kapoor',
        category: 'friends',
        plusOnes: 1,
        rsvpStatus: 'confirmed',
        dietaryNotes: 'No restrictions',
        phone: '919820556677',
        email: 'rohan.kapoor@example.com',
        inviteSent: true,
        tableNumber: 'Table 7 (Groomsmen)',
        createdAt: now - 86400000 * 9,
        updatedAt: now,
      },
      gst_04: {
        id: 'gst_04',
        name: 'Ananya Iyer',
        category: 'friends',
        plusOnes: 1,
        rsvpStatus: 'pending',
        dietaryNotes: 'Vegan / Lactose Free',
        phone: '919840112244',
        email: 'ananya.iyer@example.com',
        inviteSent: true,
        tableNumber: 'Table 8 (Bridesmaids)',
        createdAt: now - 86400000 * 8,
        updatedAt: now,
      },
      gst_05: {
        id: 'gst_05',
        name: 'Kunwar Devendra Rathore',
        category: 'vip',
        plusOnes: 2,
        rsvpStatus: 'confirmed',
        dietaryNotes: 'Traditional Rajasthani Cuisine',
        phone: '919414332211',
        email: 'devendra.rathore@example.com',
        inviteSent: true,
        tableNumber: 'VIP Pavilion A',
        createdAt: now - 86400000 * 7,
        updatedAt: now,
      },
      gst_06: {
        id: 'gst_06',
        name: 'Meenakshi Joshi',
        category: 'colleague',
        plusOnes: 0,
        rsvpStatus: 'confirmed',
        dietaryNotes: 'Vegetarian',
        phone: '919828778899',
        email: 'meenakshi.joshi@example.com',
        inviteSent: true,
        tableNumber: 'Table 12',
        createdAt: now - 86400000 * 7,
        updatedAt: now,
      },
      gst_07: {
        id: 'gst_07',
        name: 'Arjun Verma',
        category: 'friends',
        plusOnes: 0,
        rsvpStatus: 'pending',
        dietaryNotes: 'None',
        phone: '919810998877',
        email: 'arjun.verma@example.com',
        inviteSent: true,
        tableNumber: 'Table 7 (Groomsmen)',
        createdAt: now - 86400000 * 6,
        updatedAt: now,
      },
      gst_08: {
        id: 'gst_08',
        name: 'Dr. Rajesh Aggarwal',
        category: 'family',
        plusOnes: 3,
        rsvpStatus: 'confirmed',
        dietaryNotes: 'Diabetic Friendly / Low Sugar Desserts',
        phone: '919811009988',
        email: 'dr.aggarwal@example.com',
        inviteSent: true,
        tableNumber: 'Royal Table 3',
        createdAt: now - 86400000 * 5,
        updatedAt: now,
      },
      gst_09: {
        id: 'gst_09',
        name: 'Priyanka Deshmukh',
        category: 'colleague',
        plusOnes: 0,
        rsvpStatus: 'declined',
        dietaryNotes: 'N/A',
        phone: '919822334455',
        email: 'priyanka.d@example.com',
        inviteSent: true,
        createdAt: now - 86400000 * 5,
        updatedAt: now,
      },
      gst_10: {
        id: 'gst_10',
        name: 'Kabir Sen',
        category: 'friends',
        plusOnes: 1,
        rsvpStatus: 'confirmed',
        dietaryNotes: 'No restrictions',
        phone: '919830221133',
        email: 'kabir.sen@example.com',
        inviteSent: true,
        tableNumber: 'Table 9',
        createdAt: now - 86400000 * 4,
        updatedAt: now,
      },
    },
    tasks: {
      tsk_01: {
        id: 'tsk_01',
        title: 'Sign Palace Contract & Settle 50% Booking Advance',
        category: 'venue',
        priority: 'high',
        status: 'completed',
        dueDate: '2026-10-15',
        assignedTo: 'Alex Planner',
        notes: 'Contract signed with Kunwar Ranvijay Singh at Jaigarh Valley Resort.',
        createdAt: now - 86400000 * 14,
        updatedAt: now - 86400000 * 10,
      },
      tsk_02: {
        id: 'tsk_02',
        title: 'Finalize Royal Rajasthani & Jain Tasting Menu',
        category: 'catering',
        priority: 'high',
        status: 'completed',
        dueDate: '2026-10-22',
        assignedTo: 'Alex Planner',
        notes: 'Approved 12 live stalls and dedicated counter for pure Jain guests.',
        createdAt: now - 86400000 * 12,
        updatedAt: now - 86400000 * 8,
      },
      tsk_03: {
        id: 'tsk_03',
        title: 'Mandap Floral Harmony & Sunset Light Rig Review',
        category: 'decoration',
        priority: 'medium',
        status: 'in_progress',
        dueDate: '2026-11-20',
        assignedTo: 'Kavita Chawla',
        notes: 'Require 3D render of sunset view over the Aravalli hills for mandap.',
        createdAt: now - 86400000 * 8,
        updatedAt: now,
      },
      tsk_04: {
        id: 'tsk_04',
        title: 'Choreograph Sangeet Flashmob & Family Medley',
        category: 'music_dj',
        priority: 'medium',
        status: 'in_progress',
        dueDate: '2026-12-05',
        assignedTo: 'DJ Aakash Goyal',
        notes: 'Tracklist submitted: Bollywood remix medley plus Rajasthani folk dhol.',
        createdAt: now - 86400000 * 6,
        updatedAt: now,
      },
      tsk_05: {
        id: 'tsk_05',
        title: 'Dispatch Gold Foil Box Cards & Broadcast WhatsApp Save-the-Date',
        category: 'invitations',
        priority: 'high',
        status: 'in_progress',
        dueDate: '2026-11-15',
        assignedTo: 'Alex Planner',
        notes: 'All 350 RSVP links synced with phone numbers.',
        createdAt: now - 86400000 * 6,
        updatedAt: now,
      },
      tsk_06: {
        id: 'tsk_06',
        title: 'Final Trial for Bridal Lehenga & Groom Sherwani',
        category: 'attire',
        priority: 'high',
        status: 'todo',
        dueDate: '2026-12-15',
        assignedTo: 'Meera (Bride)',
        notes: 'Jewelry matching session booked at Johari Bazaar.',
        createdAt: now - 86400000 * 4,
        updatedAt: now,
      },
      tsk_07: {
        id: 'tsk_07',
        title: 'Arrange Jaipur Airport Luxury Fleets for VIP Arrivals',
        category: 'other',
        priority: 'medium',
        status: 'todo',
        dueDate: '2027-01-10',
        assignedTo: 'Alex Planner',
        notes: 'Coordinate arrival flight schedule for 25 outstation VIP families.',
        createdAt: now - 86400000 * 2,
        updatedAt: now,
      },
    },
    functions: {
      fn_01: {
        id: 'fn_01',
        title: 'Haldi & Phoolon Ki Holi Ceremony',
        date: '2027-02-18',
        startTime: '10:00',
        endTime: '13:00',
        location: 'Heritage Courtyard Gardens, Jaigarh Valley',
        description: 'Floral yellow dress code with fresh organic petals and dhol beats.',
      },
      fn_02: {
        id: 'fn_02',
        title: 'Royal Mehendi & Sangeet Gala Evening',
        date: '2027-02-18',
        startTime: '18:30',
        endTime: '23:30',
        location: 'Crystal Ballroom & Lawns',
        description: 'Bespoke cocktails, family dance showdowns, live DJ set with percussionists.',
      },
      fn_03: {
        id: 'fn_03',
        title: 'Shahi Baarat & Varmala Ceremony',
        date: '2027-02-19',
        startTime: '16:00',
        endTime: '19:00',
        location: 'Grand Entrance Palace Gates',
        description: 'Vintage car procession, Punjabi dhol troupe, rose petal showers.',
      },
      fn_04: {
        id: 'fn_04',
        title: 'Pheras & Vedic Mandap Rituals',
        date: '2027-02-19',
        startTime: '19:30',
        endTime: '22:30',
        location: 'Hilltop Lotus Mandap, Jaigarh Lawns',
        description: 'Torchlit water pavilion with Vedic chants and classical sitar players.',
      },
      fn_05: {
        id: 'fn_05',
        title: 'Grand Heritage Gala Dinner & Reception',
        date: '2027-02-20',
        startTime: '19:00',
        endTime: '23:45',
        location: 'Royal Haveli Amphitheatre',
        description: 'Multi-course banquet, live Sufi band performance, celebratory cake cutting.',
      },
    },
    collaborators: {
      [ownerId]: {
        uid: ownerId,
        email: 'alex.planner@gmail.com',
        displayName: 'Alex Planner (Owner)',
        role: 'owner',
        addedAt: now - 86400000 * 14,
      },
      collab_partner: {
        uid: 'collab_partner',
        email: 'meera.bride@example.com',
        displayName: 'Meera (Bride & Co-Host)',
        role: 'editor',
        addedAt: now - 86400000 * 10,
      },
    },
    activity: {
      act_01: {
        id: 'act_01',
        userId: ownerId,
        userName: 'Alex Planner',
        action: 'created event workspace',
        entityType: 'event',
        entityName: "Aarav & Meera's Royal Wedding Celebration",
        timestamp: now - 86400000 * 14,
      },
      act_02: {
        id: 'act_02',
        userId: ownerId,
        userName: 'Alex Planner',
        action: 'booked venue vendor',
        entityType: 'vendor',
        entityName: 'Jaigarh Valley Royal Resort & Lawns',
        timestamp: now - 86400000 * 12,
      },
      act_03: {
        id: 'act_03',
        userId: ownerId,
        userName: 'Alex Planner',
        action: 'added budget expense',
        entityType: 'budget',
        entityName: 'Jaigarh Valley Resort Initial Booking Advance',
        timestamp: now - 86400000 * 10,
      },
      act_04: {
        id: 'act_04',
        userId: ownerId,
        userName: 'Alex Planner',
        action: 'imported guest list',
        entityType: 'guest',
        entityName: '10 VIP Guests with 91XXXXXX phone numbers',
        timestamp: now - 86400000 * 5,
      },
    },
  };
}

export function buildDummyTechSummitEvent(ownerId: string = 'demo_google_user'): EventItem {
  const now = Date.now();
  const eventId = 'demo_tech_summit';

  return {
    id: eventId,
    ownerId,
    name: 'InnovateX Global Tech Leadership Summit 2027',
    category: 'corporate',
    description: 'Premier tech conference bringing together 500 AI founders, CTOs, and venture investors.',
    location: 'Bengaluru, Karnataka',
    eventDate: '2027-04-10',
    endDate: '2027-04-11',
    guestCount: 500,
    totalBudget: 1800000,
    currency: 'INR',
    theme: 'Futuristic Tech & Sustainable Innovation',
    status: 'planning',
    createdAt: now - 86400000 * 20,
    updatedAt: now,
    budget: {
      total: 1800000,
      categories: {
        cat_venue: {
          id: 'cat_venue',
          name: 'Conference Center & AV',
          allocatedAmount: 700000,
          color: '#2A9D8F',
        },
        cat_catering: {
          id: 'cat_catering',
          name: 'Corporate Catering & Coffee Lounge',
          allocatedAmount: 450000,
          color: '#F4A261',
        },
        cat_stage: {
          id: 'cat_stage',
          name: 'Stage Production & LED Video Walls',
          allocatedAmount: 350000,
          color: '#264653',
        },
        cat_keynote: {
          id: 'cat_keynote',
          name: 'Keynote Speakers & Tech Demos',
          allocatedAmount: 200000,
          color: '#E76F51',
        },
        cat_branding: {
          id: 'cat_branding',
          name: 'Badges, Lanyards & Swag Bags',
          allocatedAmount: 100000,
          color: '#6B705C',
        },
      },
      expenses: {
        exp_tech_01: {
          id: 'exp_tech_01',
          categoryId: 'cat_venue',
          title: 'Convention Hall Booking Advance',
          amount: 350000,
          paidDate: '2026-10-10',
          status: 'paid',
          notes: 'Main auditorium with 600 seats and high-speed gigabit Wi-Fi.',
        },
        exp_tech_02: {
          id: 'exp_tech_02',
          categoryId: 'cat_stage',
          title: 'P3 LED Wall & Multi-cam 4K Live Broadcast Unit',
          amount: 175000,
          paidDate: '2026-10-25',
          status: 'paid',
          notes: 'Stage backdrop and remote livestreams setup.',
        },
      },
    },
    vendors: {
      vnd_tech_01: {
        id: 'vnd_tech_01',
        name: 'The Leela Convention Centre & Tech Park',
        category: 'venue',
        contactName: 'Sanjay Nambiar',
        phone: '919845012378',
        email: 'events@theleelaconventions.com',
        website: 'https://theleela.com',
        address: 'Whitefield, Bengaluru',
        quotation: 750000,
        negotiatedPrice: 700000,
        bookingStatus: 'booked',
        paymentStatus: 'partially_paid',
        notes: 'Capacity for 800 seats, dedicated fiber optic leased line.',
        rating: 5,
        createdAt: now - 86400000 * 18,
        updatedAt: now,
      },
      vnd_tech_02: {
        id: 'vnd_tech_02',
        name: 'AcousticPulse AV & Event Tech Solutions',
        category: 'music_dj',
        contactName: 'Deepak Rao',
        phone: '919840112233',
        email: 'info@acousticpulse.in',
        website: 'https://acousticpulse.in',
        address: 'Koramangala, Bengaluru',
        quotation: 380000,
        negotiatedPrice: 350000,
        bookingStatus: 'booked',
        paymentStatus: 'partially_paid',
        notes: 'Dual 4K LED screens, 12 wireless lavalier mics, live YouTube/LinkedIn stream relay.',
        rating: 5,
        createdAt: now - 86400000 * 15,
        updatedAt: now,
      },
    },
    guests: {
      gst_tech_01: {
        id: 'gst_tech_01',
        name: 'Dr. Ramesh Sundaram',
        category: 'vip',
        plusOnes: 0,
        rsvpStatus: 'confirmed',
        dietaryNotes: 'Vegetarian',
        phone: '919845112233',
        email: 'dr.sundaram@techai.org',
        inviteSent: true,
        tableNumber: 'Speaker Lounge A',
        createdAt: now - 86400000 * 12,
        updatedAt: now,
      },
      gst_tech_02: {
        id: 'gst_tech_02',
        name: 'Tanvi Saxena',
        category: 'vip',
        plusOnes: 0,
        rsvpStatus: 'confirmed',
        dietaryNotes: 'Vegan',
        phone: '919880223344',
        email: 'tanvi@sequoiacap.com',
        inviteSent: true,
        tableNumber: 'Speaker Lounge B',
        createdAt: now - 86400000 * 11,
        updatedAt: now,
      },
    },
    tasks: {
      tsk_tech_01: {
        id: 'tsk_tech_01',
        title: 'Publish Keynote Agenda & Speaker Schedule',
        category: 'other',
        priority: 'high',
        status: 'completed',
        dueDate: '2026-10-30',
        assignedTo: 'Alex Planner',
        notes: 'Announced 15 keynote speakers across 3 tracks.',
        createdAt: now - 86400000 * 15,
        updatedAt: now - 86400000 * 2,
      },
      tsk_tech_02: {
        id: 'tsk_tech_02',
        title: 'Dispatch QR Code Mobile Passes via WhatsApp & Email',
        category: 'invitations',
        priority: 'high',
        status: 'in_progress',
        dueDate: '2026-11-25',
        assignedTo: 'Alex Planner',
        notes: 'Automated QR pass delivery to 91XXXXXX phone numbers.',
        createdAt: now - 86400000 * 10,
        updatedAt: now,
      },
    },
    functions: {
      fn_tech_01: {
        id: 'fn_tech_01',
        title: 'Opening Keynote & AI Breakthroughs Track',
        date: '2027-04-10',
        startTime: '09:00',
        endTime: '13:00',
        location: 'Grand Auditorium, Hall 1',
        description: 'Opening remarks followed by presentations from leading AI researchers.',
      },
      fn_tech_02: {
        id: 'fn_tech_02',
        title: 'VC Pitch Showcase & Networking Gala Dinner',
        date: '2027-04-10',
        startTime: '18:00',
        endTime: '22:00',
        location: 'Skyline Terrace Lounge',
        description: 'Demo day pitches with investor networking and cocktails.',
      },
    },
    collaborators: {
      [ownerId]: {
        uid: ownerId,
        email: 'alex.planner@gmail.com',
        displayName: 'Alex Planner',
        role: 'owner',
        addedAt: now - 86400000 * 20,
      },
    },
    activity: {
      act_tech_01: {
        id: 'act_tech_01',
        userId: ownerId,
        userName: 'Alex Planner',
        action: 'created conference workspace',
        entityType: 'event',
        entityName: 'InnovateX Global Tech Leadership Summit 2027',
        timestamp: now - 86400000 * 20,
      },
    },
  };
}

export async function uploadAllDummyDataToFirebase(): Promise<{
  vendorCount: number;
  eventsSeeded: string[];
}> {
  console.log('\n======================================================');
  console.log('🚀 UPLOADING DUMMY VENDOR LIST & DUMMY DATA TO FIREBASE');
  console.log('======================================================');

  // 1. Upload Curated Vendor Catalog to /vendorCatalog
  console.log('\n[1/3] Uploading dummy vendor catalog to Firebase (/vendorCatalog)...');
  const catalogMap = buildDummyVendorCatalog();
  const vendorCount = Object.keys(catalogMap).length;

  await set(ref(database, 'vendorCatalog'), catalogMap);
  console.log(`✅ Uploaded ${vendorCount} vendors with 91XXXXXX phone numbers to /vendorCatalog`);

  // Sample check of phone format
  const sampleVendor = Object.values(catalogMap)[0];
  console.log(`   Sample Vendor: "${sampleVendor.name}" -> Phone: ${sampleVendor.phone}`);

  // 2. Upload Dummy Events
  console.log('\n[2/3] Uploading dummy events to Firebase (/events)...');
  const demoOwnerId = 'demo_google_user';
  const weddingEvent = buildDummyRoyalWeddingEvent(demoOwnerId);
  const techEvent = buildDummyTechSummitEvent(demoOwnerId);

  // Upload wedding event
  await set(ref(database, `events/${weddingEvent.id}`), weddingEvent);
  await set(ref(database, `userEvents/${demoOwnerId}/${weddingEvent.id}`), {
    id: weddingEvent.id,
    name: weddingEvent.name,
    category: weddingEvent.category,
    eventDate: weddingEvent.eventDate,
    updatedAt: weddingEvent.updatedAt,
  });
  console.log(`✅ Uploaded Royal Wedding Event: "${weddingEvent.name}" (${weddingEvent.id})`);

  // Upload tech summit event
  await set(ref(database, `events/${techEvent.id}`), techEvent);
  await set(ref(database, `userEvents/${demoOwnerId}/${techEvent.id}`), {
    id: techEvent.id,
    name: techEvent.name,
    category: techEvent.category,
    eventDate: techEvent.eventDate,
    updatedAt: techEvent.updatedAt,
  });
  console.log(`✅ Uploaded Corporate Summit Event: "${techEvent.name}" (${techEvent.id})`);

  // 3. Upload Demo User Profile
  console.log('\n[3/3] Uploading demo user profile (/users/demo_google_user/profile)...');
  const demoProfile: UserProfile = {
    uid: demoOwnerId,
    email: 'alex.planner@gmail.com',
    displayName: 'Alex Planner',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    createdAt: Date.now() - 86400000 * 30,
    preferences: { defaultCurrency: 'INR' },
  };
  await set(ref(database, `users/${demoOwnerId}/profile`), demoProfile);
  console.log(`✅ Demo user profile uploaded for ${demoProfile.displayName} (${demoProfile.uid})`);

  console.log('\n======================================================');
  console.log('🎉 ALL DUMMY DATA & VENDOR LIST SUCCESSFULLY UPLOADED!');
  console.log('======================================================\n');

  return {
    vendorCount,
    eventsSeeded: [weddingEvent.id, techEvent.id],
  };
}

// If executed directly from CLI
if (process.argv[1]?.endsWith('seedFirebase.ts')) {
  uploadAllDummyDataToFirebase()
    .then((result) => {
      console.log('Summary:', result);
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Failed to upload data to Firebase:', err);
      process.exit(1);
    });
}
