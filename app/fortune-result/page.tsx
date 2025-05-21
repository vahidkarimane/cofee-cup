'use client';

import React, {useEffect, useState} from 'react';
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

	useEffect(() => {
		const fetchFortune = async () => {
			try {
				setLoading(true);
				setError(null);

				// First, check if the fortune exists and get its details
				const response = await fetch(`/api/fortune/process?fortuneId=${fortuneId}`, {
					method: 'GET',
				});

				if (!response.ok) {
					throw new Error('Failed to fetch fortune details');
				}

				const data = await response.json();

				// If the fortune doesn't have a prediction yet, process it
				if (data.status === FortuneStatus.PENDING) {
					const processResponse = await fetch('/api/fortune/process', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							fortuneId,
						}),
					});

					if (!processResponse.ok) {
						throw new Error('Failed to process fortune');
					}

					const processData = await processResponse.json();

					// Create a fortune object with the prediction
					setFortune({
						id: fortuneId,
						userId: userId || 'anonymous', // Provide a default value for userId
						prediction: processData.prediction,
						status: FortuneStatus.COMPLETED,
						createdAt: new Date(),
						name: '',
						age: '',
						intent: '',
						imageUrl: [],
					});
				} else {
					// Fortune already has a prediction
					setFortune({
						id: fortuneId,
						userId: userId || 'anonymous', // Provide a default value for userId
						prediction: data.prediction,
						status: data.status,
						createdAt: new Date(),
						name: '',
						age: '',
						intent: '',
						imageUrl: [],
					});
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

				<FortuneResultContent />
			</div>
		</div>
	);
}
