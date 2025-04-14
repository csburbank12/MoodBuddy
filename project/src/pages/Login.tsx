import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Location } from 'react-router-dom';
import { Cloud, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LocationState {
  from?: Location;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation<LocationState>();
  const { signIn, redirectPath, setRedirectPath } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    console.log("🔑 Attempting login:", email);
    
    try {
      const { user, error } = await signIn(email.trim(), password.trim());
      
      if (error) {
        console.error("❌ Login error:", error);
        throw error;
      }

      if (!user) {
        console.error("❌ No user data received");
        throw new Error('No user data received. Please try again.');
      }

      console.log("✅ Login successful:", user.email);
      const destination = redirectPath || location.state?.from?.pathname || '/dashboard';
      console.log("🔄 Redirecting to:", destination);
      setRedirectPath(null); // Clear the stored path
      navigate(destination, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 
        (err as any)?.message || 'Failed to sign in';
      console.error("❌ Sign in error:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <Cloud className="mx-auto h-12 w-12 text-cloud-blue animate-float" />
          </Link>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                School Email
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-coral-orange focus:border-coral-orange"
                  placeholder="you@school.edu"
                />
                <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-coral-orange focus:border-coral-orange"
                  placeholder="••••••••"
                />
                <Lock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/reset-password" className="font-medium text-coral-orange hover:text-opacity-90">
                Forgot your password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-coral-orange hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coral-orange disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="text-center">
            <Link
              to="/signup"
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}