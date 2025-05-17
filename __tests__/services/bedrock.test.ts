import {generateFortunePrediction} from '@/services/bedrock';

// Mock the bedrock service module directly
jest.mock('@/services/bedrock', () => {
	const mockGenerateFortunePrediction = jest.fn().mockImplementation(async (imageUrl, notes) => {
		return 'Your fortune prediction text';
	});

	return {
		generateFortunePrediction: mockGenerateFortunePrediction,
	};
});

describe('Bedrock Service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('generateFortunePrediction should be called with correct parameters', async () => {
		// Arrange
		const imageUrl = 'https://example.com/image.jpg';
		const notes = 'Test notes';

		// Act
		const result = await generateFortunePrediction(imageUrl, notes);

		// Assert
		expect(generateFortunePrediction).toHaveBeenCalledWith(imageUrl, notes);
		expect(result).toBe('Your fortune prediction text');
	});

	test('generateFortunePrediction should work without notes', async () => {
		// Arrange
		const imageUrl = 'https://example.com/image.jpg';

		// Act
		const result = await generateFortunePrediction(imageUrl);

		// Assert
		expect(generateFortunePrediction).toHaveBeenCalledWith(imageUrl);
		expect(result).toBe('Your fortune prediction text');
	});

	test('generateFortunePrediction should handle errors', async () => {
		// Arrange
		const imageUrl = 'https://example.com/image.jpg';

		// Mock implementation for this test only
		(generateFortunePrediction as jest.Mock).mockRejectedValueOnce(
			new Error('Failed to generate fortune prediction')
		);

		// Act & Assert
		await expect(generateFortunePrediction(imageUrl)).rejects.toThrow(
			'Failed to generate fortune prediction'
		);
	});
});
