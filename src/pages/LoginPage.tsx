import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, AlertCircle, Play, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { GoogleIcon } from '../components/common/GoogleIcon';
import { useAuth } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const { signInWithGoogle, signInAsDemoUser, isFirebaseConfigured } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Google sign-in popup was blocked by your browser. Please allow popups for this site.');
      } else {
        setError(err.message || 'Google authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInAsDemoUser();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-2xl p-1">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6 text-accent-400" aria-hidden="true" />
          </div>
          <span className="font-serif font-bold text-2xl text-charcoal tracking-tight">EventWise</span>
        </Link>
        <h1 className="text-2xl font-serif font-bold text-charcoal">Sign in to EventWise</h1>
        <p className="mt-1.5 text-xs text-charcoal-600">
          Fast, secure, one-click access to your AI event planning workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-charcoal-100 shadow-card space-y-6">
          {/* Primary Google Authentication Button */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              aria-busy={loading || undefined}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl border border-charcoal-200 bg-white hover:bg-charcoal-50 active:bg-charcoal-100 text-charcoal font-semibold text-sm shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              <GoogleIcon className="w-5 h-5 shrink-0" />
              <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            {!isFirebaseConfigured && (
              <p className="text-[11px] text-amber-800 text-center font-medium bg-amber-50 py-1.5 px-3 rounded-xl border border-amber-200">
                ⚡ Firebase credentials unconfigured: Google button activates simulated Google profile.
              </p>
            )}
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-charcoal-100" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-charcoal-500 font-medium">Or try instant demo</span>
            </div>
          </div>

          {/* Quick Demo Login Option */}
          <button
            type="button"
            onClick={handleDemoSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold text-primary-900 bg-primary-50 hover:bg-primary-100 border border-primary-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
          >
            <Play className="w-4 h-4 text-accent-500 fill-accent-500" aria-hidden="true" />
            <span>Instant Demo Sign In (No Setup Required)</span>
          </button>

          {/* Error Feedback */}
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-200"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {/* Value props & Security Guarantee */}
          <div className="pt-4 border-t border-charcoal-100 space-y-2 text-xs text-charcoal-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>Instant sync with your active events & budgets</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>Secure Gemini AI assistant access included</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
              <span>Protected by Google OAuth 2.0 & Firebase</span>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-charcoal-500">
          By signing in, you agree to our{' '}
          <span className="font-semibold text-charcoal-700">Terms of Service</span> and{' '}
          <span className="font-semibold text-charcoal-700">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};
