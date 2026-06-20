import { useState, useEffect } from 'react';
import { Plus, X, Link2, Tag, Type } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useWebsites } from '../hooks/useWebsites';

/* ── Domain → Category map ── */
const domainCategories: Record<string, string> = {
  'github.com': 'Dev Tools', 'gitlab.com': 'Dev Tools', 'stackoverflow.com': 'Dev Tools',
  'docker.com': 'Dev Tools', 'vercel.com': 'Dev Tools', 'netlify.com': 'Dev Tools',
  'supabase.com': 'Dev Tools', 'railway.app': 'Dev Tools', 'postman.com': 'Dev Tools',
  'firebase.google.com': 'Dev Tools',
  'chatgpt.com': 'AI Tools', 'openai.com': 'AI Tools', 'claude.ai': 'AI Tools',
  'gemini.google.com': 'AI Tools', 'huggingface.co': 'AI Tools', 'perplexity.ai': 'AI Tools',
  'midjourney.com': 'AI Tools', 'elevenlabs.io': 'AI Tools', 'replicate.com': 'AI Tools',
  'notion.so': 'Productivity', 'linear.app': 'Productivity', 'figma.com': 'Design',
  'miro.com': 'Productivity', 'canva.com': 'Design', 'slack.com': 'Productivity',
  'asana.com': 'Productivity', 'trello.com': 'Productivity', 'airtable.com': 'Productivity',
  'framer.com': 'Design', 'dribbble.com': 'Design', 'behance.net': 'Design',
  'zomato.com': 'Startups', 'swiggy.com': 'Startups',
  'groww.in': 'Startups', 'razorpay.com': 'Startups', 'paytm.com': 'Startups',
  'twitter.com': 'Social', 'x.com': 'Social', 'instagram.com': 'Social',
  'linkedin.com': 'Social', 'reddit.com': 'Social', 'threads.net': 'Social',
  'youtube.com': 'Entertainment', 'netflix.com': 'Entertainment', 'spotify.com': 'Entertainment',
  'twitch.tv': 'Entertainment', 'primevideo.com': 'Entertainment',
  'udemy.com': 'Learning', 'coursera.org': 'Learning', 'khanacademy.org': 'Learning',
  'leetcode.com': 'Learning', 'developer.mozilla.org': 'Learning',
  'codeforces.com': 'Learning', 'codechef.com': 'Learning', 'hackerrank.com': 'Learning',
  'hackerearth.com': 'Learning', 'geeksforgeeks.org': 'Learning', 'w3schools.com': 'Learning',
  'freecodecamp.org': 'Learning', 'edx.org': 'Learning',
  'techcrunch.com': 'News', 'theverge.com': 'News', 'wired.com': 'News', 'medium.com': 'News',
  'amazon.com': 'Shopping', 'flipkart.com': 'Shopping', 'ebay.com': 'Shopping',
  'bitcoin.org': 'Web3', 'ethereum.org': 'Web3', 'coinbase.com': 'Web3', 'opensea.io': 'Web3',
  'zerodha.com': 'Finance', 'nseindia.com': 'Finance', 'bseindia.com': 'Finance',
  'arxiv.org': 'Research', 'scholar.google.com': 'Research', 'researchgate.net': 'Research',
};

const keywordCategories: Record<string, string> = {
  bank: 'Finance', pay: 'Finance', finance: 'Finance', invest: 'Finance',
  shop: 'Shopping', store: 'Shopping', buy: 'Shopping',
  learn: 'Learning', course: 'Learning', edu: 'Learning', study: 'Learning',
  game: 'Entertainment', play: 'Entertainment', stream: 'Entertainment',
  news: 'News', blog: 'News', article: 'News',
  ai: 'AI Tools', gpt: 'AI Tools', llm: 'AI Tools',
};

function autoCategorize(url: string): string {
  if (!url) return 'Other';
  
  let formattedUrl = url.trim();
  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = 'https://' + formattedUrl;
  }

  try {
    const domain = new URL(formattedUrl).hostname.replace('www.', '');
    if (domainCategories[domain]) return domainCategories[domain];
    
    // Check subdomains or parent domains
    const parts = domain.split('.');
    if (parts.length > 2) {
      const rootDomain = parts.slice(-2).join('.');
      if (domainCategories[rootDomain]) return domainCategories[rootDomain];
    }
  } catch { /* invalid URL */ }
  
  const lower = formattedUrl.toLowerCase();
  for (const [kw, cat] of Object.entries(keywordCategories)) {
    if (lower.includes(kw)) return cat;
  }
  return 'Other';
}

