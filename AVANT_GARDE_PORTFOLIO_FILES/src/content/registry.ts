import type {
  ProjectItem,
  WebpageItem,
  WebtoolItem,
  ArticleItem,
  DrawerContentMap,
  SearchIndexEntry,
  ExplorerTreeNode,
} from './types';

// Drawer content with strict typing
export const DRAWER_CONTENT: DrawerContentMap = {
  home: {
    title: 'Welcome',
    description: 'This is the desktop environment of Christopher A. Rodriguez. Use the dock below to navigate through my digital workspace.',
    path: 'root/home.tsx'
  },
  about: {
    title: 'Profile',
    description: 'Christopher A. Rodriguez. Senior Frontend Architect specialized in React, WebGL, and High-Performance Interfaces.',
    path: 'root/users/chris/profile.md'
  },
  webpages: {
    title: 'Webpages & UI',
    description: 'A collection of visual experiences and interface designs. These projects focus on aesthetics, user experience, and visual storytelling.',
    path: 'src/pages/design/websites.tsx'
  },
  webapps: {
    title: 'Web Applications',
    description: 'Full-scale applications built to solve complex problems. These demonstrate architecture, state management, and backend integration.',
    path: 'src/apps/builds/production.tsx'
  },
  webtools: {
    title: 'Developer Tools',
    description: 'These are webtools which I have created for my own use, or was asked to create. A webtool is a specialized, single-function utility designed to automate repetitive tasks.',
    path: 'src/utils/tools.ts'
  },
  articles: {
    title: 'Documentation',
    description: 'Technical writing, research papers, and architectural decisions. A look into the theory behind the code.',
    path: 'src/content/posts.md'
  }
};

// Projects (webapps category)
export const PROJECTS: ProjectItem[] = [
  {
    id: 'p1',
    slug: 'nebula-stream',
    title: 'Nebula Stream',
    summary: 'High-throughput event streaming architecture for financial data analysis, processing 50k+ events/sec.',
    category: 'webapps',
    date: '2023',
    tags: ['Architecture', 'Streaming', 'Finance'],
    image: 'https://picsum.photos/id/16/800/600?grayscale',
    tech: ['Kafka', 'Rust', 'WebAssembly'],
    featured: true,
  },
  {
    id: 'p2',
    slug: 'aether-ui',
    title: 'Aether UI',
    summary: 'A composable, headless component library for enterprise dashboards used across 4 internal products.',
    category: 'webapps',
    date: '2023',
    tags: ['Design System', 'Enterprise', 'React'],
    image: 'https://picsum.photos/id/24/800/800?grayscale',
    tech: ['React', 'TypeScript', 'Storybook'],
  },
  {
    id: 'p3',
    slug: 'void-runner',
    title: 'Void Runner',
    summary: 'WebGL-based procedural runner exploring atmospheric depth and reactive audio visualization.',
    category: 'webapps',
    date: '2023',
    tags: ['Game Dev', 'WebGL', 'Audio'],
    image: 'https://picsum.photos/id/34/800/500?grayscale',
    tech: ['Three.js', 'GLSL', 'React-Three-Fiber'],
    featured: true,
  },
  {
    id: 'p4',
    slug: 'chronos',
    title: 'Chronos',
    summary: 'Kubernetes operator for temporal job scheduling at scale with self-healing capabilities.',
    category: 'webapps',
    date: '2023',
    tags: ['DevOps', 'K8s', 'Go'],
    image: 'https://picsum.photos/id/42/800/700?grayscale',
    tech: ['Go', 'K8s', 'Prometheus'],
  },
  {
    id: 'p5',
    slug: 'echo-chat',
    title: 'Echo Chat',
    summary: 'RAG-based chat interface with localized memory vectors and context-aware prompt engineering.',
    category: 'webapps',
    date: '2024',
    tags: ['AI', 'LLM', 'RAG'],
    image: 'https://picsum.photos/id/56/800/600?grayscale',
    tech: ['Python', 'LangChain', 'Postgres'],
  },
  {
    id: 'p6',
    slug: 'monolith-migration',
    title: 'Monolith Migration',
    summary: 'Legacy migration strategy and strangler fig implementation case study for a Series B fintech.',
    category: 'webapps',
    date: '2023',
    tags: ['Backend', 'Migration', 'Fintech'],
    image: 'https://picsum.photos/id/60/800/900?grayscale',
    tech: ['Java', 'Node.js', 'AWS'],
  },
];

