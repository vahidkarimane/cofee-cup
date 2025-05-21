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
		// Verify authentication
		const {userId} = await auth();
		if (!userId) {
			return NextResponse.json({error: 'Unauthorized'}, {status: 401});
		}

		// Get fortuneId and payment details
		const {fortuneId, paymentIntentId, images} = await req.json();

		if (!fortuneId) {
			return NextResponse.json({error: 'Fortune ID is required'}, {status: 400});
		}

		if (!images || !images.length) {
			return NextResponse.json({error: 'Images are required'}, {status: 400});
		}

		// Verify the fortune exists and belongs to this user
		const fortune = await getFortune(fortuneId);

		if (!fortune) {
			return NextResponse.json({error: 'Fortune not found'}, {status: 404});
		}

		if (fortune.userId !== userId && fortune.userId !== 'anonymous') {
			return NextResponse.json({error: 'Unauthorized'}, {status: 401});
		}

		// Update the fortune status to processing
		await updateFortuneStatus(fortuneId, FortuneStatus.PROCESSING);

		// Process the fortune with AI
		try {
			// Get the stored form data
			const {name, age, intent, about} = fortune;

			// Generate prediction
			const prediction = await generateFortunePredictionFromBase64(
				images,
				name,
				age,
				intent,
				about
			);

			// Update the fortune with the prediction
			await updateFortunePrediction(fortuneId, prediction);

			return NextResponse.json(
				{
					message: 'Fortune processed successfully',
					fortuneId,
					prediction,
				},
				{status: 200}
			);
		} catch (predictionError) {
			console.error('Error processing fortune:', predictionError);
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
		console.error('Error processing fortune request:', error);
		return NextResponse.json(
			{
				error: 'Failed to process request',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{status: 500}
		);
	}
}
