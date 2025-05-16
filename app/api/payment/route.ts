import {NextRequest, NextResponse} from 'next/server';
import {auth} from '@clerk/nextjs/server';
import {createPaymentIntent, getFortuneReadingPrice} from '@/services/stripe';
import {createPayment} from '@/lib/firebase/utils';

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
		const amount = await getFortuneReadingPrice();

		// Create a payment intent
		const paymentIntent = await createPaymentIntent(amount, 'usd', {
			userId,
			fortuneId,
		});

		// Create a payment record in Firestore
		const paymentId = await createPayment(userId, fortuneId, amount, 'usd', paymentIntent.id);

		// Return the client secret and payment ID
		return NextResponse.json({
			clientSecret: paymentIntent.clientSecret,
			paymentId,
			amount,
		});
	} catch (error) {
		console.error('Error creating payment:', error);
		return NextResponse.json({error: 'Failed to process payment request'}, {status: 500});
	}
}

export async function GET(req: NextRequest) {
	try {
		// Verify authentication
		const {userId} = await auth();
		if (!userId) {
			return NextResponse.json({error: 'Unauthorized'}, {status: 401});
		}

		// Get the price for a fortune reading
		const amount = await getFortuneReadingPrice();

		// Return the price
		return NextResponse.json({
			amount,
		});
	} catch (error) {
		console.error('Error getting price:', error);
		return NextResponse.json({error: 'Failed to get fortune reading price'}, {status: 500});
	}
}