// Designs (webpages category)
export const DESIGNS: WebpageItem[] = [
  {
    id: 'd1',
    slug: 'apex-finance-dashboard',
    title: 'Apex Finance Dashboard',
    summary: 'A comprehensive financial data visualization suite for high-frequency traders.',
    category: 'webpages',
    date: '2023',
    tags: ['Figma', 'Prototyping', 'Dark Mode'],
    image: 'https://picsum.photos/id/101/600/800?grayscale',
    type: 'System',
    description: 'A comprehensive financial data visualization suite for high-frequency traders. Focused on data density and legibility under high cognitive load.',
  },
  {
    id: 'd2',
    slug: 'lumina-ecommerce',
    title: 'Lumina E-Commerce',
    summary: 'Minimalist luxury fashion landing page.',
    category: 'webpages',
    date: '2023',
    tags: ['UI/UX', 'Animation', 'Web'],
    image: 'https://picsum.photos/id/202/600/900?grayscale',
    type: 'Landing',
    description: 'Minimalist luxury fashion landing page. The goal was to reduce friction and let the photography speak for itself. Implements micro-interactions for cart management.',
  },
  {
    id: 'd3',
    slug: 'neobank-mobile',
    title: 'NeoBank Mobile App',
    summary: 'A mobile-first banking experience designed for Gen Z.',
    category: 'webpages',
    date: '2024',
    tags: ['iOS', 'Mobile Design', 'App'],
    image: 'https://picsum.photos/id/301/600/1000?grayscale',
    type: 'Mobile',
    description: 'A mobile-first banking experience designed for Gen Z. Features gesture-based money transfers and social splitting features.',
  },
  {
    id: 'd4',
    slug: 'vortex-analytics',
    title: 'Vortex Analytics SaaS',
    summary: 'B2B Analytics platform interface.',
    category: 'webpages',
    date: '2022',
    tags: ['SaaS', 'B2B', 'Design System'],
    image: 'https://picsum.photos/id/401/600/700?grayscale',
    type: 'System',
    description: 'B2B Analytics platform interface. Created a custom graph library and design tokens to ensure consistency across the platform.',
  },
  {
    id: 'd5',
    slug: 'portfolio-v1',
    title: 'Portfolio V1 (Legacy)',
    summary: 'The previous iteration of my personal brand.',
    category: 'webpages',
    date: '2021',
    tags: ['Personal', 'Branding', 'Web'],
    image: 'https://picsum.photos/id/501/600/600?grayscale',
    type: 'Landing',
    description: 'The previous iteration of my personal brand. Brutalist typography mixed with soft gradients.',
  },
  {
    id: 'd6',
    slug: 'sonic-stream',
    title: 'Sonic Stream Player',
    summary: 'Concept for a high-fidelity music streaming app.',
    category: 'webpages',
    date: '2024',
    tags: ['Mobile', 'Concept', 'Music'],
    image: 'https://picsum.photos/id/600/600/850?grayscale',
    type: 'Mobile',
    description: 'Concept for a high-fidelity music streaming app. Focus on album art and immersive background adaptation.',
  },
];

