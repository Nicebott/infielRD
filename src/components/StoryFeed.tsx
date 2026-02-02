import { useState, useEffect } from 'react';
import { TrendingUp, Clock, Filter, AlertTriangle, MessageCircle, MessageSquare, Lightbulb, Grid3x3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { StoryCard } from './StoryCard';
import type { Story, Category } from '../lib/database.types';
import type { LucideIcon } from 'lucide-react';

type SortOption = 'recent' | 'popular';

const categories: { value: Category | 'all'; label: string; icon: LucideIcon }[] = [
  { value: 'all', label: 'Todas', icon: Grid3x3 },
  { value: 'red_flags', label: 'Red Flags', icon: AlertTriangle },
  { value: 'confesiones', label: 'Confesiones', icon: MessageCircle },
  { value: 'excusas', label: 'Excusas', icon: MessageSquare },
  { value: 'aprendizajes', label: 'Aprendizajes', icon: Lightbulb },
];

export function StoryFeed() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  useEffect(() => {
    fetchStories();
  }, [selectedCategory, sortBy]);

  const fetchStories = async () => {
    setLoading(true);

    try {
      let query = supabase.from('stories').select('*');

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (sortBy === 'popular') {
        query = query.order('total_reactions', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      setStories(data || []);
    } catch (err) {
      console.error('Error fetching stories:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-[rgb(var(--color-text-secondary))]" />
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
            Filtros
          </h3>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  selectedCategory === cat.value
                    ? 'bg-[rgb(var(--color-accent))] text-white shadow-lg scale-105'
                    : 'bg-[rgb(var(--color-card))] text-[rgb(var(--color-text-secondary))] border border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-accent))]'
                }`}
              >
                <Icon size={18} />
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('recent')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              sortBy === 'recent'
                ? 'bg-[rgb(var(--color-accent))] text-white shadow-lg'
                : 'bg-[rgb(var(--color-card))] text-[rgb(var(--color-text-secondary))] border border-[rgb(var(--color-border))]'
            }`}
          >
            <Clock size={16} />
            Recientes
          </button>
          <button
            onClick={() => setSortBy('popular')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              sortBy === 'popular'
                ? 'bg-[rgb(var(--color-accent))] text-white shadow-lg'
                : 'bg-[rgb(var(--color-card))] text-[rgb(var(--color-text-secondary))] border border-[rgb(var(--color-border))]'
            }`}
          >
            <TrendingUp size={16} />
            Populares
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[rgb(var(--color-accent))] border-t-transparent"></div>
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-[rgb(var(--color-text-secondary))]">
            No hay na' aquí todavía, tíguere.
          </p>
          <p className="text-sm text-[rgb(var(--color-text-tertiary))] mt-2">
            Dale, comparte tu vaina!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onReactionUpdate={fetchStories}
            />
          ))}
        </div>
      )}
    </div>
  );
}
