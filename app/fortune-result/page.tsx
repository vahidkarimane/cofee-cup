'use client';

import React, {useEffect, useState, Suspense} from 'react';
import {useSearchParams} from 'next/navigation';
import {redirect} from 'next/navigation';
import FortuneResult from '@/components/fortune/FortuneResult';
import {useAuth} from '@clerk/nextjs';
import {Fortune, FortuneStatus} from '@/types';

function FortuneResultContent() {
	const searchParams = useSearchParams();
	const {userId} = useAuth();
	const fortuneId = searchParams.get('fortuneId');
	const [fortune, setFortune] = useState<Fortune | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Redirect to fortune page if no fortuneId is provided
	if (!fortuneId) {
		redirect('/fortune');
	}

	// For development, we'll allow access without authentication
	// In production, you would want to redirect to login if not authenticated
	// if (!userId) {
	// 	redirect('/auth/sign-in');
	// }

	// Check if we're coming from a payment
	const sessionId = searchParams.get('session_id');

	useEffect(() => {
		const fetchFortune = async () => {
			try {
				setLoading(true);
				setError(null);

				// If we have a session ID, verify the payment first
				if (sessionId) {
					const paymentResponse = await fetch(`/api/payment?session_id=${sessionId}`, {
						method: 'GET',
					});

					if (!paymentResponse.ok) {
						throw new Error('Failed to verify payment status');
					}

					const paymentData = await paymentResponse.json();

					// If payment is not successful, redirect back to payment page
					if (paymentData.status !== 'complete') {
						console.log('Payment incomplete, redirecting to payment page');
						redirect(`/payment?fortuneId=${fortuneId}`);
						return;
					}

					console.log('Payment completed successfully');
				}

				// Now check the fortune exists and get its details
				const response = await fetch(`/api/fortune/process?fortuneId=${fortuneId}`, {
					method: 'GET',
				});

				if (!response.ok) {
					throw new Error('Failed to fetch fortune details');
				}

				const data = await response.json();

				// Check the status of the fortune
				if (data.status === FortuneStatus.PENDING) {
					// Fortune is pending payment
					setFortune({
						id: fortuneId,
						userId: userId || 'anonymous',
						prediction: '',
						status: FortuneStatus.PENDING,
						createdAt: new Date(),
						name: '',
						age: '',
						intent: '',
						imageUrl: [],
					});
				} else if (data.status === FortuneStatus.PROCESSING) {
					// Fortune is being processed
					setFortune({
						id: fortuneId,
						userId: userId || 'anonymous',
						prediction: '',
						status: FortuneStatus.PROCESSING,
						createdAt: new Date(),
						name: '',
						age: '',
						intent: '',
						imageUrl: [],
					});

					// Poll for updates every 5 seconds
					const intervalId = setInterval(async () => {
						try {
							const statusResponse = await fetch(`/api/fortune/process?fortuneId=${fortuneId}`, {
								method: 'GET',
							});

							if (!statusResponse.ok) {
								throw new Error('Failed to check fortune status');
							}

							const statusData = await statusResponse.json();

							if (statusData.status === FortuneStatus.COMPLETED) {
								// Fortune is complete
								setFortune({
									id: fortuneId,
									userId: userId || 'anonymous',
									prediction: statusData.prediction,
									status: FortuneStatus.COMPLETED,
									createdAt: new Date(),
									name: '',
									age: '',
									intent: '',
									imageUrl: [],
								});
								clearInterval(intervalId);
							} else if (statusData.status === FortuneStatus.FAILED) {
								// Fortune processing failed
								setError('Fortune processing failed. Please try again.');
								clearInterval(intervalId);
							}
						} catch (pollError) {
							console.error('Error polling fortune status:', pollError);
							clearInterval(intervalId);
						}
					}, 5000);

					// Clean up interval on component unmount
					return () => clearInterval(intervalId);
				} else if (data.status === FortuneStatus.COMPLETED) {
					// Fortune already has a prediction
					setFortune({
						id: fortuneId,
						userId: userId || 'anonymous',
						prediction: data.prediction,
						status: FortuneStatus.COMPLETED,
						createdAt: new Date(),
						name: '',
						age: '',
						intent: '',
						imageUrl: [],
					});
				} else if (data.status === FortuneStatus.FAILED) {
					// Fortune processing failed
					throw new Error('Fortune processing failed. Please try again.');
				}
			} catch (err) {
				console.error('Error fetching fortune:', err);
				setError(err instanceof Error ? err.message : 'An error occurred');
			} finally {
				setLoading(false);
			}
		};

		// Always fetch the fortune, even if userId is not available
		if (fortuneId) {
			fetchFortune();
		}
	}, [fortuneId, userId]);

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center py-12">
				<div className="mb-4">
					<svg
						className="h-12 w-12 animate-spin text-primary"
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
				</div>
				<h3 className="text-xl font-medium">Loading your fortune...</h3>
				<p className="mt-2 text-center text-muted-foreground">
					Please wait while we retrieve your fortune reading.
				</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center py-12">
				<div className="mb-4 rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-900/20 dark:text-red-400">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="h-6 w-6"
					>
						<circle cx="12" cy="12" r="10" />
						<line x1="15" x2="9" y1="9" y2="15" />
						<line x1="9" x2="15" y1="9" y2="15" />
					</svg>
				</div>
				<h3 className="text-xl font-medium">Error Loading Fortune</h3>
				<p className="mt-2 text-center text-muted-foreground">{error}</p>
			</div>
		);
	}

	if (!fortune) {
		return (
			<div className="flex flex-col items-center justify-center py-12">
				<div className="mb-4 rounded-full bg-amber-100 p-3 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="h-6 w-6"
					>
						<circle cx="12" cy="12" r="10" />
						<line x1="12" x2="12" y1="8" y2="12" />
						<line x1="12" x2="12.01" y1="16" y2="16" />
					</svg>
				</div>
				<h3 className="text-xl font-medium">Fortune Not Found</h3>
				<p className="mt-2 text-center text-muted-foreground">
					We couldn't find the fortune you're looking for.
				</p>
			</div>
		);
	}

	return <FortuneResult fortune={fortune} />;
}

export default function FortuneResultPage() {
	return (
		<div className="container py-12">
			<div className="mx-auto max-w-4xl space-y-8">
				<div className="text-center">
					<h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Your Fortune Reading</h1>
					<p className="mt-4 text-lg text-muted-foreground">
						Here's what the coffee grounds reveal about your future.
					</p>
				</div>

				<Suspense
					fallback={
						<div className="flex flex-col items-center justify-center py-12">
							<div className="mb-4">
								<svg
									className="h-12 w-12 animate-spin text-primary"
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
							</div>
							<h3 className="text-xl font-medium">Loading your fortune...</h3>
							<p className="mt-2 text-center text-muted-foreground">
								Please wait while we retrieve your fortune reading.
							</p>
						</div>
					}
				>
					<FortuneResultContent />
				</Suspense>
			</div>
		</div>
	);
}
