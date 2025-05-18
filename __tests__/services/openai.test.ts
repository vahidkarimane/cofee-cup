import {generateFortunePrediction} from '@/services/openai';
import OpenAI from 'openai';

// Mock the OpenAI module
jest.mock('openai', () => {
	const mockCreate = jest.fn().mockResolvedValue({
		choices: [
			{
				message: {
					content: 'This is a mock fortune prediction',
				},
			},
		],
	});

	return {
		__esModule: true,
		default: jest.fn().mockImplementation(() => ({
			chat: {
				completions: {
					create: mockCreate,
				},
			},
		})),
		mockCreate, // Export the mock for tests to use
	};
});

// Get the mock function for testing
const {mockCreate} = jest.requireMock('openai');

// Mock environment config
jest.mock('@/lib/env', () => ({
	getOpenAIConfig: jest.fn().mockReturnValue({
		apiKey: 'mock-api-key',
		model: 'gpt-4.1-vision-preview',
	}),
}));

// Mock fetch for image fetching
global.fetch = jest.fn().mockImplementation(() =>
	Promise.resolve({
		arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
	})
) as jest.Mock;

// Mock Buffer
jest.mock('buffer', () => ({
	Buffer: {
		from: jest.fn().mockReturnValue({
			toString: jest.fn().mockReturnValue('mock-base64'),
		}),
	},
}));

describe('OpenAI Service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('generateFortunePrediction', () => {
		it('should generate a fortune prediction with a single image URL', async () => {
			const imageUrl = 'https://example.com/image.jpg';
			const name = 'Test User';
			const age = '30';
			const intent = 'career';
			const about = 'Some notes';

			const result = await generateFortunePrediction(imageUrl, name, age, intent, about);

			expect(result).toBe('This is a mock fortune prediction');
			expect(fetch).toHaveBeenCalledWith(imageUrl);
		});

		it('should generate a fortune prediction with multiple image URLs', async () => {
			const imageUrls = ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'];
			const name = 'Test User';
			const age = '30';
			const intent = 'career';
			const about = 'Some notes';

			const result = await generateFortunePrediction(imageUrls, name, age, intent, about);

			expect(result).toBe('This is a mock fortune prediction');
			expect(fetch).toHaveBeenCalledTimes(2);
			expect(fetch).toHaveBeenCalledWith(imageUrls[0]);
			expect(fetch).toHaveBeenCalledWith(imageUrls[1]);
		});

		it('should handle errors gracefully', async () => {
			const imageUrl = 'https://example.com/image.jpg';
			const name = 'Test User';
			const age = '30';
			const intent = 'career';
			const about = 'Some notes';

			// Mock the create method to reject with an error for this test only
			mockCreate.mockRejectedValueOnce(new Error('API Error'));

			await expect(generateFortunePrediction(imageUrl, name, age, intent, about)).rejects.toThrow(
				'Failed to generate fortune prediction'
			);
		});
	});
});
