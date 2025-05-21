import {NextRequest, NextResponse} from 'next/server';
import {auth} from '@clerk/nextjs/server';
import {getFortune, updateFortunePrediction} from '@/lib/supabase/utils';
import {generateFortunePrediction} from '@/services/openai';
import {FortuneStatus} from '@/types';

export async function POST(req: NextRequest) {
	try {
		// Get user ID from authentication or use anonymous
		const {userId} = await auth();
		const effectiveUserId = userId || 'anonymous';

		// Get request body
		const {fortuneId} = await req.json();

		if (!fortuneId) {
			return NextResponse.json({error: 'Fortune ID is required'}, {status: 400});
		}

		// Get the fortune from Firestore
		const fortune = await getFortune(fortuneId);

		if (!fortune) {
			return NextResponse.json({error: 'Fortune not found'}, {status: 404});
		}

		// Check if the fortune belongs to the authenticated user or anonymous user
		if (fortune.userId !== effectiveUserId && fortune.userId !== 'anonymous') {
			return NextResponse.json({error: 'Unauthorized'}, {status: 401});
		}

		// Check if the fortune already has a prediction
		if (fortune.prediction) {
			return NextResponse.json(
				{
					message: 'Fortune prediction already exists',
					prediction: fortune.prediction,
				},
				{status: 200}
			);
		}

		// Generate a fortune prediction using OpenAI GPT-4.1
		const prediction = await generateFortunePrediction(
			fortune.imageUrl,
			fortune.name,
			fortune.age,
			fortune.intent,
			fortune.about
		);

		// Update the fortune with the prediction
		await updateFortunePrediction(fortuneId, prediction);

		return NextResponse.json(
			{
				message: 'Fortune prediction generated successfully',
				prediction,
			},
			{status: 200}
		);
	} catch (error) {
		//console.error('Error processing fortune:', error);
		return NextResponse.json({error: 'Failed to process fortune prediction'}, {status: 500});
	}
}

// Webhook endpoint for asynchronous processing
export async function GET(req: NextRequest) {
	try {
		const fortuneId = req.nextUrl.searchParams.get('fortuneId');

		if (!fortuneId) {
			return NextResponse.json({error: 'Fortune ID is required'}, {status: 400});
		}

		// Get the fortune from Firestore
		const fortune = await getFortune(fortuneId);

		if (!fortune) {
			return NextResponse.json({error: 'Fortune not found'}, {status: 404});
		}

		// Check if the fortune already has a prediction
		if (fortune.prediction && fortune.status === FortuneStatus.COMPLETED) {
			return NextResponse.json(
				{
					status: fortune.status,
					prediction: fortune.prediction,
				},
				{status: 200}
			);
		}

		// Return the current status
		return NextResponse.json(
			{
				status: fortune.status,
			},
			{status: 200}
		);
	} catch (error) {
		//console.error('Error checking fortune status:', error);
		return NextResponse.json({error: 'Failed to check fortune status'}, {status: 500});
	}
}
