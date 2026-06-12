import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { KeyRound, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import tekartLogo from '@/assets/tekart-logo.png';
import { useTheme } from '@/context/ThemeContext';

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsValidSession(true);
      } else {
        // Wait a small bit in case Supabase is parsing hash fragments
        setTimeout(async () => {
          const { data: retryData } = await supabase.auth.getSession();
          if (retryData.session) {
            setIsValidSession(true);
          } else {
            setIsValidSession(false);
            setErrorMsg('Invalid or expired reset link. Please request a new password reset email.');
          }
        }, 1500);
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg('Password updated successfully! Redirecting you to login in 3 seconds...');
        // Clear attempts counter on successful password reset
        localStorage.removeItem('tk_login_attempts');
        localStorage.removeItem('tk_login_lockout_until');
        setTimeout(() => {
          navigate('/owner/login', { replace: true });
        }, 3000);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-tk-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-left">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4">
        {/* Back link */}
        <div className="flex justify-start px-4 sm:px-0">
          <Link to="/owner/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-tk-text-secondary hover:text-tk-blue-deep transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Login</span>
          </Link>
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <img 
            src={tekartLogo} 
            alt="TEKART" 
            className="h-12 w-auto object-contain transition-all duration-300" 
            style={resolvedTheme === 'dark' ? { filter: 'brightness(0) invert(1)' } : undefined}
          />
          <h2 className="font-display font-bold text-xl text-tk-text-primary">Reset Admin Password</h2>
          <p className="text-xs text-tk-text-secondary">
            Set a new secure password for your owner account.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-tk-surface py-8 px-4 border border-tk-border shadow-md sm:rounded-tk-card sm:px-10">
          
          {errorMsg && (
            <div className="mb-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-tk-input p-3 text-xs text-red-800 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-tk-input p-3 text-xs text-green-800 dark:text-green-300 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {isValidSession === null ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <div className="h-8 w-8 border-3 border-tk-blue-deep border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-tk-text-secondary">Verifying reset session...</p>
            </div>
          ) : isValidSession ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-tk-text-secondary mb-2">
                  New Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-tk-text-tertiary" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-tk-border rounded-tk-input text-sm text-tk-text-primary placeholder-tk-text-tertiary focus:outline-none focus:ring-1 focus:ring-tk-blue-deep focus:border-tk-blue-deep"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-tk-text-secondary mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-tk-text-tertiary" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-tk-border rounded-tk-input text-sm text-tk-text-primary placeholder-tk-text-tertiary focus:outline-none focus:ring-1 focus:ring-tk-blue-deep focus:border-tk-blue-deep"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || successMsg !== ''}
                  className="w-full bg-tk-blue-deep hover:bg-tk-blue-mid text-white font-bold py-2.5 px-4 rounded-tk-input text-sm shadow-md transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <p className="text-sm text-tk-text-secondary">
                This reset link is either invalid, has already been used, or has expired.
              </p>
              <Link
                to="/owner/login"
                className="inline-block bg-tk-blue-deep hover:bg-tk-blue-mid text-white font-bold py-2 px-4 rounded-tk-input text-xs"
              >
                Go to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
