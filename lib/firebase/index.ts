// Re-export Firebase client configuration
export * from './config';

// Re-export Firebase admin configuration
export * from './admin';

// Re-export Firebase utility functions
export * from './utils';

// Re-export Firebase schema
export * from './schema';

// Export collection names
export const COLLECTIONS = {
	FORTUNES: 'fortunes',
	USERS: 'users',
	PAYMENTS: 'payments',
};
