'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, otp?: string) => Promise<void>;
  sendLoginOtp: (email: string, password?: string) => Promise<{ success: boolean; devCode?: string }>;
  sendRegisterOtp: (email: string, username?: string) => Promise<{ success: boolean; devCode?: string }>;
  register: (name: string, username: string, email: string, password: string, otp: string) => Promise<void>;
  loginWithDiscord: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBPiBHbzlRcYg-VzCqa9abHJPIL9BG3hsGjYrg1YuEcxLAvZq_28HBmgi_vVLY6LXX7ZLaii2TP2mN0ONbeRSEH2c_Ibxi5ywHFNR7lVUkiKau_ETuEQldb9XY_n-cmgh6J8dkSEkOfWl_rc3FR_aARvAIKhgC0Yn2AH8nQGjbcdI-uqCEYXbZcXPFET1BithmzsIN6cfFU0OX4wNbW_8_sJ44MN0imLRt2A1p_RKkP2z0-H1SMUwtl';

function AuthConsumerInternal({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';

  const user: User | null = useMemo(() => {
    if (!session?.user) return null;
    return {
      id: session.user.id ?? '',
      name: session.user.name ?? 'Workspace User',
      email: session.user.email ?? '',
      avatar: session.user.image ?? DEFAULT_AVATAR,
    };
  }, [session]);

  const sendLoginOtp = useCallback(async (email: string, password?: string): Promise<{ success: boolean; devCode?: string }> => {
    setError(null);
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, type: 'login' }),
    });

    const data = (await res.json()) as { error?: string; success?: boolean; devCode?: string };
    if (!res.ok || !data.success) {
      const msg = data.error ?? 'Failed to send verification code';
      setError(msg);
      throw new Error(msg);
    }

    return { success: true, devCode: data.devCode };
  }, []);

  const sendRegisterOtp = useCallback(async (email: string, username?: string): Promise<{ success: boolean; devCode?: string }> => {
    setError(null);
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, type: 'register' }),
    });

    const data = (await res.json()) as { error?: string; success?: boolean; devCode?: string };
    if (!res.ok || !data.success) {
      const msg = data.error ?? 'Failed to send verification code';
      setError(msg);
      throw new Error(msg);
    }

    return { success: true, devCode: data.devCode };
  }, []);

  const login = useCallback(async (email: string, password: string, otp?: string): Promise<void> => {
    setError(null);
    const result = await signIn('credentials', {
      email: email.toLowerCase().trim(),
      password,
      otp: otp?.trim() ?? '',
      redirect: false,
    });

    if (result?.error) {
      const msg = 'Invalid email, password, or verification code';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const register = useCallback(
    async (name: string, username: string, email: string, password: string, otp: string): Promise<void> => {
      setError(null);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email, password, otp: otp.trim() }),
      });

      const data = (await res.json()) as {
        error?: string;
        success?: boolean;
        loginOtp?: string;
      };

      if (!res.ok || !data.success) {
        const msg = data.error ?? 'Failed to create account';
        setError(msg);
        throw new Error(msg);
      }

      // Automatically sign in upon registration with issued loginOtp
      const loginRes = await signIn('credentials', {
        email: email.toLowerCase().trim(),
        password,
        otp: data.loginOtp ?? '',
        redirect: false,
      });

      if (loginRes?.error) {
        setError(loginRes.error);
        throw new Error(loginRes.error);
      }
    },
    [],
  );

  const loginWithDiscord = useCallback(async (): Promise<void> => {
    setError(null);
    await signIn('discord', { callbackUrl: '/dashboard' });
  }, []);

  const loginWithGithub = useCallback(async (): Promise<void> => {
    setError(null);
    await signIn('github', { callbackUrl: '/dashboard' });
  }, []);

  const loginWithGoogle = useCallback(async (): Promise<void> => {
    setError(null);
    await signIn('google', { callbackUrl: '/dashboard' });
  }, []);

  const logout = useCallback(() => {
    void signOut({ callbackUrl: '/login' });
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      error,
      login,
      sendLoginOtp,
      sendRegisterOtp,
      register,
      loginWithDiscord,
      loginWithGithub,
      loginWithGoogle,
      logout,
      clearError,
    }),
    [
      user,
      isAuthenticated,
      isLoading,
      error,
      login,
      sendLoginOtp,
      sendRegisterOtp,
      register,
      loginWithDiscord,
      loginWithGithub,
      loginWithGoogle,
      logout,
      clearError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
      <AuthConsumerInternal>{children}</AuthConsumerInternal>
    </SessionProvider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
