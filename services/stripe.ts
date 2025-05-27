'use server';

import {getStripeConfig} from '@/lib/env';
import {stripe} from '@/lib/stripe';

// Get stripe configuration for use in this service
const stripeConfig = getStripeConfig();

/**
 * Create a payment intent for a fortune reading
 * @param amount Amount in cents (e.g., 500 for $5.00)
 * @param currency Currency code (e.g., 'usd')
 * @param metadata Additional metadata for the payment intent
 * @returns The created payment intent
 */
export async function createPaymentIntent(
	amount: number,
	currency: string = 'usd',
	metadata: Record<string, string> = {}
) {
	try {
		// Validate amount to prevent sending 0 to Stripe
		if (!amount || amount <= 0) {
			console.error(`[Stripe] Invalid payment amount: ${amount}cents`);
			throw new Error('Payment amount must be greater than 0');
		}

		// Log the amount being sent to Stripe
		console.log(`[Stripe] Creating payment intent with amount: ${amount} cents (${currency})`);

		const paymentIntent = await stripe.paymentIntents.create({
			amount,
			currency,
			metadata,
			automatic_payment_methods: {
				enabled: true,
			},
		});

		if (!paymentIntent.client_secret) {
			console.error('[Stripe] Payment intent created but missing client secret');
			throw new Error('Payment intent missing client secret');
		}

		console.log(`[Stripe] Successfully created payment intent: ${paymentIntent.id}`);

		return {
			clientSecret: paymentIntent.client_secret,
			id: paymentIntent.id,
		};
	} catch (error) {
		console.error('Error creating payment intent:', error);
		throw new Error(error instanceof Error ? error.message : 'Failed to create payment intent');
	}
}

/**
 * Retrieve a payment intent by ID
 * @param paymentIntentId The ID of the payment intent to retrieve
 * @returns The payment intent
 */
export async function retrievePaymentIntent(paymentIntentId: string) {
	try {
		return await stripe.paymentIntents.retrieve(paymentIntentId);
	} catch (error) {
		console.error('Error retrieving payment intent:', error);
		throw new Error('Failed to retrieve payment intent');
	}
}

/**
 * Get the price of a fortune reading from Stripe
 * @returns The price in cents
 */
export async function getFortuneReadingPrice() {
	try {
		if (!stripeConfig.priceId) {
			// Default price if no price ID is configured
			return 500; // $5.00
		}

		const price = await stripe.prices.retrieve(stripeConfig.priceId);
		return price.unit_amount || 500;
	} catch (error) {
		console.error('Error retrieving price:', error);
		// Return default price if there's an error
		return 500; // $5.00
	}
}

/**
 * Format a price in cents to a display price
 * @param amount Amount in cents
 * @param currency Currency code
 * @returns Formatted price string
 */
export async function formatPrice(amount: number, currency: string = 'usd') {
	const formatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: currency.toUpperCase(),
	});

	return formatter.format(amount / 100);
}

/**
 * Create a checkout session for a fortune reading
 * @param fortuneId The ID of the fortune reading
 * @param userId The ID of the user
 * @param domainUrl The base URL for redirect URLs
 * @returns The created checkout session with client secret
 */
export async function createCheckoutSession(fortuneId: string, userId: string, domainUrl: string) {
	try {
		// Get the price for a fortune reading
		let amount = await getFortuneReadingPrice();

		// Validate amount to prevent sending 0 to Stripe
		if (!amount || amount <= 0) {
			console.error(`[Stripe] Invalid payment amount: ${amount} cents`);
			throw new Error('Payment amount must be greater than 0');
		}

		console.log(`[Stripe] Creating checkout session with amount: ${amount} cents (USD)`);

		// Create a product price ID if one isn't available
		let priceId = stripeConfig.priceId;

		if (!priceId) {
			// Create a temporary price if none is configured
			const price = await stripe.prices.create({
				unit_amount: amount,
				currency: 'usd',
				product_data: {
					name: 'Fortune Reading',
				},
			});
			priceId = price.id;
		}

		// Create a checkout session
		const session = await stripe.checkout.sessions.create({
			line_items: [
				{
					price: priceId,
					quantity: 1,
				},
			],
			mode: 'payment',
			ui_mode: 'custom',
			metadata: {
				fortuneId,
				userId,
			},
			return_url: `${domainUrl}/fortune-result?fortuneId=${fortuneId}&session_id={CHECKOUT_SESSION_ID}`,
		});

		if (!session.client_secret) {
			console.error('[Stripe] Checkout session created but missing client secret');
			throw new Error('Checkout session missing client secret');
		}

		console.log(`[Stripe] Successfully created checkout session: ${session.id}`);

		return {
			clientSecret: session.client_secret,
			id: session.id,
		};
	} catch (error) {
		console.error('Error creating checkout session:', error);
		throw new Error(error instanceof Error ? error.message : 'Failed to create checkout session');
	}
}

/**
 * Retrieve a checkout session by ID
 * @param sessionId The ID of the checkout session to retrieve
 * @returns The checkout session
 */
export async function retrieveCheckoutSession(sessionId: string) {
	try {
		return await stripe.checkout.sessions.retrieve(sessionId);
	} catch (error) {
		console.error('Error retrieving checkout session:', error);
		throw new Error('Failed to retrieve checkout session');
	}
}
