import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Popup from './pages/Popup';
import Explore from './pages/Explore';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Settings from './pages/Settings';
import Seed from './pages/Seed';
import { useAuth } from './hooks/useAuth';
import { ErrorBoundary } from './components/ErrorBoundary';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-editorial-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-editorial-text border-t-transparent rounded-full animate-spin"></div>
        <div className="font-serif italic text-editorial-text/70">Authenticating...</div>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
        {/* Marketing / Landing page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Main App (Protected) */}
        <Route element={<AuthGuard><Layout /></AuthGuard>}>
          {/* Root redirect */}
          <Route path="/app" element={<Navigate to="/library" replace />} />
          
          <Route path="/library" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/stacks" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* Keep existing sub-routes mapped under library for compatibility if needed, 
              or map them to dashboard component since it handles categories */}
          <Route path="/explore"   element={<Explore />} />
          <Route path="/favorites" element={<Dashboard />} />
          <Route path="/archives"  element={<Dashboard />} />
          <Route path="/seed"  element={<Seed />} />
        </Route>

        {/* Browser Extension Popup (Protected) */}
        <Route path="/popup" element={<AuthGuard><Popup /></AuthGuard>} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
