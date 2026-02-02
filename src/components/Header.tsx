import { Sun, Moon, Heart, PenSquare } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  onNewStoryClick: () => void;
}

export function Header({ onNewStoryClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 bg-[rgb(var(--color-bg-secondary))]/95 backdrop-blur-sm border-b border-[rgb(var(--color-border))] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-red-500 to-pink-600 p-2.5 rounded-xl shadow-lg">
              <Heart className="text-white" size={24} fill="white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                RD Historias
              </h1>
              <p className="text-xs text-[rgb(var(--color-text-tertiary))] hidden sm:block">
                La vaina como e' de verdad
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNewStoryClick}
              className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-accent-hover))] text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <PenSquare size={18} />
              <span className="hidden sm:inline">Cuenta tu vaina</span>
              <span className="sm:hidden">Contar</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-[rgb(var(--color-bg-tertiary))] hover:bg-[rgb(var(--color-card-hover))] transition-all duration-200 border border-[rgb(var(--color-border))]"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon size={20} className="text-[rgb(var(--color-text-secondary))]" />
              ) : (
                <Sun size={20} className="text-[rgb(var(--color-text-secondary))]" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
