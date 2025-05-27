import {NextRequest, NextResponse} from 'next/server';
import {auth} from '@clerk/nextjs/server';
import {
	createCheckoutSession,
	getFortuneReadingPrice,
	retrieveCheckoutSession,
} from '@/services/stripe';

// Ensure route is not cached and every request hits the function
export const dynamic = 'force-dynamic';

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

		// Get domain URL for return URL
		const domainUrl = process.env.DOMAIN || `${req.nextUrl.protocol}//${req.headers.get('host')}`;
		console.log('[Payment API] Step 4: Using domain URL:', domainUrl);

		// Create a checkout session
		let session;
		try {
			console.log('[Payment API] Step 5: Creating Stripe checkout session');
			session = await createCheckoutSession(fortuneId, userId, domainUrl);
			console.log('[Payment API] Step 6: Checkout session created:', session.id);
		} catch (stripeError) {
			console.error('[Payment API] Stripe error creating checkout session:', stripeError);
			return NextResponse.json({error: 'Failed to create Stripe checkout session'}, {status: 500});
		}

		// Verify client secret exists
		if (!session.clientSecret) {
			console.error('[Payment API] Error: Missing client secret from Stripe');
			return NextResponse.json({error: 'Failed to create checkout session'}, {status: 500});
		}

		// Return the client secret and session ID
		console.log('[Payment API] Step 7: Returning client secret and session details to client');

		// Get the amount for consistency with the previous implementation
		const amount = await getFortuneReadingPrice();

		return NextResponse.json({
			clientSecret: session.clientSecret,
			sessionId: session.id,
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
		const sessionId = searchParams.get('session_id');

		if (sessionId) {
			// If a session ID is provided, verify its status
			try {
				const session = await retrieveCheckoutSession(sessionId);
				return NextResponse.json({status: session.status});
			} catch (error) {
				console.error('Error retrieving session:', error);
				return NextResponse.json({error: 'Failed to retrieve session status'}, {status: 500});
			}
		} else {
			// Otherwise, just return the price
			try {
				const amount = await getFortuneReadingPrice();
				return NextResponse.json({amount});
			} catch (error) {
				console.error('Error getting fortune reading price:', error);
				return NextResponse.json({error: 'Failed to get price'}, {status: 500});
			}
		}
	} catch (error) {
		console.error('Error in GET request:', error);
		return NextResponse.json(
			{
				error: 'Failed to process request',
				details: error instanceof Error ? error.message : String(error),
			},
			{status: 500}
		);
	}
}
