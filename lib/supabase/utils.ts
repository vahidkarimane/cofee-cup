import {supabase, STORAGE_BUCKET} from './config';
import {Fortune, FortuneStatus, PaymentStatus} from '@/types';

// Table names
const TABLES = {
	FORTUNES: 'fortunes',
	PAYMENTS: 'payments',
};

// Fortune operations
export async function createFortune(
	userId: string,
	imageUrl: string | string[],
	name: string,
	age: string,
	intent: string,
	about?: string
): Promise<string> {
	try {
		const fortuneData = {
			user_id: userId,
			image_url: Array.isArray(imageUrl) ? imageUrl : [imageUrl],
			prediction: '',
			name,
			age,
			intent,
			about: about || '',
			created_at: new Date().toISOString(),
			status: FortuneStatus.PENDING,
		};

		const {data, error} = await supabase
			.from(TABLES.FORTUNES)
			.insert(fortuneData)
			.select('id')
			.single();

		if (error) throw error;
		return data.id;
	} catch (error) {
		console.error('Error creating fortune:', error);
		throw new Error('Failed to create fortune');
	}
}

export async function getFortune(fortuneId: string): Promise<Fortune | null> {
	try {
		const {data, error} = await supabase
			.from(TABLES.FORTUNES)
			.select('*')
			.eq('id', fortuneId)
			.single();

		if (error) throw error;
		if (!data) return null;

		// Transform to match Fortune type
		return {
			id: data.id,
			userId: data.user_id,
			imageUrl: data.image_url,
			prediction: data.prediction,
			name: data.name,
			age: data.age,
			intent: data.intent,
			about: data.about,
			createdAt: new Date(data.created_at),
			status: data.status,
			paymentId: data.payment_id,
		} as Fortune;
	} catch (error) {
		console.error('Error getting fortune:', error);
		throw new Error('Failed to get fortune');
	}
}

export async function updateFortunePrediction(
	fortuneId: string,
	prediction: string
): Promise<void> {
	try {
		const {error} = await supabase
			.from(TABLES.FORTUNES)
			.update({
				prediction,
				status: FortuneStatus.COMPLETED,
			})
			.eq('id', fortuneId);

		if (error) throw error;
	} catch (error) {
		console.error('Error updating fortune prediction:', error);
		throw new Error('Failed to update fortune prediction');
	}
}

export async function updateFortuneStatus(fortuneId: string, status: FortuneStatus): Promise<void> {
	try {
		const {error} = await supabase
			.from(TABLES.FORTUNES)
			.update({
				status,
			})
			.eq('id', fortuneId);

		if (error) throw error;
	} catch (error) {
		console.error('Error updating fortune status:', error);
		throw new Error('Failed to update fortune status');
	}
}

export async function getUserFortunes(userId: string): Promise<Fortune[]> {
	try {
		const {data, error} = await supabase
			.from(TABLES.FORTUNES)
			.select('*')
			.eq('user_id', userId)
			.order('created_at', {ascending: false});

		if (error) throw error;

		// Transform to match Fortune type
		return data.map((item) => ({
			id: item.id,
			userId: item.user_id,
			imageUrl: item.image_url,
			prediction: item.prediction,
			name: item.name,
			age: item.age,
			intent: item.intent,
			about: item.about,
			createdAt: new Date(item.created_at),
			status: item.status,
			paymentId: item.payment_id,
		})) as Fortune[];
	} catch (error) {
		console.error('Error getting user fortunes:', error);
		throw new Error('Failed to get user fortunes');
	}
}

