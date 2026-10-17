import { axiosInstance } from '@/lib/axios';
import {create} from 'zustand';

interface ChatStore {
    users: any[];
    fetchUsers: () => Promise<void>;

    isloading: boolean;
    error: string | null;  

}

export const useChatStore = create<ChatStore>((set) => ({
  users: [],
  isloading: false,
  error: null,

  fetchUsers: async () => {
    set({ isloading: true, error: null });

    try {
      const response = await axiosInstance.get("/users");
      set({ users: response.data });
    } catch (error: any) {
      set({
        error: error?.response?.data?.message || "Failed to fetch users",
      });
    } finally {
      set({ isloading: false });
    }
  },
}));