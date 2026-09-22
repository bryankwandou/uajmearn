'use client';
// Drop-in replacement for the parts of `@privy-io/react-auth` this app uses.
// Sessions are an HttpOnly cookie issued by /api/auth/local/login, so API
// calls authenticate through the cookie and getAccessToken() has nothing to add.
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

export type LocalUser = {
  id: string;
  email?: { address: string };
  mfaMethods: string[];
  google?: { email: string };
};

type AuthState = {
  ready: boolean;
  authenticated: boolean;
  user: LocalUser | null;
  logout: () => Promise<void>;
  refresh: () => Promise<LocalUser | null>;
};

const AuthContext = createContext<AuthState>({
  ready: false,
  authenticated: false,
  user: null,
  logout: async () => {},
  refresh: async () => null,
});

export function PrivyProvider({
  children,
}: {
  children: ReactNode;
  appId?: string;
  config?: unknown;
}) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/local/me', {
        credentials: 'same-origin',
      });
      const data = (await res.json()) as { user: LocalUser | null };
      setUser(data.user);
      return data.user;
    } catch {
      setUser(null);
      return null;
    } finally {
      setReady(true);
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/local/logout', {
      method: 'POST',
      credentials: 'same-origin',
    });
    setUser(null);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider
      value={{ ready, authenticated: !!user, user, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function usePrivy() {
  return useContext(AuthContext);
}

export async function getAccessToken(): Promise<string | null> {
  return null;
}

export async function loginWithPassword(email: string, password: string) {
  const res = await fetch('/api/auth/local/login', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Login gagal.');
  return data as { user: LocalUser; wasAlreadyRegistered: boolean };
}

// Google sign-in is not available without Privy; the button is hidden.
export function useLoginWithOAuth(_opts?: {
  onComplete?: (args: {
    user: LocalUser;
    wasAlreadyAuthenticated: boolean;
  }) => unknown;
  onError?: (error: unknown) => unknown;
}) {
  return {
    initOAuth: async (_args?: unknown) => {},
    state: { status: 'initial' as const },
    loading: false,
  };
}

export function useMfaEnrollment() {
  return { showMfaEnrollmentModal: () => {} };
}
