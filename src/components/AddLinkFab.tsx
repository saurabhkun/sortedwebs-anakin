import { useState, useEffect } from 'react';
import {
  Plus, X, Link2, Tag, Type, Sparkles,
  CheckCircle2, AlertCircle, Loader2, Clock, BookOpen, ChevronDown, ChevronUp
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useWebsites } from '../hooks/useWebsites';
import { analyzeUrl, isAnakinConfigured, normalizeUrl } from '../services/anakinService';

/* ── Domain → Category fallback map (used when not using Anakin) ── */
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
  'trello.com': 'Productivity', 'framer.com': 'Design', 'dribbble.com': 'Design',
  'twitter.com': 'Social', 'x.com': 'Social', 'instagram.com': 'Social',
  'linkedin.com': 'Social', 'reddit.com': 'Social',
  'youtube.com': 'Entertainment', 'netflix.com': 'Entertainment', 'spotify.com': 'Entertainment',
  'udemy.com': 'Learning', 'coursera.org': 'Learning', 'khanacademy.org': 'Learning',
  'leetcode.com': 'Learning', 'developer.mozilla.org': 'Learning',
  'freecodecamp.org': 'Learning', 'geeksforgeeks.org': 'Learning',
  'techcrunch.com': 'News', 'theverge.com': 'News', 'wired.com': 'News', 'medium.com': 'News',
  'amazon.com': 'Shopping', 'flipkart.com': 'Shopping',
  'bitcoin.org': 'Web3', 'ethereum.org': 'Web3', 'coinbase.com': 'Web3',
  'zerodha.com': 'Finance', 'nseindia.com': 'Finance',
  'arxiv.org': 'Research', 'scholar.google.com': 'Research', 'researchgate.net': 'Research',
};

