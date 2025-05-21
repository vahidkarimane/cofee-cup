// Script to verify Clerk authentication
require('dotenv').config({path: '.env.local'});
const {clerkClient} = require('@clerk/clerk-sdk-node');

async function verifyClerk() {
	try {
		console.log('Verifying Clerk configuration...');

		// Check if keys are set
		const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
		const secretKey = process.env.CLERK_SECRET_KEY;

		if (!publishableKey) {
			console.error('❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set');
			return;
		}

		if (!secretKey) {
			console.error('❌ CLERK_SECRET_KEY is not set');
			return;
		}

		console.log('✅ Clerk keys are set in environment variables');
		console.log(`Publishable key: ${publishableKey.substring(0, 8)}...`);
		console.log(`Secret key: ${secretKey.substring(0, 8)}...`);

		// Initialize Clerk client
		console.log('Testing Clerk API connection...');

		// Get a list of users (limited to 10)
		const users = await clerkClient.users.getUserList({
			limit: 10,
		});

		console.log(`✅ Successfully connected to Clerk API!`);
		console.log(`Found ${users.totalCount} users`);

		// Check middleware configuration
		console.log('\nChecking middleware configuration...');
		const fs = require('fs');
		try {
			const middlewareContent = fs.readFileSync('middleware.ts', 'utf8');
			if (middlewareContent.includes('@clerk/nextjs')) {
				console.log('✅ Clerk middleware is configured');
			} else {
				console.log('❌ Clerk middleware may not be properly configured');
			}
		} catch (err) {
			console.error('❌ Could not read middleware.ts file:', err.message);
		}
	} catch (error) {
		console.error('❌ Clerk verification failed:', error.message);
		if (error.message.includes('Unauthorized')) {
			console.error('The provided API key is invalid or expired.');
		} else if (error.message.includes('Permission')) {
			console.error('The API key does not have permission to perform this action.');
		}
	}
}

verifyClerk();
