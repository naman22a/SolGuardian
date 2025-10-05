import { create } from 'zustand/react';
import { SchemaType } from '../interfaces';

type AppState = 'upload' | 'processing' | 'results';

interface GlobalState {
    appState: AppState;
    setAppState: (a: AppState) => void;

    file: File | null;
    setFile: (file: File | null) => void;

    data: SchemaType | null;
    setData: (data: SchemaType | null) => void;

    originalCode: string;
    setOriginalCode: (code: string) => void;
}

export const useStore = create<GlobalState>((set) => ({
    appState: 'upload',
    setAppState: (a) => set(() => ({ appState: a })),

    file: null,
    setFile: (file) => set(() => ({ file })),

    data: null,
    setData: (data) => set(() => ({ data })),

    originalCode: '',
    setOriginalCode: (code) => set(() => ({ originalCode: code }))
}));