function autoCategorize(url: string): string {
  if (!url) return 'Other';
  let formatted = url.trim();
  if (!/^https?:\/\//i.test(formatted)) formatted = 'https://' + formatted;
  try {
    const domain = new URL(formatted).hostname.replace('www.', '');
    if (domainCategories[domain]) return domainCategories[domain];
    const parts = domain.split('.');
    if (parts.length > 2) {
      const root = parts.slice(-2).join('.');
      if (domainCategories[root]) return domainCategories[root];
    }
  } catch { /* invalid URL */ }
  return 'Other';
}

const ALL_CATEGORIES = [
  'AI Tools', 'Dev Tools', 'Design', 'Productivity', 'Research',
  'Startups', 'Social', 'Entertainment', 'Learning', 'Shopping',
  'Finance', 'News', 'Web3', 'Other',
];

/* ── Analysis state type ── */
type AnalysisState = 'idle' | 'analyzing' | 'success' | 'error';

interface AnakinResult {
  title: string;
  description: string;
  summary: string;
  keyTakeaways: string[];
  category: string;
  tags: string[];
  readingTime: string;
  analyzedAt: string;
  aiPowered: boolean;
}

export default function AddLinkFab() {
  const { user } = useAuth();
  const { addWebsite } = useWebsites();

  /* Modal open/close */
  const [isOpen, setIsOpen]         = useState(false);

  /* Form fields */
  const [title, setTitle]           = useState('');
  const [url, setUrl]               = useState('');
  const [category, setCategory]     = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput]   = useState('');  // comma-separated display
  const [summary, setSummary]       = useState('');
  const [keyTakeaways, setKeyTakeaways] = useState<string[]>([]);
  const [readingTime, setReadingTime]   = useState('');
  const [analyzedAt, setAnalyzedAt]     = useState('');

  /* UI state */
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [analysisError, setAnalysisError] = useState('');
  const [loading, setLoading]             = useState(false);
  const [showInsights, setShowInsights]   = useState(false);

  const anakinAvailable = isAnakinConfigured();

  /* Auto-categorize from domain when URL changes (fallback only) */
  useEffect(() => {
    if (analysisState !== 'success') {
      const autoCat = autoCategorize(url);
      if (autoCat) setCategory(autoCat);
    }
  }, [url]);  // eslint-disable-line react-hooks/exhaustive-deps

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setCategory('');
    setDescription('');
    setTagsInput('');
    setSummary('');
    setKeyTakeaways([]);
    setReadingTime('');
    setAnalyzedAt('');
    setAnalysisState('idle');
    setAnalysisError('');
    setLoading(false);
    setShowInsights(false);
  };

  /* Escape key closes modal */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setIsOpen(false); resetForm(); }
    };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  /* ── Analyze with Anakin ── */
  const handleAnalyze = async () => {
    if (!url.trim()) return;

    // Clear every AI-derived field before starting — prevents stale data
    // from a previous analysis persisting if this one fails or changes.
    setTitle('');
    setDescription('');
    setCategory(autoCategorize(url));  // reset to domain-based fallback
    setTagsInput('');
    setSummary('');
    setKeyTakeaways([]);
    setReadingTime('');
    setAnalyzedAt('');
    setAnalysisError('');
    setShowInsights(false);
    setAnalysisState('analyzing');

    try {
      const result: AnakinResult = await analyzeUrl(url);

      /* Auto-fill all form fields from AI result */
      setTitle(result.title || '');
      setDescription(result.description || '');
      setCategory(result.category || autoCategorize(url));
      setTagsInput((result.tags || []).join(', '));
      setSummary(result.summary || '');
      setKeyTakeaways(result.keyTakeaways || []);
      setReadingTime(result.readingTime || '');
      setAnalyzedAt(result.analyzedAt || '');

      setAnalysisState('success');
      setShowInsights(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
      // Keep fields empty on error — never show stale AI data
      setTitle('');
      setTagsInput('');
      setAnalysisError(msg);
      setAnalysisState('error');
    }
  };

  /* ── Save to Firestore ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url || !category || !user) return;

    const formattedUrl = normalizeUrl(url);
    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    setLoading(true);
    try {
      await addWebsite({
        title,
        url:          formattedUrl,
        category,
        description,
        is_favorite:  false,
        is_archived:  false,
        tags:         tagsArray,
        /* AI fields — only saved if analysis succeeded */
        ...(analysisState === 'success' && {
          summary,
          keyTakeaways,
          readingTime,
          analyzedAt,
          aiPowered: true,
        }),
      });
      setIsOpen(false);
      resetForm();
    } catch (err: unknown) {
      console.error('Error adding link:', err);
      alert('Failed to save link. Please try again.');
      setLoading(false);
    }
  };

  /* ── Render analysis status badge ── */
  const renderAnalysisBadge = () => {
    if (analysisState === 'analyzing') {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-editorial-text/5 border border-editorial-text/15 text-sm font-sans text-editorial-text/70">
          <Loader2 className="w-4 h-4 animate-spin text-editorial-accent" />
          <span>Anakin is analyzing the page</span>
          <span className="animate-pulse">...</span>
        </div>
      );
    }
    if (analysisState === 'success') {
      return (
        <div className="flex items-center justify-between px-4 py-2 bg-editorial-accent/10 border border-editorial-accent/40">
          <div className="flex items-center gap-2 text-sm font-sans text-editorial-text/80">
            <CheckCircle2 className="w-4 h-4 text-editorial-accent" />
            <span className="font-medium">Analysis complete</span>
            {readingTime && (
              <span className="flex items-center gap-1 text-editorial-text/50 ml-2">
                <Clock className="w-3.5 h-3.5" />
                {readingTime}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowInsights(!showInsights)}
            className="flex items-center gap-1 text-xs text-editorial-text/60 hover:text-editorial-text transition-colors"
          >
            {showInsights ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showInsights ? 'Hide' : 'Show'} insights
          </button>
        </div>
      );
    }
    if (analysisState === 'error') {
      return (
        <div className="flex items-start gap-2 px-4 py-2 bg-red-50 border border-red-200 text-sm font-sans text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{analysisError}</span>
        </div>
      );
    }
    return null;
  };

  /* ── Insights panel (shown when analysis succeeds) ── */
  const renderInsights = () => {
    if (analysisState !== 'success' || !showInsights) return null;
    return (
      <div className="border border-editorial-accent/30 bg-editorial-accent/5 p-4 space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-editorial-accent" />
          <span className="text-xs uppercase tracking-widest text-editorial-text/60 font-sans">
            Anakin AI Insights
          </span>
        </div>

        {summary && (
          <div>
            <p className="text-xs uppercase tracking-widest text-editorial-text/40 font-sans mb-1">Summary</p>
            <p className="text-sm text-editorial-text/80 leading-relaxed font-sans">{summary}</p>
          </div>
        )}

        {keyTakeaways.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest text-editorial-text/40 font-sans mb-2">Key Takeaways</p>
            <ul className="space-y-1">
              {keyTakeaways.map((kt, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-editorial-text/70 font-sans">
                  <span className="text-editorial-accent font-bold mt-0.5">→</span>
                  <span>{kt}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* ── FAB ── */}
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

      {/* ── Modal overlay ── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-editorial-text/20 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto py-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) { setIsOpen(false); resetForm(); }
          }}
        >
          <div className="bg-editorial-bg w-full max-w-xl mx-4 border border-editorial-text shadow-[16px_16px_0_0_#141414] my-auto">
            {/* ── Modal header ── */}
            <div className="flex items-center justify-between p-8 border-b border-editorial-text/15">
              <div>
                <h2 className="text-3xl font-serif text-editorial-text leading-tight">
                  Add to Library
                </h2>
                <p className="text-sm text-editorial-text/60 mt-1 font-sans flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-editorial-accent" />
                  Powered by Anakin AI
                </p>
              </div>
              <button
                onClick={() => { setIsOpen(false); resetForm(); }}
                className="w-10 h-10 border border-editorial-text/20 flex items-center justify-center
                           hover:border-editorial-text hover:bg-editorial-text/5 text-editorial-text transition-all duration-200"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* ── URL field + Analyze button ── */}
              <div>
                <label
                  htmlFor="link-url"
                  className="flex items-center gap-2 text-sm text-editorial-text/70 mb-2 uppercase tracking-widest"
                >
                  <Link2 className="w-4 h-4" /> URL
                </label>
                <div className="flex gap-3 items-end">
                  <input
                    id="link-url"
                    type="url"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (analysisState !== 'idle') {
                        setAnalysisState('idle');
                        setShowInsights(false);
                      }
                    }}
                    placeholder="https://example.com"
                    className="input-editorial flex-1"
                    required
                    autoFocus
                  />
                  {anakinAvailable && (
                    <button
                      type="button"
                      id="analyze-with-anakin-btn"
                      onClick={handleAnalyze}
                      disabled={!url.trim() || analysisState === 'analyzing'}
                      className="flex-shrink-0 flex items-center gap-2 px-4 py-3 bg-editorial-accent border border-editorial-text
                                 text-editorial-text text-sm font-sans uppercase tracking-widest
                                 hover:bg-[#caba24] transition-colors duration-200
                                 disabled:opacity-40 disabled:cursor-not-allowed
                                 whitespace-nowrap"
                    >
                      {analysisState === 'analyzing' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      {analysisState === 'analyzing' ? 'Analyzing...' : 'Analyze'}
                    </button>
                  )}
                </div>
              </div>

              {/* ── Analysis status ── */}
              {analysisState !== 'idle' && renderAnalysisBadge()}

              {/* ── Insights expandable panel ── */}
              {renderInsights()}

              {/* ── Title ── */}
              <div>
                <label
                  htmlFor="link-title"
                  className="flex items-center gap-2 text-sm text-editorial-text/70 mb-2 uppercase tracking-widest"
                >
                  <Type className="w-4 h-4" /> Title
                  {analysisState === 'success' && (
                    <span className="ml-1 text-editorial-accent italic font-serif normal-case tracking-normal text-xs">(AI-filled)</span>
                  )}
                </label>
                <input
                  id="link-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="The New Yorker"
                  className="input-editorial"
                  required
                />
              </div>

              {/* ── Description (shown only after analysis) ── */}
              {description && (
                <div>
                  <label className="flex items-center gap-2 text-sm text-editorial-text/70 mb-2 uppercase tracking-widest">
                    <BookOpen className="w-4 h-4" /> Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="input-editorial resize-none"
                  />
                </div>
              )}

              {/* ── Category ── */}
              <div>
                <label
                  htmlFor="link-category"
                  className="flex items-center gap-2 text-sm text-editorial-text/70 mb-2 uppercase tracking-widest"
                >
                  <Tag className="w-4 h-4" /> Category
                  {analysisState === 'success' && (
                    <span className="ml-1 text-editorial-accent italic font-serif normal-case tracking-normal text-xs">(AI-suggested)</span>
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

              {/* ── Tags (shown always, pre-filled if analysis succeeded) ── */}
              <div>
                <label
                  htmlFor="link-tags"
                  className="flex items-center gap-2 text-sm text-editorial-text/70 mb-2 uppercase tracking-widest"
                >
                  <Tag className="w-4 h-4" /> Tags
                  {analysisState === 'success' && (
                    <span className="ml-1 text-editorial-accent italic font-serif normal-case tracking-normal text-xs">(AI-generated)</span>
                  )}
                </label>
                <input
                  id="link-tags"
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="react, typescript, open-source"
                  className="input-editorial text-editorial-text"
                />
                <p className="text-xs text-editorial-text/40 mt-1 font-sans">Comma-separated</p>
              </div>

              {/* ── Action buttons ── */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => { setIsOpen(false); resetForm(); }}
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
                  ) : analysisState === 'success' ? (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Save with AI Insights
                    </span>
                  ) : (
                    'Save to Library'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}