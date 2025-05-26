// This file is kept for backward compatibility
// The application has been migrated from Firebase to Supabase
// Do not load any Firebase modules from here

export * from './config';
export * from './admin';
export * from './utils';
export * from './schema';

// Collection names (kept for reference only)
export const COLLECTIONS = {
	FORTUNES: 'fortunes',
	USERS: 'users',
	PAYMENTS: 'payments',
};
