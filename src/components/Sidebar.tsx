import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Globe, Heart, Archive, Layers } from 'lucide-react';
import { useWebsites } from '../hooks/useWebsites';

export default function Sidebar() {
  const location = useLocation();

  const { websites } = useWebsites();

  const categories = [
    { name: 'Research',      colorClass: 'bg-[#dfceb9]' },
    { name: 'Design',        colorClass: 'bg-[#f0eadd]' },
    { name: 'Dev Tools',     colorClass: 'bg-[#f2efe4]' },
    { name: 'Entertainment', colorClass: 'bg-[#e7d6c4]' },
    { name: 'AI Tools',      colorClass: 'bg-editorial-accent' },
    { name: 'Learning',      colorClass: 'bg-[#d6e4df]' },
    { name: 'Finance',       colorClass: 'bg-[#e8d5e1]' },
    { name: 'Productivity',  colorClass: 'bg-[#d8e0e8]' },
    { name: 'Social',        colorClass: 'bg-[#e8dec0]' },
    { name: 'Other',         colorClass: 'bg-editorial-text/10' },
  ];

  const getActiveCategory = () => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    if (location.pathname === '/favorites') return 'favorites';
    if (location.pathname === '/archives') return 'archives';
    if (categoryParam) return categoryParam;
    return null;
  };

  const activeCategory = getActiveCategory();

  const navLinks = [
    { to: '/library',        label: 'Library',       icon: BookOpen, match: (p: string) => p === '/library' && !activeCategory },
    { to: '/dashboard',      label: 'Dashboard',     icon: Layers,   match: (p: string) => p === '/dashboard' },
    { to: '/stacks',         label: 'Stacks',        icon: Archive,  match: (p: string) => p === '/stacks' },
    { to: '/explore',        label: 'Explore',       icon: Globe,    match: (p: string) => p === '/explore' },
    { to: '/favorites',      label: 'Favorites',     icon: Heart,    match: () => activeCategory === 'favorites' },
    { to: '/settings',       label: 'Settings',      icon: Globe,    match: (p: string) => p === '/settings' },
  ];

  return (
    <div className="w-64 bg-editorial-surface border-r border-editorial-text/15 h-screen fixed left-0 top-0 flex flex-col z-50">
      {/* Logo */}
      <div className="px-8 pt-10 pb-8 border-b border-editorial-text/15">
        <Link to="/" className="flex flex-col gap-1 group">
          <span className="font-serif text-2xl text-editorial-text tracking-tight group-hover:underline underline-offset-4 decoration-1">
            SortedWebs.
          </span>
          <p className="text-xs uppercase tracking-widest text-editorial-text/60 mt-1">Personal Archive</p>
        </Link>
      </div>

      <div className="p-6 overflow-y-auto flex-1">
        {/* Main nav */}
        <nav className="space-y-2 mb-10">
          {navLinks.map(({ to, label, icon: Icon, match }) => {
            const isActive = match(location.pathname);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2 text-sm uppercase tracking-widest transition-all ${
                  isActive 
                    ? 'text-editorial-text font-medium border-l-2 border-editorial-text -ml-[2px] pl-[13px]' 
                    : 'text-editorial-text/60 hover:text-editorial-text hover:bg-editorial-text/5'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Smart Categories */}
        <div>
          <h3 className="text-xs uppercase tracking-widest text-editorial-text/40 mb-4 px-3 border-b border-editorial-text/15 pb-2">
            Collections
          </h3>
          <div className="space-y-1">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.name;
              return (
                <Link
                  key={cat.name}
                  to={`/library?category=${cat.name}`}
                  className={`flex items-center justify-between w-full px-3 py-2 text-sm transition-all border ${
                    isActive
                      ? 'border-editorial-text/30 bg-editorial-bg shadow-[2px_2px_0_0_#141414]'
                      : 'border-transparent text-editorial-text/70 hover:text-editorial-text hover:bg-editorial-text/5'
                  }`}
                >
                  <span className="font-serif italic flex items-center gap-2">
                    {cat.name}
                    <span className="text-[10px] font-sans not-italic text-editorial-text/40">
                      ({websites.filter(w => w.category === cat.name && !w.is_archived).length})
                    </span>
                  </span>
                  <span className={`w-3 h-3 border border-editorial-text/20 ${cat.colorClass}`} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-6 border-t border-editorial-text/15">
        <div className="flex items-center gap-3 text-editorial-text/50">
          <Layers className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest">Index v2.0</span>
        </div>
      </div>
    </div>
  );
}