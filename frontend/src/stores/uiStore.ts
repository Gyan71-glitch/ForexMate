import { create } from 'zustand';

interface UiState {
  isGlobalLoading: boolean;
  globalError: string | null;
  globalSuccess: string | null;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isGlobalLoading: false,
  globalError: null,
  globalSuccess: null,

  setLoading: (loading) => set({ isGlobalLoading: loading }),
  setError: (error) => set({ globalError: error }),
  setSuccess: (success) => set({ globalSuccess: success }),
}));
