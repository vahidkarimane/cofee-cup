'use server';

import Stripe from 'stripe';
import {getStripeConfig} from '@/lib/env';

// Initialize Stripe with the secret key
const stripeConfig = getStripeConfig();
// Using the latest API version
const stripe = new Stripe(stripeConfig.secretKey || '', {
	apiVersion: '2025-04-30.basil' as any, // Latest API version to match frontend
});

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
