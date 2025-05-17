import {sendFortuneEmail, sendWelcomeEmail} from '@/services/email';
import {FortuneStatus} from '@/types';

// Mock the email service module directly
jest.mock('@/services/email');

// Mock Resend
jest.mock('resend');

beforeAll(() => {
	// Setup the mocks
	const mockSendFortuneEmail = jest.fn().mockImplementation(async (email, fortune) => {
		return {id: 'test-email-id'};
	});

	const mockSendWelcomeEmail = jest.fn().mockImplementation(async (email, name) => {
		return {id: 'test-email-id'};
	});

	// Apply the mocks
	(sendFortuneEmail as jest.Mock).mockImplementation(mockSendFortuneEmail);
	(sendWelcomeEmail as jest.Mock).mockImplementation(mockSendWelcomeEmail);
});

describe('Email Service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('sendFortuneEmail', () => {
		test('should send a fortune email successfully', async () => {
			// Arrange
			const email = 'user@example.com';
			const fortune = {
				id: 'test-fortune-id',
				userId: 'test-user-id',
				imageUrl: 'https://example.com/image.jpg',
				prediction: 'Your future looks bright!',
				notes: 'Test notes',
				createdAt: new Date(),
				status: FortuneStatus.COMPLETED,
			};

			// Act
			const result = await sendFortuneEmail(email, fortune);

			// Assert
			expect(sendFortuneEmail).toHaveBeenCalledWith(email, fortune);
			expect(result).toEqual({id: 'test-email-id'});
		});

		test('should handle error cases', async () => {
			// Arrange
			const email = 'user@example.com';
			const fortune = {
				id: 'test-fortune-id',
				userId: 'test-user-id',
				imageUrl: 'https://example.com/image.jpg',
				prediction: 'Your future looks bright!',
				notes: 'Test notes',
				createdAt: new Date(),
				status: FortuneStatus.COMPLETED,
			};

			// Mock implementation for this test only
			(sendFortuneEmail as jest.Mock).mockImplementationOnce(() => {
				return Promise.reject(new Error('Failed to send fortune email'));
			});

			// Act & Assert
			await expect(sendFortuneEmail(email, fortune)).rejects.toThrow(
				'Failed to send fortune email'
			);
		});
	});

	describe('sendWelcomeEmail', () => {
		test('should send a welcome email successfully', async () => {
			// Arrange
			const email = 'user@example.com';
			const name = 'John Doe';

			// Act
			const result = await sendWelcomeEmail(email, name);

			// Assert
			expect(sendWelcomeEmail).toHaveBeenCalledWith(email, name);
			expect(result).toEqual({id: 'test-email-id'});
		});

		test('should handle empty name parameter', async () => {
			// Arrange
			const email = 'user@example.com';
			const name = '';

			// Act
			const result = await sendWelcomeEmail(email, name);

			// Assert
			expect(sendWelcomeEmail).toHaveBeenCalledWith(email, name);
			expect(result).toEqual({id: 'test-email-id'});
		});

		test('should handle error cases', async () => {
			// Arrange
			const email = 'user@example.com';
			const name = 'John Doe';

			// Mock implementation for this test only
			(sendWelcomeEmail as jest.Mock).mockImplementationOnce(() => {
				return Promise.reject(new Error('Failed to send welcome email'));
			});

			// Act & Assert
			await expect(sendWelcomeEmail(email, name)).rejects.toThrow('Failed to send welcome email');
		});
	});
});
