import { useState } from 'react';
import { BookOpen, ExternalLink, Check } from 'lucide-react';
import { useWebsites } from '../hooks/useWebsites';

export default function Popup() {
  const { websites, addWebsite } = useWebsites();
  const [showSaving, setShowSaving] = useState(false);

  const recentWebsites = websites.slice(0, 5);

  const handleSaveTab = async () => {
    setShowSaving(true);
    await addWebsite({
      title: 'New Tab - ' + new Date().toLocaleTimeString(),
      description: 'Saved from popup',
      url: 'https://example.com',
      category: 'Research',
      faviconUrl: undefined,
      is_favorite: false,
      is_archived: false,
    });
    setTimeout(() => setShowSaving(false), 1200);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-editorial-bg p-8 font-sans">
      <div className="w-[400px] h-[600px] bg-editorial-surface border border-editorial-text shadow-[8px_8px_0_0_#141414] flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-editorial-text/15">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-editorial-text" />
            <span className="font-serif text-xl text-editorial-text tracking-tight">SortedWebs.</span>
          </div>
          <p className="text-xs uppercase tracking-widest text-editorial-text/50">Personal Archive</p>
        </div>

        {/* Save button area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-editorial-bg">
          <button
            id="popup-save-tab-btn"
            onClick={handleSaveTab}
            disabled={showSaving}
            className={`w-full py-4 uppercase tracking-widest text-sm font-medium transition-all duration-200 border border-editorial-text focus:outline-none flex items-center justify-center gap-2 ${
              showSaving
                ? 'bg-[#caba24] text-editorial-text'
                : 'bg-editorial-text hover:bg-editorial-text/90 text-editorial-bg shadow-[4px_4px_0_0_#141414] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#141414]'
            }`}
          >
            {showSaving ? (
              <>
                <Check className="w-4 h-4" />
                Saved to Archive
              </>
            ) : (
              'Save Current Tab'
            )}
          </button>
          <p className="text-xs text-editorial-text/50 text-center mt-6 uppercase tracking-widest">
            Index the current page
          </p>
        </div>

        {/* Recent saves */}
        <div className="p-6 border-t border-editorial-text/15 bg-editorial-surface">
          <h3 className="text-xs font-serif italic text-editorial-text/60 mb-4 px-2">
            Recent Additions
          </h3>
          <div className="space-y-0">
            {recentWebsites.length === 0 ? (
              <p className="text-sm text-editorial-text/40 text-center py-4 font-serif italic">Archive is empty</p>
            ) : (
              recentWebsites.map((website) => (
                <a
                  key={website.id}
                  href={website.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-3 py-3 hover:bg-editorial-text/5 transition-colors group border-b border-editorial-text/10 last:border-0"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm text-editorial-text font-serif truncate group-hover:underline underline-offset-2">
                      {website.title}
                    </p>
                    <p className="text-xs text-editorial-text/50 truncate uppercase tracking-widest mt-1">
                      {website.category}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-editorial-text/30 group-hover:text-editorial-text transition-colors flex-shrink-0" />
                </a>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
