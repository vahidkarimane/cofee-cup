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
// Create Stripe promise with explicit API version
const stripePromise = loadStripe(stripeConfig.publishableKey || '', {
	apiVersion: '2025-04-30',
	stripeAccount: undefined, // Only include if using Connect
});

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
				console.log('[Payment] Step 1: Creating payment intent for fortune:', fortuneId);

				const response = await fetch('/api/payment', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({fortuneId}),
				});

				console.log('[Payment] Step 2: API response received, status:', response.status);
				const data = await response.json();
				console.log('[Payment] Step 3: Response data parsed');

				if (!response.ok) {
					console.error('[Payment] Error: API returned error status', data);
					throw new Error(data.details || data.error || 'Failed to create payment intent');
				}

				console.log('[Payment] Step 4: Payment intent created successfully, ID:', data.paymentId);
				console.log('[Payment] Step 5: Setting client secret and amount');
				setClientSecret(data.clientSecret);
				setAmount(data.amount);
				console.log('[Payment] Step 6: Payment form ready to load Stripe elements');
			} catch (err) {
				console.error('[Payment] Error creating payment intent:', err);
				setError(err instanceof Error ? err.message : 'An error occurred with payment processing');
			} finally {
				setLoading(false);
			}
		}

		createPaymentIntent();
	}, [fortuneId]);

	useEffect(() => {
		// Debug Stripe loading
		if (clientSecret) {
			console.log(
				'[Payment] Step 6b: About to render Stripe Elements with client secret:',
				clientSecret.substring(0, 10) + '...'
			);

			// Check if stripePromise resolved
			stripePromise.then(
				() => console.log('[Payment] Step 6c: Stripe.js loaded successfully'),
				(err) => console.error('[Payment] Error loading Stripe.js:', err)
			);
		}
	}, [clientSecret]);

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
				<div className="stripe-elements-container" style={{minHeight: '400px'}}>
					{/* Add explicit styling to ensure Stripe elements are visible */}
					<style jsx global>{`
						.StripeElement {
							width: 100%;
							padding: 12px;
							border: 1px solid #e2e8f0;
							border-radius: 4px;
							background-color: white;
							min-height: 40px;
							box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
							transition: box-shadow 150ms ease;
						}
						.StripeElement--focus {
							box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
						}
						.StripeElement--invalid {
							border-color: #fa755a;
						}
						.stripe-elements-container iframe {
							opacity: 1 !important;
							height: auto !important;
							min-height: 40px !important;
						}
					`}</style>
					<Elements
						options={{
							...options,
							loader: 'always',
							locale: 'en',
						}}
						stripe={stripePromise}
					>
						<ErrorBoundary>
							<CheckoutForm amount={amount} fortuneId={fortuneId} />
						</ErrorBoundary>
					</Elements>
				</div>
			)}
		</div>
	);
}

// Error boundary component to catch rendering errors in Stripe Elements
class ErrorBoundary extends React.Component<
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

	componentDidCatch(error: any, errorInfo: any) {
		console.error('[Payment] Stripe Elements rendering error:', error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				<Card className="w-full max-w-md mx-auto">
					<CardHeader>
						<CardTitle>Payment Form Error</CardTitle>
						<CardDescription>There was an error loading the payment form.</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
							{this.state.error?.toString() || 'An unexpected error occurred loading Stripe.'}
						</div>
					</CardContent>
					<CardFooter>
						<Button onClick={() => window.location.reload()} className="w-full">
							Try Again
						</Button>
					</CardFooter>
				</Card>
			);
		}

		return this.props.children;
	}
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
		console.log('[Payment] Step 7: Form submitted');

		if (!stripe || !elements) {
			console.warn('[Payment] Warning: Stripe or elements not loaded yet');
			return;
		}

		setIsLoading(true);
		setMessage(null);
		console.log('[Payment] Step 8: Confirming payment with Stripe');

		const {error, paymentIntent} = await stripe.confirmPayment({
			elements,
			confirmParams: {
				return_url: `${window.location.origin}/dashboard?fortuneId=${fortuneId}&payment=success`,
			},
			redirect: 'if_required',
		});

		console.log('[Payment] Step 9: Payment confirmation response received');

		if (error) {
			console.error('[Payment] Payment error:', error.type, error.message);
			setMessage(error.message || 'An unexpected error occurred.');
			setIsLoading(false);
		} else if (paymentIntent && paymentIntent.status === 'succeeded') {
			console.log('[Payment] Step 10: Payment intent succeeded, status:', paymentIntent.status);

			try {
				console.log('[Payment] Step 11: Retrieving stored images from localStorage');
				// Get the stored images from localStorage
				const storedImages = localStorage.getItem(`fortune_images_${fortuneId}`);

				if (!storedImages) {
					console.error('[Payment] Error: Fortune images not found in localStorage');
					throw new Error('Fortune images not found');
				}

				const images = JSON.parse(storedImages);
				console.log('[Payment] Step 12: Processing fortune with payment ID:', paymentIntent.id);

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

				console.log(
					'[Payment] Step 13: Fortune processing response status:',
					processingResponse.status
				);

				if (!processingResponse.ok) {
					const errorData = await processingResponse.json();
					console.error('[Payment] Fortune processing error:', errorData);
					throw new Error(errorData.details || errorData.error || 'Failed to process fortune');
				}

				console.log('[Payment] Step 14: Fortune processed successfully, cleaning up localStorage');
				// Clean up the stored images
				localStorage.removeItem(`fortune_images_${fortuneId}`);

				// Redirect to fortune result page
				console.log('[Payment] Step 15: Redirecting to fortune result page');
				router.push(`/fortune-result?fortuneId=${fortuneId}`);
			} catch (processError) {
				console.error('[Payment] Fortune processing error:', processError);
				setMessage(
					processError instanceof Error
						? processError.message
						: 'Payment succeeded but fortune processing failed. Please contact support.'
				);
				setIsLoading(false);
			}
		} else {
			console.warn(
				'[Payment] Payment status unexpected or undefined:',
				paymentIntent ? paymentIntent.status : 'undefined'
			);
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
