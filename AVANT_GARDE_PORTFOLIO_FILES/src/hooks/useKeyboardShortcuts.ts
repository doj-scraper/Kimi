import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RouteCategory } from '../content';

interface ShortcutsConfig {
  onTogglePalette: () => void;
  onSearch: () => void;
  isPaletteOpen: boolean;
}

export const useKeyboardShortcuts = ({
  onTogglePalette,
  onSearch,
  isPaletteOpen,
}: ShortcutsConfig) => {
  const navigate = useNavigate();
  const lastKeyRef = useRef('');
  const chordTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSwitchCategory = useCallback((category: RouteCategory) => {
    switch (category) {
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
        navigate(`/projects/${category}`);
        break;
    }
  }, [navigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when palette is open (except ESC)
      if (isPaletteOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          onTogglePalette();
        }
        return;
      }

      const target = e.target as HTMLElement;
      const isInputField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;

      // Command Palette (Cmd+K or Ctrl+K)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onTogglePalette();
        return;
      }

      // Search (/)
      if (e.key === '/' && !isInputField) {
        e.preventDefault();
        onSearch();
        return;
      }

      // G-chord navigation (g then h/u/w/a/t/d)
      if (!isInputField) {
        if (e.key === 'g') {
          lastKeyRef.current = 'g';
          
          // Reset chord after timeout
          if (chordTimeoutRef.current) {
            clearTimeout(chordTimeoutRef.current);
          }
          chordTimeoutRef.current = setTimeout(() => {
            lastKeyRef.current = '';
          }, 1000);
          
          return;
        }

        if (lastKeyRef.current === 'g') {
          let category: RouteCategory | null = null;
          
          switch (e.key) {
            case 'h': category = 'home'; break;
            case 'u': category = 'about'; break;
            case 'w': category = 'webpages'; break;
            case 'a': category = 'webapps'; break;
            case 't': category = 'webtools'; break;
            case 'd': category = 'articles'; break;
          }

          if (category) {
            e.preventDefault();
            handleSwitchCategory(category);
          }
          
          // Reset chord state
          lastKeyRef.current = '';
          if (chordTimeoutRef.current) {
            clearTimeout(chordTimeoutRef.current);
            chordTimeoutRef.current = null;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (chordTimeoutRef.current) {
        clearTimeout(chordTimeoutRef.current);
      }
    };
  }, [onTogglePalette, onSearch, isPaletteOpen, handleSwitchCategory]);
};
