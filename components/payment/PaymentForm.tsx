'use client';

import React, {useState, useCallback, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {loadStripe} from '@stripe/stripe-js';
import {CheckoutProvider, useCheckout, PaymentElement} from '@stripe/react-stripe-js';
import {Button} from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {getStripeConfig} from '@/lib/env';
import {formatPrice} from '@/services/stripe';

// Load Stripe outside of component render to avoid recreating Stripe object on every render
const stripeConfig = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = loadStripe(stripeConfig!);

interface PaymentFormProps {
	fortuneId: string;
}

export default function PaymentFormWrapper({fortuneId}: PaymentFormProps) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	// Function to call the API and get client secret
	const fetchClientSecret = useCallback(async () => {
		try {
			console.log('[VAhid Payment] Fetching client secret for fortune:', fortuneId);

			const response = await fetch('/api/payment', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({fortuneId}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.details || data.error || 'Failed to create checkout session');
			}

			console.log('[Payment] Checkout session created successfully');
			setLoading(false);
			return data.clientSecret;
		} catch (error) {
			console.error('[Payment] Error fetching client secret:', error);
			setError(error instanceof Error ? error.message : 'Failed to initialize payment');
			setLoading(false);
			throw error;
		}
	}, [fortuneId]);

	// Check for missing Stripe key
	React.useEffect(() => {
		if (!stripeConfig) {
			setError('Stripe is not configured properly. Please contact support.');
			setLoading(false);
		}
	}, []);

	if (loading && !error) {
		return (
			<Card className="w-full max-w-md mx-auto">
				<CardHeader>
					<CardTitle>Processing Payment</CardTitle>
					<CardDescription>Please wait while we prepare your payment...</CardDescription>
				</CardHeader>
				<CardContent className="flex justify-center py-8">
					<svg
						className="h-8 w-8 animate-spin text-primary"
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M21 12a9 9 0 1 1-6.219-8.56" />
					</svg>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className="w-full max-w-md mx-auto">
				<CardHeader>
					<CardTitle>Payment Error</CardTitle>
					<CardDescription>We encountered an error processing your payment.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
				</CardContent>
				<CardFooter>
					<Button onClick={() => window.location.reload()} className="w-full">
						Try Again
					</Button>
				</CardFooter>
			</Card>
		);
	}

	return (
		<div className="w-full max-w-md mx-auto">
			<CheckoutProvider
				stripe={stripePromise}
				options={{
					fetchClientSecret,
					elementsOptions: {
						appearance: {
							theme: 'stripe',
							variables: {
								colorPrimary: '#6366f1',
								colorBackground: '#ffffff',
								colorText: '#1f2937',
							},
						},
					},
				}}
			>
				<CheckoutForm fortuneId={fortuneId} />
			</CheckoutProvider>
		</div>
	);
}

interface CheckoutFormProps {
	fortuneId: string;
}

function CheckoutForm({fortuneId}: CheckoutFormProps) {
	const checkout = useCheckout();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [email, setEmail] = useState('');

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!checkout) {
			setError('Payment system not initialized. Please try again.');
			return;
		}

		setIsLoading(false);
		setError(null);

		try {
			// Update email
			if (email) {
				const emailResult = await checkout.updateEmail(email);
				if (emailResult.type === 'error') {
					setError(emailResult.error.message);
					setIsLoading(false);
					return;
				}
			}

			// Confirm payment
			console.log('[Payment] Confirming payment');
			const result = await checkout.confirm();

			if (result.type === 'error') {
				console.error('[Payment] Error confirming payment:', result.error);
				setError(result.error.message);
				setIsLoading(false);
			} else {
				// Redirect will be handled automatically by Stripe
				console.log('[Payment] Payment confirmed, waiting for redirect');
			}
		} catch (err) {
			console.error('[Payment] Error during payment:', err);
			setError(err instanceof Error ? err.message : 'An error occurred during payment processing');
			setIsLoading(false);
		}
	};

	// Format the amount correctly for display
	const amount = checkout?.total?.total?.amount || 0;
	const [formattedAmount, setFormattedAmount] = useState('...');

	useEffect(() => {
		if (checkout?.total?.total) {
			// Format the amount on the client side to avoid calling server function
			const formatter = new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
			});
			setFormattedAmount(formatter.format(Number(amount) / 100));
		}
	}, [amount, checkout?.total?.total]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Complete Your Payment</CardTitle>
				<CardDescription>
					Your fortune reading will be processed after payment is complete.
				</CardDescription>
			</CardHeader>
			<form onSubmit={handleSubmit}>
				<CardContent className="space-y-6">
					<div className="rounded-md bg-muted p-4">
						<div className="flex justify-between items-center">
							<span className="text-sm font-medium">Fortune Reading</span>
							<span className="text-lg font-semibold">{formattedAmount}</span>
						</div>
					</div>

					<div className="space-y-4">
						<div className="email">
							<label htmlFor="email" className="block text-sm font-medium mb-1">
								Email
							</label>
							<input
								type="email"
								id="email"
								name="email"
								className="w-full p-2 border rounded-md"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>

						<PaymentElement className="payment-element" options={{layout: 'accordion'}} />
					</div>

					{error && (
						<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
					)}
				</CardContent>
				<CardFooter>
					<Button type="submit" disabled={isLoading || !checkout} className="w-full">
						{isLoading ? (
							<>
								<svg
									className="mr-2 h-4 w-4 animate-spin"
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M21 12a9 9 0 1 1-6.219-8.56" />
								</svg>
								Processing...
							</>
						) : (
							`Pay Now`
						)}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