// Tools (webtools category)
export const TOOLS: WebtoolItem[] = [
  { 
    id: 't1', 
    slug: 'json-diff',
    title: 'JSON Diff',
    summary: 'Semantic visual differ for JSON structures.',
    category: 'webtools',
    date: '2024',
    tags: ['Developer', 'JSON', 'Diff'],
    image: '',
    icon: 'Braces', 
    demoUrl: '#' 
  },
  { 
    id: 't2', 
    slug: 'jwt-decode',
    title: 'JWT Decode',
    summary: 'Client-side token inspector.',
    category: 'webtools',
    date: '2024',
    tags: ['Security', 'JWT', 'Auth'],
    image: '',
    icon: 'Key', 
    demoUrl: '#' 
  },
  { 
    id: 't3', 
    slug: 'regex-viz',
    title: 'RegEx Viz',
    summary: 'Visual state machine graph generator.',
    category: 'webtools',
    date: '2024',
    tags: ['Regex', 'Visualization', 'Graph'],
    image: '',
    icon: 'Regex', 
    demoUrl: '#' 
  },
  { 
    id: 't4', 
    slug: 'contrast',
    title: 'Contrast',
    summary: 'APCA contrast checker.',
    category: 'webtools',
    date: '2024',
    tags: ['A11y', 'Color', 'Design'],
    image: '',
    icon: 'Eye', 
    demoUrl: '#' 
  },
  { 
    id: 't5', 
    slug: 'grid-gen',
    title: 'Grid Gen',
    summary: 'Tailwind grid layouts generator.',
    category: 'webtools',
    date: '2024',
    tags: ['CSS', 'Tailwind', 'Layout'],
    image: '',
    icon: 'Grid', 
    demoUrl: '#' 
  },
  { 
    id: 't6', 
    slug: 'shadows',
    title: 'Shadows',
    summary: 'Smooth shadow layered generator.',
    category: 'webtools',
    date: '2024',
    tags: ['CSS', 'Effects', 'Design'],
    image: '',
    icon: 'Layers', 
    demoUrl: '#' 
  },
];

// Articles (articles category)
export const ARTICLES: ArticleItem[] = [
  {
    id: 'a1',
    slug: 'death-of-loading-spinner',
    title: 'The Death of the Loading Spinner',
    summary: 'Why skeletal UIs and optimistic updates are the only acceptable standard in modern web applications.',
    category: 'articles',
    date: '2023-10-12',
    tags: ['UI', 'UX', 'Performance'],
    image: '',
    readTime: '5 min',
    excerpt: 'Why skeletal UIs and optimistic updates are the only acceptable standard in modern web applications.',
    content: 'Full MDX content simulation would go here...',
  },
  {
    id: 'a2',
    slug: 'typescript-at-scale',
    title: 'TypeScript at Scale',
    summary: 'Managing monorepos with 100k+ lines of code without losing your sanity or build speed.',
    category: 'articles',
    date: '2023-11-04',
    tags: ['TypeScript', 'Monorepo', 'Architecture'],
    image: '',
    readTime: '8 min',
    excerpt: 'Managing monorepos with 100k+ lines of code without losing your sanity or build speed.',
    content: '...',
  },
  {
    id: 'a3',
    slug: 'designing-for-dark-mode',
    title: 'Designing for Dark Mode',
    summary: 'It is not just inverting colors. A deep dive into contrast ratios and saturation.',
    category: 'articles',
    date: '2023-12-15',
    tags: ['Design', 'Dark Mode', 'A11y'],
    image: '',
    readTime: '4 min',
    excerpt: 'It is not just inverting colors. A deep dive into contrast ratios and saturation.',
    content: '...',
  },
  {
    id: 'a4',
    slug: 'ai-copilot-not-captain',
    title: 'AI as a Co-Pilot, not a Captain',
    summary: 'Integrating LLMs into developer workflows requires a human-in-the-loop philosophy.',
    category: 'articles',
    date: '2024-01-10',
    tags: ['AI', 'LLM', 'Workflow'],
    image: '',
    readTime: '6 min',
    excerpt: 'Integrating LLMs into developer workflows requires a human-in-the-loop philosophy.',
    content: '...',
  },
  {
    id: 'a5',
    slug: 'state-management-2024',
    title: 'State Management in 2024',
    summary: 'Do we still need Redux? Exploring Signals, Atoms, and React Context.',
    category: 'articles',
    date: '2024-02-22',
    tags: ['React', 'State', 'Signals'],
    image: '',
    readTime: '10 min',
    excerpt: 'Do we still need Redux? Exploring Signals, Atoms, and React Context.',
    content: '...',
  },
  {
    id: 'a6',
    slug: 'fixed-frame-manifesto',
    title: 'The Fixed Frame Manifesto',
    summary: 'Why I chose to stop scrolling the body and start framing the content.',
    category: 'articles',
    date: '2024-03-01',
    tags: ['Design', 'CSS', 'Layout'],
    image: '',
    readTime: '3 min',
    excerpt: 'Why I chose to stop scrolling the body and start framing the content.',
    content: '...',
  },
];