// Payment operations
export async function createPayment(
	userId: string,
	fortuneId: string,
	amount: number,
	currency: string,
	stripePaymentIntentId: string
): Promise<string> {
	try {
		const paymentData = {
			user_id: userId,
			amount,
			currency,
			status: PaymentStatus.PENDING,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			stripe_payment_intent_id: stripePaymentIntentId,
			fortune_id: fortuneId,
		};

		const {data, error} = await supabase
			.from(TABLES.PAYMENTS)
			.insert(paymentData)
			.select('id')
			.single();

		if (error) throw error;

		// Update the fortune with the payment ID
		const {error: updateError} = await supabase
			.from(TABLES.FORTUNES)
			.update({payment_id: data.id})
			.eq('id', fortuneId);

		if (updateError) throw updateError;

		return data.id;
	} catch (error) {
		console.error('Error creating payment:', error);
		throw new Error('Failed to create payment');
	}
}

export async function updatePaymentStatus(paymentId: string, status: PaymentStatus): Promise<void> {
	try {
		const {error} = await supabase
			.from(TABLES.PAYMENTS)
			.update({
				status,
				updated_at: new Date().toISOString(),
			})
			.eq('id', paymentId);

		if (error) throw error;
	} catch (error) {
		console.error('Error updating payment status:', error);
		throw new Error('Failed to update payment status');
	}
}

export async function getPayment(paymentId: string) {
	try {
		const {data, error} = await supabase
			.from(TABLES.PAYMENTS)
			.select('*')
			.eq('id', paymentId)
			.single();

		if (error) throw error;
		if (!data) return null;

		return {
			id: data.id,
			userId: data.user_id,
			amount: data.amount,
			currency: data.currency,
			status: data.status,
			createdAt: new Date(data.created_at),
			updatedAt: new Date(data.updated_at),
			stripePaymentIntentId: data.stripe_payment_intent_id,
			fortuneId: data.fortune_id,
		};
	} catch (error) {
		console.error('Error getting payment:', error);
		throw new Error('Failed to get payment');
	}
}

// Storage operations
export async function uploadImage(userId: string, file: File): Promise<string> {
	try {
		const timestamp = Date.now();
		const filePath = `fortune-images/${userId}/${timestamp}-${file.name}`;

		// Convert File to ArrayBuffer
		const arrayBuffer = await file.arrayBuffer();

		const {data, error} = await supabase.storage
			.from(STORAGE_BUCKET)
			.upload(filePath, arrayBuffer, {
				contentType: file.type,
				upsert: false,
			});

		if (error) throw error;

		// Get public URL
		const {data: urlData} = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);

		return urlData.publicUrl;
	} catch (error) {
		console.error('Error uploading image:', error);
		throw new Error('Failed to upload image');
	}
}

export async function uploadBase64Image(
	userId: string,
	base64Data: string,
	fileName: string
): Promise<string> {
	try {
		// Extract the base64 content (remove data:image/jpeg;base64, part)
		const base64Content = base64Data.split(',')[1];
		const timestamp = Date.now();
		const filePath = `fortune-images/${userId}/${timestamp}-${fileName}`;

		// Convert base64 to Uint8Array
		const binaryData = Buffer.from(base64Content, 'base64');

		const {data, error} = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, binaryData, {
			contentType: 'image/jpeg', // Adjust based on actual image type
			upsert: false,
		});

		if (error) throw error;

		// Get public URL
		const {data: urlData} = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);

		return urlData.publicUrl;
	} catch (error) {
		console.error('Error uploading base64 image:', error);
		throw new Error('Failed to upload base64 image');
	}
}

export async function deleteImage(imageUrl: string): Promise<void> {
	try {
		// Extract the path from the URL
		const url = new URL(imageUrl);
		const pathParts = url.pathname.split('/');
		const bucketIndex = pathParts.findIndex((part) => part === STORAGE_BUCKET);

		if (bucketIndex === -1) {
			throw new Error('Invalid image URL format');
		}

		const filePath = pathParts.slice(bucketIndex + 1).join('/');

		const {error} = await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);

		if (error) throw error;
	} catch (error) {
		console.error('Error deleting image:', error);
		throw new Error('Failed to delete image');
	}
}
