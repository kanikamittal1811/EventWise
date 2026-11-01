import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import * as dotenv from 'dotenv';
import {
  buildDummyVendorCatalog,
  buildDummyRoyalWeddingEvent,
  buildDummyTechSummitEvent,
} from '../src/constants/dummyData';
import { UserProfile } from '../src/types/user';

// Load environment variables
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || '',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL || '',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
  appId: process.env.VITE_FIREBASE_APP_ID || '',
};

console.log('--- Initializing Firebase Realtime Database ---');
console.log(`Database URL: ${firebaseConfig.databaseURL || 'Not provided'}`);

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const database = getDatabase(app);

export async function uploadAllDummyDataToFirebase() {
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
