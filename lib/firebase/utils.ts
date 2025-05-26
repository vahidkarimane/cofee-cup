import {Fortune, FortuneStatus, PaymentStatus} from '@/types';

// This file is kept for backward compatibility but Firebase is no longer used
// The application has been migrated to Supabase
// Please use lib/supabase/utils.ts instead

// Stub functions that throw errors to ensure they're not actually used
// These are placeholders to maintain compatibility with existing imports

// Fortune operations
export async function createFortune(): Promise<string> {
	console.warn('Firebase utils are deprecated. Use Supabase utils instead.');
	throw new Error('Firebase has been replaced with Supabase. Use Supabase utils instead.');
}

export async function getFortune(): Promise<Fortune | null> {
	console.warn('Firebase utils are deprecated. Use Supabase utils instead.');
	throw new Error('Firebase has been replaced with Supabase. Use Supabase utils instead.');
}

export async function updateFortunePrediction(): Promise<void> {
	console.warn('Firebase utils are deprecated. Use Supabase utils instead.');
	throw new Error('Firebase has been replaced with Supabase. Use Supabase utils instead.');
}

export async function getUserFortunes(): Promise<Fortune[]> {
	console.warn('Firebase utils are deprecated. Use Supabase utils instead.');
	throw new Error('Firebase has been replaced with Supabase. Use Supabase utils instead.');
}

// Payment operations
export async function createPayment(): Promise<string> {
	console.warn('Firebase utils are deprecated. Use Supabase utils instead.');
	throw new Error('Firebase has been replaced with Supabase. Use Supabase utils instead.');
}

export async function updatePaymentStatus(): Promise<void> {
	console.warn('Firebase utils are deprecated. Use Supabase utils instead.');
	throw new Error('Firebase has been replaced with Supabase. Use Supabase utils instead.');
}

export async function getPayment() {
	console.warn('Firebase utils are deprecated. Use Supabase utils instead.');
	throw new Error('Firebase has been replaced with Supabase. Use Supabase utils instead.');
}

// Storage operations
export async function uploadImage(): Promise<string> {
	console.warn('Firebase utils are deprecated. Use Supabase utils instead.');
	throw new Error('Firebase has been replaced with Supabase. Use Supabase utils instead.');
}

export async function deleteImage(): Promise<void> {
	console.warn('Firebase utils are deprecated. Use Supabase utils instead.');
	throw new Error('Firebase has been replaced with Supabase. Use Supabase utils instead.');
}
