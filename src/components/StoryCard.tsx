import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useFingerprint } from '../hooks/useFingerprint';
import type { Story, ReactionType } from '../lib/database.types';

interface StoryCardProps {
  story: Story;
  onReactionUpdate?: () => void;
}

const categoryLabels = {
  red_flags: { label: 'Red Flag', emoji: '🚩', color: 'text-red-500' },
  confesiones: { label: 'Confesión', emoji: '💭', color: 'text-blue-500' },
  excusas: { label: 'Excusa', emoji: '🤥', color: 'text-yellow-500' },
  aprendizajes: { label: 'Aprendizaje', emoji: '💡', color: 'text-green-500' },
};

const reactions = [
  { type: 'red_flag' as ReactionType, emoji: '🚩', label: 'Red Flag' },
  { type: 'clown' as ReactionType, emoji: '🤡', label: 'Payaso' },
  { type: 'wow' as ReactionType, emoji: '😮', label: 'Wow' },
];

export function StoryCard({ story, onReactionUpdate }: StoryCardProps) {
  const { fingerprint } = useFingerprint();
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [reactionCounts, setReactionCounts] = useState({
    red_flag: story.reactions_red_flag,
    clown: story.reactions_clown,
    wow: story.reactions_wow,
  });
  const [isVoting, setIsVoting] = useState(false);

  const categoryInfo = categoryLabels[story.category];

  useEffect(() => {
    if (fingerprint) {
      checkUserReaction();
    }
  }, [fingerprint, story.id]);

  const checkUserReaction = async () => {
    try {
      const { data } = await supabase
        .from('story_votes')
        .select('reaction_type')
        .eq('story_id', story.id)
        .eq('voter_fingerprint', fingerprint)
        .maybeSingle();

      if (data) {
        setUserReaction(data.reaction_type as ReactionType);
      }
    } catch (err) {
      console.error('Error checking user reaction:', err);
    }
  };

  const handleReaction = async (reactionType: ReactionType) => {
    if (!fingerprint || isVoting) return;

    setIsVoting(true);

    try {
      if (userReaction === reactionType) {
        const { error } = await supabase
          .from('story_votes')
          .delete()
          .eq('story_id', story.id)
          .eq('voter_fingerprint', fingerprint);

        if (error) throw error;

        setUserReaction(null);
        setReactionCounts(prev => ({
          ...prev,
          [reactionType]: Math.max(0, prev[reactionType] - 1),
        }));
      } else {
        if (userReaction) {
          await supabase
            .from('story_votes')
            .delete()
            .eq('story_id', story.id)
            .eq('voter_fingerprint', fingerprint);

          setReactionCounts(prev => ({
            ...prev,
            [userReaction]: Math.max(0, prev[userReaction] - 1),
          }));
        }

        const { error } = await supabase
          .from('story_votes')
          .insert({
            story_id: story.id,
            voter_fingerprint: fingerprint,
            reaction_type: reactionType,
          });

        if (error) throw error;

        setUserReaction(reactionType);
        setReactionCounts(prev => ({
          ...prev,
          [reactionType]: prev[reactionType] + 1,
        }));
      }

      if (onReactionUpdate) {
        onReactionUpdate();
      }
    } catch (err) {
      console.error('Error voting:', err);
    } finally {
      setIsVoting(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-DO');
  };

  return (
    <article className="bg-[rgb(var(--color-card))] rounded-2xl shadow-lg p-6 border border-[rgb(var(--color-border))] hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${categoryInfo.color} bg-[rgb(var(--color-bg-tertiary))]`}>
          <span>{categoryInfo.emoji}</span>
          <span>{categoryInfo.label}</span>
        </span>
        <span className="flex items-center gap-1 text-sm text-[rgb(var(--color-text-tertiary))]">
          <Clock size={14} />
          {getTimeAgo(story.created_at)}
        </span>
      </div>

      <p className="text-[rgb(var(--color-text-primary))] leading-relaxed mb-6 whitespace-pre-wrap">
        {story.content}
      </p>

      <div className="flex items-center gap-2 pt-4 border-t border-[rgb(var(--color-border))]">
        {reactions.map((reaction) => {
          const count = reactionCounts[reaction.type];
          const isActive = userReaction === reaction.type;

          return (
            <button
              key={reaction.type}
              onClick={() => handleReaction(reaction.type)}
              disabled={isVoting || !fingerprint}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-[rgb(var(--color-accent))]/20 border-2 border-[rgb(var(--color-accent))] scale-105'
                  : 'bg-[rgb(var(--color-bg-tertiary))] border-2 border-transparent hover:border-[rgb(var(--color-border))]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={reaction.label}
            >
              <span className="text-xl">{reaction.emoji}</span>
              <span className={`text-sm font-medium ${
                isActive ? 'text-[rgb(var(--color-accent))]' : 'text-[rgb(var(--color-text-secondary))]'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </article>
  );
}
