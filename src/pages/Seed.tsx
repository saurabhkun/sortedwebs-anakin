import { useState } from 'react';
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';

export default function Seed() {
  const { user } = useAuth();
  const [status, setStatus] = useState('Idle');

  const handleSeed = async () => {
    if (!user) {
      setStatus('Must be logged in to seed.');
      return;
    }

    setStatus('Seeding...');
    try {
      const batch = writeBatch(db);

      // Seed publicResources
      const resourcesData = [
        {
          category: 'AI Tools', order: 1, items: [
            { id: 'ai1', title: 'ChatGPT', url: 'https://chatgpt.com', category: 'AI Tools', description: 'Advanced conversational AI model by OpenAI.' },
            { id: 'ai2', title: 'Claude', url: 'https://claude.ai', category: 'AI Tools', description: 'Next-generation AI assistant by Anthropic.' },
            { id: 'ai3', title: 'Perplexity', url: 'https://perplexity.ai', category: 'AI Tools', description: 'AI-powered search engine and research assistant.' },
            { id: 'ai4', title: 'Gemini', url: 'https://gemini.google.com', category: 'AI Tools', description: 'Google\'s largest and most capable AI model.' },
            { id: 'ai5', title: 'Hugging Face', url: 'https://huggingface.co', category: 'AI Tools', description: 'The AI community building the future.' }
          ]
        },
        {
          category: 'Dev Tools', order: 2, items: [
            { id: 'dev1', title: 'GitHub', url: 'https://github.com', category: 'Dev Tools', description: 'Where the world builds software.' },
            { id: 'dev2', title: 'GitLab', url: 'https://gitlab.com', category: 'Dev Tools', description: 'The comprehensive DevSecOps platform.' },
            { id: 'dev3', title: 'Vercel', url: 'https://vercel.com', category: 'Dev Tools', description: 'Develop. Preview. Ship. For the best frontend teams.' },
            { id: 'dev4', title: 'Netlify', url: 'https://netlify.com', category: 'Dev Tools', description: 'The modern web development platform.' },
            { id: 'dev5', title: 'Stack Overflow', url: 'https://stackoverflow.com', category: 'Dev Tools', description: 'Where developers learn, share, & build careers.' },
            { id: 'dev6', title: 'MDN Docs', url: 'https://developer.mozilla.org', category: 'Dev Tools', description: 'Resources for developers, by developers.' }
          ]
        },
        {
          category: 'Design', order: 3, items: [
            { id: 'des1', title: 'Figma', url: 'https://figma.com', category: 'Design', description: 'The collaborative interface design tool.' },
            { id: 'des2', title: 'Framer', url: 'https://framer.com', category: 'Design', description: 'Design sites, intuitively. Ship them, instantly.' },
            { id: 'des3', title: 'Dribbble', url: 'https://dribbble.com', category: 'Design', description: 'Discover the world\'s top designers & creatives.' },
            { id: 'des4', title: 'Behance', url: 'https://behance.net', category: 'Design', description: 'Showcase and discover creative work.' },
            { id: 'des5', title: 'Coolors', url: 'https://coolors.co', category: 'Design', description: 'The super fast color palettes generator!' }
          ]
        },
        {
          category: 'Learning', order: 4, items: [
            { id: 'learn1', title: 'LeetCode', url: 'https://leetcode.com', category: 'Learning', description: 'The World\'s Leading Online Programming Learning Platform.' },
            { id: 'learn2', title: 'Codeforces', url: 'https://codeforces.com', category: 'Learning', description: 'Programming competitions and contests.' },
            { id: 'learn3', title: 'CodeChef', url: 'https://codechef.com', category: 'Learning', description: 'Competitive Programming Community.' },
            { id: 'learn4', title: 'GeeksforGeeks', url: 'https://geeksforgeeks.org', category: 'Learning', description: 'A computer science portal for geeks.' },
            { id: 'learn5', title: 'freeCodeCamp', url: 'https://freecodecamp.org', category: 'Learning', description: 'Learn to code - for free.' },
            { id: 'learn6', title: 'Coursera', url: 'https://coursera.org', category: 'Learning', description: 'Build Skills with Online Courses from Top Institutions.' }
          ]
        },
        {
          category: 'Research', order: 5, items: [
            { id: 'res1', title: 'Google Scholar', url: 'https://scholar.google.com', category: 'Research', description: 'Search across a wide variety of disciplines and sources.' },
            { id: 'res2', title: 'arXiv', url: 'https://arxiv.org', category: 'Research', description: 'Open access scholarly articles.' },
            { id: 'res3', title: 'ResearchGate', url: 'https://researchgate.net', category: 'Research', description: 'Discover scientific knowledge and stay connected to the world of science.' }
          ]
        },
        {
          category: 'Productivity', order: 6, items: [
            { id: 'prod1', title: 'Notion', url: 'https://notion.so', category: 'Productivity', description: 'Your connected workspace for wiki, docs & projects.' },
            { id: 'prod2', title: 'Obsidian', url: 'https://obsidian.md', category: 'Productivity', description: 'Sharpen your thinking.' },
            { id: 'prod3', title: 'Trello', url: 'https://trello.com', category: 'Productivity', description: 'Manage your team\'s projects from anywhere.' },
            { id: 'prod4', title: 'Linear', url: 'https://linear.app', category: 'Productivity', description: 'A better way to build products.' }
          ]
        },
        {
          category: 'Finance', order: 7, items: [
            { id: 'fin1', title: 'Zerodha', url: 'https://zerodha.com', category: 'Finance', description: 'India\'s largest retail stockbroker.' },
            { id: 'fin2', title: 'TradingView', url: 'https://tradingview.com', category: 'Finance', description: 'Track All Markets.' },
            { id: 'fin3', title: 'Investopedia', url: 'https://investopedia.com', category: 'Finance', description: 'Sharpen your financial knowledge.' }
          ]
        },
        {
          category: 'Entertainment', order: 8, items: [
            { id: 'ent1', title: 'YouTube', url: 'https://youtube.com', category: 'Entertainment', description: 'Enjoy the videos and music you love.' },
            { id: 'ent2', title: 'Spotify', url: 'https://spotify.com', category: 'Entertainment', description: 'Listening is everything.' },
            { id: 'ent3', title: 'IMDb', url: 'https://imdb.com', category: 'Entertainment', description: 'Ratings, Reviews, and Where to Watch the Best Movies & TV Shows.' }
          ]
        }
      ];

      resourcesData.forEach(resource => {
        const ref = doc(collection(db, 'publicResources'));
        batch.set(ref, resource);
      });

      // Seed publicStacks
      const stacksData = [
        {
          title: 'Frontend Starter Pack',
          description: 'Essential tools for modern frontend web development.',
          userId: user.uid,
          isPublic: true,
          createdAt: serverTimestamp(),
          links: [
            { id: 'fs1', title: 'Figma', url: 'https://figma.com', category: 'Design' },
            { id: 'fs2', title: 'MDN Docs', url: 'https://developer.mozilla.org', category: 'Dev Tools' },
            { id: 'fs3', title: 'GitHub', url: 'https://github.com', category: 'Dev Tools' },
            { id: 'fs4', title: 'Vercel', url: 'https://vercel.com', category: 'Dev Tools' }
          ]
        },
        {
          title: 'AI Builder Pack',
          description: 'A collection of the most powerful LLMs and AI platforms.',
          userId: user.uid,
          isPublic: true,
          createdAt: serverTimestamp(),
          links: [
            { id: 'ai1', title: 'ChatGPT', url: 'https://chatgpt.com', category: 'AI Tools' },
            { id: 'ai2', title: 'Claude', url: 'https://claude.ai', category: 'AI Tools' },
            { id: 'ai3', title: 'Perplexity', url: 'https://perplexity.ai', category: 'AI Tools' },
            { id: 'ai4', title: 'Hugging Face', url: 'https://huggingface.co', category: 'AI Tools' }
          ]
        },
        {
          title: 'Competitive Programming Pack',
          description: 'Top platforms to practice algorithms and participate in contests.',
          userId: user.uid,
          isPublic: true,
          createdAt: serverTimestamp(),
          links: [
            { id: 'cp1', title: 'Codeforces', url: 'https://codeforces.com', category: 'Learning' },
            { id: 'cp2', title: 'LeetCode', url: 'https://leetcode.com', category: 'Learning' },
            { id: 'cp3', title: 'CodeChef', url: 'https://codechef.com', category: 'Learning' }
          ]
        },
        {
          title: 'Research Pack',
          description: 'Find and manage academic papers effortlessly.',
          userId: user.uid,
          isPublic: true,
          createdAt: serverTimestamp(),
          links: [
            { id: 'rp1', title: 'Google Scholar', url: 'https://scholar.google.com', category: 'Research' },
            { id: 'rp2', title: 'arXiv', url: 'https://arxiv.org', category: 'Research' },
            { id: 'rp3', title: 'ResearchGate', url: 'https://researchgate.net', category: 'Research' }
          ]
        }
      ];

      stacksData.forEach(stack => {
        const ref = doc(collection(db, 'publicStacks'));
        batch.set(ref, stack);
      });

      await batch.commit();
      setStatus('Successfully seeded public resources and stacks!');
    } catch (err: any) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-editorial-bg flex flex-col items-center justify-center p-12">
      <h1 className="text-4xl font-serif text-editorial-text mb-8">Seed Database</h1>
      <button 
        onClick={handleSeed}
        className="btn-editorial-primary px-8 py-3 uppercase tracking-widest text-sm mb-4"
      >
        Run Seed
      </button>
      <p className="text-editorial-text/70">{status}</p>
    </div>
  );
}
