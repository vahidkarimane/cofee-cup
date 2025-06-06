'use client';

import React, {useState} from 'react';
import Image from 'next/image';
import {useRouter} from 'next/navigation';
import {useMultipleImageUpload} from '@/hooks/useMultipleImageUpload';
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
	name: z.string().min(1, {message: 'Name is required'}),
	age: z
		.string()
		.min(1, {message: 'Age is required'})
		.refine((val) => !isNaN(parseInt(val)), {message: 'Age must be a number'}),
	intent: z.string().min(1, {message: 'Intent is required'}),
	about: z.string().max(500, {
		message: 'About yourself must be 500 characters or less',
	}),
});

type FormValues = z.infer<typeof formSchema>;

export default function FortuneForm() {
	const router = useRouter();
	const {userId} = useAuth();
	const {images, isLoading, error, handleImageChange, uploadToSupabase, removeImage, resetImages} =
		useMultipleImageUpload({
			maxSizeMB: 5,
			acceptedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
			maxImages: 4,
		});

	const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
	const [statusMessage, setStatusMessage] = useState<string | null>(null);

	// Initialize react-hook-form
	const {
		register,
		handleSubmit,
		formState: {errors},
		reset,
	} = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: '',
			age: '',
			intent: '',
			about: '',
		},
	});

	// Convert File to base64
	const convertToBase64 = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = (error) => reject(error);
		});
	};

	// Resize and convert File to base64
	const resizeAndConvertToBase64 = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			// Create an image object
			const img = new window.Image();
			img.onload = () => {
				// Create a canvas to draw the resized image
				const canvas = document.createElement('canvas');

				// Set maximum dimensions
				const MAX_WIDTH = 800;
				const MAX_HEIGHT = 800;

				// Calculate new dimensions while maintaining aspect ratio
				let width = img.width;
				let height = img.height;

				if (width > height) {
					if (width > MAX_WIDTH) {
						height = height * (MAX_WIDTH / width);
						width = MAX_WIDTH;
					}
				} else {
					if (height > MAX_HEIGHT) {
						width = width * (MAX_HEIGHT / height);
						height = MAX_HEIGHT;
					}
				}

				// Set canvas dimensions
				canvas.width = width;
				canvas.height = height;

				// Draw the resized image on canvas
				const ctx = canvas.getContext('2d');
				ctx!.drawImage(img, 0, 0, width, height);

				// Convert to base64 with reduced quality (0.7 = 70% quality)
				const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
				resolve(dataUrl);
			};

			img.onerror = (error: Event | string) => reject(error);

			// Load the file as a data URL
			const reader = new FileReader();
			reader.onload = (e) => {
				img.src = e.target!.result as string;
			};
			reader.onerror = (error: ProgressEvent<FileReader>) => reject(error);
			reader.readAsDataURL(file);
		});
	};

	const onSubmit = async (formData: FormValues) => {
		if (images.length === 0) {
			setStatus('error');
			setStatusMessage('Please upload at least one image');
			return;
		}

		// Use anonymous user ID if not authenticated
		const effectiveUserId = userId || 'anonymous';

		setStatus('submitting');
		setStatusMessage('Preparing your fortune request...');

		try {
			// Resize and convert images to base64
			const base64Images = await Promise.all(
				images.map((image) => resizeAndConvertToBase64(image.file))
			);

			// Create a pending fortune request
			const response = await fetch('/api/fortune/create-pending', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					images: base64Images,
					name: formData.name,
					age: formData.age,
					intent: formData.intent,
					about: formData.about,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				console.error('Server error response:', data);
				throw new Error(data.details || data.error || 'Failed to submit fortune request');
			}

			// Store the base64 images in localStorage for later use
			// This is a simplified approach - in a production environment,
			// you might want to store these in a database with a TTL
			localStorage.setItem(`fortune_images_${data.fortuneId}`, JSON.stringify(base64Images));

			setStatus('success');
			setStatusMessage('Redirecting to payment...');

			// Reset form
			resetImages();
			reset();

			// Redirect to payment page with the fortuneId
			router.push(`/payment?fortuneId=${data.fortuneId}`);
		} catch (err) {
			console.error('Error submitting fortune:', err);
			setStatus('error');
			setStatusMessage(
				err instanceof Error
					? err.message
					: 'An error occurred while submitting your fortune request'
			);
		} finally {
			if (status !== 'success') {
				setStatus('idle');
			}
		}
	};

	return (
		<Card className="w-full max-w-2xl mx-auto">
			<CardHeader>
				<CardTitle className="text-2xl">Get Your Coffee Cup Fortune</CardTitle>
				<CardDescription>
					Upload photos of your coffee cup (up to 4) and receive a personalized fortune reading.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form id="fortune-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="image-upload" className="text-base">
							Upload Coffee Cup Images (Up to 4)
						</Label>
						<div className="flex flex-col gap-4">
							<div className="relative flex h-40 cursor-pointer items-center justify-center rounded-md border border-dashed border-input bg-muted hover:bg-accent hover:text-accent-foreground">
								<Input
									id="image-upload"
									type="file"
									accept="image/jpeg,image/png,image/jpg"
									className="absolute inset-0 cursor-pointer opacity-0"
									onChange={handleImageChange}
									disabled={isLoading || status === 'submitting' || images.length >= 4}
									multiple
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
										<span className="font-medium text-primary">Click to upload</span> or drag and
										drop
									</div>
									<p className="text-xs text-muted-foreground">
										JPG, PNG (max 5MB each, up to 4 images)
									</p>
								</div>
							</div>
							{error && <p className="text-sm text-destructive">{error}</p>}

							{/* Image Previews */}
							{images.length > 0 && (
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									{images.map((image, index) => (
										<div
											key={index}
											className="relative aspect-square h-24 overflow-hidden rounded-md"
										>
											<Image
												src={image.preview}
												alt={`Coffee cup preview ${index + 1}`}
												fill
												className="object-cover"
											/>
											<Button
												type="button"
												variant="destructive"
												size="icon"
												className="absolute right-1 top-1 h-5 w-5"
												onClick={() => removeImage(index)}
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
													className="h-3 w-3"
												>
													<path d="M18 6 6 18" />
													<path d="m6 6 12 12" />
												</svg>
												<span className="sr-only">Remove</span>
											</Button>
										</div>
									))}
								</div>
							)}
						</div>
					</div>

					<div className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="name" className="text-base">
								Your Name *
							</Label>
							<Input
								id="name"
								placeholder="Enter your name"
								className={errors.name ? 'border-destructive' : ''}
								disabled={isLoading || status === 'submitting'}
								{...register('name')}
							/>
							{errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="age" className="text-base">
								Your Age *
							</Label>
							<Input
								id="age"
								placeholder="Enter your age"
								type="number"
								className={errors.age ? 'border-destructive' : ''}
								disabled={isLoading || status === 'submitting'}
								{...register('age')}
							/>
							{errors.age && <p className="text-sm text-destructive">{errors.age.message}</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="intent" className="text-base">
								Your Intent for Reading *
							</Label>
							<Input
								id="intent"
								placeholder="e.g., career path, relationship, financial future"
								className={errors.intent ? 'border-destructive' : ''}
								disabled={isLoading || status === 'submitting'}
								{...register('intent')}
							/>
							{errors.intent && <p className="text-sm text-destructive">{errors.intent.message}</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="about" className="text-base">
								About Yourself (Optional)
							</Label>
							<Textarea
								id="about"
								placeholder="Share anything about yourself that might help with your reading..."
								className={`min-h-[100px] ${errors.about ? 'border-destructive' : ''}`}
								disabled={isLoading || status === 'submitting'}
								{...register('about')}
							/>
							{errors.about && <p className="text-sm text-destructive">{errors.about.message}</p>}
						</div>
					</div>

					{statusMessage && (
						<div
							className={`rounded-md p-3 text-sm ${
								status === 'error'
									? 'bg-destructive/10 text-destructive'
									: status === 'success'
										? 'bg-green-100 text-green-800'
										: 'bg-blue-100 text-blue-800'
							}`}
						>
							{statusMessage}
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
					disabled={images.length === 0 || isLoading || status === 'submitting'}
					className="w-full sm:w-auto"
				>
					{status === 'submitting' ? (
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
						'Proceed to Payment'
					)}
				</Button>
			</CardFooter>
		</Card>
	);
}