// Lookup utilities
export function getContentByCategory(category: string) {
  switch (category) {
    case 'webapps': return PROJECTS;
    case 'webpages': return DESIGNS;
    case 'webtools': return TOOLS;
    case 'articles': return ARTICLES;
    default: return [];
  }
}

export function getContentBySlug(category: string, slug: string) {
  const items = getContentByCategory(category);
  return items.find(item => item.slug === slug);
}

// Build search index for command palette
export function buildSearchIndex(): SearchIndexEntry[] {
  const navItems: SearchIndexEntry[] = [
    { id: 'nav-home', slug: '', title: 'Home', category: 'home', type: 'nav' },
    { id: 'nav-about', slug: '', title: 'About', category: 'about', type: 'nav' },
    { id: 'nav-webpages', slug: '', title: 'Webpages', category: 'webpages', type: 'nav' },
    { id: 'nav-webapps', slug: '', title: 'Webapps', category: 'webapps', type: 'nav' },
    { id: 'nav-webtools', slug: '', title: 'Webtools', category: 'webtools', type: 'nav' },
    { id: 'nav-articles', slug: '', title: 'Articles', category: 'articles', type: 'nav' },
  ];

  const projectItems: SearchIndexEntry[] = PROJECTS.map(p => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    category: 'webapps',
    type: 'content',
    excerpt: p.summary,
  }));

  const designItems: SearchIndexEntry[] = DESIGNS.map(d => ({
    id: d.id,
    slug: d.slug,
    title: d.title,
    category: 'webpages',
    type: 'content',
    excerpt: d.summary,
  }));

  const articleItems: SearchIndexEntry[] = ARTICLES.map(a => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    category: 'articles',
    type: 'content',
    excerpt: a.excerpt,
  }));

  return [...navItems, ...projectItems, ...designItems, ...articleItems];
}

// Explorer tree structure
export function buildExplorerTree(): ExplorerTreeNode[] {
  return [
    {
      id: 'root',
      name: 'root',
      path: '/',
      type: 'folder',
      children: [
        {
          id: 'users',
          name: 'users',
          path: '/users',
          type: 'folder',
          children: [
            {
              id: 'chris',
              name: 'chris',
              path: '/about',
              type: 'folder',
              category: 'about',
              meta: { date: '2024' },
              children: [
                {
                  id: 'profile',
                  name: 'profile.md',
                  path: '/about',
                  type: 'file',
                  category: 'about',
                }
              ]
            }
          ]
        },
        {
          id: 'projects',
          name: 'projects',
          path: '/projects',
          type: 'folder',
          children: [
            {
              id: 'webpages',
              name: 'webpages',
              path: '/projects/webpages',
              type: 'folder',
              category: 'webpages',
              children: DESIGNS.map(d => ({
                id: d.id,
                name: `${d.slug}.tsx`,
                path: `/projects/webpages/${d.slug}`,
                type: 'file',
                category: 'webpages',
                meta: { date: d.date },
              }))
            },
            {
              id: 'webapps',
              name: 'webapps',
              path: '/projects/webapps',
              type: 'folder',
              category: 'webapps',
              children: PROJECTS.map(p => ({
                id: p.id,
                name: `${p.slug}.tsx`,
                path: `/projects/webapps/${p.slug}`,
                type: 'file',
                category: 'webapps',
                meta: { date: p.date },
              }))
            },
            {
              id: 'webtools',
              name: 'webtools',
              path: '/projects/webtools',
              type: 'folder',
              category: 'webtools',
              children: TOOLS.map(t => ({
                id: t.id,
                name: `${t.slug}.ts`,
                path: `/projects/webtools/${t.slug}`,
                type: 'file',
                category: 'webtools',
              }))
            },
            {
              id: 'articles',
              name: 'articles',
              path: '/projects/articles',
              type: 'folder',
              category: 'articles',
              children: ARTICLES.map(a => ({
                id: a.id,
                name: `${a.slug}.md`,
                path: `/projects/articles/${a.slug}`,
                type: 'file',
                category: 'articles',
                meta: { date: a.date },
              }))
            }
          ]
        }
      ]
    }
  ];
}
