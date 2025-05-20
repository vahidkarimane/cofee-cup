import {NextRequest, NextResponse} from 'next/server';
import {auth} from '@clerk/nextjs/server';
import {FortuneStatus} from '@/types';
import {generateFortunePredictionFromBase64} from '@/services/openai';
import {createFortune, updateFortunePrediction} from '@/lib/firebase/utils';

export async function POST(req: NextRequest) {
	try {
		// Verify authentication
		const {userId} = await auth();
		if (!userId) {
			return NextResponse.json({error: 'Unauthorized'}, {status: 401});
		}

		// Get request body
		const {images, name, age, intent, about} = await req.json();

		if (!images || !images.length) {
			return NextResponse.json({error: 'At least one image is required'}, {status: 400});
		}

		try {
			// Generate prediction directly using base64 images
			const prediction = await generateFortunePredictionFromBase64(
				images,
				name,
				age,
				intent,
				about
			);

			// Store only the prediction result (without image URLs)
			// Note: We're passing an empty array for imageUrl since we're not storing images
			const fortuneId = await createFortune(
				userId,
				[], // No image URLs to store
				name,
				age,
				intent,
				about
			);

			// Update the fortune with the prediction directly
			await updateFortunePrediction(fortuneId, prediction);

			return NextResponse.json(
				{
					message: 'Fortune prediction generated successfully',
					fortuneId,
					prediction,
				},
				{status: 200}
			);
		} catch (predictionError) {
			console.error('Error in prediction or database operations:', predictionError);
			return NextResponse.json(
				{
					error: 'Failed to process fortune prediction',
					details: predictionError instanceof Error ? predictionError.message : 'Unknown error',
				},
				{status: 500}
			);
		}
	} catch (error) {
		console.error('Error processing fortune request:', error);
		return NextResponse.json(
			{
				error: 'Failed to process fortune request',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{status: 500}
		);
	}
}
