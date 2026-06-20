import { Link } from 'react-router-dom';

/* ── Editorial Typography Card ── */
function TypographyCard({
  title,
  subtitle,
  count,
  bgColorClass = "bg-editorial-bg",
  textColorClass = "text-editorial-text"
}: {
  title: string;
  subtitle: string;
  count: number;
  bgColorClass?: string;
  textColorClass?: string;
}) {
  return (
    <div className={`p-12 flex flex-col justify-between aspect-[3/4] border border-editorial-text/20 transition-all hover:border-editorial-text ${bgColorClass} ${textColorClass}`}>
      <div>
        <h3 className="font-serif text-4xl md:text-5xl uppercase leading-[0.9] tracking-tight whitespace-pre-line">
          {title}
        </h3>
      </div>
      <div>
        <p className="font-sans text-lg md:text-xl font-medium tracking-tight whitespace-pre-line mb-8 opacity-80">
          {subtitle}
        </p>
        <div className="font-sans text-xs uppercase tracking-widest opacity-60">
          {count} Resources
        </div>
      </div>
    </div>
  );
}

/* ── Feature Block ── */
function FeatureBlock({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-t border-editorial-text/20 pt-8">
      <h3 className="font-sans text-sm uppercase tracking-widest mb-6 font-semibold">{title}</h3>
      <p className="font-serif text-2xl md:text-3xl leading-snug text-editorial-text/90">
        {description}
      </p>
    </div>
  );
}

/* ── Collection Card ── */
function CollectionCard({ backgroundWord, title }: { backgroundWord: string; title: string }) {
  return (
    <div className="relative overflow-hidden border border-editorial-text/20 aspect-[16/9] md:aspect-auto md:h-64 flex items-center justify-center bg-editorial-bg group cursor-pointer hover:border-editorial-text transition-colors">
      <span className="absolute text-[8rem] md:text-[12rem] font-serif uppercase text-editorial-text/5 select-none pointer-events-none -z-0">
        {backgroundWord}
      </span>
      <h4 className="relative z-10 font-serif text-3xl md:text-4xl text-editorial-text group-hover:italic transition-all">
        {title}
      </h4>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-editorial-bg text-editorial-text selection:bg-editorial-text selection:text-editorial-bg">
      
      {/* ── Navbar ── */}
      <nav className="w-full py-8 px-8 flex items-center justify-between sticky top-0 bg-editorial-bg/90 backdrop-blur-sm z-50">
        <div className="font-serif text-xl tracking-tight uppercase">
          SortedWebs
        </div>
        
        <div className="hidden md:flex items-center gap-12 font-sans text-sm uppercase tracking-widest">
          <a href="#about" className="hover:opacity-50 transition-opacity">About</a>
          <a href="#collections" className="hover:opacity-50 transition-opacity">Collections</a>
          <Link to="/explore" className="hover:opacity-50 transition-opacity">Explore</Link>
        </div>

        <Link to="/library" className="font-sans text-sm uppercase tracking-widest border-b border-editorial-text pb-0.5 hover:opacity-50 transition-opacity">
          Enter Archive
        </Link>
      </nav>

      <main>
        {/* ── Hero ── */}
        <section className="px-8 pt-32 pb-40 max-w-7xl mx-auto flex flex-col items-center text-center">
          <h1 className="text-[12vw] leading-[0.8] font-serif uppercase tracking-tighter mb-12">
            SORTEDWEBS
          </h1>
          
          <h2 className="text-3xl md:text-5xl font-serif italic mb-10 text-editorial-text/90">
            Your personal archive for the internet.
          </h2>
          
          <p className="max-w-xl text-lg md:text-xl font-sans leading-relaxed text-editorial-text/70 mb-16">
            Save websites.<br/>
            Build collections.<br/>
            Rediscover knowledge.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Link to="/library" className="bg-editorial-text text-editorial-bg px-10 py-5 font-sans text-sm uppercase tracking-widest hover:bg-editorial-text/80 transition-colors">
              Start Collecting
            </Link>
            <Link to="/explore" className="border border-editorial-text px-10 py-5 font-sans text-sm uppercase tracking-widest hover:bg-editorial-text/5 transition-colors">
              Explore Stacks
            </Link>
          </div>
        </section>

        {/* ── Feature Blocks ── */}
        <section id="about" className="px-8 py-32 max-w-7xl mx-auto border-t border-editorial-text/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
            <FeatureBlock 
              title="COLLECT" 
              description="Capture useful websites before they disappear into forgotten browser folders." 
            />
            <FeatureBlock 
              title="ORGANIZE" 
              description="Build collections around ideas, projects, interests, and research." 
            />
            <FeatureBlock 
              title="DISCOVER" 
              description="Explore curated stacks assembled by builders, designers, and learners." 
            />
          </div>
        </section>

        {/* ── Typography Cards ── */}
        <section className="px-8 py-32 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TypographyCard 
              title={"DEVELOPER\nESSENTIALS"}
              subtitle={"Build.\nShip.\nScale."}
              count={128}
            />
            <TypographyCard 
              title={"AI\nPRODUCTIVITY"}
              subtitle={"Think.\nResearch.\nCreate."}
              count={84}
              bgColorClass="bg-[#2A2A2A]"
              textColorClass="text-[#F5F2EA]"
            />
            <TypographyCard 
              title={"RESEARCH\nDESK"}
              subtitle={"Read.\nLearn.\nUnderstand."}
              count={92}
            />
          </div>
        </section>

        {/* ── Collections ── */}
        <section id="collections" className="border-t border-editorial-text/20">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <CollectionCard backgroundWord="DEV" title="Developer Essentials" />
            <CollectionCard backgroundWord="ART" title="Design Inspiration" />
            <CollectionCard backgroundWord="SYS" title="Startup Toolkit" />
            <CollectionCard backgroundWord="WEB" title="Indie Hacker Stack" />
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-editorial-text/20 py-24 px-8 mt-32">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16">
          <div className="font-serif">
            <h4 className="text-3xl mb-4">SortedWebs</h4>
            <p className="text-editorial-text/70 italic text-lg">A personal archive for the internet.</p>
          </div>
          
          <div className="font-sans text-sm uppercase tracking-widest flex flex-col gap-8 md:text-right">
            <div>Built by Saurabh Gandhi</div>
            <div className="flex flex-col gap-3">
              <a href="https://github.com/saurabhkun" target="_blank" rel="noopener noreferrer" className="hover:opacity-50 transition-opacity">GitHub</a>
              <a href="https://www.linkedin.com/in/saurabh-gandhi-1421b2318/" target="_blank" rel="noopener noreferrer" className="hover:opacity-50 transition-opacity">LinkedIn</a>
              <a href="mailto:saurabhgandhi016@gmail.com" className="hover:opacity-50 transition-opacity">Email</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
