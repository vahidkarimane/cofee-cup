'use client';

import React, {Suspense} from 'react';
import {useSearchParams} from 'next/navigation';
import {redirect} from 'next/navigation';
import PaymentForm from '@/components/payment/PaymentForm';
import {useAuth} from '@clerk/nextjs';

function PaymentContent() {
	const searchParams = useSearchParams();
	const {userId} = useAuth();
	const fortuneId = searchParams.get('fortuneId');

	// Redirect to fortune page if no fortuneId is provided
	if (!fortuneId) {
		redirect('/fortune');
	}

	// Redirect to login if not authenticated
	if (!userId) {
		redirect('/auth/sign-in');
	}

	return (
		<div className="mt-10">
			<PaymentForm fortuneId={fortuneId} />
		</div>
	);
}

export default function PaymentPage() {
	return (
		<div className="container py-12">
			<div className="mx-auto max-w-4xl space-y-8">
				<div className="text-center">
					<h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Complete Your Payment</h1>
					<p className="mt-4 text-lg text-muted-foreground">
						Your fortune reading will be processed after payment is complete.
					</p>
				</div>

				<Suspense fallback={<div>Loading payment details...</div>}>
					<PaymentContent />
				</Suspense>

				<div className="mt-8 text-center text-sm text-muted-foreground">
					<p>
						Your payment is processed securely through Stripe. We do not store your credit card
						information.
					</p>
				</div>
			</div>
		</div>
	);
}
