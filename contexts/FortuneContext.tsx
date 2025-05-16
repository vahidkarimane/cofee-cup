'use client';

import React, {createContext, useContext, useState, ReactNode} from 'react';
import {Fortune} from '@/types';

interface FortuneContextType {
	fortunes: Fortune[];
	currentFortune: Fortune | null;
	isLoading: boolean;
	error: string | null;
	setCurrentFortune: (fortune: Fortune | null) => void;
	addFortune: (fortune: Fortune) => void;
	updateFortune: (fortune: Fortune) => void;
	deleteFortune: (id: string) => void;
}

const FortuneContext = createContext<FortuneContextType | undefined>(undefined);

export function FortuneProvider({children}: {children: ReactNode}) {
	const [fortunes, setFortunes] = useState<Fortune[]>([]);
	const [currentFortune, setCurrentFortune] = useState<Fortune | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const addFortune = (fortune: Fortune) => {
		setFortunes((prev) => [...prev, fortune]);
	};

	const updateFortune = (fortune: Fortune) => {
		setFortunes((prev) => prev.map((f) => (f.id === fortune.id ? fortune : f)));
	};

	const deleteFortune = (id: string) => {
		setFortunes((prev) => prev.filter((f) => f.id !== id));
	};

	return (
		<FortuneContext.Provider
			value={{
				fortunes,
				currentFortune,
				isLoading,
				error,
				setCurrentFortune,
				addFortune,
				updateFortune,
				deleteFortune,
			}}
		>
			{children}
		</FortuneContext.Provider>
	);
}

export function useFortune() {
	const context = useContext(FortuneContext);
	if (context === undefined) {
		throw new Error('useFortune must be used within a FortuneProvider');
	}
	return context;
}
