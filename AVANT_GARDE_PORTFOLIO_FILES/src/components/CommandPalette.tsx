import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Search, ArrowRight, FileText, Folder, Globe, Cpu, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { buildSearchIndex, type SearchIndexEntry } from '../content';

interface PaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<PaletteProps> = ({ isOpen, onClose }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  
  // Build search index
  const searchIndex = useMemo(() => buildSearchIndex(), []);

  // Filter and group results
  const filteredResults = useMemo(() => {
    if (!query.trim()) return searchIndex;
    const lowerQuery = query.toLowerCase();
    return searchIndex.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) ||
      item.excerpt?.toLowerCase().includes(lowerQuery)
    );
  }, [query, searchIndex]);

  // Group results by type
  const navItems = useMemo(() => 
    filteredResults.filter(i => i.type === 'nav'),
    [filteredResults]
  );
  
  const contentItems = useMemo(() => 
    filteredResults.filter(i => i.type === 'content'),
    [filteredResults]
  );

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const totalItems = filteredResults.length;
    if (totalItems === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
        break;
      case 'Enter':
        e.preventDefault();
        const selected = filteredResults[selectedIndex];
        if (selected) {
          handleSelect(selected);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [filteredResults, selectedIndex, onClose]);

  // Handle selection/navigation
  const handleSelect = useCallback((item: SearchIndexEntry) => {
    switch (item.category) {
      case 'home':
        navigate('/');
        break;
      case 'about':
        navigate('/about');
        break;
      case 'webpages':
      case 'webapps':
      case 'webtools':
      case 'articles':
        if (item.slug && item.type === 'content') {
          navigate(`/projects/${item.category}/${item.slug}`);
        } else {
          navigate(`/projects/${item.category}`);
        }
        break;
    }
    onClose();
  }, [navigate, onClose]);

  // Get icon for item
  const getItemIcon = (item: SearchIndexEntry) => {
    if (item.type === 'nav') {
      switch (item.category) {
        case 'home': return Globe;
        case 'about': return Folder;
        case 'webpages': return Globe;
        case 'webapps': return Cpu;
        case 'webtools': return Wrench;
        case 'articles': return FileText;
        default: return Globe;
      }
    }
    switch (item.category) {
      case 'webpages': return Globe;
      case 'webapps': return Cpu;
      case 'webtools': return Wrench;
      case 'articles': return FileText;
      default: return FileText;
    }
  };



  // Calculate if an item is selected
  const isItemSelected = (index: number) => index === selectedIndex;

  // Render item with selection state
  const renderItem = (item: SearchIndexEntry, index: number, offset: number = 0) => {
    const actualIndex = offset + index;
    const selected = isItemSelected(actualIndex);
    const Icon = getItemIcon(item);
    
    return (
      <button
        key={`${item.id}-${index}`}
        onClick={() => handleSelect(item)}
        onMouseEnter={() => setSelectedIndex(actualIndex)}
        className={`
          w-full text-left px-3 py-3 flex items-center justify-between group transition-colors rounded-lg
          ${selected ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}
        `}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-4 h-4" />
          <div>
            <span className="capitalize block">{item.title}</span>
            {item.excerpt && !selected && (
              <span className="text-[10px] text-zinc-600 truncate max-w-[200px] block">{item.excerpt}</span>
            )}
          </div>
        </div>
        <ArrowRight className={`
          w-4 h-4 transition-all 
          ${selected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}
        `} />
      </button>
    );
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4"
      onKeyDown={handleKeyDown}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Gradient Border Wrapper */}
      <div className="relative w-full max-w-xl p-[1px] rounded-2xl bg-gradient-to-br from-pink-500 via-blue-500 to-green-500 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="w-full bg-[#1a1a1a] flex flex-col rounded-2xl overflow-hidden">
          <div className="flex items-center p-4 border-b border-white/10">
            <Search className="w-5 h-5 text-zinc-500 mr-3" />
            <input 
              ref={inputRef}
              type="text" 
              placeholder="Search..."
              className="w-full bg-transparent border-none outline-none text-white placeholder:text-zinc-600 text-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <kbd 
              className="hidden md:block text-xs text-zinc-500 border border-zinc-700 px-2 py-1 rounded-md bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
              onClick={onClose}
            >
              ESC
            </kbd>
          </div>

          <div className="p-2 max-h-[60vh] overflow-y-auto">
            {/* Navigation Section */}
            {navItems.length > 0 && (
              <>
                <div className="text-[10px] font-mono text-zinc-600 px-3 py-2 uppercase tracking-widest">
                  Jump To
                </div>
                {navItems.map((item, idx) => renderItem(item, idx, 0))}
              </>
            )}
            
            {/* Content Section */}
            {contentItems.length > 0 && (
              <>
                <div className="text-[10px] font-mono text-zinc-600 px-3 py-2 mt-2 uppercase tracking-widest">
                  Results
                </div>
                {contentItems.map((item, idx) => renderItem(item, idx, navItems.length))}
              </>
            )}

            {/* Empty State */}
            {filteredResults.length === 0 && (
              <div className="px-3 py-8 text-center text-zinc-500">
                <p className="text-sm">No results found for &quot;{query}&quot;</p>
              </div>
            )}
          </div>
          
          {/* Footer with keyboard hints */}
          <div className="bg-black/40 p-2 border-t border-white/5 flex justify-between items-center text-[10px] text-zinc-600 px-4">
            <div className="flex gap-4">
              <span className="flex items-center gap-1">
                <kbd className="border border-zinc-700 px-1 rounded">↑</kbd>
                <kbd className="border border-zinc-700 px-1 rounded">↓</kbd>
                <span className="ml-1">navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="border border-zinc-700 px-1 rounded">↵</kbd>
                <span className="ml-1">select</span>
              </span>
            </div>
            <span className="flex items-center gap-1">
              <span>{filteredResults.length}</span>
              <span>results</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
