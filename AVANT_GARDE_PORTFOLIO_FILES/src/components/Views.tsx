import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, Code, Cpu, Eye, Layout, Terminal, Clock, X, Calendar, 
  Globe, Server, Shield, Activity, Layers 
} from 'lucide-react';
import { PROJECTS, TOOLS, ARTICLES, DESIGNS, getContentBySlug } from '../content';
import type { WebpageItem, ProjectItem, ArticleItem } from '../content';

const CardHover: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="group relative h-full bg-surface border border-white/5 hover:border-white/20 transition-all duration-500 hover:bg-surfaceHighlight hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] cursor-pointer overflow-hidden rounded-xl">
    {children}
  </div>
);

// --- Profile View (About) ---

export const ProfileView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 pb-32 animate-fade-in font-sans">
       {/* Header / Intro */}
       <div className="mb-12 border-b border-white/10 pb-8">
         <div className="text-xs font-mono text-pink-500 mb-2 tracking-widest uppercase">:: Operator_Dossier ::</div>
         <h2 className="text-4xl md:text-5xl font-light text-white mb-6 tracking-tight">CHRISTOPHER_RODRIGUEZ</h2>
         <p className="text-zinc-400 leading-relaxed text-lg font-light max-w-2xl">
           I architect production-grade web systems where performance, type safety, and stability are non-negotiable.
           My work spans high-complexity frontend environments—from real-time Web Audio to DevOps dashboards—designed under worst-case assumptions and built with strict TypeScript discipline.
         </p>
       </div>

       {/* Domain Expertise */}
       <div className="mb-12">
          <h3 className="text-sm font-mono text-blue-400 mb-6 flex items-center gap-2">
            <span>// DOMAIN_EXPERTISE</span>
            <div className="h-[1px] bg-blue-400/20 flex-1" />
          </h3>
          <p className="text-zinc-300 mb-6 font-light">
            I specialize in high-complexity environments where architectural decisions matter more than surface-level polish.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Real-time Web Audio', desc: 'Implementing low-latency signal chains and browser-based mastering suites.', icon: Activity },
              { title: 'Performance Visualization', desc: 'Designing high-frequency pipelines for DevOps and data-heavy internal dashboards.', icon: Layers },
              { title: 'Platform Agnostic', desc: 'Operating fluidly across Linux, macOS, Windows, and mobile environments, optimizing for platform-specific constraints.', icon: Globe },
              { title: 'Systems Origins', desc: 'Shaped by a background in Supply Chain Management, I approach software in terms of flows, constraints, and failure modes.', icon: Server }
            ].map(item => (
              <div key={item.title} className="bg-white/5 p-5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                    <item.icon className="w-4 h-4 text-blue-400" />
                    <h4 className="text-white font-medium text-sm">{item.title}</h4>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
       </div>

       {/* AI Integration */}
       <div className="mb-12">
          <h3 className="text-sm font-mono text-green-400 mb-6 flex items-center gap-2">
            <span>// AI_&_SYSTEMS_INTEGRATION</span>
            <div className="h-[1px] bg-green-400/20 flex-1" />
          </h3>
          <p className="text-zinc-300 mb-6 font-light">
             I design AI-integrated systems with an emphasis on operational usefulness, not novelty.
             Rather than treating AI as a surface-level feature, I focus on how intelligent components interact with real production constraints—latency budgets, observability, and human-in-the-loop workflows. My work prioritizes systems that degrade gracefully and remain auditable under imperfect conditions.
          </p>
          <ul className="space-y-4">
             {[
               { title: 'AI-Augmented Interfaces', desc: 'Designing tools where models assist decision-making without obscuring user control.' },
               { title: 'Workflow Integration', desc: 'Embedding LLM-driven capabilities into existing systems to reduce operational friction.' },
               { title: 'Reliability & Guardrails', desc: 'Architecting fallback paths and deterministic boundaries around non-deterministic systems.' },
               { title: 'Model-Agnostic Design', desc: 'Building pipelines that remain portable as underlying models evolve.' }
             ].map((item, i) => (
                <li key={i} className="flex gap-4 group">
                   <span className="font-mono text-green-500/50 text-xs mt-1">0{i+1}</span>
                   <div>
                      <strong className="text-white font-normal block mb-1 group-hover:text-green-400 transition-colors">{item.title}</strong>
                      <span className="text-zinc-500 text-sm leading-relaxed">{item.desc}</span>
                   </div>
                </li>
             ))}
          </ul>
       </div>

       {/* Security */}
       <div className="mb-12">
          <h3 className="text-sm font-mono text-purple-400 mb-6 flex items-center gap-2">
            <span>// SECURITY_&_RESILIENCE</span>
            <div className="h-[1px] bg-purple-400/20 flex-1" />
          </h3>
          <p className="text-zinc-300 mb-6 font-light">
             I focus on cryptographic agility and post-quantum readiness, ensuring platforms remain resilient as security assumptions evolve.
             Theoretical security often fails at the last mile—where protocols encounter browser engines, mobile runtimes, and real-world performance limits. I work at this boundary.
          </p>
          
           <div className="grid grid-cols-1 gap-4">
              <div className="bg-white/5 border border-purple-500/20 p-4 rounded-lg flex flex-col md:flex-row gap-4 items-start md:items-center">
                 <Shield className="w-8 h-8 text-purple-400 shrink-0" />
                 <div className="flex-1">
                    <h4 className="text-white text-sm font-medium mb-1">Post-Quantum Readiness</h4>
                    <p className="text-zinc-500 text-xs">Designing systems that transition safely toward post-quantum cryptographic models.</p>
                 </div>
                 <div className="flex gap-2 flex-wrap">
                    {['Hybrid Encryption', 'Lattice-based KEMs', 'Key Agility'].map(tag => (
                      <span key={tag} className="px-2 py-1 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">{tag}</span>
                    ))}
                 </div>
              </div>
           </div>
       </div>

       {/* Footer / Availability */}
       <div className="p-6 bg-[#0a0a0a] rounded-2xl border border-white/10 font-mono text-xs text-zinc-400 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-y-2 gap-x-4">
            <span className="text-zinc-600 uppercase tracking-widest">LOC:</span>
            <span className="text-white">Portland, OR (PDX_NODE)</span>
            
            <span className="text-zinc-600 uppercase tracking-widest">FOCUS:</span>
            <span className="text-white">Frontend Architecture · AI-Enabled Tooling · Systems Consulting</span>
            
            <span className="text-zinc-600 uppercase tracking-widest">PHILOSOPHY:</span>
            <span className="text-white">Systems over spectacle. Reliability over excess.</span>
          </div>
       </div>

    </div>
  );
};

