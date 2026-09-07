'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { API_BASE_URL } from '@/lib/api';

const API_URL = API_BASE_URL;



export default function RegisterPage() {
  const router = useRouter();
  const { checkAuth } = useAuth();

  const [step, setStep] = useState<'details' | 'verify'>('details');

  // Form fields
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // 1. Move from details to OTP verification
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Display name is required');
      return;
    }
    if (!phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
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
      setError(err.message || 'Error requesting verification code');
      setToastMsg({ message: err.message || 'Error requesting verification code', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // 2. Complete Registration after OTP entry
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim() !== '123456' && otpCode.trim().length !== 6) {
      setError('Invalid verification code. Enter 123456 in dev mode.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const payload = {
        display_name: displayName.trim(),
        phone_number: phoneNumber.trim(),
        username: username.trim() || undefined,
        password: password,
      };

      const res = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      await checkAuth();
      router.push('/chats');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setToastMsg({ message: err.message || 'Registration failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="border-b border-neutral-800 pb-2">
        <h2 className="text-lg font-semibold text-text-primary">
          {step === 'details' ? 'Create Your Account' : 'Verify Phone Number'}
        </h2>
        <p className="text-xs text-text-secondary mt-0.5">
          {step === 'details' ? 'Join Signal with your phone number' : `Code sent to ${phoneNumber}`}
        </p>
      </div>

      {step === 'details' ? (
        <form onSubmit={handleRequestOtp} className="flex flex-col gap-3.5">
          <Input
            label="Display Name *"
            type="text"
            placeholder="Alice Smith"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={loading}
            required
          />
          <Input
            label="Phone Number *"
            type="tel"
            placeholder="+15551234567"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={loading}
            required
          />
          <Input
            label="Username (Optional)"
            type="text"
            placeholder="alice_smith"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <Input
            label="Password * (min. 6 characters)"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            error={error || undefined}
            required
          />
          <Button type="submit" variant="primary" disabled={loading} className="w-full mt-2">
            {loading ? 'Sending Code...' : 'Continue to Verification'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleCompleteRegistration} className="flex flex-col gap-4">
          <div className="p-3 rounded-panel bg-accent-blue/10 border border-accent-blue/30 text-xs text-blue-200">
            💡 <span className="font-semibold">Demo Verification Code:</span> Enter code{' '}
            <span className="font-mono font-bold bg-accent-blue/20 px-1.5 py-0.5 rounded text-white">
              {devCodeHint || '123456'}
            </span>
            <div className="text-[11px] text-text-secondary mt-1">
              (Real SMS carrier gateway is not configured. Use demo OTP <strong>123456</strong> for any phone number.)
            </div>
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

          <div className="flex gap-2 mt-1">
            <Button
              type="button"
              variant="ghost"
              disabled={loading}
              onClick={() => { setStep('details'); setError(null); }}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Creating...' : 'Register'}
            </Button>
          </div>
        </form>
      )}

      <div className="text-center pt-2 border-t border-neutral-800 text-xs text-text-secondary">
        Already have an account?{' '}
        <a href="/login" className="text-accent-blue hover:underline font-medium">
          Log In
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
