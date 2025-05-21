// Script to verify environment variables
require('dotenv').config({path: '.env.local'});

function verifyEnvironmentVariables() {
	console.log('Verifying environment variables...');

	// Define required environment variables by category
	const requiredVars = {
		clerk: ['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY'],
		stripe: [
			'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
			'STRIPE_SECRET_KEY',
			'STRIPE_WEBHOOK_SECRET',
			'NEXT_PUBLIC_STRIPE_PRICE_ID',
		],
		supabase: [
			'NEXT_PUBLIC_SUPABASE_URL',
			'NEXT_PUBLIC_SUPABASE_ANON_KEY',
			'SUPABASE_SERVICE_ROLE_KEY',
		],
		app: ['NEXT_PUBLIC_APP_URL'],
	};

	// Check each category
	let allValid = true;

	for (const [category, vars] of Object.entries(requiredVars)) {
		console.log(`\n${category.toUpperCase()} VARIABLES:`);

		for (const varName of vars) {
			const value = process.env[varName];

			if (!value) {
				console.log(`❌ ${varName}: Missing`);
				allValid = false;
			} else {
				// Show a preview of the value (first few characters)
				let preview;
				if (varName.includes('KEY') || varName.includes('SECRET')) {
					preview = `${value.substring(0, 8)}...`;
				} else {
					preview = value.length > 30 ? `${value.substring(0, 30)}...` : value;
				}
				console.log(`✅ ${varName}: ${preview}`);
			}
		}
	}

	// Check for storage bucket name consistency
	console.log('\nSTORAGE BUCKET CHECK:');
	// Look for storage bucket name in code
	const storageBucketInCode = 'coffee-cup'; // From lib/supabase/utils.ts
	console.log(`Storage bucket name in code: ${storageBucketInCode}`);

	return allValid;
}

const result = verifyEnvironmentVariables();
console.log(
	'\nEnvironment variables check:',
	result ? '✅ All required variables are set' : '❌ Some variables are missing'
);