// --- Splash View (Home/Boot) ---

export const SplashView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in">
       <div className="relative mb-12 group">
         <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 via-blue-500 to-green-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
         <div className="w-32 h-32 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center shadow-2xl relative z-10">
            <Globe className="w-12 h-12 text-white/80" />
         </div>
       </div>
       
       <h1 className="text-6xl md:text-8xl font-thin tracking-tighter text-white mb-8">
         C. Rodriguez
       </h1>
       
       <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed mb-16 font-light">
         Senior Frontend Architect & Digital Craftsman. <br/>
         Building high-performance interfaces and scalable systems.
       </p>
       
       <div className="flex gap-6">
         <button onClick={() => navigate('/projects/webpages')} className="px-8 py-4 rounded-full bg-white text-black font-medium text-sm hover:bg-zinc-200 transition-colors tracking-widest uppercase">
           View Work
         </button>
         <button onClick={() => navigate('/about')} className="px-8 py-4 rounded-full border border-white/20 text-white font-medium text-sm hover:bg-white/10 transition-colors tracking-widest uppercase">
           Operator Dossier
         </button>
       </div>
    </div>
  );
};

// --- Webapps View ---

export const WebappsView: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 p-8 pb-32 animate-fade-in max-w-5xl mx-auto">
      <div className="col-span-full mb-4">
        <h2 className="text-2xl font-light text-white">Web Applications</h2>
        <p className="text-zinc-500 text-sm">Full-scale production builds.</p>
      </div>
      
      {PROJECTS.map((project) => (
        <CardHover key={project.id}>
            <div className="aspect-video relative overflow-hidden">
              <img src={project.image} alt={project.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
              
              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                 <span className="text-[10px] uppercase tracking-wider text-white">{project.tags[0] || 'Project'}</span>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-light text-white mb-2 group-hover:text-blue-400 transition-colors">{project.title}</h3>
              <p className="text-sm text-zinc-400 line-clamp-2 mb-4">{project.summary}</p>
              <div className="flex gap-2 flex-wrap">
                {project.tech.map(t => (
                  <span key={t} className="text-[10px] border border-white/10 px-2 py-1 rounded-md text-zinc-500 bg-white/5">{t}</span>
                ))}
              </div>
            </div>
        </CardHover>
      ))}
    </div>
  );
};

