import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      await resetPassword(email);
      setStatus('success');
    } catch (error: any) {
      console.error(error);
      setStatus('error');
      setErrorMessage(error.message || 'Failed to send reset link.');
    }
  };

  return (
    <div className="min-h-screen bg-editorial-bg text-editorial-text flex flex-col items-center justify-center p-8 font-sans">
      <div className="w-full max-w-md border border-editorial-text/15 bg-editorial-surface p-10 shadow-[8px_8px_0_0_#141414]">
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="w-6 h-6" />
          <span className="font-serif text-3xl tracking-tight">SortedWebs.</span>
        </div>
        
        <h1 className="text-2xl font-serif mb-2">Reset Password</h1>
        <p className="text-editorial-text/60 text-sm mb-8 leading-relaxed">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {status === 'success' ? (
          <div className="bg-[#dfceb9] border border-editorial-text/20 p-4 text-center">
            <p className="font-serif italic text-lg mb-2">Check your inbox</p>
            <p className="text-sm">We've sent a password reset link to {email}.</p>
            <div className="mt-4">
              <Link to="/login" className="text-editorial-text font-medium hover:underline underline-offset-4 text-sm">
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
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
            
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full btn-editorial-primary uppercase tracking-widest text-sm py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Sending Link...' : 'Send Reset Link'}
            </button>
            
            {status === 'error' && (
              <p className="text-red-700 text-sm text-center mt-4 bg-red-50 p-2 border border-red-200">
                {errorMessage}
              </p>
            )}

            <div className="text-center mt-6 text-sm text-editorial-text/60">
              <Link to="/login" className="text-editorial-text font-medium hover:underline underline-offset-4">
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
