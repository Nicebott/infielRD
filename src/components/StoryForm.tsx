import { useState } from 'react';
import { Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Category } from '../lib/database.types';

interface StoryFormProps {
  onSuccess?: () => void;
}

const categories: { value: Category; label: string; emoji: string }[] = [
  { value: 'red_flags', label: 'Red Flags', emoji: '🚩' },
  { value: 'confesiones', label: 'Confesiones', emoji: '💭' },
  { value: 'excusas', label: 'Excusas', emoji: '🤥' },
  { value: 'aprendizajes', label: 'Aprendizajes', emoji: '💡' },
];

export function StoryForm({ onSuccess }: StoryFormProps) {
  const [category, setCategory] = useState<Category>('red_flags');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const maxChars = 1000;
  const minChars = 10;
  const charsLeft = maxChars - content.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (content.length < minChars) {
      setError(`La historia debe tener al menos ${minChars} caracteres`);
      return;
    }

    if (content.length > maxChars) {
      setError(`La historia no puede exceder ${maxChars} caracteres`);
      return;
    }

    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from('stories')
        .insert({
          category,
          content: content.trim(),
        });

      if (insertError) throw insertError;

      setSuccess(true);
      setContent('');
      setCategory('red_flags');

      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500);
      }
    } catch (err) {
      setError('Error al enviar la historia. Intenta de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto p-4 sm:p-6">
      <div className="bg-[rgb(var(--color-card))] rounded-2xl shadow-lg p-6 sm:p-8 border border-[rgb(var(--color-border))]">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
          Suelta tu cuento aquí
        </h2>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-3 text-[rgb(var(--color-text-secondary))]">
            Categoría
          </label>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  category === cat.value
                    ? 'border-[rgb(var(--color-accent))] bg-[rgb(var(--color-accent))]/10 scale-105'
                    : 'border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-accent))]/50'
                }`}
              >
                <div className="text-2xl mb-1">{cat.emoji}</div>
                <div className="text-sm font-medium">{cat.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-[rgb(var(--color-text-secondary))]">
            Tu historia (nadie va a saber que fuiste tú)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Cuenta lo que te pasó... Acuérdate: sin nombres, sin fotos, ni nada que te identifique, esto es anónimo de verdad."
            className="w-full p-4 rounded-xl border-2 border-[rgb(var(--color-border))]
                     bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-primary))]
                     focus:outline-none focus:border-[rgb(var(--color-accent))]
                     transition-colors duration-200 resize-none h-40 sm:h-48"
            maxLength={maxChars}
            disabled={loading}
          />
          <div className="flex justify-between items-center mt-2 text-sm">
            <span className={`${
              charsLeft < 100 ? 'text-[rgb(var(--color-accent))]' : 'text-[rgb(var(--color-text-tertiary))]'
            }`}>
              {charsLeft} caracteres restantes
            </span>
            <span className="text-[rgb(var(--color-text-tertiary))]">
              Mínimo {minChars} caracteres
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">
            Listo tíguere! Tu historia ya ta' ahí publicá'
          </div>
        )}

        <button
          type="submit"
          disabled={loading || content.length < minChars}
          className="w-full py-4 px-6 bg-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-accent-hover))]
                   text-white rounded-xl font-medium transition-all duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <span>Enviando...</span>
          ) : (
            <>
              <Send size={20} />
              <span>Dale, publicar</span>
            </>
          )}
        </button>

        <p className="mt-4 text-xs text-center text-[rgb(var(--color-text-tertiary))]">
          Tranquilo, esto es 100% anónimo. Nadie va a saber que tú lo escribiste.
        </p>
      </div>
    </form>
  );
}
