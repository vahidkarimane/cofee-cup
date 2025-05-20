'use client';

import React, {useState} from 'react';
import Image from 'next/image';
import {useRouter} from 'next/navigation';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Fortune, FortuneStatus} from '@/types';

interface FortuneResultProps {
	fortune: Fortune;
	isLoading?: boolean;
}

export default function FortuneResult({fortune, isLoading = false}: FortuneResultProps) {
	const router = useRouter();
	const [processing, setProcessing] = useState(false);
	const [prediction, setPrediction] = useState<string | null>(fortune.prediction || null);
	const [error, setError] = useState<string | null>(null);
	const [emailSent, setEmailSent] = useState(false);
	const [sendingEmail, setSendingEmail] = useState(false);

	// Function to send the fortune reading by email
	const sendFortuneEmail = async () => {
		try {
			setSendingEmail(true);
			setError(null);

			const response = await fetch('/api/email', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					fortuneId: fortune.id,
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to send fortune email');
			}

			setEmailSent(true);
		} catch (err) {
			console.error('Error sending fortune email:', err);
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setSendingEmail(false);
		}
	};

	// Function to process the fortune prediction
	const processFortune = async () => {
		try {
			setProcessing(true);
			setError(null);

			const response = await fetch('/api/fortune/process', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					fortuneId: fortune.id,
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to process fortune prediction');
			}

			const data = await response.json();
			setPrediction(data.prediction);

			// Refresh the page to show the updated fortune
			router.refresh();
		} catch (err) {
			console.error('Error processing fortune:', err);
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setProcessing(false);
		}
	};

	// Function to render different content based on fortune status
	const renderFortuneContent = () => {
		if (isLoading) {
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
					<h3 className="text-xl font-medium">Reading your fortune...</h3>
					<p className="mt-2 text-center text-muted-foreground">
						Our AI is analyzing the patterns in your coffee cup. This may take a moment.
					</p>
				</div>
			);
		}

		switch (fortune.status) {
			case FortuneStatus.PENDING:
				return (
					<div className="flex flex-col items-center justify-center py-8">
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
						<h3 className="text-xl font-medium">Fortune Pending</h3>
						<p className="mt-2 text-center text-muted-foreground">
							Your fortune is ready to be processed.
						</p>
						<Button
							onClick={processFortune}
							disabled={processing}
							className="mt-4"
							variant="default"
						>
							{processing ? (
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
								'Process My Fortune'
							)}
						</Button>
						{error && (
							<div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
								{error}
							</div>
						)}
					</div>
				);
			case FortuneStatus.PROCESSING:
				return (
					<div className="flex flex-col items-center justify-center py-8">
						<div className="mb-4">
							<svg
								className="h-10 w-10 animate-spin text-primary"
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
						<h3 className="text-xl font-medium">Processing Your Fortune</h3>
						<p className="mt-2 text-center text-muted-foreground">
							Our AI is analyzing the patterns in your coffee cup. This may take a moment.
						</p>
					</div>
				);
			case FortuneStatus.COMPLETED:
				return (
					<div className="space-y-6">
						<div className="flex flex-col items-center justify-center py-4">
							<div className="mb-4 rounded-full bg-green-100 p-3 text-green-600 dark:bg-green-900/20 dark:text-green-400">
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
									<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
									<polyline points="22 4 12 14.01 9 11.01" />
								</svg>
							</div>
							<h3 className="text-xl font-medium">Your Fortune Is Ready</h3>
						</div>

						<div className="rounded-lg border bg-card p-4">
							<div className="prose dark:prose-invert max-w-none">
								<p className="text-lg font-medium italic">{prediction || fortune.prediction}</p>
							</div>
						</div>
					</div>
				);
			case FortuneStatus.FAILED:
				return (
					<div className="flex flex-col items-center justify-center py-8">
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
						<h3 className="text-xl font-medium">Fortune Processing Failed</h3>
						<p className="mt-2 text-center text-muted-foreground">
							We encountered an issue while processing your fortune. Please try again.
						</p>
						<Button onClick={() => router.push('/fortune')} className="mt-4" variant="outline">
							Try Again
						</Button>
					</div>
				);
			default:
				return (
					<div className="py-8 text-center">
						<p>No fortune information available.</p>
					</div>
				);
		}
	};

	return (
		<Card className="w-full max-w-2xl mx-auto">
			<CardHeader>
				<CardTitle className="text-2xl">Your Coffee Cup Fortune</CardTitle>
				<CardDescription>
					Based on the patterns in your coffee cup, here's what the future holds.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Coffee Cup Image - Only show if image URLs exist */}
				{fortune.imageUrl &&
					(Array.isArray(fortune.imageUrl) ? (
						fortune.imageUrl.length > 0 && (
							<div className="overflow-hidden rounded-md border">
								<div className="relative aspect-video">
									<Image
										src={fortune.imageUrl[0]}
										alt="Coffee cup"
										fill
										className="object-cover"
										priority
									/>
								</div>
							</div>
						)
					) : (
						<div className="overflow-hidden rounded-md border">
							<div className="relative aspect-video">
								<Image
									src={fortune.imageUrl}
									alt="Coffee cup"
									fill
									className="object-cover"
									priority
								/>
							</div>
						</div>
					))}

				{/* Fortune Content */}
				{renderFortuneContent()}
			</CardContent>
			<CardFooter className="flex flex-col gap-4 sm:flex-row sm:justify-between">
				{fortune.status === FortuneStatus.COMPLETED && (
					<>
						<div className="flex space-x-2">
							<Button
								variant="outline"
								size="sm"
								onClick={sendFortuneEmail}
								disabled={sendingEmail || emailSent}
							>
								{sendingEmail ? (
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
										Sending...
									</>
								) : emailSent ? (
									<>
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
											className="mr-2 h-4 w-4"
										>
											<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
											<polyline points="22 4 12 14.01 9 11.01" />
										</svg>
										Sent
									</>
								) : (
									<>
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
											className="mr-2 h-4 w-4"
										>
											<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
											<polyline points="22,6 12,13 2,6" />
										</svg>
										Email Me
									</>
								)}
							</Button>
							<Button variant="outline" size="sm">
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
									className="mr-2 h-4 w-4"
								>
									<path d="M7 11v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1z" />
									<path d="M14 10V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v6" />
									<path d="M21 12a9 9 0 0 0-9 9" />
									<path d="M16 17a5 5 0 0 0-5 5" />
								</svg>
								Share
							</Button>
						</div>
						<Button onClick={() => router.push('/fortune')}>Get Another Reading</Button>
					</>
				)}
				{(fortune.status === FortuneStatus.PENDING ||
					fortune.status === FortuneStatus.PROCESSING) && (
					<Button variant="outline" onClick={() => router.push('/dashboard')}>
						Back to Dashboard
					</Button>
				)}
			</CardFooter>
		</Card>
	);
}
