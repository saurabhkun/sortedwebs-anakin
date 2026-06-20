import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Signup() {
  const { user, loading, signup } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    if (!email || !password || !username) return;
    if (password !== confirmPassword) {
      setStatus('error');
      setErrorMessage('Passwords do not match');
      return;
    }
    
    setStatus('loading');
    try {
      await signup(email, password, username);
      // Fallback redirect if auto-login doesn't immediately set the user state
      window.location.href = '/library';
    } catch (error: any) {
      console.error(error);
      setStatus('error');
      setErrorMessage(error.message || 'Failed to sign up.');
    }
  };

  return (
    <div className="min-h-screen bg-editorial-bg text-editorial-text flex flex-col items-center justify-center p-8 font-sans">
      <div className="w-full max-w-md border border-editorial-text/15 bg-editorial-surface p-10 shadow-[8px_8px_0_0_#141414]">
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="w-6 h-6" />
          <span className="font-serif text-3xl tracking-tight">SortedWebs.</span>
        </div>
        
        <h1 className="text-2xl font-serif mb-2">Create your account</h1>
        <p className="text-editorial-text/60 text-sm mb-8 leading-relaxed">
          Join to start curating and organizing your digital library.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-xs uppercase tracking-widest text-editorial-text/70 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="reader123"
              required
              className="w-full bg-transparent border-b border-editorial-text/30 text-editorial-text 
                         px-0 py-3 text-lg rounded-none focus:outline-none focus:border-editorial-text"
            />
          </div>

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
            <label htmlFor="password" className="block text-xs uppercase tracking-widest text-editorial-text/70 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full bg-transparent border-b border-editorial-text/30 text-editorial-text 
                         px-0 py-3 text-lg rounded-none focus:outline-none focus:border-editorial-text"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs uppercase tracking-widest text-editorial-text/70 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full bg-transparent border-b border-editorial-text/30 text-editorial-text 
                         px-0 py-3 text-lg rounded-none focus:outline-none focus:border-editorial-text"
            />
          </div>
          
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full btn-editorial-primary uppercase tracking-widest text-sm py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Creating Account...' : 'Create Account'}
          </button>
          
          {status === 'error' && (
            <p className="text-red-700 text-sm text-center mt-4 bg-red-50 p-2 border border-red-200">
              {errorMessage}
            </p>
          )}

          <div className="text-center mt-6 text-sm text-editorial-text/60">
            Already have an account?{' '}
            <Link to="/login" className="text-editorial-text font-medium hover:underline underline-offset-4">
              Log in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
