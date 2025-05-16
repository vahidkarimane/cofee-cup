import {NextRequest, NextResponse} from 'next/server';
import {auth} from '@clerk/nextjs/server';
import {createFortune} from '@/lib/firebase/utils';
import {FortuneStatus} from '@/types';

export async function POST(req: NextRequest) {
	try {
		const {userId} = await auth();

		if (!userId) {
			return NextResponse.json({error: 'Unauthorized'}, {status: 401});
		}

		const {imageUrl, notes} = await req.json();

		if (!imageUrl) {
			return NextResponse.json({error: 'Image URL is required'}, {status: 400});
		}

		// Create a new fortune record in Firestore
		const fortuneId = await createFortune(userId, imageUrl, notes);

		// In the future, this will integrate with AWS Bedrock for AI-based fortune telling
		// For now, we just create the record with a pending status

		return NextResponse.json(
			{
				message: 'Fortune submission received',
				fortuneId,
				status: FortuneStatus.PENDING,
			},
			{status: 200}
		);
	} catch (error) {
		console.error('Error creating fortune:', error);
		return NextResponse.json({error: 'Failed to process fortune submission'}, {status: 500});
	}
}
