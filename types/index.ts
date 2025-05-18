// User related types
export interface User {
	id: string;
	email: string;
	firstName?: string;
	lastName?: string;
	imageUrl?: string;
	createdAt: Date;
	updatedAt: Date;
}

// Fortune related types
export interface Fortune {
	id: string;
	userId: string;
	imageUrl: string | string[]; // Support for single or multiple image URLs
	prediction: string;
	notes?: string;
	createdAt: Date;
	status: FortuneStatus;
	paymentId?: string;
}

export enum FortuneStatus {
	PENDING = 'pending',
	PROCESSING = 'processing',
	COMPLETED = 'completed',
	FAILED = 'failed',
}

// Payment related types
export interface Payment {
	id: string;
	userId: string;
	amount: number;
	currency: string;
	status: PaymentStatus;
	createdAt: Date;
	updatedAt: Date;
}

export enum PaymentStatus {
	PENDING = 'pending',
	SUCCEEDED = 'succeeded',
	FAILED = 'failed',
	REFUNDED = 'refunded',
}
