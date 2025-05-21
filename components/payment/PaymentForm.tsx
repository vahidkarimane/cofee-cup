'use client';

import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {loadStripe} from '@stripe/stripe-js';
import {
	Elements,
	PaymentElement,
	useStripe,
	useElements,
	AddressElement,
} from '@stripe/react-stripe-js';
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
const stripeConfig = getStripeConfig();
const stripePromise = loadStripe(stripeConfig.publishableKey || '');

interface PaymentFormProps {
	fortuneId: string;
}

export default function PaymentFormWrapper({fortuneId}: PaymentFormProps) {
	const [clientSecret, setClientSecret] = useState<string | null>(null);
	const [amount, setAmount] = useState<number>(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Create a payment intent as soon as the page loads
		async function createPaymentIntent() {
			try {
				setLoading(true);
				const response = await fetch('/api/payment', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({fortuneId}),
				});

				if (!response.ok) {
					throw new Error('Failed to create payment intent');
				}

				const data = await response.json();
				setClientSecret(data.clientSecret);
				setAmount(data.amount);
			} catch (err) {
				console.error('Error creating payment intent:', err);
				setError(err instanceof Error ? err.message : 'An error occurred');
			} finally {
				setLoading(false);
			}
		}

		createPaymentIntent();
	}, [fortuneId]);

	const options = clientSecret
		? {
				clientSecret,
				appearance: {
					theme: 'stripe' as const,
					variables: {
						colorPrimary: '#6366f1',
						colorBackground: '#ffffff',
						colorText: '#1f2937',
					},
				},
			}
		: {appearance: {theme: 'stripe' as const}};

	if (loading) {
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
			{clientSecret && (
				<Elements options={options} stripe={stripePromise}>
					<CheckoutForm amount={amount} fortuneId={fortuneId} />
				</Elements>
			)}
		</div>
	);
}

interface CheckoutFormProps {
	amount: number;
	fortuneId: string;
}

function CheckoutForm({amount, fortuneId}: CheckoutFormProps) {
	const stripe = useStripe();
	const elements = useElements();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!stripe || !elements) {
			// Stripe.js hasn't yet loaded.
			return;
		}

		setIsLoading(true);
		setMessage(null);

		const {error, paymentIntent} = await stripe.confirmPayment({
			elements,
			confirmParams: {
				return_url: `${window.location.origin}/dashboard?fortuneId=${fortuneId}&payment=success`,
			},
			redirect: 'if_required',
		});

		if (error) {
			// Show error to your customer
			setMessage(error.message || 'An unexpected error occurred.');
			setIsLoading(false);
		} else if (paymentIntent && paymentIntent.status === 'succeeded') {
			try {
				// Get the stored images from localStorage
				const storedImages = localStorage.getItem(`fortune_images_${fortuneId}`);

				if (!storedImages) {
					throw new Error('Fortune images not found');
				}

				const images = JSON.parse(storedImages);

				// Process the fortune after successful payment
				const processingResponse = await fetch('/api/fortune/process-paid', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						fortuneId,
						paymentIntentId: paymentIntent.id,
						images,
					}),
				});

				if (!processingResponse.ok) {
					const errorData = await processingResponse.json();
					throw new Error(errorData.details || errorData.error || 'Failed to process fortune');
				}

				// Clean up the stored images
				localStorage.removeItem(`fortune_images_${fortuneId}`);

				// Redirect to fortune result page
				router.push(`/fortune-result?fortuneId=${fortuneId}`);
			} catch (processError) {
				console.error('Error processing fortune:', processError);
				setMessage(
					processError instanceof Error
						? processError.message
						: 'Payment succeeded but fortune processing failed. Please contact support.'
				);
				setIsLoading(false);
			}
		} else {
			setMessage('An unexpected error occurred.');
			setIsLoading(false);
		}
	};

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
							<span className="text-lg font-semibold">{formatPrice(amount)}</span>
						</div>
					</div>

					<div className="space-y-4">
						<PaymentElement />
						<AddressElement options={{mode: 'billing'}} />
					</div>

					{message && (
						<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
							{message}
						</div>
					)}
				</CardContent>
				<CardFooter>
					<Button type="submit" disabled={isLoading || !stripe || !elements} className="w-full">
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
							`Pay ${formatPrice(amount)}`
						)}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