// --- Webtools View ---

export const WebtoolsView: React.FC = () => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Braces': return <Code className="w-6 h-6" />;
      case 'Key': return <Terminal className="w-6 h-6" />;
      case 'Regex': return <Cpu className="w-6 h-6" />;
      case 'Eye': return <Eye className="w-6 h-6" />;
      case 'Grid': return <Layout className="w-6 h-6" />;
      default: return <Box className="w-6 h-6" />;
    }
  };

  return (
    <div className="p-8 pb-32 animate-fade-in max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-light text-white">Dev Utilities</h2>
        <p className="text-zinc-500 text-sm">Micro-tools for workflow automation.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {TOOLS.map((tool) => (
          <div key={tool.id} className="bg-surface border border-white/5 p-6 hover:border-amber-400/50 hover:bg-white/5 transition-all duration-300 rounded-xl group flex flex-col justify-between h-40">
            <div className="text-zinc-500 group-hover:text-amber-400 transition-colors">
              {getIcon(tool.icon)}
            </div>
            <div>
              <h4 className="text-base font-medium text-white mb-1">{tool.title}</h4>
              <p className="text-[10px] text-zinc-500 line-clamp-2">{tool.summary}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Articles View ---

export const ArticlesView: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto p-8 pb-32 animate-fade-in">
      <div className="mb-8">
         <h2 className="text-2xl font-light text-white">Documentation</h2>
         <p className="text-zinc-500 text-sm">Research and technical writing.</p>
      </div>
      <div className="space-y-4">
        {ARTICLES.map((article) => (
          <article key={article.id} className="group cursor-pointer bg-surface border border-white/5 p-6 rounded-xl hover:border-emerald-400/30 transition-all">
            <div className="flex justify-between items-start mb-2">
               <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">{article.date}</span>
               <span className="text-[10px] text-zinc-600 flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime}</span>
            </div>
            <h3 className="text-xl font-light text-white mb-2 group-hover:text-emerald-400 transition-colors">
              {article.title}
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {article.excerpt}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
};

// --- Webpages View ---

export const WebpagesView: React.FC = () => {
  const [selectedDesign, setSelectedDesign] = useState<WebpageItem | null>(null);

  return (
    <>
      <div className="p-8 pb-32 animate-fade-in max-w-6xl mx-auto">
        <div className="mb-8">
           <h2 className="text-2xl font-light text-white">Visual & UI</h2>
           <p className="text-zinc-500 text-sm">Interface exploration and design systems.</p>
        </div>
        
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {DESIGNS.map((design) => (
            <div 
              key={design.id} 
              onClick={() => setSelectedDesign(design)}
              className="break-inside-avoid relative group cursor-zoom-in overflow-hidden rounded-xl border border-white/5 bg-surface"
            >
              <img 
                src={design.image} 
                alt={design.title} 
                className="w-full h-auto grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <span className="text-[10px] text-pink-400 uppercase tracking-widest mb-1">{design.type}</span>
                <h4 className="text-lg text-white font-medium">{design.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDesign && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setSelectedDesign(null)} />
          <div className="relative bg-[#1a1a1a] border border-white/10 w-full max-w-4xl max-h-[80vh] overflow-hidden rounded-3xl flex flex-col md:flex-row shadow-2xl animate-in fade-in zoom-in-95">
            <button 
              onClick={() => setSelectedDesign(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-white hover:text-black text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Side */}
            <div className="w-full md:w-1/2 bg-black relative">
              <img 
                src={selectedDesign.image} 
                alt={selectedDesign.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent md:hidden" />
            </div>

            {/* Content Side */}
            <div className="w-full md:w-1/2 p-8 overflow-y-auto">
              <div>
                <span className="text-xs font-mono text-pink-400 uppercase tracking-widest mb-2 block">{selectedDesign.type}</span>
                <h2 className="text-3xl font-light text-white mb-6">{selectedDesign.title}</h2>
                
                <div className="flex items-center gap-2 text-zinc-500 text-xs mb-6 font-mono">
                  <Calendar className="w-3 h-3" />
                  <span>{selectedDesign.date}</span>
                </div>

                <p className="text-zinc-400 leading-relaxed text-sm mb-8">
                  {selectedDesign.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {selectedDesign.tags.map(tag => (
                    <span key={tag} className="text-[10px] border border-white/10 px-2 py-1 rounded-md text-zinc-500">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-white/5">
                <button className="w-full py-3 bg-white text-black rounded-lg text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors">
                  View Live Prototype
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// --- Detail Views for individual content items ---

export const ProjectDetailView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const project = slug ? getContentBySlug('webapps', slug) as ProjectItem | undefined : undefined;

  if (!project) {
    return (
      <div className="p-8 pb-32 animate-fade-in max-w-5xl mx-auto">
        <h2 className="text-2xl font-light text-white">Project not found</h2>
        <button onClick={() => navigate('/projects/webapps')} className="mt-4 text-blue-400 hover:underline">
          Back to Webapps
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 pb-32 animate-fade-in max-w-5xl mx-auto">
      <button onClick={() => navigate('/projects/webapps')} className="text-zinc-500 hover:text-white text-sm mb-6 flex items-center gap-2">
        ← Back to Webapps
      </button>
      
      <div className="aspect-video relative overflow-hidden rounded-xl mb-8">
        <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
      </div>

      <h1 className="text-4xl font-light text-white mb-4">{project.title}</h1>
      <p className="text-zinc-400 text-lg mb-6">{project.summary}</p>

      <div className="flex gap-2 flex-wrap mb-8">
        {project.tech.map(t => (
          <span key={t} className="text-sm border border-white/10 px-3 py-1 rounded-md text-zinc-400 bg-white/5">{t}</span>
        ))}
      </div>
    </div>
  );
};

export const WebpageDetailView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const design = slug ? getContentBySlug('webpages', slug) as WebpageItem | undefined : undefined;

  if (!design) {
    return (
      <div className="p-8 pb-32 animate-fade-in max-w-5xl mx-auto">
        <h2 className="text-2xl font-light text-white">Design not found</h2>
        <button onClick={() => navigate('/projects/webpages')} className="mt-4 text-pink-400 hover:underline">
          Back to Webpages
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 pb-32 animate-fade-in max-w-5xl mx-auto">
      <button onClick={() => navigate('/projects/webpages')} className="text-zinc-500 hover:text-white text-sm mb-6 flex items-center gap-2">
        ← Back to Webpages
      </button>
      
      <div className="aspect-video relative overflow-hidden rounded-xl mb-8">
        <img src={design.image} alt={design.title} className="w-full h-full object-cover" />
      </div>

      <span className="text-xs font-mono text-pink-400 uppercase tracking-widest mb-2 block">{design.type}</span>
      <h1 className="text-4xl font-light text-white mb-4">{design.title}</h1>
      <p className="text-zinc-400 text-lg mb-6">{design.description}</p>

      <div className="flex gap-2 flex-wrap mb-8">
        {design.tags.map(t => (
          <span key={t} className="text-sm border border-white/10 px-3 py-1 rounded-md text-zinc-400 bg-white/5">{t}</span>
        ))}
      </div>
    </div>
  );
};

export const ArticleDetailView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const article = slug ? getContentBySlug('articles', slug) as ArticleItem | undefined : undefined;

  if (!article) {
    return (
      <div className="p-8 pb-32 animate-fade-in max-w-5xl mx-auto">
        <h2 className="text-2xl font-light text-white">Article not found</h2>
        <button onClick={() => navigate('/projects/articles')} className="mt-4 text-emerald-400 hover:underline">
          Back to Articles
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 pb-32 animate-fade-in max-w-3xl mx-auto">
      <button onClick={() => navigate('/projects/articles')} className="text-zinc-500 hover:text-white text-sm mb-6 flex items-center gap-2">
        ← Back to Articles
      </button>
      
      <div className="flex justify-between items-start mb-6">
        <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">{article.date}</span>
        <span className="text-xs text-zinc-600 flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime}</span>
      </div>

      <h1 className="text-4xl font-light text-white mb-6">{article.title}</h1>
      
      <div className="prose prose-invert max-w-none">
        <p className="text-lg text-zinc-400 leading-relaxed mb-6">{article.excerpt}</p>
        <div className="text-zinc-300 leading-relaxed">
          {article.content}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mt-8 pt-8 border-t border-white/10">
        {article.tags.map(t => (
          <span key={t} className="text-sm border border-white/10 px-3 py-1 rounded-md text-zinc-400 bg-white/5">{t}</span>
        ))}
      </div>
    </div>
  );
};
