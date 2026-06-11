import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase, isMockMode } from '@/lib/supabase';
import { KeyRound, Mail, ArrowLeft, AlertCircle } from 'lucide-react';
import tekartLogo from '@/assets/tekart-logo.png';

export const OwnerLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect target after success
  const from = (location.state as any)?.from?.pathname || '/owner';

  useEffect(() => {
    // If already logged in, redirect directly
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate(from, { replace: true });
      }
    };
    checkSession();
  }, [navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data) {
        navigate(from, { replace: true });
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
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-tk-text-secondary hover:text-tk-blue-deep transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>View Storefront</span>
          </Link>
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <img src={tekartLogo} alt="TEKART" className="h-12 w-auto object-contain" />
          <h2 className="font-display font-bold text-xl text-tk-text-primary">Owner Portal Access</h2>
          <p className="text-xs text-tk-text-secondary">
            Sign in to manage products, categories, and view analytics.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-tk-border shadow-md sm:rounded-tk-card sm:px-10">
          
          {isMockMode && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-tk-input p-4 text-xs text-blue-800 space-y-2">
              <p className="font-bold">Offline Demo Credentials:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Email: <code className="bg-blue-100 p-0.5 rounded">owner@tekart.com</code></li>
                <li>Password: <code className="bg-blue-100 p-0.5 rounded">admin123</code></li>
              </ul>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-tk-input p-3 text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-tk-text-secondary mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-tk-text-tertiary" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-tk-border rounded-tk-input text-sm text-tk-text-primary placeholder-tk-text-tertiary focus:outline-none focus:ring-1 focus:ring-tk-blue-deep focus:border-tk-blue-deep"
                  placeholder="name@store.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-tk-text-secondary mb-2">
                Password
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
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-tk-blue-deep hover:bg-tk-blue-mid text-white font-bold py-2.5 px-4 rounded-tk-input text-sm shadow-md transition-all flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
