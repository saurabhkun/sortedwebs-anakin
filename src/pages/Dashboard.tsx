import { useState, useMemo, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import WebsiteCard from '../components/WebsiteCard';
import { useWebsites } from '../hooks/useWebsites';
import { BookOpen } from 'lucide-react';

export default function Dashboard() {
  const { websites, loading, deleteWebsite, updateWebsite } = useWebsites();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const path = location.pathname;
    const categoryParam = searchParams.get('category');
    if (path === '/favorites') setActiveCategory('favorites');
    else if (path === '/archives') setActiveCategory('archives');
    else if (categoryParam) setActiveCategory(categoryParam);
    else setActiveCategory(null);
  }, [location.pathname, searchParams]);

  const filteredWebsites = useMemo(() => {
    let filtered = websites;
    if (activeCategory === 'favorites') filtered = filtered.filter((w) => w.is_favorite);
    else if (activeCategory === 'archives') filtered = filtered.filter((w) => w.is_archived);
    else if (activeCategory) filtered = filtered.filter((w) => w.category === activeCategory);
    else filtered = filtered.filter((w) => !w.is_archived);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.title.toLowerCase().includes(query) ||
          (w.description?.toLowerCase() || '').includes(query) ||
          w.url.toLowerCase().includes(query) ||
          /* Anakin AI fields */
          (w.summary?.toLowerCase() || '').includes(query) ||
          (w.category?.toLowerCase() || '').includes(query) ||
          (w.tags || []).some((tag) => tag.toLowerCase().includes(query)) ||
          (w.keyTakeaways || []).some((kt) => kt.toLowerCase().includes(query))
      );
    }
    return filtered;
  }, [websites, searchQuery, activeCategory]);

  const pageTitle = activeCategory === 'favorites' ? 'Favorites'
    : activeCategory === 'archives' ? 'Archives'
    : activeCategory ? activeCategory
    : 'Your Library';

  const totalCount = filteredWebsites.length;

  return (
    <>
      <TopBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="pt-24 min-h-screen pb-20">
        {/* Page header */}
        <div className="px-12 pt-16 pb-12 border-b border-editorial-text/15">
          <div className="flex flex-col gap-4 max-w-4xl">
            <span className="text-xs uppercase tracking-widest text-editorial-text/50 font-sans">
              Archive Index
            </span>
            <h1 className="text-5xl md:text-7xl font-serif text-editorial-text leading-tight tracking-tight">
              {pageTitle}
            </h1>
            <p className="text-lg text-editorial-text/60 mt-2 font-sans flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-editorial-text/40" />
              {loading ? 'Curating your library...' : `${totalCount} item${totalCount !== 1 ? 's' : ''} in collection`}
            </p>
          </div>
        </div>

        <div className="p-12">
          {loading ? (
            /* Skeleton grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="editorial-card p-6 h-48 bg-editorial-text/5" />
              ))}
            </div>
          ) : filteredWebsites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center max-w-md mx-auto">
              <div className="w-20 h-20 border border-editorial-text/20 flex items-center justify-center mb-8 bg-editorial-surface">
                <BookOpen className="w-8 h-8 text-editorial-text/40" />
              </div>
              <h3 className="text-2xl font-serif text-editorial-text mb-4">
                {searchQuery ? 'No Match Found' : 'Your Library is empty.'}
              </h3>
              <p className="text-editorial-text/60 leading-relaxed mb-8">
                {searchQuery
                  ? `There are no items matching "${searchQuery}" in your archive. Please refine your query.`
                  : 'Start your collection by adding resources or exploring curated content.'}
              </p>
              {!searchQuery && (
                <div className="flex flex-col gap-4 w-full">
                  <a href="/explore" className="btn-editorial-primary px-8 py-3 uppercase tracking-widest text-sm w-full text-center">
                    Explore curated resources
                  </a>
                  <button 
                    onClick={() => {
                      const fab = document.getElementById('add-link-fab');
                      if (fab) fab.click();
                    }}
                    className="btn-editorial-ghost px-8 py-3 uppercase tracking-widest text-sm w-full text-center"
                  >
                    Add your first link
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredWebsites.map((website) => (
                <div key={website.id} className="h-full">
                  <WebsiteCard
                    website={website}
                    onDelete={deleteWebsite}
                    onToggleFavorite={(id, isFavorite) => updateWebsite(id, { is_favorite: isFavorite })}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
