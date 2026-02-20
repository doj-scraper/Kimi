// Core category types
export type ProjectCategory = 'webpages' | 'webapps' | 'webtools' | 'articles';
export type RouteCategory = ProjectCategory | 'about' | 'home';

// Content item base interface for scalable content
export interface ContentItemBase {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: ProjectCategory;
  date: string;
  tags: string[];
  image: string;
  status?: 'draft' | 'published' | 'archived';
}

// Project-specific type (for webapps)
export interface ProjectItem extends ContentItemBase {
  category: 'webapps';
  tech: string[];
  featured?: boolean;
}

// Webpage/Design type
export interface WebpageItem extends ContentItemBase {
  category: 'webpages';
  type: 'Landing' | 'Mobile' | 'System' | 'Branding';
  description: string;
}

// Tool type
export interface WebtoolItem extends ContentItemBase {
  category: 'webtools';
  icon: string;
  demoUrl: string;
}

// Article type
export interface ArticleItem extends ContentItemBase {
  category: 'articles';
  readTime: string;
  excerpt: string;
  content: string;
}

// Union type for all content
export type ContentItem = ProjectItem | WebpageItem | WebtoolItem | ArticleItem;

// Drawer content for info panel
export interface DrawerContent {
  title: string;
  description: string;
  path: string;
}

// Strict drawer content map
export type DrawerContentMap = Record<RouteCategory, DrawerContent>;

// Search index entry for command palette
export interface SearchIndexEntry {
  id: string;
  slug: string;
  title: string;
  category: RouteCategory;
  type: 'nav' | 'content';
  excerpt?: string;
}

// Explorer tree node for file system navigation
export interface ExplorerTreeNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  category?: RouteCategory;
  children?: ExplorerTreeNode[];
  meta?: {
    date?: string;
    size?: string;
  };
}

// Legacy types for backwards compatibility during migration
export interface LegacyProject {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  tech: string[];
  featured?: boolean;
}

export interface LegacyTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  demoUrl: string;
}

export interface LegacyArticle {
  id: string;
  title: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: string;
}

export interface LegacyDesignItem {
  id: string;
  title: string;
  image: string;
  type: 'Landing' | 'Mobile' | 'System' | 'Branding';
  date: string;
  description: string;
  tags: string[];
}
