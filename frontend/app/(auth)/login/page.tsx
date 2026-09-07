'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function LoginPage() {
  const router = useRouter();
  const { checkAuth } = useAuth();

  const [mode, setMode] = useState<'otp' | 'password'>('otp');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');

  // OTP flow fields
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null);

  // Password flow fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // UI status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // 1. Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/v1/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phoneNumber.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Failed to request OTP');
      }

      setDevCodeHint(data.dev_only_code || '123456');
      setStep('verify');
      setToastMsg({ message: 'Verification code sent!', type: 'success' });
    } catch (err: any) {
      setError(err.message || 'Error sending OTP');
      setToastMsg({ message: err.message || 'Error sending OTP', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setError('Please enter the 6-digit verification code');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/v1/auth/verify-otp`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneNumber.trim(),
          code: otpCode.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Verification failed');
      }

      await checkAuth();
      router.push('/chats');
    } catch (err: any) {
      setError(err.message || 'Invalid code or user not found');
      setToastMsg({ message: err.message || 'Invalid code or user not found', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // 3. Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please provide phone/username and password');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const isPhone = identifier.startsWith('+') || /^\d+$/.test(identifier);
      const payload = isPhone
        ? { phone_number: identifier.trim(), password }
        : { username: identifier.trim(), password };

      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      await checkAuth();
      router.push('/chats');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
      setToastMsg({ message: err.message || 'Invalid credentials', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex border-b border-neutral-800 pb-2 justify-between items-center">
        <h2 className="text-lg font-semibold text-text-primary">
          {mode === 'otp' ? (step === 'phone' ? 'Phone Login' : 'Verify Code') : 'Password Login'}
        </h2>
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'otp' ? 'password' : 'otp');
            setError(null);
            setStep('phone');
          }}
          className="text-xs text-accent-blue hover:underline"
        >
          {mode === 'otp' ? 'Use Password' : 'Use OTP'}
        </button>
      </div>

      {mode === 'otp' ? (
        step === 'phone' ? (
          <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
            <p className="text-xs text-text-secondary">
              Enter your phone number to receive a verification code.
            </p>
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+15551234567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={loading}
              error={error || undefined}
              required
            />
            <Button type="submit" variant="primary" disabled={loading} className="w-full mt-1">
              {loading ? 'Sending Code...' : 'Send Verification Code'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>Code sent to <strong className="text-text-primary">{phoneNumber}</strong></span>
              <button
                type="button"
                onClick={() => { setStep('phone'); setError(null); }}
                className="text-accent-blue hover:underline"
              >
                Change
              </button>
            </div>

            <div className="p-3 rounded-panel bg-accent-blue/10 border border-accent-blue/30 text-xs text-blue-200">
              💡 <span className="font-semibold">Dev Mode Hint:</span> Enter code{' '}
              <span className="font-mono font-bold bg-accent-blue/20 px-1.5 py-0.5 rounded text-white">
                {devCodeHint || '123456'}
              </span>
            </div>

            <Input
              label="6-Digit Verification Code"
              type="text"
              maxLength={6}
              placeholder="123456"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              disabled={loading}
              error={error || undefined}
              autoFocus
              required
            />

            <Button type="submit" variant="primary" disabled={loading} className="w-full mt-1">
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </Button>
          </form>
        )
      ) : (
        <form onSubmit={handlePasswordLogin} className="flex flex-col gap-4">
          <Input
            label="Phone Number or Username"
            type="text"
            placeholder="+15551234567 or alice"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            disabled={loading}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            error={error || undefined}
            required
          />
          <Button type="submit" variant="primary" disabled={loading} className="w-full mt-1">
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      )}

      <div className="text-center pt-2 border-t border-neutral-800 text-xs text-text-secondary">
        Don&apos;t have an account?{' '}
        <a href="/register" className="text-accent-blue hover:underline font-medium">
          Register
        </a>
      </div>

      {toastMsg && (
        <Toast
          message={toastMsg.message}
          type={toastMsg.type}
          onClose={() => setToastMsg(null)}
        />
      )}
    </div>
  );
}
