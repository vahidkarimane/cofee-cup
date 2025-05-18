import {POST} from '@/app/api/fortune/route';
import {createFortune} from '@/lib/firebase/utils';
import {auth} from '@clerk/nextjs/server';
import {FortuneStatus} from '@/types';

// Mock dependencies
jest.mock('@clerk/nextjs/server', () => ({
	auth: jest.fn(),
}));

jest.mock('@/lib/firebase/utils', () => ({
	createFortune: jest.fn(),
}));

// Mock NextResponse
const mockJson = jest.fn();
jest.mock('next/server', () => ({
	NextResponse: {
		json: (data: any, options: any) => {
			mockJson(data, options);
			return {data, options};
		},
	},
}));

describe('Fortune API Route', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('should return 401 when user is not authenticated', async () => {
		// Arrange
		(auth as unknown as jest.Mock).mockResolvedValue({userId: null});

		const req = {
			json: jest.fn().mockResolvedValue({
				imageUrl: 'https://example.com/image.jpg',
				name: 'Test User',
				age: '30',
				intent: 'career',
				about: 'Test notes',
			}),
		} as any;

		// Act
		await POST(req);

		// Assert
		expect(auth).toHaveBeenCalled();
		expect(mockJson).toHaveBeenCalledWith({error: 'Unauthorized'}, {status: 401});
	});

	test('should return 400 when imageUrl is missing', async () => {
		// Arrange
		(auth as unknown as jest.Mock).mockResolvedValue({userId: 'test-user-id'});

		const req = {
			json: jest.fn().mockResolvedValue({
				name: 'Test User',
				age: '30',
				intent: 'career',
				about: 'Test notes',
			}),
		} as any;

		// Act
		await POST(req);

		// Assert
		expect(auth).toHaveBeenCalled();
		expect(mockJson).toHaveBeenCalledWith({error: 'Image URL is required'}, {status: 400});
	});

	test('should create a fortune and return success response', async () => {
		// Arrange
		const userId = 'test-user-id';
		const imageUrl = 'https://example.com/image.jpg';
		const name = 'Test User';
		const age = '30';
		const intent = 'career';
		const about = 'Test notes';
		const fortuneId = 'test-fortune-id';

		(auth as unknown as jest.Mock).mockResolvedValue({userId});
		(createFortune as jest.Mock).mockResolvedValue(fortuneId);

		const req = {
			json: jest.fn().mockResolvedValue({
				imageUrl,
				name,
				age,
				intent,
				about,
			}),
		} as any;

		// Act
		await POST(req);

		// Assert
		expect(auth).toHaveBeenCalled();
		expect(createFortune).toHaveBeenCalledWith(userId, imageUrl, name, age, intent, about);
		expect(mockJson).toHaveBeenCalledWith(
			{
				message: 'Fortune submission received',
				fortuneId,
				status: FortuneStatus.PENDING,
			},
			{status: 200}
		);
	});

	test('should handle errors and return 500 response', async () => {
		// Arrange
		(auth as unknown as jest.Mock).mockResolvedValue({userId: 'test-user-id'});
		(createFortune as jest.Mock).mockRejectedValue(new Error('Database error'));

		const req = {
			json: jest.fn().mockResolvedValue({
				imageUrl: 'https://example.com/image.jpg',
				name: 'Test User',
				age: '30',
				intent: 'career',
				about: 'Test notes',
			}),
		} as any;

		// Act
		await POST(req);

		// Assert
		expect(mockJson).toHaveBeenCalledWith(
			{error: 'Failed to process fortune submission'},
			{status: 500}
		);
	});
});
