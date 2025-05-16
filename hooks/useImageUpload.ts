'use client';

import {useState} from 'react';
import {uploadImage} from '@/lib/firebase/utils';

interface UseImageUploadOptions {
	maxSizeMB?: number;
	acceptedTypes?: string[];
}

interface UseImageUploadReturn {
	image: File | null;
	preview: string | null;
	imageUrl: string | null;
	isLoading: boolean;
	error: string | null;
	handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	uploadToFirebase: (userId: string) => Promise<string>;
	resetImage: () => void;
}

export function useImageUpload(options?: UseImageUploadOptions): UseImageUploadReturn {
	const [image, setImage] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const maxSize = options?.maxSizeMB || 5; // Default 5MB
	const acceptedTypes = options?.acceptedTypes || ['image/jpeg', 'image/png', 'image/jpg'];

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setError(null);

		if (!e.target.files || e.target.files.length === 0) {
			return;
		}

		const file = e.target.files[0];

		// Validate file type
		if (!acceptedTypes.includes(file.type)) {
			setError(`Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`);
			return;
		}

		// Validate file size
		if (file.size > maxSize * 1024 * 1024) {
			setError(`File size exceeds ${maxSize}MB limit`);
			return;
		}

		setImage(file);
		const objectUrl = URL.createObjectURL(file);
		setPreview(objectUrl);
	};

	const resetImage = () => {
		if (preview) {
			URL.revokeObjectURL(preview);
		}
		setImage(null);
		setPreview(null);
		setError(null);
	};

	const uploadToFirebase = async (userId: string): Promise<string> => {
		if (!image) {
			throw new Error('No image selected');
		}

		setIsLoading(true);
		setError(null);

		try {
			const url = await uploadImage(userId, image);
			setImageUrl(url);
			return url;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
			setError(errorMessage);
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	return {
		image,
		preview,
		imageUrl,
		isLoading,
		error,
		handleImageChange,
		uploadToFirebase,
		resetImage,
	};
}
