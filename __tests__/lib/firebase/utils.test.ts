import {
	createFortune,
	getFortune,
	updateFortunePrediction,
	getUserFortunes,
	createPayment,
	updatePaymentStatus,
	getPayment,
	uploadImage,
	deleteImage,
} from '@/lib/firebase/utils';
import {db, storage} from '@/lib/firebase/config';
import {
	collection,
	doc,
	addDoc,
	getDoc,
	getDocs,
	updateDoc,
	query,
	where,
	orderBy,
	Timestamp,
} from 'firebase/firestore';
import {ref, uploadBytes, getDownloadURL, deleteObject} from 'firebase/storage';
import {FortuneStatus, PaymentStatus} from '@/types';

// Mock Firebase
jest.mock('@/lib/firebase/config', () => ({
	db: {
		collection: jest.fn(),
	},
	storage: {
		ref: jest.fn(),
	},
}));

jest.mock('firebase/firestore');
jest.mock('firebase/storage');

describe('Firebase Utility Functions', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('Fortune Operations', () => {
		test('createFortune should create a new fortune document', async () => {
			// Mock data
			const userId = 'test-user-id';
			const imageUrl = 'https://example.com/image.jpg';
			const notes = 'Test notes';
			const fortuneId = 'test-fortune-id';

			// Mock Firebase functions
			const mockCollection = collection as jest.MockedFunction<typeof collection>;
			const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;

			mockCollection.mockReturnValue('fortunes-collection' as any);
			mockAddDoc.mockResolvedValue({id: fortuneId} as any);

			// Call the function
			const result = await createFortune(userId, imageUrl, notes);

			// Assertions
			expect(mockCollection).toHaveBeenCalledWith(db, 'fortunes');
			expect(mockAddDoc).toHaveBeenCalled();
			expect(result).toBe(fortuneId);
		});

		test('getFortune should retrieve a fortune document', async () => {
			// Mock data
			const fortuneId = 'test-fortune-id';
			const mockFortuneData = {
				userId: 'test-user-id',
				imageUrl: 'https://example.com/image.jpg',
				prediction: 'Your future looks bright',
				notes: 'Test notes',
				createdAt: {toDate: () => new Date()},
				status: FortuneStatus.COMPLETED,
			};

			// Mock Firebase functions
			const mockDoc = doc as jest.MockedFunction<typeof doc>;
			const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;

			mockDoc.mockReturnValue('fortune-doc-ref' as any);
			mockGetDoc.mockResolvedValue({
				exists: () => true,
				id: fortuneId,
				data: () => mockFortuneData,
			} as any);

			// Call the function
			const result = await getFortune(fortuneId);

			// Assertions
			expect(mockDoc).toHaveBeenCalledWith(db, 'fortunes', fortuneId);
			expect(mockGetDoc).toHaveBeenCalled();
			expect(result).toEqual({
				id: fortuneId,
				...mockFortuneData,
				createdAt: expect.any(Date),
			});
		});

		test('updateFortunePrediction should update a fortune prediction', async () => {
			// Mock data
			const fortuneId = 'test-fortune-id';
			const prediction = 'Your future looks bright';

			// Mock Firebase functions
			const mockDoc = doc as jest.MockedFunction<typeof doc>;
			const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;

			mockDoc.mockReturnValue('fortune-doc-ref' as any);
			mockUpdateDoc.mockResolvedValue(undefined);

			// Call the function
			await updateFortunePrediction(fortuneId, prediction);

			// Assertions
			expect(mockDoc).toHaveBeenCalledWith(db, 'fortunes', fortuneId);
			expect(mockUpdateDoc).toHaveBeenCalledWith('fortune-doc-ref', {
				prediction,
				status: FortuneStatus.COMPLETED,
			});
		});

		test('getUserFortunes should retrieve all fortunes for a user', async () => {
			// Mock data
			const userId = 'test-user-id';
			const mockFortunes = [
				{
					id: 'fortune-1',
					userId,
					imageUrl: 'https://example.com/image1.jpg',
					prediction: 'Fortune 1',
					notes: 'Notes 1',
					createdAt: {toDate: () => new Date()},
					status: FortuneStatus.COMPLETED,
				},
				{
					id: 'fortune-2',
					userId,
					imageUrl: 'https://example.com/image2.jpg',
					prediction: 'Fortune 2',
					notes: 'Notes 2',
					createdAt: {toDate: () => new Date()},
					status: FortuneStatus.PENDING,
				},
			];

			// Mock Firebase functions
			const mockCollection = collection as jest.MockedFunction<typeof collection>;
			const mockQuery = query as jest.MockedFunction<typeof query>;
			const mockWhere = where as jest.MockedFunction<typeof where>;
			const mockOrderBy = orderBy as jest.MockedFunction<typeof orderBy>;
			const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;

			mockCollection.mockReturnValue('fortunes-collection' as any);
			mockQuery.mockReturnValue('fortunes-query' as any);
			mockWhere.mockReturnValue('where-clause' as any);
			mockOrderBy.mockReturnValue('order-by-clause' as any);
			mockGetDocs.mockResolvedValue({
				docs: mockFortunes.map((fortune) => ({
					id: fortune.id,
					data: () => ({
						userId: fortune.userId,
						imageUrl: fortune.imageUrl,
						prediction: fortune.prediction,
						notes: fortune.notes,
						createdAt: fortune.createdAt,
						status: fortune.status,
					}),
				})),
			} as any);

			// Call the function
			const result = await getUserFortunes(userId);

			// Assertions
			expect(mockCollection).toHaveBeenCalledWith(db, 'fortunes');
			expect(mockQuery).toHaveBeenCalled();
			expect(mockGetDocs).toHaveBeenCalled();
			expect(result.length).toBe(2);
			expect(result[0].id).toBe('fortune-1');
			expect(result[1].id).toBe('fortune-2');
		});
	});

	describe('Payment Operations', () => {
		test('createPayment should create a new payment document', async () => {
			// Mock data
			const userId = 'test-user-id';
			const fortuneId = 'test-fortune-id';
			const amount = 1000;
			const currency = 'usd';
			const stripePaymentIntentId = 'pi_test123';
			const paymentId = 'test-payment-id';

			// Mock Firebase functions
			const mockCollection = collection as jest.MockedFunction<typeof collection>;
			const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
			const mockDoc = doc as jest.MockedFunction<typeof doc>;
			const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;

			mockCollection.mockReturnValue('payments-collection' as any);
			mockAddDoc.mockResolvedValue({id: paymentId} as any);
			mockDoc.mockReturnValue('fortune-doc-ref' as any);
			mockUpdateDoc.mockResolvedValue(undefined);

			// Call the function
			const result = await createPayment(
				userId,
				fortuneId,
				amount,
				currency,
				stripePaymentIntentId
			);

			// Assertions
			expect(mockCollection).toHaveBeenCalledWith(db, 'payments');
			expect(mockAddDoc).toHaveBeenCalled();
			expect(mockDoc).toHaveBeenCalledWith(db, 'fortunes', fortuneId);
			expect(mockUpdateDoc).toHaveBeenCalledWith('fortune-doc-ref', {
				paymentId,
			});
			expect(result).toBe(paymentId);
		});

		test('updatePaymentStatus should update a payment status', async () => {
			// Mock data
			const paymentId = 'test-payment-id';
			const status = PaymentStatus.SUCCEEDED;

			// Mock Firebase functions
			const mockDoc = doc as jest.MockedFunction<typeof doc>;
			const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
			const mockTimestamp = {now: jest.fn().mockReturnValue('mock-timestamp')};

			// Mock Timestamp
			jest.spyOn(Timestamp, 'now').mockImplementation(() => mockTimestamp.now() as any);

			mockDoc.mockReturnValue('payment-doc-ref' as any);
			mockUpdateDoc.mockResolvedValue(undefined);

			// Call the function
			await updatePaymentStatus(paymentId, status);

			// Assertions
			expect(mockDoc).toHaveBeenCalledWith(db, 'payments', paymentId);
			expect(mockUpdateDoc).toHaveBeenCalledWith('payment-doc-ref', {
				status,
				updatedAt: 'mock-timestamp',
			});
		});

		test('getPayment should retrieve a payment document', async () => {
			// Mock data
			const paymentId = 'test-payment-id';
			const mockPaymentData = {
				userId: 'test-user-id',
				amount: 1000,
				currency: 'usd',
				status: PaymentStatus.SUCCEEDED,
				createdAt: {toDate: () => new Date()},
				updatedAt: {toDate: () => new Date()},
				stripePaymentIntentId: 'pi_test123',
				fortuneId: 'test-fortune-id',
			};

			// Mock Firebase functions
			const mockDoc = doc as jest.MockedFunction<typeof doc>;
			const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;

			mockDoc.mockReturnValue('payment-doc-ref' as any);
			mockGetDoc.mockResolvedValue({
				exists: () => true,
				id: paymentId,
				data: () => mockPaymentData,
			} as any);

			// Call the function
			const result = await getPayment(paymentId);

			// Assertions
			expect(mockDoc).toHaveBeenCalledWith(db, 'payments', paymentId);
			expect(mockGetDoc).toHaveBeenCalled();
			expect(result).toEqual({
				id: paymentId,
				...mockPaymentData,
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
			});
		});
	});

	describe('Storage Operations', () => {
		test('uploadImage should upload an image and return the download URL', async () => {
			// Mock data
			const userId = 'test-user-id';
			const file = new File(['test'], 'test.jpg', {type: 'image/jpeg'});
			const downloadURL = 'https://example.com/image.jpg';

			// Mock Firebase functions
			const mockRef = ref as jest.MockedFunction<typeof ref>;
			const mockUploadBytes = uploadBytes as jest.MockedFunction<typeof uploadBytes>;
			const mockGetDownloadURL = getDownloadURL as jest.MockedFunction<typeof getDownloadURL>;

			mockRef.mockReturnValue('storage-ref' as any);
			mockUploadBytes.mockResolvedValue(undefined as any);
			mockGetDownloadURL.mockResolvedValue(downloadURL);

			// Mock Date.now
			const originalDateNow = Date.now;
			Date.now = jest.fn(() => 1234567890);

			// Call the function
			const result = await uploadImage(userId, file);

			// Restore Date.now
			Date.now = originalDateNow;

			// Assertions
			expect(mockRef).toHaveBeenCalledWith(storage, `fortune-images/${userId}/1234567890-test.jpg`);
			expect(mockUploadBytes).toHaveBeenCalledWith('storage-ref', file);
			expect(mockGetDownloadURL).toHaveBeenCalledWith('storage-ref');
			expect(result).toBe(downloadURL);
		});

		test('deleteImage should delete an image', async () => {
			// Mock data
			const imageUrl = 'https://example.com/image.jpg';

			// Mock Firebase functions
			const mockRef = ref as jest.MockedFunction<typeof ref>;
			const mockDeleteObject = deleteObject as jest.MockedFunction<typeof deleteObject>;

			mockRef.mockReturnValue('storage-ref' as any);
			mockDeleteObject.mockResolvedValue(undefined);

			// Call the function
			await deleteImage(imageUrl);

			// Assertions
			expect(mockRef).toHaveBeenCalledWith(storage, imageUrl);
			expect(mockDeleteObject).toHaveBeenCalledWith('storage-ref');
		});
	});

	describe('Error Handling', () => {
		test('createFortune should throw an error when addDoc fails', async () => {
			// Mock data
			const userId = 'test-user-id';
			const imageUrl = 'https://example.com/image.jpg';

			// Mock Firebase functions
			const mockCollection = collection as jest.MockedFunction<typeof collection>;
			const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;

			mockCollection.mockReturnValue('fortunes-collection' as any);
			mockAddDoc.mockRejectedValue(new Error('Firebase error'));

			// Call the function and expect it to throw
			await expect(createFortune(userId, imageUrl)).rejects.toThrow('Failed to create fortune');
		});
	});
});
