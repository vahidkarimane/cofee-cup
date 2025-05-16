'use client';

import React, {useState} from 'react';
import Image from 'next/image';
import {useRouter} from 'next/navigation';
import {useImageUpload} from '@/hooks/useImageUpload';
import {Button} from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {useAuth} from '@clerk/nextjs';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';

// Define the form schema with zod
const formSchema = z.object({
	notes: z.string().max(500, {
		message: 'Notes must be 500 characters or less',
	}),
});

type FormValues = z.infer<typeof formSchema>;

export default function FortuneForm() {
	const router = useRouter();
	const {userId} = useAuth();
	const {image, preview, isLoading, error, handleImageChange, uploadToFirebase, resetImage} =
		useImageUpload({
			maxSizeMB: 5,
			acceptedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
		});

	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	// Initialize react-hook-form
	const {
		register,
		handleSubmit,
		formState: {errors},
		reset,
	} = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			notes: '',
		},
	});

	const onSubmit = async (formData: FormValues) => {
		if (!image || !userId) return;

		setSubmitting(true);
		setSubmitError(null);

		try {
			// Upload image to Firebase Storage
			const imageUrl = await uploadToFirebase(userId);

			// Submit to API
			const response = await fetch('/api/fortune', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					imageUrl,
					notes: formData.notes,
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to submit fortune request');
			}

			const data = await response.json();

			// Reset form
			resetImage();
			reset();

			// Redirect to payment page
			router.push(`/payment?fortuneId=${data.fortuneId}`);
		} catch (err) {
			console.error('Error submitting fortune:', err);
			setSubmitError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Card className="w-full max-w-2xl mx-auto">
			<CardHeader>
				<CardTitle className="text-2xl">Get Your Coffee Cup Fortune</CardTitle>
				<CardDescription>
					Upload a photo of your coffee cup and receive a personalized fortune reading.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form id="fortune-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="image-upload" className="text-base">
							Upload Coffee Cup Image
						</Label>
						<div className="grid gap-6 md:grid-cols-2">
							<div>
								<div className="flex flex-col gap-2">
									<div className="relative flex h-40 cursor-pointer items-center justify-center rounded-md border border-dashed border-input bg-muted hover:bg-accent hover:text-accent-foreground">
										<Input
											id="image-upload"
											type="file"
											accept="image/jpeg,image/png,image/jpg"
											className="absolute inset-0 cursor-pointer opacity-0"
											onChange={handleImageChange}
											disabled={isLoading || submitting}
										/>
										<div className="flex flex-col items-center justify-center space-y-2 text-center">
											<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
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
													className="h-5 w-5 text-primary"
												>
													<path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
													<line x1="16" x2="22" y1="5" y2="5" />
													<line x1="19" x2="19" y1="2" y2="8" />
													<circle cx="9" cy="9" r="2" />
													<path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
												</svg>
											</div>
											<div className="text-sm">
												<span className="font-medium text-primary">Click to upload</span> or drag
												and drop
											</div>
											<p className="text-xs text-muted-foreground">JPG, PNG (max 5MB)</p>
										</div>
									</div>
									{error && <p className="text-sm text-destructive">{error}</p>}
								</div>
							</div>
							<div>
								{preview ? (
									<div className="relative aspect-square h-40 overflow-hidden rounded-md">
										<Image src={preview} alt="Coffee cup preview" fill className="object-cover" />
										<Button
											type="button"
											variant="destructive"
											size="icon"
											className="absolute right-2 top-2 h-6 w-6"
											onClick={resetImage}
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
												className="h-4 w-4"
											>
												<path d="M18 6 6 18" />
												<path d="m6 6 12 12" />
											</svg>
											<span className="sr-only">Remove</span>
										</Button>
									</div>
								) : (
									<div className="flex h-40 items-center justify-center rounded-md border border-dashed border-input bg-muted">
										<p className="text-sm text-muted-foreground">Image preview will appear here</p>
									</div>
								)}
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="notes" className="text-base">
							Additional Notes (Optional)
						</Label>
						<Textarea
							id="notes"
							placeholder="Add any specific questions or areas of interest for your reading..."
							className={`min-h-[100px] ${errors.notes ? 'border-destructive' : ''}`}
							disabled={isLoading || submitting}
							{...register('notes')}
						/>
						{errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
					</div>

					{submitError && (
						<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
							{submitError}
						</div>
					)}
				</form>
			</CardContent>
			<CardFooter className="flex flex-col gap-4 sm:flex-row sm:justify-between">
				<div className="text-sm text-muted-foreground">
					By submitting, you agree to our{' '}
					<a href="#" className="underline underline-offset-4 hover:text-primary">
						Terms of Service
					</a>
				</div>
				<Button
					type="submit"
					form="fortune-form"
					onClick={handleSubmit(onSubmit)}
					disabled={!image || isLoading || submitting}
					className="w-full sm:w-auto"
				>
					{submitting ? (
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
						'Submit for Reading'
					)}
				</Button>
			</CardFooter>
		</Card>
	);
}
