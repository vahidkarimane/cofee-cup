// Script to verify Stripe API keys
require('dotenv').config({path: '.env.local'});
const Stripe = require('stripe');

async function verifyStripeKeys() {
	try {
		console.log('Verifying Stripe API keys...');

		// Check if keys are set
		const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
		const secretKey = process.env.STRIPE_SECRET_KEY;

		if (!publishableKey) {
			console.error('❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
			return;
		}

		if (!secretKey) {
			console.error('❌ STRIPE_SECRET_KEY is not set');
			return;
		}

		console.log('✅ Stripe keys are set in environment variables');
		console.log(`Publishable key: ${publishableKey.substring(0, 8)}...`);
		console.log(`Secret key: ${secretKey.substring(0, 8)}...`);

		// Initialize Stripe with the secret key
		const stripe = new Stripe(secretKey, {
			apiVersion: '2023-10-16',
		});

		// Try to make a simple API call to verify the key works
		console.log('Testing API connection...');
		const balance = await stripe.balance.retrieve();

		console.log('✅ Successfully connected to Stripe API!');
		console.log(
			'Available balance:',
			balance.available.map((b) => `${b.amount / 100} ${b.currency.toUpperCase()}`).join(', ')
		);

		// Try to retrieve the price
		if (process.env.NEXT_PUBLIC_STRIPE_PRICE_ID) {
			console.log(`Testing price retrieval for ID: ${process.env.NEXT_PUBLIC_STRIPE_PRICE_ID}`);
			const price = await stripe.prices.retrieve(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID);
			console.log(`✅ Price found: ${price.unit_amount / 100} ${price.currency.toUpperCase()}`);
		}
	} catch (error) {
		console.error('❌ Stripe verification failed:', error.message);
		if (error.type === 'StripeAuthenticationError') {
			console.error('The provided API key is invalid or expired.');
		} else if (error.type === 'StripePermissionError') {
			console.error('The API key does not have permission to perform this action.');
		}
	}
}

verifyStripeKeys();