const ALL_CATEGORIES = [
  'AI Tools', 'Dev Tools', 'Design', 'Productivity', 'Research',
  'Startups', 'Social', 'Entertainment', 'Learning', 'Shopping',
  'Finance', 'News', 'Web3', 'Other',
];

export default function AddLinkFab() {
  const { user } = useAuth();
  const { addWebsite } = useWebsites();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setCategory('');
    setLoading(false);
  };

  useEffect(() => {
    const autoCat = autoCategorize(url);
    if (autoCat) setCategory(autoCat);
  }, [url]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { 
      if (e.key === 'Escape') {
        setIsOpen(false);
        resetForm();
      }
    };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url || !category || !user) return;
    
    // Normalize URL
    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    setLoading(true);
    try {
      await addWebsite({ 
        title, 
        url: formattedUrl, 
        category, 
        is_favorite: false, 
        is_archived: false,
        tags: []
      });
      setIsOpen(false);
      resetForm();
    } catch (err: unknown) {
      console.error('Error adding link:', err);
      alert('Failed to add link. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      {/* FAB */}
      <button
        id="add-link-fab"
        onClick={() => setIsOpen(true)}
        aria-label="Add new link"
        className="fixed bottom-10 right-10 w-16 h-16 rounded-none
                   bg-editorial-text text-editorial-bg shadow-[8px_8px_0_0_rgba(20,20,20,0.2)]
                   flex items-center justify-center border border-editorial-text
                   transition-all duration-200 hover:translate-x-1 hover:translate-y-1 hover:shadow-[0px_0px_0_0_rgba(20,20,20,0.2)]
                   focus:outline-none z-50"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-editorial-text/20 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => { 
            if (e.target === e.currentTarget) {
              setIsOpen(false);
              resetForm();
            }
          }}
        >
          <div className="bg-editorial-bg w-full max-w-xl mx-4 border border-editorial-text shadow-[16px_16px_0_0_#141414]">
            {/* Modal header */}
            <div className="flex items-center justify-between p-8 border-b border-editorial-text/15">
              <div>
                <h2 className="text-3xl font-serif text-editorial-text leading-tight">Add to Library</h2>
                <p className="text-sm text-editorial-text/60 mt-1 font-sans">Smart category suggestion</p>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  resetForm();
                }}
                className="w-10 h-10 border border-editorial-text/20 flex items-center justify-center
                           hover:border-editorial-text hover:bg-editorial-text/5 text-editorial-text transition-all duration-200"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Title */}
              <div>
                <label htmlFor="link-title" className="flex items-center gap-2 text-sm text-editorial-text/70 mb-2 uppercase tracking-widest">
                  <Type className="w-4 h-4" /> Title
                </label>
                <input
                  id="link-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="The New Yorker"
                  className="input-editorial"
                  required
                  autoFocus
                />
              </div>

              {/* URL */}
              <div>
                <label htmlFor="link-url" className="flex items-center gap-2 text-sm text-editorial-text/70 mb-2 uppercase tracking-widest">
                  <Link2 className="w-4 h-4" /> URL
                </label>
                <input
                  id="link-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="input-editorial"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="link-category" className="flex items-center gap-2 text-sm text-editorial-text/70 mb-2 uppercase tracking-widest">
                  <Tag className="w-4 h-4" /> Category
                  {category && (
                    <span className="ml-2 text-editorial-accent italic font-serif normal-case tracking-normal">
                      (suggested)
                    </span>
                  )}
                </label>
                <select
                  id="link-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-transparent border-b border-editorial-text/30 text-editorial-text 
                             px-0 py-3 text-lg rounded-none focus:outline-none focus:border-editorial-text"
                  required
                >
                  <option value="">Select category...</option>
                  {ALL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    resetForm();
                  }}
                  className="flex-1 btn-editorial-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-link-btn"
                  disabled={loading || !title || !url || !category}
                  className="flex-1 btn-editorial-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-editorial-bg/30 border-t-editorial-bg rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : 'Save to Library'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}