'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Lock, Unlock, Eye, EyeOff, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import '@/styles/PasswordScreen.css';

interface PasswordScreenProps {
  onAuthenticated: () => void;
  expectedPassword?: string;
}

export const PasswordScreen: React.FC<PasswordScreenProps> = ({
  onAuthenticated,
  expectedPassword = 'root1234',
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setHasError(true);
      setErrorMessage('Please enter the password');
      return;
    }

    if (password === expectedPassword) {
      setHasError(false);
      setIsSuccess(true);
      setErrorMessage('');
      
      // Brief feedback animation before transitioning
      setTimeout(() => {
        onAuthenticated();
      }, 500);
    } else {
      setHasError(true);
      setErrorMessage('Incorrect password. Please try again.');
      
      // Haptic feedback if supported on mobile
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([40, 60, 40]);
      }
    }
  };

  return (
    <div className={`password-screen-container ${isSuccess ? 'success-fade' : ''}`}>
      {/* Background ambient lighting */}
      <div className="ambient-glow glow-top" />
      <div className="ambient-glow glow-bottom" />

      <div className="content-card">
        {/* Brand Emblem */}
        <div className="emblem-wrapper">
          <div className="emblem-ring ring-outer" />
          <div className="emblem-ring ring-inner" />
          <div className="logo-center">
            <Image
              src="/logo-cosmic.png"
              alt="Aura"
              width={52}
              height={52}
              priority
              className="password-logo-img"
            />
          </div>
        </div>

        {/* Header Text */}
        <div className="header-text">
          <h1 className="app-title">AURA</h1>
          <div className="security-badge">
            {isSuccess ? (
              <ShieldCheck size={14} className="badge-icon success" />
            ) : (
              <Lock size={14} className="badge-icon" />
            )}
          
          </div>
          <p className="instruction-text">
            Enter the access password to unlock your fitness space.
          </p>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="password-form" noValidate>
          <div className={`input-field-wrapper ${hasError ? 'error-shake' : ''} ${isSuccess ? 'success-border' : ''}`}>
            <div className="input-icon-left">
              {isSuccess ? (
                <Unlock size={24} className="text-green" />
              ) : (
                <Lock size={24} className={hasError ? 'text-red' : 'text-muted'} />
              )}
            </div>

            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (hasError) setHasError(false);
              }}
              placeholder="Enter passcode"
              className="password-input"
              autoFocus
              autoComplete="current-password"
              disabled={isSuccess}
            />

            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff size={18} className="text-muted" />
              ) : (
                <Eye size={18} className="text-muted" />
              )}
            </button>
          </div>

          {/* Error Message */}
          {hasError && (
            <div className="error-banner animate-fade-in" role="alert">
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={`submit-btn ${isSuccess ? 'btn-success' : ''}`}
            disabled={isSuccess}
          >
            {isSuccess ? (
              <span className="btn-content">
                <ShieldCheck size={18} />
                <span>Unlocked</span>
              </span>
            ) : (
              <span className="btn-content">
                <span>Enter Aura</span>
                <ArrowRight size={17} />
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
