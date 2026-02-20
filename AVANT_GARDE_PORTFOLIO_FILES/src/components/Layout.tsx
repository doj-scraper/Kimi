import React, { useState, useEffect, useMemo } from 'react';
import { 
  Layout, Cpu, Wrench, FileText, Search, 
  Thermometer, Info, X
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnalogClock } from './Clock';
import { DRAWER_CONTENT, type RouteCategory, type ProjectCategory } from '../content';

// --- Header Component ---

interface HeaderProps {
  onToggleDrawer: () => void;
  onToggleSearch: () => void;
  weather: { temp: number | null; loading: boolean };
}

export const GlassHeader: React.FC<HeaderProps> = ({ 
  onToggleDrawer,
  onToggleSearch,
  weather 
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [digitalTime, setDigitalTime] = useState('');
  const navigate = useNavigate();

  // Digital Clock for Left Side
  useEffect(() => {
    const updateTime = () => {
      setDigitalTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate actual days in current month
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 pointer-events-none flex justify-between items-start h-20">
      
      {/* LEFT: Time & Temp */}
      <div className="pointer-events-auto flex items-center gap-4 bg-black/20 backdrop-blur-xl border border-white/10 rounded-full px-6 py-2 shadow-lg hover:bg-black/30 transition-colors z-50">
         {/* Weather */}
         <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium border-r border-white/10 pr-4">
            <Thermometer className="w-4 h-4 text-zinc-400" />
            <span>{weather.loading ? '--' : weather.temp !== null ? `${weather.temp}°` : 'N/A'}</span>
         </div>
         {/* Digital Time */}
         <div className="text-xs font-mono text-zinc-300 min-w-[60px]">
            {digitalTime}
         </div>
      </div>

      {/* CENTER: Info | Branding | Search - Absolutely Centered */}
      <div className="absolute left-1/2 -translate-x-1/2 top-4 pointer-events-auto flex items-center gap-4 bg-black/20 backdrop-blur-xl border border-white/10 rounded-full px-3 py-2 shadow-lg hover:bg-black/30 transition-colors z-50">
         
         {/* Info (Left) */}
         <button 
            onClick={onToggleDrawer} 
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors border border-white/5"
         >
            <Info className="w-4 h-4" />
         </button>

         {/* Branding (Center) */}
         <button 
           onClick={() => navigate('/')}
           className="text-sm font-medium text-zinc-200 hover:text-white transition-colors tracking-wide px-2"
         >
           c. Rodriguez 2026 <span className="text-zinc-500 mx-1">/</span> Current Portfolio
         </button>
         
         {/* Search (Right) */}
         <button 
            onClick={onToggleSearch}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors border border-white/5"
         >
           <Search className="w-4 h-4" />
         </button>
      </div>

      {/* RIGHT: Date & Analog Clock */}
      <div className="pointer-events-auto flex items-center gap-5 bg-black/20 backdrop-blur-xl border border-white/10 rounded-full pl-6 pr-2 py-2 shadow-lg hover:bg-black/30 transition-colors relative z-50">
         
         {/* Date & Calendar */}
         <button 
           onClick={() => setShowCalendar(!showCalendar)}
           className="flex items-center gap-2 text-xs text-zinc-300 font-medium hover:text-white transition-colors"
         >
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
         </button>

         <div className="h-4 w-[1px] bg-white/10" />

         {/* Analog Clock (Far Right) */}
         <div className="flex items-center">
            <AnalogClock />
         </div>

         {/* Calendar Dropdown */}
         {showCalendar && (
           <div className="absolute top-16 right-0 w-72 bg-[#121212] border border-white/10 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 z-50">
              <div className="text-center">
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                <div className="grid grid-cols-7 gap-2 text-[10px] text-zinc-500 mb-2 font-mono">
                  {['S','M','T','W','T','F','S'].map(d => <span key={d}>{d}</span>)}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {daysArray.map((day) => (
                    <div 
                      key={day} 
                      className={`aspect-square flex items-center justify-center text-xs rounded-full transition-all
                      ${day === currentDate ? 'bg-white text-black font-bold scale-110 shadow-lg' : 'text-zinc-400 hover:bg-white/10 cursor-pointer'}`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>
           </div>
         )}
      </div>

    </header>
  );
};

// --- Dock Component ---

interface DockProps {
  activeCategory?: ProjectCategory;
}

export const Dock: React.FC<DockProps> = ({ activeCategory }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const items = useMemo(() => [
    { id: 'webpages' as const, label: 'Webpages', icon: Layout, color: 'text-pink-400' },
    { id: 'webapps' as const, label: 'Webapps', icon: Cpu, color: 'text-blue-400' },
    { id: 'webtools' as const, label: 'Webtools', icon: Wrench, color: 'text-amber-400' },
    { id: 'articles' as const, label: 'Articles', icon: FileText, color: 'text-emerald-400' },
  ], []);

  // Determine active dock item based on current route
  const getActiveItem = (): string | null => {
    if (activeCategory) return activeCategory;
    const path = location.pathname;
    if (path.startsWith('/projects/webpages')) return 'webpages';
    if (path.startsWith('/projects/webapps')) return 'webapps';
    if (path.startsWith('/projects/webtools')) return 'webtools';
    if (path.startsWith('/projects/articles')) return 'articles';
    return null;
  };

  const currentActive = getActiveItem();

  return (
    <div className="fixed bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none">
      <nav className="pointer-events-auto flex items-center gap-4 px-6 py-4 bg-black/30 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-black/40">
        {items.map((item) => {
          const isActive = currentActive === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(`/projects/${item.id}`)}
              className={`
                group relative flex flex-col items-center justify-center gap-2 px-4 py-2 rounded-2xl transition-all duration-300
                ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}
              `}
            >
              <Icon 
                className={`w-6 h-6 md:w-8 md:h-8 transition-all duration-300 ${isActive ? item.color : 'text-zinc-400 group-hover:text-zinc-200 group-hover:scale-110'}`} 
              />
              <span className={`text-[10px] md:text-xs font-medium transition-colors duration-300 ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                {item.label}
              </span>
              
              {/* Active Indicator Dot */}
              {isActive && (
                <div className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

// --- Info Drawer Component ---

interface InfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: RouteCategory;
}

export const InfoDrawer: React.FC<InfoDrawerProps> = ({ isOpen, onClose, activeCategory }) => {
  const content = DRAWER_CONTENT[activeCategory];

  return (
    <div 
      className={`fixed top-24 bottom-32 right-6 w-96 bg-[#0c0c0c]/95 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl z-40 transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-[120%]'}
      `}
    >
      <div className="p-8 border-b border-white/5 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-light text-white mb-1">{content?.title}</h2>
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">Info & Context</span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-8 flex-1 overflow-y-auto">
        <p className="text-base leading-relaxed text-zinc-300 mb-8 font-light">
          {content?.description}
        </p>

        <div className="bg-white/5 rounded-2xl p-6 border border-white/5 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
              <Cpu className="w-16 h-16 text-white" />
           </div>
           <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 relative z-10">Specialized Toolkit</h3>
           <p className="text-sm text-zinc-400 italic relative z-10 leading-relaxed">
             "If you&apos;re in need of a specialized webtool look no further. My experience with these makes me a prime candidate for your digital needs."
           </p>
        </div>
      </div>

      <div className="p-6 bg-black/40 text-[10px] text-center text-zinc-600 font-mono border-t border-white/5 rounded-b-[2rem]">
         SYSTEM_READY // {activeCategory.toUpperCase()}_VIEW
      </div>
    </div>
  );
};
