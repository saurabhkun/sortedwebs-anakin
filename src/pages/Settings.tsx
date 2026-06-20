import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useWebsites } from '../hooks/useWebsites';
import { useMyStacks } from '../hooks/useStacks';
import TopBar from '../components/TopBar';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Settings() {
  const { user, logout } = useAuth();
  const { websites } = useWebsites();
  const { stacks } = useMyStacks();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [username, setUsername] = useState('');
  
  const [preferences, setPreferences] = useState({
    autoCategory: true,
    openNewTab: true,
    showFavicons: true,
    viewMode: 'comfortable',
    publicCollections: false,
    publicStacks: true,
    publicStatistics: false,
    theme: 'Archive Beige'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showDangerModal, setShowDangerModal] = useState<'links' | 'account' | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      const fetchUserData = async () => {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.username) setUsername(data.username);
          if (data.preferences) setPreferences(prev => ({ ...prev, ...data.preferences }));
        }
      };
      fetchUserData();
    }
  }, [user]);

  const saveProfileData = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        username,
        preferences
      }, { merge: true });
      // In a real app we might also call updateProfile for displayName, but let's keep it simple here.
      setTimeout(() => setIsSaving(false), 800);
    } catch (error) {
      console.error(error);
      setIsSaving(false);
    }
  };

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences(prev => {
      const next = { ...prev, [key]: value };
      // auto-save preferences
      if (user) {
        setDoc(doc(db, 'users', user.uid), { preferences: next }, { merge: true });
      }
      return next;
    });
  };

  // Stats calculations
  const totalLinks = websites.length;
  const totalCollections = stacks.length;
  const totalPublicStacks = stacks.filter(s => s.isPublic).length;
  const uniqueCategories = new Set(websites.map(w => w.category).filter(Boolean)).size;
  
  const totalDomains = new Set(
    websites.map(w => {
      try { return new URL(w.url).hostname; } catch(e) { return null; }
    }).filter(Boolean)
  ).size;

  const joinDate = user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown';

  const handleExportJSON = () => {
    if (websites.length === 0) {
      alert("No links to export.");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(websites, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "sortedwebs_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleExportCSV = () => {
    if (websites.length === 0) {
      alert("No links to export.");
      return;
    }
    const headers = ['Title', 'URL', 'Category', 'Description'];
    const rows = websites.map(w => [
      `"${(w.title || '').replace(/"/g, '""')}"`,
      `"${(w.url || '').replace(/"/g, '""')}"`,
      `"${(w.category || '').replace(/"/g, '""')}"`,
      `"${(w.description || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", encodeURI(csvContent));
    downloadAnchorNode.setAttribute("download", "sortedwebs_export.csv");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <>
      <TopBar searchQuery="" onSearchChange={() => {}} />

      <main className="pt-32 pb-40 min-h-screen bg-editorial-bg text-editorial-text selection:bg-editorial-text selection:text-editorial-bg">
        <div className="max-w-4xl mx-auto px-8 md:px-12">
          
          <header className="mb-24">
            <h1 className="text-[4rem] md:text-[5rem] font-serif uppercase tracking-tighter leading-none mb-6">
              Archive Control Center
            </h1>
            <p className="font-sans text-lg md:text-xl text-editorial-text/70">
              Manage your personal archive, profile, and curation preferences.
            </p>
          </header>

          <div className="space-y-32">

            {/* ── Profile Section ── */}
            <section>
              <h2 className="font-sans text-sm uppercase tracking-widest font-semibold mb-8 border-b border-editorial-text/20 pb-4">
                PROFILE
              </h2>
              <div className="flex flex-col md:flex-row gap-12 items-start">
                <div className="w-24 h-24 bg-editorial-text/5 border border-editorial-text/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-serif text-3xl uppercase">{displayName.charAt(0) || user?.email?.charAt(0) || '?'}</span>
                </div>
                <div className="flex-1 space-y-8 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block font-sans text-xs uppercase tracking-widest text-editorial-text/50 mb-2">Display Name</label>
                      <input 
                        type="text" 
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        onBlur={saveProfileData}
                        className="w-full bg-transparent border-b border-editorial-text/20 pb-2 font-serif text-2xl focus:outline-none focus:border-editorial-text transition-colors"
                        placeholder="Your Name"
                      />
                    </div>
                    <div>
                      <label className="block font-sans text-xs uppercase tracking-widest text-editorial-text/50 mb-2">Username</label>
                      <div className="flex items-center">
                        <span className="font-serif text-2xl text-editorial-text/40 mr-1">@</span>
                        <input 
                          type="text" 
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          onBlur={saveProfileData}
                          className="w-full bg-transparent border-b border-editorial-text/20 pb-2 font-serif text-2xl focus:outline-none focus:border-editorial-text transition-colors"
                          placeholder="username"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-sans text-xs uppercase tracking-widest text-editorial-text/50 mb-2">Email Address</label>
                      <div className="font-serif text-xl text-editorial-text/60 pb-2">{user?.email}</div>
                    </div>
                    <div>
                      <label className="block font-sans text-xs uppercase tracking-widest text-editorial-text/50 mb-2">Member Since</label>
                      <div className="font-serif text-xl text-editorial-text/60 pb-2">{joinDate}</div>
                    </div>
                  </div>
                  {isSaving && <div className="text-xs uppercase tracking-widest text-editorial-text/50">Saving changes...</div>}
                </div>
              </div>
            </section>

            {/* ── Archive Statistics ── */}
            <section>
              <h2 className="font-sans text-sm uppercase tracking-widest font-semibold mb-8 border-b border-editorial-text/20 pb-4">
                YOUR ARCHIVE
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="border border-editorial-text/15 p-6 flex flex-col justify-between aspect-square">
                  <span className="font-sans text-xs uppercase tracking-widest text-editorial-text/60">Links Saved</span>
                  <span className="font-serif text-5xl">{totalLinks}</span>
                </div>
                <div className="border border-editorial-text/15 p-6 flex flex-col justify-between aspect-square">
                  <span className="font-sans text-xs uppercase tracking-widest text-editorial-text/60">Collections</span>
                  <span className="font-serif text-5xl">{totalCollections}</span>
                </div>
                <div className="border border-editorial-text/15 p-6 flex flex-col justify-between aspect-square">
                  <span className="font-sans text-xs uppercase tracking-widest text-editorial-text/60">Categories</span>
                  <span className="font-serif text-5xl">{uniqueCategories}</span>
                </div>
                <div className="border border-editorial-text/15 p-6 flex flex-col justify-between aspect-square">
                  <span className="font-sans text-xs uppercase tracking-widest text-editorial-text/60">Domains</span>
                  <span className="font-serif text-5xl">{totalDomains}</span>
                </div>
              </div>
              {totalPublicStacks > 0 && (
                <div className="mt-6 text-sm font-sans text-editorial-text/60 italic">
                  You also have {totalPublicStacks} public stacks shared with the community.
                </div>
              )}
            </section>

            {/* ── Archive Preferences ── */}
            <section>
              <h2 className="font-sans text-sm uppercase tracking-widest font-semibold mb-8 border-b border-editorial-text/20 pb-4">
                ARCHIVE PREFERENCES
              </h2>
              <div className="space-y-6 max-w-2xl">
                
                <div className="flex items-center justify-between py-4 border-b border-editorial-text/10">
                  <div>
                    <div className="font-serif text-xl mb-1">Auto Category Suggestions</div>
                    <div className="font-sans text-sm text-editorial-text/60">Automatically suggest categories based on URL and metadata.</div>
                  </div>
                  <button 
                    onClick={() => handlePreferenceChange('autoCategory', !preferences.autoCategory)}
                    className={`w-12 h-6 border ${preferences.autoCategory ? 'bg-editorial-text border-editorial-text' : 'bg-transparent border-editorial-text/30'} transition-colors relative`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-editorial-bg transition-all ${preferences.autoCategory ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-editorial-text/10">
                  <div>
                    <div className="font-serif text-xl mb-1">Open Links in New Tab</div>
                    <div className="font-sans text-sm text-editorial-text/60">Always open archive links in a new browser tab.</div>
                  </div>
                  <button 
                    onClick={() => handlePreferenceChange('openNewTab', !preferences.openNewTab)}
                    className={`w-12 h-6 border ${preferences.openNewTab ? 'bg-editorial-text border-editorial-text' : 'bg-transparent border-editorial-text/30'} transition-colors relative`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-editorial-bg transition-all ${preferences.openNewTab ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-editorial-text/10">
                  <div>
                    <div className="font-serif text-xl mb-1">Show Favicons</div>
                    <div className="font-sans text-sm text-editorial-text/60">Display website icons next to saved links.</div>
                  </div>
                  <button 
                    onClick={() => handlePreferenceChange('showFavicons', !preferences.showFavicons)}
                    className={`w-12 h-6 border ${preferences.showFavicons ? 'bg-editorial-text border-editorial-text' : 'bg-transparent border-editorial-text/30'} transition-colors relative`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-editorial-bg transition-all ${preferences.showFavicons ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-editorial-text/10">
                  <div>
                    <div className="font-serif text-xl mb-1">Library View Mode</div>
                    <div className="font-sans text-sm text-editorial-text/60">Choose your preferred reading density.</div>
                  </div>
                  <div className="flex border border-editorial-text/20 text-sm font-sans uppercase tracking-widest">
                    <button 
                      onClick={() => handlePreferenceChange('viewMode', 'comfortable')}
                      className={`px-4 py-2 ${preferences.viewMode === 'comfortable' ? 'bg-editorial-text text-editorial-bg' : 'hover:bg-editorial-text/5'}`}
                    >
                      Comfortable
                    </button>
                    <button 
                      onClick={() => handlePreferenceChange('viewMode', 'compact')}
                      className={`px-4 py-2 border-l border-editorial-text/20 ${preferences.viewMode === 'compact' ? 'bg-editorial-text text-editorial-bg' : 'hover:bg-editorial-text/5'}`}
                    >
                      Compact
                    </button>
                  </div>
                </div>

              </div>
            </section>

            {/* ── Library Management ── */}
            <section>
              <h2 className="font-sans text-sm uppercase tracking-widest font-semibold mb-8 border-b border-editorial-text/20 pb-4">
                LIBRARY
              </h2>
              <div className="flex flex-wrap gap-6">
                <button 
                  onClick={handleExportJSON}
                  className="px-8 py-4 border border-editorial-text font-sans text-sm uppercase tracking-widest hover:bg-editorial-text hover:text-editorial-bg transition-colors"
                >
                  Export Library as JSON
                </button>
                <button 
                  onClick={handleExportCSV}
                  className="px-8 py-4 border border-editorial-text font-sans text-sm uppercase tracking-widest hover:bg-editorial-text hover:text-editorial-bg transition-colors"
                >
                  Export Library as CSV
                </button>
                <button 
                  onClick={() => alert('Import functionality coming in v1.1')}
                  className="px-8 py-4 border border-editorial-text/20 text-editorial-text/50 font-sans text-sm uppercase tracking-widest hover:border-editorial-text/40 transition-colors"
                >
                  Import Links
                </button>
              </div>
            </section>

            {/* ── Public Profile ── */}
            <section>
              <h2 className="font-sans text-sm uppercase tracking-widest font-semibold mb-8 border-b border-editorial-text/20 pb-4">
                PUBLIC PROFILE
              </h2>
              <div className="mb-10 p-6 bg-editorial-text/5 border border-editorial-text/15 font-serif text-2xl text-center">
                sortedwebs.app/@{username || 'username'}
              </div>
              <div className="space-y-6 max-w-2xl">
                <div className="flex items-center justify-between py-4 border-b border-editorial-text/10">
                  <div>
                    <div className="font-serif text-xl mb-1">Public Collections</div>
                    <div className="font-sans text-sm text-editorial-text/60">Show your collections on your public profile.</div>
                  </div>
                  <button 
                    onClick={() => handlePreferenceChange('publicCollections', !preferences.publicCollections)}
                    className={`w-12 h-6 border ${preferences.publicCollections ? 'bg-editorial-text border-editorial-text' : 'bg-transparent border-editorial-text/30'} transition-colors relative`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-editorial-bg transition-all ${preferences.publicCollections ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-editorial-text/10">
                  <div>
                    <div className="font-serif text-xl mb-1">Public Stacks</div>
                    <div className="font-sans text-sm text-editorial-text/60">Show your curated stacks.</div>
                  </div>
                  <button 
                    onClick={() => handlePreferenceChange('publicStacks', !preferences.publicStacks)}
                    className={`w-12 h-6 border ${preferences.publicStacks ? 'bg-editorial-text border-editorial-text' : 'bg-transparent border-editorial-text/30'} transition-colors relative`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-editorial-bg transition-all ${preferences.publicStacks ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-editorial-text/10">
                  <div>
                    <div className="font-serif text-xl mb-1">Public Statistics</div>
                    <div className="font-sans text-sm text-editorial-text/60">Show your archive stats publicly.</div>
                  </div>
                  <button 
                    onClick={() => handlePreferenceChange('publicStatistics', !preferences.publicStatistics)}
                    className={`w-12 h-6 border ${preferences.publicStatistics ? 'bg-editorial-text border-editorial-text' : 'bg-transparent border-editorial-text/30'} transition-colors relative`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-editorial-bg transition-all ${preferences.publicStatistics ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </section>

            {/* ── Appearance ── */}
            <section>
              <h2 className="font-sans text-sm uppercase tracking-widest font-semibold mb-8 border-b border-editorial-text/20 pb-4">
                APPEARANCE
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-editorial-text p-6 cursor-pointer">
                  <div className="w-full h-24 bg-[#EBE5D9] border border-editorial-text/20 mb-4"></div>
                  <div className="font-serif text-xl text-center">Archive Beige</div>
                  <div className="text-center font-sans text-xs uppercase tracking-widest mt-2 opacity-60">Active</div>
                </div>
                <div className="border border-editorial-text/20 p-6 opacity-60">
                  <div className="w-full h-24 bg-white border border-editorial-text/20 mb-4"></div>
                  <div className="font-serif text-xl text-center">Paper White</div>
                  <div className="text-center font-sans text-xs uppercase tracking-widest mt-2">Coming Soon</div>
                </div>
                <div className="border border-editorial-text/20 p-6 opacity-60">
                  <div className="w-full h-24 bg-[#141414] border border-editorial-text/20 mb-4"></div>
                  <div className="font-serif text-xl text-center">Midnight Ink</div>
                  <div className="text-center font-sans text-xs uppercase tracking-widest mt-2">Coming Soon</div>
                </div>
              </div>
            </section>

            {/* ── About ── */}
            <section>
              <h2 className="font-sans text-sm uppercase tracking-widest font-semibold mb-8 border-b border-editorial-text/20 pb-4">
                ABOUT
              </h2>
              <div className="font-serif text-2xl md:text-3xl mb-8 leading-tight">
                SortedWebs v1.0 <br />
                <span className="italic text-editorial-text/70">Personal Web Library & Curator</span>
              </div>
              <div className="font-sans text-sm uppercase tracking-widest space-y-4">
                <p>Built by Saurabh Gandhi</p>
                <div className="flex flex-col gap-2 opacity-70">
                  <a href="https://github.com/saurabhkun" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity w-fit">
                    GitHub: github.com/saurabhkun
                  </a>
                  <a href="https://www.linkedin.com/in/saurabh-gandhi-1421b2318/" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity w-fit">
                    LinkedIn: linkedin.com/in/saurabh-gandhi-1421b2318
                  </a>
                </div>
              </div>
              
              <div className="mt-16">
                <button 
                  onClick={logout}
                  className="font-sans text-sm uppercase tracking-widest border-b border-editorial-text pb-1 hover:opacity-50 transition-opacity"
                >
                  Sign out of Archive
                </button>
              </div>
            </section>

            {/* ── Danger Zone ── */}
            <section className="border border-red-900/30 p-12 bg-red-900/5">
              <h2 className="font-sans text-sm uppercase tracking-widest font-semibold mb-8 text-red-900">
                DANGER ZONE
              </h2>
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-red-900/10">
                  <div>
                    <div className="font-serif text-xl mb-1 text-red-900">Delete All Saved Links</div>
                    <div className="font-sans text-sm text-red-900/60">Permanently remove all your saved bookmarks. This cannot be undone.</div>
                  </div>
                  <button 
                    onClick={() => setShowDangerModal('links')}
                    className="px-6 py-3 border border-red-900 text-red-900 font-sans text-sm uppercase tracking-widest hover:bg-red-900 hover:text-[#EBE5D9] transition-colors whitespace-nowrap"
                  >
                    Delete Links
                  </button>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <div className="font-serif text-xl mb-1 text-red-900">Delete Account</div>
                    <div className="font-sans text-sm text-red-900/60">Permanently delete your account and all associated data.</div>
                  </div>
                  <button 
                    onClick={() => setShowDangerModal('account')}
                    className="px-6 py-3 border border-red-900 text-red-900 font-sans text-sm uppercase tracking-widest hover:bg-red-900 hover:text-[#EBE5D9] transition-colors whitespace-nowrap"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>

      {/* Danger Modal Placeholder */}
      {showDangerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-editorial-bg/80 backdrop-blur-sm p-4">
          <div className="bg-[#EBE5D9] border border-editorial-text p-10 max-w-lg w-full">
            <h3 className="font-serif text-3xl mb-4 text-red-900">Are you absolutely sure?</h3>
            <p className="font-sans text-lg text-editorial-text/80 mb-8">
              This action is destructive and irreversible. Please confirm you want to proceed.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => { alert('Action confirmed (placeholder)'); setShowDangerModal(null); }}
                className="flex-1 px-6 py-4 bg-red-900 text-[#EBE5D9] font-sans text-sm uppercase tracking-widest hover:bg-red-800 transition-colors"
              >
                Confirm
              </button>
              <button 
                onClick={() => setShowDangerModal(null)}
                className="flex-1 px-6 py-4 border border-editorial-text text-editorial-text font-sans text-sm uppercase tracking-widest hover:bg-editorial-text/5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
