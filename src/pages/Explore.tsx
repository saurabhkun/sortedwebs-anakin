import { ExternalLink, Layers, Compass, Plus, Check } from 'lucide-react';
import { usePublicStacks } from '../hooks/useStacks';
import { usePublicResources } from '../hooks/useResources';
import { curatedStacks } from '../lib/curatedData';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { doc, serverTimestamp, writeBatch, collection, getDocs, query } from 'firebase/firestore';
import { useState } from 'react';

export default function Explore() {
  const { stacks, loading: stacksLoading } = usePublicStacks();
  const { resources, loading: resourcesLoading } = usePublicResources();
  const { user } = useAuth();
  const [savedStacks, setSavedStacks] = useState<Set<string>>(new Set());
  const [saveLoading, setSaveLoading] = useState<string | null>(null);

  const loading = stacksLoading || resourcesLoading;

  const combinedStacks = [...curatedStacks, ...stacks.filter(s => !curatedStacks.find(c => c.id === s.id))];

  const handleSaveStack = async (stack: typeof curatedStacks[0] | any) => {
    if (!user) {
      alert("Please log in to save stacks.");
      return;
    }
    
    setSaveLoading(stack.id);
    try {
      // Fetch existing links to prevent duplicates
      const q = query(collection(db, `users/${user.uid}/links`));
      const existingLinksSnap = await getDocs(q);
      const existingUrls = new Set(existingLinksSnap.docs.map(d => d.data().url));

      const batch = writeBatch(db);
      
      // Save stack
      const stackRef = doc(db, `users/${user.uid}/stacks`, stack.id);
      batch.set(stackRef, {
        title: stack.title,
        description: stack.description,
        isPublic: false,
        userId: user.uid,
        createdAt: serverTimestamp(),
        links: stack.links
      }, { merge: true });

      // Save links
      stack.links.forEach((link: { url: string; title: string; description?: string }) => {
        if (!existingUrls.has(link.url)) {
          const linkRef = doc(collection(db, `users/${user.uid}/links`));
          batch.set(linkRef, {
            url: link.url,
            title: link.title,
            description: link.description || '',
            category: stack.category || '',
            is_favorite: false,
            is_archived: false,
            tags: [stack.title],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
      });

      await batch.commit();
      setSavedStacks(prev => new Set(prev).add(stack.id));
    } catch (err) {
      console.error(err);
      alert("Failed to save stack.");
    } finally {
      setSaveLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-editorial-bg pt-0 pb-20">
      {/* Page header */}
      <div className="px-12 pt-16 pb-12 border-b border-editorial-text/15">
        <div className="flex flex-col gap-4 max-w-4xl">
          <span className="text-xs uppercase tracking-widest text-editorial-text/50 font-sans">
            Curated Collections & Resources
          </span>
          <h1 className="text-5xl md:text-7xl font-serif text-editorial-text leading-tight tracking-tight">
            Explore
          </h1>
          <p className="text-lg text-editorial-text/60 mt-2 font-sans flex items-center gap-2">
            <Compass className="w-5 h-5 text-editorial-text/40" />
            Discover tools, platforms, and hand-picked bundles to supercharge your workflow
          </p>
        </div>
      </div>

      <div className="p-12 space-y-24">
        {loading && combinedStacks.length === 0 ? (
          <div className="text-editorial-text/50 font-serif italic">Loading collections...</div>
        ) : (
          <>
            {/* Curated Resources Section */}
            {resources.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-12">
                  <h2 className="text-4xl font-serif text-editorial-text leading-tight">Curated Categories</h2>
                  <div className="flex-1 h-px bg-editorial-text/15"></div>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="border border-editorial-text/15 p-10 flex flex-col gap-8 bg-editorial-bg"
                    >
                      <div>
                        <h3 className="text-3xl font-serif text-editorial-text leading-tight mb-3">
                          {resource.category}
                        </h3>
                      </div>
                      
                      {resource.items && resource.items.length > 0 ? (
                        <ul className="space-y-0 border-t border-editorial-text/15 pt-4">
                          {resource.items.map((tool) => (
                            <li key={tool.id} className="flex items-center justify-between py-4 border-b border-editorial-text/10 last:border-0 group">
                              <div className="flex items-center gap-4 min-w-0">
                                {tool.faviconUrl ? (
                                  <img src={tool.faviconUrl} alt="" className="w-6 h-6 rounded-sm opacity-80" />
                                ) : (
                                  <div className="w-6 h-6 rounded-sm bg-editorial-text/5 border border-editorial-text/20 flex items-center justify-center text-[10px] font-sans uppercase text-editorial-text/40">
                                    {tool.title.charAt(0)}
                                  </div>
                                )}
                                <div className="flex flex-col min-w-0">
                                  <span className="font-serif text-xl text-editorial-text group-hover:underline underline-offset-4 decoration-1 truncate">
                                    {tool.title}
                                  </span>
                                  {tool.description && (
                                    <span className="text-sm text-editorial-text/50 font-sans truncate">
                                      {tool.description}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <a
                                href={tool.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 ml-4 w-8 h-8 flex items-center justify-center border border-editorial-text/20 hover:border-editorial-text transition-colors bg-editorial-bg"
                                aria-label={`Visit ${tool.title}`}
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-editorial-text" />
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-editorial-text/40 text-sm font-sans italic border-t border-editorial-text/15 pt-4">
                          No items in this category.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Featured Stacks Section */}
            <section>
              <div className="flex items-center gap-4 mb-12">
                <h2 className="text-4xl font-serif text-editorial-text leading-tight">Featured Stacks</h2>
                <div className="flex-1 h-px bg-editorial-text/15"></div>
              </div>
              
              {combinedStacks.length === 0 ? (
                <div className="text-editorial-text/50 font-serif italic">Curated stacks are being prepared.</div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {combinedStacks.map((stack) => {
                    const isSaved = savedStacks.has(stack.id);
                    const isSaving = saveLoading === stack.id;
                    
                    return (
                    <div
                      key={stack.id}
                      className="border border-editorial-text/15 p-10 flex flex-col gap-8 transition-colors hover:border-editorial-text/40 bg-editorial-bg"
                    >
                      {/* Stack header */}
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="text-3xl font-serif text-editorial-text leading-tight mb-3">
                            {stack.title}
                          </h3>
                          {stack.description && (
                            <p className="text-editorial-text/70 font-sans leading-relaxed">
                              {stack.description}
                            </p>
                          )}
                        </div>
                        {stack.category && (
                          <span className="px-3 py-1 bg-editorial-text/5 border border-editorial-text/10 text-xs uppercase tracking-widest text-editorial-text/60 font-sans whitespace-nowrap">
                            {stack.category}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm font-sans text-editorial-text/50">
                        <span className="flex items-center gap-1">
                          <Layers className="w-4 h-4" />
                          {stack.links?.length || 0} links
                        </span>
                      </div>

                      {/* Tools list preview */}
                      {stack.links && stack.links.length > 0 ? (
                        <ul className="space-y-0 border-t border-editorial-text/15 pt-4">
                          {stack.links.slice(0, 3).map((tool: { id: string; url: string; title: string; description?: string }) => (
                            <li key={tool.id} className="flex items-center justify-between py-4 border-b border-editorial-text/10 last:border-0 group">
                              <div className="flex items-baseline gap-4 min-w-0">
                                <span className="font-serif text-xl text-editorial-text group-hover:underline underline-offset-4 decoration-1">
                                  {tool.title}
                                </span>
                                {tool.description && (
                                  <span className="text-sm text-editorial-text/50 font-sans truncate">
                                    {tool.description}
                                  </span>
                                )}
                              </div>
                              <a
                                href={tool.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 w-8 h-8 flex items-center justify-center border border-editorial-text/20 hover:border-editorial-text transition-colors bg-editorial-bg"
                                aria-label={`Visit ${tool.title}`}
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-editorial-text" />
                              </a>
                            </li>
                          ))}
                          {stack.links.length > 3 && (
                            <li className="py-4 text-sm font-sans text-editorial-text/50 italic text-center">
                              + {stack.links.length - 3} more links
                            </li>
                          )}
                        </ul>
                      ) : (
                        <p className="text-editorial-text/40 text-sm font-sans italic border-t border-editorial-text/15 pt-4">
                          This stack is empty.
                        </p>
                      )}

                      {/* Save Button */}
                      <div className="mt-auto pt-6">
                        <button
                          onClick={() => handleSaveStack(stack)}
                          disabled={isSaved || isSaving || !user}
                          className={`w-full py-4 flex items-center justify-center gap-2 border transition-all font-sans tracking-wide ${
                            isSaved 
                              ? 'bg-editorial-text/5 border-editorial-text/20 text-editorial-text/50 cursor-not-allowed'
                              : 'bg-editorial-text text-editorial-bg hover:bg-editorial-text/90'
                          }`}
                        >
                          {isSaved ? (
                            <>
                              <Check className="w-4 h-4" />
                              Saved to Library
                            </>
                          ) : isSaving ? (
                            'Saving...'
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              Save Stack
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
