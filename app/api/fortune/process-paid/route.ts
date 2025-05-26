import {NextRequest, NextResponse} from 'next/server';
import {auth} from '@clerk/nextjs/server';
import {generateFortunePredictionFromBase64} from '@/services/openai';
import {
	getFortune,
	updateFortunePrediction,
	updateFortuneStatus,
	getPayment,
} from '@/lib/supabase/utils';
import {FortuneStatus, PaymentStatus} from '@/types';

export async function POST(req: NextRequest) {
	try {
		console.log('[Fortune Processing] Step 1: Process-paid request received');

		// Verify authentication
		const {userId} = await auth();
		if (!userId) {
			console.error('[Fortune Processing] Error: Authentication failed, no userId found');
			return NextResponse.json({error: 'Unauthorized'}, {status: 401});
		}

		console.log('[Fortune Processing] Step 2: Authentication successful, userId:', userId);

		// Get fortuneId and payment details
		const {fortuneId, paymentIntentId, images} = await req.json();
		console.log('[Fortune Processing] Step 3: Request parsed, fortuneId:', fortuneId);

		if (!fortuneId) {
			console.error('[Fortune Processing] Error: Missing fortuneId in request');
			return NextResponse.json({error: 'Fortune ID is required'}, {status: 400});
		}

		if (!images || !images.length) {
			console.error('[Fortune Processing] Error: No images provided in request');
			return NextResponse.json({error: 'Images are required'}, {status: 400});
		}

		console.log('[Fortune Processing] Step 4: Validating fortune ownership');
		// Verify the fortune exists and belongs to this user
		const fortune = await getFortune(fortuneId);

		if (!fortune) {
			console.error('[Fortune Processing] Error: Fortune not found with ID:', fortuneId);
			return NextResponse.json({error: 'Fortune not found'}, {status: 404});
		}

		if (fortune.userId !== userId && fortune.userId !== 'anonymous') {
			console.error('[Fortune Processing] Error: Fortune belongs to another user');
			return NextResponse.json({error: 'Unauthorized'}, {status: 401});
		}

		console.log('[Fortune Processing] Step 5: Updating fortune status to PROCESSING');
		// Update the fortune status to processing
		await updateFortuneStatus(fortuneId, FortuneStatus.PROCESSING);

		// Process the fortune with AI
		try {
			// Get the stored form data
			const {name, age, intent, about} = fortune;
			console.log('[Fortune Processing] Step 6: Starting AI prediction generation');

			// Generate prediction
			console.log('[Fortune Processing] Step 7: Calling OpenAI to generate fortune prediction');
			const prediction = await generateFortunePredictionFromBase64(
				images,
				name,
				age,
				intent,
				about
			);

			console.log('[Fortune Processing] Step 8: AI prediction received, updating fortune record');
			// Update the fortune with the prediction
			await updateFortunePrediction(fortuneId, prediction);

			console.log('[Fortune Processing] Step 9: Fortune processed successfully');
			return NextResponse.json(
				{
					message: 'Fortune processed successfully',
					fortuneId,
					prediction,
				},
				{status: 200}
			);
		} catch (predictionError) {
			console.error('[Fortune Processing] Error generating prediction:', predictionError);
			console.log('[Fortune Processing] Updating fortune status to FAILED');

			await updateFortuneStatus(fortuneId, FortuneStatus.FAILED);

			return NextResponse.json(
				{
					error: 'Failed to process fortune',
					details: predictionError instanceof Error ? predictionError.message : 'Unknown error',
				},
				{status: 500}
			);
		}
	} catch (error) {
		console.error('[Fortune Processing] Unhandled error in processing request:', error);
		return NextResponse.json(
			{
				error: 'Failed to process request',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{status: 500}
		);
	}
}
