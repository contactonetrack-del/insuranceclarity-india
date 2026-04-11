import { create } from 'zustand';

// Define the state interface
interface GlobalState {
    // UI States
    mobileMenuOpen: boolean;
    contactModalOpen: boolean;
    activeTheme: 'light' | 'dark' | 'system';

    // User Journey States
    selectedInsuranceType: string | null;
    savedQuotes: number;

    // Actions
    setMobileMenuOpen: (isOpen: boolean) => void;
    toggleMobileMenu: () => void;
    setContactModalOpen: (isOpen: boolean) => void;
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    setSelectedInsuranceType: (type: string | null) => void;
    incrementSavedQuotes: () => void;
}

// Create the unified store to prevent cascading re-renders
export const useGlobalStore = create<GlobalState>((set) => ({
    // Initial Values
    mobileMenuOpen: false,
    contactModalOpen: false,
    activeTheme: 'system',
    selectedInsuranceType: null,
    savedQuotes: 0,

    // Action Implementations
    setMobileMenuOpen: (isOpen) => set({ mobileMenuOpen: isOpen }),
    toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
    setContactModalOpen: (isOpen) => set({ contactModalOpen: isOpen }),
    setTheme: (theme) => set({ activeTheme: theme }),
    setSelectedInsuranceType: (type) => set({ selectedInsuranceType: type }),
    incrementSavedQuotes: () => set((state) => ({ savedQuotes: state.savedQuotes + 1 })),
}));
