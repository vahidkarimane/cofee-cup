import {NextRequest, NextResponse} from 'next/server';
import {auth} from '@clerk/nextjs/server';
import {createPaymentIntent, getFortuneReadingPrice} from '@/services/stripe';
import {createPayment} from '@/lib/supabase/utils';

export async function POST(req: NextRequest) {
	try {
		console.log('[Payment API] Step 1: Payment request received');

		// Verify authentication
		const {userId} = await auth();
		if (!userId) {
			console.error('[Payment API] Error: Authentication failed, no userId found');
			return NextResponse.json({error: 'Unauthorized'}, {status: 401});
		}

		console.log('[Payment API] Step 2: Authentication successful, userId:', userId);

		// Get request body
		const {fortuneId} = await req.json();
		console.log('[Payment API] Step 3: Request body parsed, fortuneId:', fortuneId);

		if (!fortuneId) {
			console.error('[Payment API] Error: Missing fortuneId in request');
			return NextResponse.json({error: 'Fortune ID is required'}, {status: 400});
		}

		// Get the price for a fortune reading
		let amount;
		try {
			console.log('[Payment API] Step 4: Getting fortune reading price');
			amount = await getFortuneReadingPrice();
			console.log('[Payment API] Step 5: Fortune reading price retrieved:', amount);
		} catch (priceError) {
			console.error('[Payment API] Error getting fortune reading price:', priceError);
			return NextResponse.json({error: 'Failed to get price'}, {status: 500});
		}

		// Create a payment intent
		let paymentIntent;
		try {
			console.log('[Payment API] Step 6: Creating Stripe payment intent');
			paymentIntent = await createPaymentIntent(amount, 'usd', {
				userId,
				fortuneId,
			});
			console.log('[Payment API] Step 7: Payment intent created:', paymentIntent.id);
		} catch (stripeError) {
			console.error('[Payment API] Stripe error creating payment intent:', stripeError);
			return NextResponse.json({error: 'Failed to create Stripe payment intent'}, {status: 500});
		}

		// Create a payment record in Supabase
		let paymentId;
		try {
			console.log('[Payment API] Step 8: Creating payment record in Supabase');
			paymentId = await createPayment(userId, fortuneId, amount, 'usd', paymentIntent.id);
			console.log('[Payment API] Step 9: Payment record created:', paymentId);
		} catch (dbError) {
			console.error('[Payment API] Database error creating payment record:', dbError);
			return NextResponse.json({error: 'Failed to create payment record'}, {status: 500});
		}

		// Return the client secret and payment ID
		console.log('[Payment API] Step 10: Returning client secret and payment details to client');
		return NextResponse.json({
			clientSecret: paymentIntent.clientSecret,
			paymentId,
			amount,
		});
	} catch (error) {
		console.error('[Payment API] Unhandled error in payment processing:', error);
		return NextResponse.json(
			{
				error: 'Failed to process payment request',
				details: error instanceof Error ? error.message : String(error),
			},
			{status: 500}
		);
	}
}

export async function GET(req: NextRequest) {
	try {
		// Verify authentication
		const {userId} = await auth();
		if (!userId) {
			return NextResponse.json({error: 'Unauthorized'}, {status: 401});
		}

		const searchParams = req.nextUrl.searchParams;
		const paymentId = searchParams.get('paymentId');

		// Get the price for a fortune reading
		let amount;
		try {
			amount = await getFortuneReadingPrice();
			console.log('Fortune reading price (GET):', amount);
		} catch (priceError) {
			console.error('Error getting fortune reading price:', priceError);
			return NextResponse.json({error: 'Failed to get price'}, {status: 500});
		}

		// Return the price
		return NextResponse.json({
			amount,
		});
	} catch (error) {
		console.error('Error getting price:', error);
		return NextResponse.json(
			{
				error: 'Failed to get fortune reading price',
				details: error instanceof Error ? error.message : String(error),
			},
			{status: 500}
		);
	}
}
