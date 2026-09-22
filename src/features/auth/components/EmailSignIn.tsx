import { useSetAtom } from 'jotai';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginWithPassword, usePrivy } from '@/lib/local-auth';

import { loginEventAtom } from '../atoms';
import { validateEmailRegex } from '../utils/email';
import { handleUserCreation } from '../utils/handleUserCreation';

interface LoginProps {
  redirectTo?: string;
  onSuccess?: () => void;
}

// Email + password sign-in. An unknown email is registered on first sign-in.
export const EmailSignIn = ({ redirectTo, onSuccess }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const setLoginEvent = useSetAtom(loginEventAtom);
  const { refresh } = usePrivy();

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');
    if (!validateEmailRegex(email)) {
      setError('Masukkan email yang valid.');
      return;
    }
    if (password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }
    setIsLoading(true);
    try {
      const { user, wasAlreadyRegistered } = await loginWithPassword(
        email,
        password,
      );
      await refresh();
      onSuccess?.();
      await handleUserCreation(user.email?.address || email);
      const url = new URL(redirectTo || router.asPath, window.location.origin);
      if (redirectTo) url.searchParams.set('originUrl', router.asPath);
      router.push(url.toString());
      if (!wasAlreadyRegistered) setLoginEvent('fresh_login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        className="h-12 border-slate-300 text-lg"
        onChange={(e) => setEmail(e.target.value.trim())}
        placeholder="Email"
        type="email"
        autoComplete="email"
        value={email}
      />
      <Input
        className="mt-3 h-12 border-slate-300 text-lg"
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password (min. 8 karakter)"
        type="password"
        autoComplete="current-password"
        value={password}
      />
      <Button
        type="submit"
        className="ph-no-capture mt-3 h-12 w-full font-medium"
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Masuk / Daftar'}
      </Button>
      <p className="mt-2 text-center text-xs text-slate-400">
        Email baru otomatis didaftarkan.
      </p>
      {error && (
        <p className="mt-2 text-center text-xs leading-[0.9rem] text-red-500">
          {error}
        </p>
      )}
    </form>
  );
};
