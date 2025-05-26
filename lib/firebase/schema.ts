import {FortuneStatus, PaymentStatus} from '@/types';

// Mock Timestamp type to replace Firebase's Timestamp
export class Timestamp {
	seconds: number;
	nanoseconds: number;

	constructor(seconds: number, nanoseconds: number) {
		this.seconds = seconds;
		this.nanoseconds = nanoseconds;
	}

	static now(): Timestamp {
		const now = new Date();
		return new Timestamp(Math.floor(now.getTime() / 1000), 0);
	}

	toDate(): Date {
		return new Date(this.seconds * 1000);
	}
}

/**
 * This file defines the Firestore database schema for the Coffee Cup Fortune app.
 * It serves as documentation for the database structure and can be used for type checking.
 */

// User document structure
export interface UserDocument {
	id: string; // Clerk user ID
	email: string;
	firstName?: string;
	lastName?: string;
	imageUrl?: string;
	createdAt: Timestamp;
	updatedAt: Timestamp;
}

// Fortune document structure
export interface FortuneDocument {
	userId: string; // Clerk user ID
	imageUrl: string; // URL to the uploaded coffee cup image
	prediction: string; // The fortune prediction text
	createdAt: Timestamp;
	status: FortuneStatus;
	paymentId?: string; // Reference to payment document
}

// Payment document structure
export interface PaymentDocument {
	userId: string; // Clerk user ID
	amount: number;
	currency: string;
	status: PaymentStatus;
	createdAt: Timestamp;
	updatedAt: Timestamp;
	stripePaymentIntentId: string;
	fortuneId?: string; // Reference to fortune document
}

/**
 * Firestore Collection Structure
 *
 * /users/{userId}
 *   - User information
 *
 * /fortunes/{fortuneId}
 *   - Fortune information
 *   - Includes reference to user and payment
 *
 * /payments/{paymentId}
 *   - Payment information
 *   - Includes reference to user and fortune
 */

// Firestore security rules (to be implemented in Firebase console)
export const firestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User can read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User can read and create their own fortunes
    match /fortunes/{fortuneId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // User can read and create their own payments
    match /payments/{paymentId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
`;

// Storage security rules (to be implemented in Firebase console)
export const storageRules = `
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User can upload and read their own images
    match /fortune-images/{userId}/{allImages=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
`;
