import {db, storage} from './config';
import {
	collection,
	doc,
	addDoc,
	getDoc,
	getDocs,
	updateDoc,
	deleteDoc,
	query,
	where,
	orderBy,
	limit,
	DocumentData,
	QueryConstraint,
	Timestamp,
} from 'firebase/firestore';
import {ref, uploadBytes, getDownloadURL, deleteObject} from 'firebase/storage';
import {Fortune, FortuneStatus, PaymentStatus} from '@/types';

// Collection names
const COLLECTIONS = {
	FORTUNES: 'fortunes',
	USERS: 'users',
	PAYMENTS: 'payments',
};

// Fortune operations
export async function createFortune(
	userId: string,
	imageUrl: string | string[],
	notes?: string
): Promise<string> {
	try {
		const fortuneData = {
			userId,
			imageUrl,
			prediction: '',
			notes: notes || '',
			createdAt: Timestamp.now(),
			status: FortuneStatus.PENDING,
		};

		const docRef = await addDoc(collection(db, COLLECTIONS.FORTUNES), fortuneData);
		return docRef.id;
	} catch (error) {
		console.error('Error creating fortune:', error);
		throw new Error('Failed to create fortune');
	}
}

export async function getFortune(fortuneId: string): Promise<Fortune | null> {
	try {
		const docRef = doc(db, COLLECTIONS.FORTUNES, fortuneId);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			const data = docSnap.data();
			return {
				id: docSnap.id,
				...data,
				createdAt: data.createdAt.toDate(),
			} as Fortune;
		}
		return null;
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
		const docRef = doc(db, COLLECTIONS.FORTUNES, fortuneId);
		await updateDoc(docRef, {
			prediction,
			status: FortuneStatus.COMPLETED,
		});
	} catch (error) {
		console.error('Error updating fortune prediction:', error);
		throw new Error('Failed to update fortune prediction');
	}
}

export async function getUserFortunes(userId: string): Promise<Fortune[]> {
	try {
		const q = query(
			collection(db, COLLECTIONS.FORTUNES),
			where('userId', '==', userId),
			orderBy('createdAt', 'desc')
		);

		const querySnapshot = await getDocs(q);
		return querySnapshot.docs.map((doc) => {
			const data = doc.data();
			return {
				id: doc.id,
				...data,
				createdAt: data.createdAt.toDate(),
			} as Fortune;
		});
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
			userId,
			amount,
			currency,
			status: PaymentStatus.PENDING,
			createdAt: Timestamp.now(),
			updatedAt: Timestamp.now(),
			stripePaymentIntentId,
			fortuneId,
		};

		const docRef = await addDoc(collection(db, COLLECTIONS.PAYMENTS), paymentData);

		// Update the fortune with the payment ID
		const fortuneRef = doc(db, COLLECTIONS.FORTUNES, fortuneId);
		await updateDoc(fortuneRef, {
			paymentId: docRef.id,
		});

		return docRef.id;
	} catch (error) {
		console.error('Error creating payment:', error);
		throw new Error('Failed to create payment');
	}
}

export async function updatePaymentStatus(paymentId: string, status: PaymentStatus): Promise<void> {
	try {
		const docRef = doc(db, COLLECTIONS.PAYMENTS, paymentId);
		await updateDoc(docRef, {
			status,
			updatedAt: Timestamp.now(),
		});
	} catch (error) {
		console.error('Error updating payment status:', error);
		throw new Error('Failed to update payment status');
	}
}

export async function getPayment(paymentId: string) {
	try {
		const docRef = doc(db, COLLECTIONS.PAYMENTS, paymentId);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			const data = docSnap.data();
			return {
				id: docSnap.id,
				...data,
				createdAt: data.createdAt.toDate(),
				updatedAt: data.updatedAt.toDate(),
			};
		}
		return null;
	} catch (error) {
		console.error('Error getting payment:', error);
		throw new Error('Failed to get payment');
	}
}

// Storage operations
export async function uploadImage(userId: string, file: File): Promise<string> {
	try {
		const timestamp = Date.now();
		const storageRef = ref(storage, `fortune-images/${userId}/${timestamp}-${file.name}`);

		await uploadBytes(storageRef, file);
		const downloadURL = await getDownloadURL(storageRef);

		return downloadURL;
	} catch (error) {
		console.error('Error uploading image:', error);
		throw new Error('Failed to upload image');
	}
}

export async function deleteImage(imageUrl: string): Promise<void> {
	try {
		const storageRef = ref(storage, imageUrl);
		await deleteObject(storageRef);
	} catch (error) {
		console.error('Error deleting image:', error);
		throw new Error('Failed to delete image');
	}
}
