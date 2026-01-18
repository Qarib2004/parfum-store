import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  clearAuth: () => void;
}



export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user:null,
            accessToken:null,
            refreshToken:null,
            isAuthenticated:false,

            setAuth:(user,accessToken,refreshToken) => {
                if(typeof window !== 'undefined'){
                    localStorage.setItem('accessToken',accessToken);
                    localStorage.setItem('refreshToken',refreshToken)
                }

                set({
                    user,
                    accessToken,
                    refreshToken,
                    isAuthenticated:true
                })
            },

            updateUser:(updateUser) => 
                set((state) => ({
                    user:state.user ? {...state.user,...updateUser}:null
                })),



                logout: () => {
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('accessToken');
                      localStorage.removeItem('refreshToken');
                    }
            
                    set({
                      user: null,
                      accessToken: null,
                      refreshToken: null,
                      isAuthenticated: false,
                    });
                  },
            
                  clearAuth: () => {
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('accessToken');
                      localStorage.removeItem('refreshToken');
                    }
            
                    set({
                      user: null,
                      accessToken: null,
                      refreshToken: null,
                      isAuthenticated: false,
                    });
                  },
                }),
                {
                  name: 'auth-storage',
                  partialize: (state) => ({
                    user: state.user,
                    isAuthenticated: state.isAuthenticated,
                  }),
                }
              )
)
