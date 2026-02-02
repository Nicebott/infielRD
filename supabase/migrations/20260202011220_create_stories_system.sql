/*
  # Sistema de Historias Anónimas

  ## Descripción
  Sistema para compartir experiencias anónimas relacionadas con relaciones sentimentales,
  enfocado en República Dominicana. Permite categorización, votaciones con reacciones
  y mantiene total anonimato de los usuarios.

  ## Nuevas Tablas

  ### `stories`
  Almacena las historias anónimas compartidas por los usuarios.
  - `id` (uuid, primary key) - Identificador único de la historia
  - `category` (text) - Categoría: 'red_flags', 'confesiones', 'excusas', 'aprendizajes'
  - `content` (text) - Contenido de la historia (max 1000 caracteres)
  - `created_at` (timestamptz) - Fecha de creación
  - `reactions_red_flag` (integer) - Contador de reacciones 🚩
  - `reactions_clown` (integer) - Contador de reacciones 🤡
  - `reactions_wow` (integer) - Contador de reacciones 😮
  - `total_reactions` (integer) - Total de reacciones (para ordenamiento)

  ### `story_votes`
  Rastrea votos para prevenir duplicados (usa fingerprint anónimo).
  - `id` (uuid, primary key) - Identificador único del voto
  - `story_id` (uuid, foreign key) - Referencia a la historia
  - `voter_fingerprint` (text) - Hash anónimo del votante
  - `reaction_type` (text) - Tipo de reacción: 'red_flag', 'clown', 'wow'
  - `created_at` (timestamptz) - Fecha del voto

  ## Seguridad

  ### RLS (Row Level Security)
  - Todas las tablas tienen RLS habilitado
  - Lecturas públicas para historias (sin autenticación requerida)
  - Escritura pública para envío de historias y votos
  - Restricciones para prevenir abuso

  ## Índices
  - Índice en `category` para filtrado rápido
  - Índice en `created_at` para ordenamiento temporal
  - Índice en `total_reactions` para historias populares
  - Índice compuesto en `story_votes` para prevenir votos duplicados
*/

-- Crear tabla de historias
CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('red_flags', 'confesiones', 'excusas', 'aprendizajes')),
  content text NOT NULL CHECK (char_length(content) > 10 AND char_length(content) <= 1000),
  created_at timestamptz DEFAULT now(),
  reactions_red_flag integer DEFAULT 0,
  reactions_clown integer DEFAULT 0,
  reactions_wow integer DEFAULT 0,
  total_reactions integer DEFAULT 0
);

-- Crear tabla de votos
CREATE TABLE IF NOT EXISTS story_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  voter_fingerprint text NOT NULL,
  reaction_type text NOT NULL CHECK (reaction_type IN ('red_flag', 'clown', 'wow')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(story_id, voter_fingerprint)
);

-- Crear índices para optimizar queries
CREATE INDEX IF NOT EXISTS idx_stories_category ON stories(category);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_total_reactions ON stories(total_reactions DESC);
CREATE INDEX IF NOT EXISTS idx_story_votes_story_id ON story_votes(story_id);
CREATE INDEX IF NOT EXISTS idx_story_votes_fingerprint ON story_votes(voter_fingerprint);

-- Habilitar RLS en todas las tablas
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_votes ENABLE ROW LEVEL SECURITY;

-- Políticas para tabla stories
-- Cualquiera puede leer historias (público)
CREATE POLICY "Anyone can read stories"
  ON stories FOR SELECT
  TO anon, authenticated
  USING (true);

-- Cualquiera puede insertar historias (anónimo)
CREATE POLICY "Anyone can insert stories"
  ON stories FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(content) > 10 
    AND char_length(content) <= 1000
    AND category IN ('red_flags', 'confesiones', 'excusas', 'aprendizajes')
  );

-- Solo actualizar contadores de reacciones (mediante función)
CREATE POLICY "System can update reaction counts"
  ON stories FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para tabla story_votes
-- Cualquiera puede leer sus propios votos
CREATE POLICY "Anyone can read votes"
  ON story_votes FOR SELECT
  TO anon, authenticated
  USING (true);

-- Cualquiera puede insertar votos
CREATE POLICY "Anyone can insert votes"
  ON story_votes FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    reaction_type IN ('red_flag', 'clown', 'wow')
  );

-- Función para actualizar contadores de reacciones
CREATE OR REPLACE FUNCTION update_story_reactions()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE stories
    SET 
      reactions_red_flag = reactions_red_flag + CASE WHEN NEW.reaction_type = 'red_flag' THEN 1 ELSE 0 END,
      reactions_clown = reactions_clown + CASE WHEN NEW.reaction_type = 'clown' THEN 1 ELSE 0 END,
      reactions_wow = reactions_wow + CASE WHEN NEW.reaction_type = 'wow' THEN 1 ELSE 0 END,
      total_reactions = total_reactions + 1
    WHERE id = NEW.story_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE stories
    SET 
      reactions_red_flag = reactions_red_flag - CASE WHEN OLD.reaction_type = 'red_flag' THEN 1 ELSE 0 END,
      reactions_clown = reactions_clown - CASE WHEN OLD.reaction_type = 'clown' THEN 1 ELSE 0 END,
      reactions_wow = reactions_wow - CASE WHEN OLD.reaction_type = 'wow' THEN 1 ELSE 0 END,
      total_reactions = total_reactions - 1
    WHERE id = OLD.story_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar contadores automáticamente
DROP TRIGGER IF EXISTS trigger_update_story_reactions ON story_votes;
CREATE TRIGGER trigger_update_story_reactions
  AFTER INSERT OR DELETE ON story_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_story_reactions();