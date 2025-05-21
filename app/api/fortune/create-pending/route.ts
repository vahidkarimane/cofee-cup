import {NextRequest, NextResponse} from 'next/server';
import {auth} from '@clerk/nextjs/server';
import {createFortune} from '@/lib/supabase/utils';
import {FortuneStatus} from '@/types';

// Configure the API route to handle larger payloads
export const config = {
	api: {
		bodyParser: {
			sizeLimit: '10mb', // Increase the body parser size limit to 10MB
		},
		responseLimit: '10mb', // Increase the response size limit to 10MB
	},
};

export async function POST(req: NextRequest) {
	try {
		// Get user ID from authentication or use anonymous
		const {userId} = await auth();
		const effectiveUserId = userId || 'anonymous';

		// Get request body
		const {images, name, age, intent, about} = await req.json();

		if (!images || !images.length) {
			return NextResponse.json({error: 'At least one image is required'}, {status: 400});
		}

		try {
			// Store form data with pending status (no prediction yet)
			const fortuneId = await createFortune(
				effectiveUserId,
				[], // No image URLs stored yet
				name,
				age,
				intent,
				about
			);

			// Store the base64 images in the session
			// We'll use a custom header to pass the base64 images to the client
			// The client will then pass them back when processing the fortune
			const response = NextResponse.json(
				{
					message: 'Fortune request created successfully',
					fortuneId,
				},
				{status: 200}
			);

			// Store the base64 images in a cookie or session
			// This is a simplified approach - in a production environment,
			// you might want to store these in a database with a TTL
			response.headers.set('X-Fortune-Images', JSON.stringify(images));

			return response;
		} catch (error) {
			console.error('Error creating pending fortune:', error);
			return NextResponse.json(
				{
					error: 'Failed to create fortune request',
					details: error instanceof Error ? error.message : 'Unknown error',
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
