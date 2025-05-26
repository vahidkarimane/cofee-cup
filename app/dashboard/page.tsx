'use client';

import React, {useEffect, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {UserButton} from '@clerk/nextjs';
import {Button} from '@/components/ui/button';
import {Card} from '@/components/ui/card';
import FortuneResult from '@/components/fortune/FortuneResult';
import {Fortune, FortuneStatus, PaymentStatus} from '@/types';
import {getUserFortunes, getFortune, updatePaymentStatus, getPayment} from '@/lib/supabase/utils';
import {useAuth} from '@clerk/nextjs';
import Link from 'next/link';

export default function DashboardPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const {userId} = useAuth();
	const [fortunes, setFortunes] = useState<Fortune[]>([]);
	const [selectedFortune, setSelectedFortune] = useState<Fortune | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Get params from URL query params
	const fortuneId = searchParams.get('fortuneId');
	const paymentStatus = searchParams.get('payment');

	// Handle payment success
	useEffect(() => {
		async function handlePaymentSuccess() {
			if (paymentStatus === 'success' && fortuneId && userId) {
				try {
					// Update payment status in Supabase
					const fortune = await getFortune(fortuneId);
					if (fortune && fortune.paymentId) {
						await updatePaymentStatus(fortune.paymentId, PaymentStatus.SUCCEEDED);
					}

					// Clear the payment status from URL to prevent duplicate updates
					router.replace(`/dashboard?fortuneId=${fortuneId}`, {scroll: false});
				} catch (err) {
					//console.error('Error updating payment status:', err);
				}
			}
		}

		handlePaymentSuccess();
	}, [paymentStatus, fortuneId, userId, router]);

	// Fetch user's fortunes
	useEffect(() => {
		async function fetchFortunes() {
			if (!userId) return;

			try {
				setLoading(true);
				const userFortunes = await getUserFortunes(userId);
				setFortunes(userFortunes);

				// If fortuneId is provided in URL, select that fortune
				if (fortuneId) {
					const fortune =
						userFortunes.find((f) => f.id === fortuneId) || (await getFortune(fortuneId));

					if (fortune) {
						setSelectedFortune(fortune);
					}
				}
			} catch (err) {
				//console.error('Error fetching fortunes:', err);
				setError('Failed to load your fortunes. Please try again.');
			} finally {
				setLoading(false);
			}
		}

		fetchFortunes();
	}, [userId, fortuneId]);

	// Handle fortune selection
	const handleSelectFortune = (fortune: Fortune) => {
		setSelectedFortune(fortune);
		// Update URL without full page reload
		router.push(`/dashboard?fortuneId=${fortune.id}`, {scroll: false});
	};

	// Format date for display
	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	return (
		<div className="space-y-8">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Dashboard</h1>
				<UserButton afterSignOutUrl="/" />
			</div>

			{selectedFortune ? (
				<div className="space-y-4">
					<Button
						variant="ghost"
						onClick={() => {
							setSelectedFortune(null);
							router.push('/dashboard', {scroll: false});
						}}
						className="mb-2"
					>
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
							<path d="m15 18-6-6 6-6" />
						</svg>
						Back to Dashboard
					</Button>
					<FortuneResult fortune={selectedFortune} />
				</div>
			) : (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					<Card className="p-6">
						<h2 className="mb-4 text-xl font-semibold">Recent Fortunes</h2>
						{loading ? (
							<div className="flex items-center justify-center py-8">
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
							</div>
						) : error ? (
							<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
								{error}
							</div>
						) : fortunes.length === 0 ? (
							<>
								<p className="text-muted-foreground">
									You haven&apos;t submitted any coffee cup images yet.
								</p>
								<Link href="/fortune">
									<Button className="mt-4">Get Your First Fortune</Button>
								</Link>
							</>
						) : (
							<div className="space-y-4">
								<ul className="divide-y">
									{fortunes.map((fortune) => (
										<li key={fortune.id} className="py-3">
											<button
												onClick={() => handleSelectFortune(fortune)}
												className="flex w-full items-center justify-between hover:bg-accent hover:text-accent-foreground rounded-md p-2 transition-colors"
											>
												<div className="flex items-center">
													<div
														className={`mr-3 h-3 w-3 rounded-full ${
															fortune.status === FortuneStatus.COMPLETED
																? 'bg-green-500'
																: fortune.status === FortuneStatus.FAILED
																	? 'bg-red-500'
																	: fortune.status === FortuneStatus.PROCESSING
																		? 'bg-blue-500'
																		: 'bg-amber-500'
														}`}
													/>
													<span>Fortune {fortune.id.substring(0, 6)}...</span>
												</div>
												<span className="text-sm text-muted-foreground">
													{formatDate(fortune.createdAt)}
												</span>
											</button>
										</li>
									))}
								</ul>
								<Link href="/fortune">
									<Button className="w-full">Get Another Reading</Button>
								</Link>
							</div>
						)}
					</Card>

					<Card className="p-6">
						<h2 className="mb-4 text-xl font-semibold">Account</h2>
						<p className="text-muted-foreground">Manage your account settings and preferences.</p>
						<Button className="mt-4" variant="outline">
							View Settings
						</Button>
					</Card>

					<Card className="p-6">
						<h2 className="mb-4 text-xl font-semibold">Help & Support</h2>
						<p className="text-muted-foreground">Get help with using the Coffee Cup Fortune app.</p>
						<Button className="mt-4" variant="outline">
							View Help
						</Button>
					</Card>
				</div>
			)}
		</div>
	);
}
