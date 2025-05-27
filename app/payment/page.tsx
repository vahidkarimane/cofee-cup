'use client';

import React, {Suspense} from 'react';
import {useSearchParams} from 'next/navigation';
import {redirect} from 'next/navigation';
import PaymentForm from '@/components/payment/PaymentForm';
import {useAuth} from '@clerk/nextjs';
import {useUser} from '@clerk/nextjs';

function PaymentContent() {
	const searchParams = useSearchParams();

	const {isSignedIn, user, isLoaded} = useUser();

	const fortuneId = searchParams.get('fortuneId');

	// Redirect to fortune page if no fortuneId is provided
	if (!fortuneId) {
		redirect('/fortune');
	}

	// // Redirect to login if not authenticated
	// if (!user) {
	// 	redirect('/auth/sign-in');
	// }

	return (
		<div className="mt-10">
			<PaymentForm fortuneId={fortuneId} />
		</div>
	);
}

// PaymentErrorBoundary for catching any errors in the payment page
class PaymentErrorBoundary extends React.Component<
	{children: React.ReactNode},
	{hasError: boolean; error: any}
> {
	constructor(props: {children: React.ReactNode}) {
		super(props);
		this.state = {hasError: false, error: null};
	}

	static getDerivedStateFromError(error: any) {
		return {hasError: true, error};
	}

	componentDidCatch(error: any, info: any) {
		console.error('Payment page error:', error, info);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="mx-auto max-w-md mt-8 p-4 border rounded-md bg-destructive/5">
					<h2 className="text-lg font-semibold mb-2">Error Loading Payment Form</h2>
					<p className="text-sm text-destructive">
						We encountered a problem loading the payment form. Please try refreshing the page.
					</p>
					<p className="text-xs mt-2 text-muted-foreground">
						Error details: {this.state.error?.message || 'Unknown error'}
					</p>
					<button
						className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
						onClick={() => window.location.reload()}
					>
						Reload Page
					</button>
				</div>
			);
		}
		return this.props.children;
	}
}

export default function PaymentPage() {
	console.log('[Payment Page] Rendering payment page');

	return (
		<div className="container py-12">
			<div className="mx-auto max-w-4xl space-y-8">
				<div className="text-center">
					<h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Complete Your Payment</h1>
					<p className="mt-4 text-lg text-muted-foreground">
						Your fortune reading will be processed after payment is complete.
					</p>
				</div>

				<PaymentErrorBoundary>
					<Suspense
						fallback={
							<div className="flex justify-center py-12">
								<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
							</div>
						}
					>
						<PaymentContent />
					</Suspense>
				</PaymentErrorBoundary>

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
