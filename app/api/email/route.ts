import {NextRequest, NextResponse} from 'next/server';
import {auth, currentUser} from '@clerk/nextjs/server';
import {sendFortuneEmail} from '@/services/email';
import {getFortune} from '@/lib/supabase/utils';
import {FortuneStatus} from '@/types';

export async function POST(req: NextRequest) {
	try {
		// Verify authentication
		const {userId} = await auth();
		const user = await currentUser();

		if (!userId || !user) {
			return NextResponse.json({error: 'Unauthorized'}, {status: 401});
		}

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

		// Check if the fortune belongs to the authenticated user
		if (fortune.userId !== userId) {
			return NextResponse.json({error: 'Unauthorized'}, {status: 401});
		}

		// Check if the fortune has a prediction
		if (!fortune.prediction || fortune.status !== FortuneStatus.COMPLETED) {
			return NextResponse.json({error: 'Fortune prediction not available yet'}, {status: 400});
		}

		// Get the user's email
		const email = user.emailAddresses[0]?.emailAddress;

		if (!email) {
			return NextResponse.json({error: 'User email not found'}, {status: 400});
		}

		// Send the fortune email
		const emailId = await sendFortuneEmail(email, fortune);

		return NextResponse.json(
			{
				message: 'Fortune email sent successfully',
				emailId,
			},
			{status: 200}
		);
	} catch (error) {
		//console.error('Error sending fortune email:', error);
		return NextResponse.json({error: 'Failed to send fortune email'}, {status: 500});
	}
}
