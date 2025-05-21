'use client';

import {useState} from 'react';
import {uploadImage} from '@/lib/supabase/utils';

interface UseMultipleImageUploadOptions {
	maxSizeMB?: number;
	acceptedTypes?: string[];
	maxImages?: number;
}

interface ImageItem {
	file: File;
	preview: string;
	url?: string;
}

interface UseMultipleImageUploadReturn {
	images: ImageItem[];
	isLoading: boolean;
	error: string | null;
	handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	uploadToSupabase: (userId: string) => Promise<string[]>;
	removeImage: (index: number) => void;
	resetImages: () => void;
}

export function useMultipleImageUpload(
	options?: UseMultipleImageUploadOptions
): UseMultipleImageUploadReturn {
	const [images, setImages] = useState<ImageItem[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const maxSize = options?.maxSizeMB || 5; // Default 5MB
	const acceptedTypes = options?.acceptedTypes || ['image/jpeg', 'image/png', 'image/jpg'];
	const maxImages = options?.maxImages || 4; // Default max 4 images

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setError(null);

		if (!e.target.files || e.target.files.length === 0) {
			return;
		}

		const newFiles = Array.from(e.target.files);

		// Check if adding these files would exceed the maximum
		if (images.length + newFiles.length > maxImages) {
			setError(`Maximum of ${maxImages} images allowed`);
			return;
		}

		// Validate each file
		const invalidFiles = newFiles.filter(
			(file) => !acceptedTypes.includes(file.type) || file.size > maxSize * 1024 * 1024
		);

		if (invalidFiles.length > 0) {
			setError(
				`Some files were invalid. Accepted types: ${acceptedTypes.join(
					', '
				)}, max size: ${maxSize}MB`
			);
			return;
		}

		// Add new images
		const newImages = newFiles.map((file) => ({
			file,
			preview: URL.createObjectURL(file),
		}));

		setImages((prevImages) => [...prevImages, ...newImages]);
	};

	const removeImage = (index: number) => {
		setImages((prevImages) => {
			// Revoke the object URL to avoid memory leaks
			URL.revokeObjectURL(prevImages[index].preview);

			// Remove the image at the specified index
			return prevImages.filter((_, i) => i !== index);
		});
	};

	const resetImages = () => {
		// Revoke all object URLs
		images.forEach((image) => {
			URL.revokeObjectURL(image.preview);
		});

		setImages([]);
		setError(null);
	};

	const uploadToSupabase = async (userId: string): Promise<string[]> => {
		if (images.length === 0) {
			throw new Error('No images selected');
		}

		setIsLoading(true);
		setError(null);

		try {
			// Upload all images in parallel
			const uploadPromises = images.map((image) => uploadImage(userId, image.file));
			const urls = await Promise.all(uploadPromises);

			// Update the image items with their URLs
			setImages((prevImages) =>
				prevImages.map((image, index) => ({
					...image,
					url: urls[index],
				}))
			);

			return urls;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to upload images';
			setError(errorMessage);
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	return {
		images,
		isLoading,
		error,
		handleImageChange,
		uploadToSupabase,
		removeImage,
		resetImages,
	};
}
