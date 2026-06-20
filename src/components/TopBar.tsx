import { Search, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function TopBar({ searchQuery, onSearchChange }: TopBarProps) {
  const { user, logout } = useAuth();

  return (
    <div className="h-24 bg-editorial-bg border-b border-editorial-text/15 fixed top-0 right-0 left-64 flex items-center px-12 z-40">
      {/* Search */}
      <div className="flex-1 max-w-2xl">
        <div className="relative group">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-editorial-text/50 pointer-events-none group-focus-within:text-editorial-text transition-colors" />
          <input
            type="text"
            id="global-search"
            placeholder="Search your library..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-0 py-3 bg-transparent border-b border-editorial-text/30 
                       text-lg font-serif text-editorial-text placeholder-editorial-text/40
                       focus:outline-none focus:border-editorial-text rounded-none
                       transition-all duration-200"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-6 ml-auto">
        <span className="text-xs uppercase tracking-widest text-editorial-text/60 font-sans hidden md:inline-block">
          {user?.email || 'Reader'}
        </span>
        <button
          id="user-profile-btn"
          onClick={() => logout()}
          className="w-10 h-10 border border-editorial-text/20 flex items-center justify-center
                     hover:border-editorial-text hover:bg-editorial-text/5 transition-all duration-200"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut className="w-4 h-4 text-editorial-text" />
        </button>
      </div>
    </div>
  );
}
