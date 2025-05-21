import {NextRequest, NextResponse} from 'next/server';
import {auth} from '@clerk/nextjs/server';
import {createPaymentIntent, getFortuneReadingPrice} from '@/services/stripe';
import {createPayment} from '@/lib/supabase/utils';

export async function POST(req: NextRequest) {
	try {
		// Verify authentication
		const {userId} = await auth();
		if (!userId) {
			return NextResponse.json({error: 'Unauthorized'}, {status: 401});
		}

		// Get request body
		const {fortuneId} = await req.json();

		if (!fortuneId) {
			return NextResponse.json({error: 'Fortune ID is required'}, {status: 400});
		}

		// Get the price for a fortune reading
		let amount;
		try {
			amount = await getFortuneReadingPrice();
			console.log('Fortune reading price:', amount);
		} catch (priceError) {
			console.error('Error getting fortune reading price:', priceError);
			return NextResponse.json({error: 'Failed to get price'}, {status: 500});
		}

		// Create a payment intent
		let paymentIntent;
		try {
			paymentIntent = await createPaymentIntent(amount, 'usd', {
				userId,
				fortuneId,
			});
			console.log('Payment intent created:', paymentIntent.id);
		} catch (stripeError) {
			console.error('Stripe error creating payment intent:', stripeError);
			return NextResponse.json({error: 'Failed to create Stripe payment intent'}, {status: 500});
		}

		// Create a payment record in Supabase
		let paymentId;
		try {
			paymentId = await createPayment(userId, fortuneId, amount, 'usd', paymentIntent.id);
			console.log('Payment record created:', paymentId);
		} catch (dbError) {
			console.error('Database error creating payment record:', dbError);
			return NextResponse.json({error: 'Failed to create payment record'}, {status: 500});
		}

		// Return the client secret and payment ID
		return NextResponse.json({
			clientSecret: paymentIntent.clientSecret,
			paymentId,
			amount,
		});
	} catch (error) {
		console.error('Error creating payment:', error);
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
