# AVANT_GARDE_PORTFOLIO - Agent Documentation

## Project Overview

This is **AVANT_GARDE_PORTFOLIO**, a high-end, fixed-frame portfolio website for Christopher A Rodriguez. It features a desktop-environment-inspired interface with:

- **Infinite scrolling** content areas within a fixed frame
- **Cinema mode** aesthetic with dark theme
- **Keyboard shortcuts** for power-user navigation
- **WebGL liquid background** using Three.js and custom GLSL shaders
- **Command palette** search interface (Cmd+K)
- **Real-time weather** based on geolocation
- **Analog clock** and digital time displays

The site presents portfolio content across 6 categories: Home (splash), About (profile), Webpages (design gallery), Webapps (projects), Webtools (utilities), and Articles (technical writing).

---

## Technology Stack

| Layer | Technology | Version/Source |
|-------|-----------|----------------|
| Framework | React | 18.2.0 (via ESM.sh) |
| Renderer | ReactDOM | 18.2.0 (via ESM.sh) |
| Language | TypeScript | Implicit via .tsx files |
| Styling | Tailwind CSS | 3.x (via CDN) |
| 3D/WebGL | Three.js + React Three Fiber | 0.160.0 / 8.15.14 |
| Icons | Lucide React | 0.292.0 (via ESM.sh) |
| Build Tool | None | Pure ESM, no bundler |

### CDN Dependencies

All dependencies are loaded via ESM.sh CDN using import maps defined in `index.html`:

```html
<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@18.2.0",
    "react-dom/client": "https://esm.sh/react-dom@18.2.0/client",
    "react/": "https://esm.sh/react@18.2.0/",
    "react-dom/": "https://esm.sh/react-dom@18.2.0/",
    "lucide-react": "https://esm.sh/lucide-react@0.292.0",
    "three": "https://esm.sh/three@0.160.0",
    "@react-three/fiber": "https://esm.sh/@react-three/fiber@8.15.14?external=react,react-dom,three",
    "@react-three/drei": "https://esm.sh/@react-three/drei@9.99.0?external=react,react-dom,three,@react-three/fiber"
  }
}
</script>
```

---

## Project Structure

```
/home/mya/Documents/2026/Kimi/AVANT_GARDE_PORTFOLIO_FILES/
├── index.html              # Entry point with Tailwind config, import maps
├── index.tsx               # React application entry (creates root, renders App)
├── App.tsx                 # Main application component with state management
├── types.ts                # TypeScript type definitions
├── constants.ts            # Static data: projects, tools, articles, designs
├── metadata.json           # Project metadata for host platform
├── AGENTS.md               # This file
├── components/             # React components
│   ├── Layout.tsx          # GlassHeader, Dock, InfoDrawer
│   ├── Views.tsx           # All view components (Splash, Profile, Webpages, etc.)
│   ├── CommandPalette.tsx  # Search/command interface
│   ├── LiquidBackground.tsx # WebGL background with shaders
│   ├── Clock.tsx           # Analog clock component
│   └── MessageLog.tsx      # Message inbox component (demo data)
└── hooks/
    └── useKeyboardShortcuts.ts  # Global keyboard shortcut handler
```

---

## Architecture Details

### Application State Management

State is managed via React hooks in `App.tsx`:

```typescript
const [activeCategory, setActiveCategory] = useState<Category>('home');
const [isPaletteOpen, setIsPaletteOpen] = useState(false);
const [isDrawerOpen, setIsDrawerOpen] = useState(false);
const [weather, setWeather] = useState<{ temp: number | null; loading: boolean }>({ temp: null, loading: true });
```

- **activeCategory**: Controls which view is displayed (home, about, webpages, webapps, webtools, articles)
- **isPaletteOpen**: Toggles the command palette search interface
- **isDrawerOpen**: Toggles the info drawer sidebar
- **weather**: Stores geolocation-based weather data from Open-Meteo API

### View Routing

Views are conditionally rendered based on `activeCategory`:

```typescript
{activeCategory === 'home' && <SplashView onNavigate={setActiveCategory} />}
{activeCategory === 'about' && <ProfileView />}
{activeCategory === 'webpages' && <WebpagesView />}
{activeCategory === 'webapps' && <WebappsView />}
{activeCategory === 'webtools' && <WebtoolsView />}
{activeCategory === 'articles' && <ArticlesView />}
```

### WebGL Background

The `LiquidBackground` component uses:
- **React Three Fiber** for React integration with Three.js
- **Custom GLSL shaders** (vertex + fragment) for liquid animation
- **Simplex noise** algorithm for organic movement
- **Error boundary** to gracefully handle WebGL context failures

The shader creates a dark, sophisticated palette with contour lines and domain warping effects.

---

## Build Process

**This project has no build step.** It uses a modern "no-build" architecture:

1. **Development**: Serve `index.html` with any static file server
2. **No transpilation**: TypeScript is handled by the browser (via esm.sh pre-compilation)
3. **No bundler**: Native ES modules with import maps
4. **No package.json**: Dependencies managed via CDN

### Running the Project

Use any static file server:

```bash
# Python 3
python -m http.server 8080

# Node.js (npx serve)
npx serve .

# PHP
php -S localhost:8080
```

