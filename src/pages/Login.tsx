import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (loading) return (
    <div className="min-h-screen bg-editorial-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-editorial-text border-t-transparent rounded-full animate-spin"></div>
        <div className="font-serif italic text-editorial-text/70">Authenticating...</div>
      </div>
    </div>
  );
  if (user) return <Navigate to="/library" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setStatus('loading');
    try {
      await login(email, password);
    } catch (error: any) {
      console.error(error);
      setStatus('error');
      setErrorMessage(error.message || 'Failed to sign in.');
    }
  };

  return (
    <div className="min-h-screen bg-editorial-bg text-editorial-text flex flex-col items-center justify-center p-8 font-sans">
      <div className="w-full max-w-md border border-editorial-text/15 bg-editorial-surface p-10 shadow-[8px_8px_0_0_#141414]">
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="w-6 h-6" />
          <span className="font-serif text-3xl tracking-tight">SortedWebs.</span>
        </div>
        
        <h1 className="text-2xl font-serif mb-2">Access Your Library</h1>
        <p className="text-editorial-text/60 text-sm mb-8 leading-relaxed">
          Sign in to access your private collection and curated stacks.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-xs uppercase tracking-widest text-editorial-text/70 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="reader@example.com"
              required
              className="w-full bg-transparent border-b border-editorial-text/30 text-editorial-text 
                         px-0 py-3 text-lg rounded-none focus:outline-none focus:border-editorial-text"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-xs uppercase tracking-widest text-editorial-text/70">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-editorial-text/60 hover:text-editorial-text underline-offset-4 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-transparent border-b border-editorial-text/30 text-editorial-text 
                         px-0 py-3 text-lg rounded-none focus:outline-none focus:border-editorial-text"
            />
          </div>
          
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full btn-editorial-primary uppercase tracking-widest text-sm py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Signing In...' : 'Sign In'}
          </button>
          
          {status === 'error' && (
            <p className="text-red-700 text-sm text-center mt-4 bg-red-50 p-2 border border-red-200">
              {errorMessage}
            </p>
          )}

          <div className="text-center mt-6 text-sm text-editorial-text/60">
            Don't have an account?{' '}
            <Link to="/signup" className="text-editorial-text font-medium hover:underline underline-offset-4">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
