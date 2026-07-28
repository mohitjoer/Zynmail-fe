import { create } from 'zustand';
import { Email } from '@/types';

interface EmailCacheState {
  cache: Record<string, Email>;
  setCachedEmail: (id: string, email: Email) => void;
  getCachedEmail: (id: string) => Email | undefined;
}

export const useEmailCache = create<EmailCacheState>((set, get) => ({
  cache: {},
  setCachedEmail: (id, email) => set((state) => ({ 
    cache: { ...state.cache, [id]: email } 
  })),
  getCachedEmail: (id) => get().cache[id]
}));