Then open `http://localhost:8080` in a browser.

---

## Code Style Guidelines

### TypeScript Conventions

- **Strict typing**: All props and state are explicitly typed
- **Functional components**: All components use `React.FC<Props>` pattern
- **Type imports**: Use `import type { Category } from '../types'` where appropriate

### Component Pattern

```typescript
interface ComponentProps {
  propName: string;
  onAction: () => void;
}

export const ComponentName: React.FC<ComponentProps> = ({ propName, onAction }) => {
  return (
    <div className="...">{propName}</div>
  );
};
```

### Tailwind CSS Conventions

- **Custom colors** defined in `index.html` Tailwind config:
  - `background`: '#0c0c0c'
  - `surface`: '#121212'
  - `surfaceHighlight`: '#1a1a1a'
  - `textMain`: '#ececec'
  - `textMuted`: '#737373'
  - `accent`: '#d4d4d4'

- **Custom fonts**:
  - Sans: 'Helvetica Neue', Arial, sans-serif
  - Mono: 'Courier New', monospace

- **Common patterns**:
  - Backdrop blur: `backdrop-blur-xl`
  - Glass effect: `bg-black/20 backdrop-blur-xl border border-white/10`
  - Rounded corners: `rounded-2xl`, `rounded-3xl`, `rounded-full`
  - Scrollbar hiding: `scrollbar-hide` (custom CSS class)

### File Organization

- One component per file (except `Layout.tsx` which exports 3 related components)
- Hooks in `hooks/` directory
- Components in `components/` directory
- Types in `types.ts`
- Constants/data in `constants.ts`

---

## Keyboard Shortcuts

The `useKeyboardShortcuts` hook provides Vim-inspired navigation:

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Toggle command palette |
| `/` | Open search (command palette) |
| `g` then `h` | Go to Home |
| `g` then `u` | Go to About (user profile) |
| `g` then `w` | Go to Webpages |
| `g` then `a` | Go to Webapps |
| `g` then `t` | Go to Webtools |
| `g` then `d` | Go to Articles (docs) |
| `ESC` | Close command palette |

---

## Data Structure

### Types (types.ts)

```typescript
type Category = 'home' | 'about' | 'webpages' | 'webapps' | 'webtools' | 'articles';

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  tech: string[];
  featured?: boolean;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;  // Lucide icon name
  demoUrl: string;
}

interface Article {
  id: string;
  title: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: string;
}

interface DesignItem {
  id: string;
  title: string;
  image: string;
  type: 'Landing' | 'Mobile' | 'System' | 'Branding';
  date: string;
  description: string;
  tags: string[];
}
```

### Content Data (constants.ts)

Portfolio content is hardcoded in `constants.ts`:
- `PROJECTS`: Array of Project objects (6 items)
- `TOOLS`: Array of Tool objects (6 items)
- `ARTICLES`: Array of Article objects (6 items)
- `DESIGNS`: Array of DesignItem objects (6 items)
- `DRAWER_CONTENT`: Info panel content for each category

---

## External APIs

### Weather API

Uses Open-Meteo API (no API key required):

```typescript
`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&temperature_unit=fahrenheit`
```

- Requires `geolocation` permission (declared in `metadata.json`)
- Gracefully degrades if permission denied

### Image Sources

Uses Picsum Photos for placeholder images:

```
https://picsum.photos/id/{id}/{width}/{height}?grayscale
```

---

## Browser Compatibility

Requires browsers supporting:
- ES Modules
- Import Maps
- WebGL (with fallback)
- CSS Backdrop Filter
- Geolocation API (optional)

**Recommended**: Chrome 89+, Firefox 108+, Safari 15.4+, Edge 89+

---

## Security Considerations

1. **CSP**: No Content Security Policy implemented (CDN dependencies)
2. **XSS**: React's default escaping provides basic protection
3. **Geolocation**: Only used for weather; no storage/persistence
4. **External resources**: Images from Picsum, scripts from ESM.sh, fonts from system

---

## Development Notes

### Adding New Views

1. Create component in `components/Views.tsx` or new file
2. Add to `Category` type in `types.ts`
3. Add drawer content to `DRAWER_CONTENT` in `constants.ts`
4. Add route case in `App.tsx`
5. Add keyboard shortcut in `useKeyboardShortcuts.ts`
6. Add dock icon in `Dock` component if applicable

### Modifying the WebGL Background

Edit `LiquidBackground.tsx`:
- `FragmentShader`: GLSL fragment shader code
- `VertexShader`: GLSL vertex shader code
- `LiquidPlane`: React Three Fiber mesh component
- `WebGLErrorBoundary`: Error handling wrapper

### Styling Changes

Global styles in `index.html`:
- Tailwind config in `<script>tailwind.config = {...}</script>`
- Custom CSS in `<style>` block
- Body background and text color

---

## Metadata

Project metadata for host platforms (from `metadata.json`):

```json
{
  "name": "AVANT_GARDE_PORTFOLIO",
  "description": "A high-end, fixed-frame portfolio site featuring infinite scrolling, cinema mode, and keyboard shortcuts.",
  "requestFramePermissions": ["geolocation"]
}
```
