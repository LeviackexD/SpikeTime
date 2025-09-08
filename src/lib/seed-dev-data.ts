/**
 * @fileoverview Seeds the Firebase emulators with mock data for development.
 * This script populates the Authentication and Firestore emulators with
 * the users defined in `mock-data.ts` to ensure a consistent starting
 * state for development and testing.
 */

// IMPORTANT: This file should only be imported and used in development environments.

import { auth, db } from './firebase';
import { mockUsers } from './mock-data';
import type { User } from './types';

// A simple in-memory flag to prevent re-seeding during hot reloads.
let isSeeding = false;
let hasSeeded = false;

const SEED_PASSWORD = 'password123';

export const seedDevelopmentData = async () => {
  if (isSeeding || hasSeeded) {
    return;
  }

  isSeeding = true;

  try {
    // Check if users already exist in the auth emulator
    const { users } = await auth.getUsers([]);
    if (users.length >= mockUsers.length) {
      console.log('Auth emulator already seeded.');
      hasSeeded = true;
      isSeeding = false;
      return;
    }

    console.log('Seeding development data...');

    for (const mockUser of mockUsers) {
      if (!mockUser.email) continue;
      try {
        // Create user in Auth
        const userRecord = await auth.createUser({
          uid: mockUser.id,
          email: mockUser.email,
          password: SEED_PASSWORD,
          displayName: mockUser.name,
          photoURL: mockUser.avatarUrl,
        });

        // Create user profile in Firestore
        const userDocRef = db.collection('users').doc(userRecord.uid);
        // Ensure we use the exact data from mockUsers, including roles
        await userDocRef.set(mockUser);
        console.log(`Successfully created user: ${mockUser.name}`);

      } catch (error: any) {
        if (error.code === 'auth/uid-already-exists' || error.code === 'auth/email-already-exists') {
          console.log(`User ${mockUser.name} already exists. Skipping.`);
        } else {
          console.error(`Error creating user ${mockUser.name}:`, error);
        }
      }
    }
    console.log('Development data seeding complete.');
    hasSeeded = true;
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    isSeeding = false;
  }
};
