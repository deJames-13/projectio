'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '~/contexts/AuthContext';
import { useTheme } from '~/contexts/ThemeContext';
import { Toast, type ToastType } from '~/components/ui/Toast';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  User,
  KeyRound,
  RotateCw,
  Sun,
  Moon,
  AtSign
} from 'lucide-react';

function RegisterPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isDark, toggleTheme } = useTheme();
  const {
    register,
    sendRegisterOtp,
    loginWithDiscord,
    loginWithGithub,
    loginWithGoogle,
    isAuthenticated
  } = useAuth();

  // Toast state
  const [toast, setToast] = useState<{
    type?: ToastType;
    title?: string;
    message: string;
  } | null>(null);

  // Step state: 'details' -> 'otp'
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Listen for OAuth conflict / error parameters in URL query
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (!errorParam) return;

    if (errorParam === 'OAuthAccountConflict') {
      const primary = searchParams.get('primary');
      const limit = searchParams.get('limit');

      if (primary === 'discord') {
        setToast({
          type: 'error',
          title: 'Provider Conflict',
          message: 'User with this email is already signed in with another provider (Discord). Please sign in using Discord.',
        });
      } else if (limit === '2') {
        setToast({
          type: 'error',
          title: 'Provider Limit Reached',
          message: 'User with this email is already signed in with another provider (maximum of 2 providers reached).',
        });
      } else {
        setToast({
          type: 'error',
          title: 'Provider Conflict',
          message: 'User with this email is already signed in with another provider.',
        });
      }
    } else if (errorParam === 'OAuthAccountNotLinked' || errorParam === 'AccessDenied') {
      setToast({
        type: 'error',
        title: 'Authentication Conflict',
        message: 'User with this email is already signed in with another provider.',
      });
    }

    // Clean up URL search params without reload
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      url.searchParams.delete('primary');
      url.searchParams.delete('attempted');
      url.searchParams.delete('limit');
      url.searchParams.delete('existing');
      window.history.replaceState({}, '', url.pathname);
    }
  }, [searchParams]);

  // Focus OTP input when transitioning to OTP step
  useEffect(() => {
    if (step === 'otp') {
      otpInputRef.current?.focus();
    }
  }, [step]);

  // Handle Resend Cooldown Countdown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Step 1: Submit Details & request registration OTP
  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.toLowerCase().trim().replace(/^@/, '');
    if (cleanUsername.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    if (!/^[a-z0-9_-]+$/.test(cleanUsername)) {
      setError('Username can only contain lowercase letters, numbers, hyphens, and underscores');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendRegisterOtp(email, cleanUsername);
      if (res.devCode) {
        setDevCode(res.devCode);
      }
      setStep('otp');
      setResendCooldown(60);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to start registration';
      setError(message);
      if (message.toLowerCase().includes('already signed in with another provider')) {
        setToast({
          type: 'error',
          title: 'Account Exists',
          message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Submit OTP & complete registration
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    const cleanUsername = username.toLowerCase().trim().replace(/^@/, '');

    setIsLoading(true);
    setError(null);
    try {
      await register(name, cleanUsername, email, password, otp.trim());
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to verify and create account';
      setError(message);
      if (message.toLowerCase().includes('already signed in with another provider')) {
        setToast({
          type: 'error',
          title: 'Account Exists',
          message,
        });
      }
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const cleanUsername = username.toLowerCase().trim().replace(/^@/, '');
      const res = await sendRegisterOtp(email, cleanUsername);
      if (res.devCode) {
        setDevCode(res.devCode);
      }
      setResendCooldown(60);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to resend code';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans transition-colors duration-200 relative">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-2xs backdrop-blur-xs transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs p-8 max-w-md w-full mx-auto transition-colors duration-200">

        {/* Header Branding with official Projectio logo lockup */}
        <div className="flex flex-col items-center mb-8">
          <Link
            href="/"
            className="mb-3 inline-flex items-center justify-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg p-1 -m-1"
            aria-label="Projectio home"
          >
            <div className="flex items-center h-14 py-0.5">
              <Image
                src={isDark ? "/images/logo-light-500.png" : "/images/logo-dark-500.png"}
                alt="Projectio"
                width={130}
                height={40}
                className="h-full w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                priority
              />
            </div>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {step === 'details' ? 'Create your account' : 'Verify your email'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 text-center">
            {step === 'details'
              ? 'Get started with your collaborative project workspace'
              : `Enter the 6-digit security code sent to ${email}`}
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div role="alert" className="mb-6 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl p-3.5 flex items-start text-rose-800 dark:text-rose-200 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 mr-2 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium leading-relaxed">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 rounded"
              aria-label="Dismiss error"
            >
              &times;
            </button>
          </div>
        )}

        {step === 'details' ? (
          <>
            {/* Social OAuth Options */}
            <div className="space-y-2.5 mb-6">
              {/* Discord */}
              <button
                type="button"
                onClick={loginWithDiscord}
                disabled={isLoading}
                className="flex items-center justify-center w-full h-11 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 shadow-2xs"
              >
                <svg className="w-4 h-4 mr-2.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 00-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 00-4.8 0c-.14-.34-.36-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z" />
                </svg>
                Continue with Discord
              </button>

              {/* GitHub */}
              <button
                type="button"
                onClick={loginWithGithub}
                disabled={isLoading}
                className="flex items-center justify-center w-full h-11 bg-[#24292F] hover:bg-[#1b1f23] text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2 shadow-2xs"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2.5 fill-current">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Continue with GitHub
              </button>

              {/* Google */}
              <button
                type="button"
                onClick={loginWithGoogle}
                disabled={isLoading}
                className="flex items-center justify-center w-full h-11 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 shadow-2xs"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2.5">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 dark:text-slate-500 font-medium">or register with email</span>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Full name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  </div>
                  <input
                    id="reg-name"
                    name="name"
                    type="text"
                    required
                    disabled={isLoading}
                    placeholder="Your Name"
                    className="block w-full h-10 pl-10 pr-4 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reg-username" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Username handle <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="inline-flex items-center px-3 h-10 text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-850 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-xl select-none">
                    @
                  </span>
                  <input
                    id="reg-username"
                    name="username"
                    type="text"
                    required
                    disabled={isLoading}
                    placeholder="username"
                    className="block flex-1 w-full h-10 px-3 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-r-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  Used for mentions and team member searches. Lowercase, min 3 characters.
                </p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  </div>
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    required
                    disabled={isLoading}
                    placeholder="you@example.com"
                    className="block w-full h-10 pl-10 pr-4 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password (min 6 characters)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  </div>
                  <input
                    id="reg-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={isLoading}
                    placeholder="••••••••"
                    className="block w-full h-10 pl-10 pr-10 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-r-xl cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reg-confirmPassword" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  </div>
                  <input
                    id="reg-confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={isLoading}
                    placeholder="••••••••"
                    className="block w-full h-10 pl-10 pr-10 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !name.trim() || !email.trim() || !password}
                className="flex items-center justify-center w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Sending verification code...
                  </>
                ) : (
                  <>
                    Continue with Email Verification
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          /* Step 2: OTP Verification */
          <div className="space-y-5">
            {/* Dev Mode Code Helper */}
            {devCode && (
              <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold block text-[11px] text-amber-800 dark:text-amber-300">Dev Code Generated:</span>
                  <span className="font-mono font-bold text-base tracking-widest text-amber-950 dark:text-amber-100">{devCode}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtp(devCode)}
                  className="px-2.5 py-1 bg-white dark:bg-slate-850 border border-amber-300 dark:border-amber-700 hover:bg-amber-100/60 dark:hover:bg-slate-800 text-amber-900 dark:text-amber-200 font-semibold rounded-lg text-xs transition-colors cursor-pointer shadow-2xs"
                >
                  Insert Code
                </button>
              </div>
            )}

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="reg-otp-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">
                  Enter 6-Digit Verification Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <KeyRound className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  </div>
                  <input
                    ref={otpInputRef}
                    id="reg-otp-input"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    disabled={isLoading}
                    required
                    placeholder="123456"
                    className="w-full h-12 pl-10 pr-4 text-center font-mono text-xl tracking-[0.4em] font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 disabled:opacity-50 transition-shadow"
                  />
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
                  Code expires in 10 minutes
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length < 6}
                className="w-full h-11 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 shadow-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account &amp; signing in...
                  </>
                ) : (
                  <>
                    Complete Registration
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setStep('details');
                  setOtp('');
                  setError(null);
                }}
                className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Edit registration details</span>
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || isLoading}
                className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:text-slate-400 font-semibold cursor-pointer transition-colors"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Footer Link to Sign In */}
        <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1 -ml-1"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </main>
  );
}

export function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPageInner />
    </Suspense>
  );
}
