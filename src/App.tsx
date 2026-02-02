import { useState } from 'react';
import { Header } from './components/Header';
import { StoryFeed } from './components/StoryFeed';
import { StoryForm } from './components/StoryForm';
import { Modal } from './components/Modal';
import { Info } from 'lucide-react';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNewStory = () => {
    setIsModalOpen(true);
  };

  const handleStorySuccess = () => {
    setIsModalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
      <Header onNewStoryClick={handleNewStory} />

      <main className="pb-12">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              La Vaina Como E': Historias Reales
            </h1>
            <p className="text-lg text-[rgb(var(--color-text-secondary))] max-w-2xl mx-auto">
              Un chin de historias de amor del Cibao al Sur. Comparte tu vaina de forma anónima,
              pa' que tú y yo aprendamo' a no caer en lo mismo.
            </p>
          </div>

          <div className="bg-[rgb(var(--color-card))] rounded-2xl p-6 mb-8 border border-[rgb(var(--color-border))] shadow-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Info size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                  ¿Cómo e' la cosa?
                </h3>
                <ul className="space-y-2 text-sm text-[rgb(var(--color-text-secondary))]">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>Suelta tu cuento de forma 100% anónima, nadie va a saber que fuiste tú</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>No se pone nombre, ni foto, ni nada de vaina personal aquí</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>Dale tu reacción a las historias: Red Flag, Payaso, o Wow</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>Aprende del mal de los demás pa' que no te pase lo mismo</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <StoryFeed />
        </div>
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <StoryForm onSuccess={handleStorySuccess} />
      </Modal>

      <footer className="border-t border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-secondary))] py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
            RD Historias • 2024 • 100% anónimo pa' que hables claro
          </p>
          <p className="text-xs text-[rgb(var(--color-text-tertiary))] mt-2">
            Pa' que aprendamo' y no nos dejen de payaso otra vez
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
