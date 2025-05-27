import Stripe from 'stripe';
import {getStripeConfig} from '@/lib/env';

// Initialize Stripe with the secret key
const stripeConfig = getStripeConfig();

// Using the latest supported API version as in the example
export const stripe = new Stripe(stripeConfig.secretKey || '', {
	apiVersion: '2025-03-31.basil' as any, // Override the TypeScript typing while using a stable API version
});
