import { create } from 'zustand';
import { getCurrentUser } from '@/lib/appwrite';
import { Models } from 'react-native-appwrite';

export interface User extends Models.Document {
    name: string;
    email: string;
    avatar: string;
    accountId: string;
    role?: 'customer' | 'service_provider' | 'admin';
}

type AuthState = {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;
    authToken: string | null;

    setIsAuthenticated: (value: boolean) => void;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    setAuthToken: (token: string | null) => void;
    setUserRole: (role: 'customer' | 'service_provider' | 'admin') => void;

    fetchAuthenticatedUser: () => Promise<void>;
    getAuthToken: () => Promise<string | null>;
}

const useAuthStore = create<AuthState>((set, get) => ({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    authToken: null,

    setIsAuthenticated: (value) => set({ isAuthenticated: value }),
    setUser: (user) => set({ user }),
    setLoading: (value) => set({ isLoading: value }),
    setAuthToken: (token) => set({ authToken: token }),
    setUserRole: (role) => {
        const currentUser = get().user;
        if (currentUser) {
            set({ user: { ...currentUser, role } });
        }
    },

    fetchAuthenticatedUser: async () => {
        set({ isLoading: true });

        try {
            const user = await getCurrentUser();

            if (user) {
                set({ isAuthenticated: true, user: user as User });
                // Get and store auth token
                try {
                    const token = await get().getAuthToken();
                    set({ authToken: token });
                } catch (tokenError) {
                    console.log('Failed to get auth token', tokenError);
                }
            } else {
                set({ isAuthenticated: false, user: null, authToken: null });
            }
        } catch (e) {
            console.log('fetchAuthenticatedUser error', e);
            set({ isAuthenticated: false, user: null, authToken: null })
        } finally {
            set({ isLoading: false });
        }
    },

    getAuthToken: async () => {
        try {
            // Try to get session from Appwrite
            const { account } = await import('@/lib/appwrite');
            const session = await account.getSession('current');
            return session.$id; // Return session ID as token
        } catch (e) {
            console.log('Failed to get auth token', e);
            return null;
        }
    }
}))

export default useAuthStore;

