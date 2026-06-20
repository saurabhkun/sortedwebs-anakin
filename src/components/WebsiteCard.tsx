import { Trash2, ExternalLink, Heart, Clock, Sparkles, Tag } from 'lucide-react';
import { Website } from '../hooks/useWebsites';

interface WebsiteCardProps {
  website: Website;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
}

const categoryStyles: Record<string, string> = {
  Research:      'bg-[#dfceb9]',
  Design:        'bg-[#f0eadd]',
  'Dev Tools':   'bg-[#f2efe4]',
  Entertainment: 'bg-[#e7d6c4]',
  'AI Tools':    'bg-editorial-accent/30',
  Learning:      'bg-[#d6e4df]',
  Finance:       'bg-[#e8d5e1]',
  Productivity:  'bg-[#d8e0e8]',
  Social:        'bg-[#e8dec0]',
  News:          'bg-[#e8e0d8]',
};

const defaultStyle = 'bg-editorial-bg';

function getDomainFromUrl(url: string) {
  try { return new URL(url).hostname.replace('www.', ''); }
  catch { return url; }
}

function formatDate(dateObj: any) {
  try {
    if (!dateObj) return '';
    const date = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch { return ''; }
}

export default function WebsiteCard({ website, onDelete, onToggleFavorite }: WebsiteCardProps) {
  const bgClass = categoryStyles[website.category ?? ''] || defaultStyle;
  const domain  = getDomainFromUrl(website.url);
  const date    = formatDate(website.createdAt);

  /* Display: prefer AI summary > description > nothing */
  const bodyText = website.summary || website.description || null;

  /* Tags to display (max 3) */
  const visibleTags = (website.tags || []).slice(0, 3);

  return (
    <div
      className={`group border border-editorial-text/15 flex flex-col h-full transition-all duration-200
                  hover:border-editorial-text/40 hover:-translate-y-0.5 ${bgClass}`}
    >
      {/* ── Header ── */}
      <div className="p-6 pb-4 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Category badge + domain */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs uppercase tracking-widest text-editorial-text/60 font-sans">
              {website.category || 'Uncategorized'}
            </span>
            <span className="w-1 h-1 bg-editorial-text/20 rounded-full" />
            <span className="text-xs uppercase tracking-widest text-editorial-text/40 font-sans truncate">
              {domain}
            </span>

            {/* AI badge */}
            {website.aiPowered && (
              <>
                <span className="w-1 h-1 bg-editorial-text/20 rounded-full" />
                <span className="flex items-center gap-1 text-[10px] text-editorial-accent font-sans uppercase tracking-widest">
                  <Sparkles className="w-2.5 h-2.5" />
                  AI
                </span>
              </>
            )}
          </div>

          <h3 className="text-xl font-serif text-editorial-text leading-tight group-hover:underline underline-offset-4 decoration-1 line-clamp-2">
            {website.title}
          </h3>
        </div>
      </div>

      {/* ── Body: summary or description ── */}
      <div className="px-6 flex-grow">
        {bodyText ? (
          <p className="text-sm text-editorial-text/70 line-clamp-3 leading-relaxed font-sans">
            {bodyText}
          </p>
        ) : (
          <p className="text-sm text-editorial-text/30 italic font-serif">
            No description available.
          </p>
        )}
      </div>

      {/* ── Tags row ── */}
      {visibleTags.length > 0 && (
        <div className="px-6 pt-4 flex flex-wrap gap-1.5">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-widest
                         bg-editorial-text/5 border border-editorial-text/10 text-editorial-text/60 font-sans"
            >
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
          {(website.tags?.length ?? 0) > 3 && (
            <span className="px-2 py-0.5 text-[10px] uppercase tracking-widest text-editorial-text/40 font-sans">
              +{(website.tags?.length ?? 0) - 3}
            </span>
          )}
        </div>
      )}

      {/* ── Footer ── */}
      <div className="p-6 pt-4 flex items-center justify-between border-t border-editorial-text/10 mt-4">
        <div className="flex items-center gap-3 text-xs text-editorial-text/50 font-sans">
          {date && (
            <span className="flex items-center gap-1 uppercase tracking-widest">
              <Clock className="w-3.5 h-3.5" />
              {date}
            </span>
          )}
          {website.readingTime && (
            <>
              {date && <span className="text-editorial-text/20">·</span>}
              <span className="flex items-center gap-1 uppercase tracking-widest">
                {website.readingTime}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Favorite */}
          <button
            id={`favorite-btn-${website.id}`}
            onClick={() => onToggleFavorite(website.id, !website.is_favorite)}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-editorial-text/5"
            aria-label={website.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                website.is_favorite
                  ? 'fill-editorial-text text-editorial-text'
                  : 'text-editorial-text/40 hover:text-editorial-text'
              }`}
            />
          </button>

          {/* Delete */}
          <button
            id={`delete-btn-${website.id}`}
            onClick={() => {
              if (confirm(`Remove "${website.title}" from your library?`)) {
                onDelete(website.id);
              }
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-editorial-text/40 hover:text-red-700 hover:bg-red-50 transition-colors"
            aria-label="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Open link */}
          <a
            href={website.url}
            id={`open-link-${website.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center border border-editorial-text/20 hover:border-editorial-text transition-colors"
            aria-label="Open link"
          >
            <ExternalLink className="w-4 h-4 text-editorial-text" />
          </a>
        </div>
      </div>
    </div>
  );
}
