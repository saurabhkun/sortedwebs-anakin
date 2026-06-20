import { Trash2, ExternalLink, Heart, Clock } from 'lucide-react';
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
  'AI Tools':    'bg-editorial-accent',
};

const defaultStyle = 'bg-editorial-bg';

function getDomainFromUrl(url: string) {
  try { return new URL(url).hostname.replace('www.', ''); }
  catch { return url; }
}

function formatDate(dateObj: any) {
  try {
    if (!dateObj) return '';
    // Handle Firestore Timestamp
    const date = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch { return ''; }
}

export default function WebsiteCard({ website, onDelete, onToggleFavorite }: WebsiteCardProps) {
  const bgClass = categoryStyles[website.category] || defaultStyle;
  const domain = getDomainFromUrl(website.url);
  const date = formatDate(website.createdAt);

  return (
    <div className={`group border border-editorial-text/15 flex flex-col h-full transition-colors hover:border-editorial-text/40 ${bgClass}`}>
      {/* Header */}
      <div className="p-6 pb-4 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs uppercase tracking-widest text-editorial-text/60 font-sans">
              {website.category || 'Uncategorized'}
            </span>
            <span className="w-1 h-1 bg-editorial-text/20 rounded-full"></span>
            <span className="text-xs uppercase tracking-widest text-editorial-text/40 font-sans truncate">
              {domain}
            </span>
          </div>
          <h3 className="text-2xl font-serif text-editorial-text truncate leading-tight group-hover:underline underline-offset-4 decoration-1">
            {website.title}
          </h3>
        </div>
      </div>

      {/* Description */}
      <div className="px-6 flex-grow">
        {website.description ? (
          <p className="text-sm text-editorial-text/70 line-clamp-3 leading-relaxed font-sans">
            {website.description}
          </p>
        ) : (
          <p className="text-sm text-editorial-text/40 italic font-serif">
            No description available.
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 pt-6 flex items-center justify-between border-t border-editorial-text/10 mt-6">
        <div className="flex items-center gap-1 text-xs text-editorial-text/50 uppercase tracking-widest font-sans">
          {date && (
            <>
              <Clock className="w-3.5 h-3.5 mr-1" />
              {date}
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Favorite button */}
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
