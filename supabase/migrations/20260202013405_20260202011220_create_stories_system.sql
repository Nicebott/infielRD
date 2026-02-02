/*
  # Sistema de Historias Anónimas Dominicanas

  1. New Tables
    - `stories`
      - `id` (uuid, primary key)
      - `category` (text) - 'red_flags', 'confesiones', 'excusas', 'aprendizajes'
      - `content` (text) - 10 a 1000 caracteres
      - `created_at` (timestamptz)
      - `reactions_red_flag`, `reactions_clown`, `reactions_wow` (integer counters)
      - `total_reactions` (integer)
    - `story_votes`
      - `id` (uuid, primary key)
      - `story_id` (uuid, foreign key)
      - `voter_fingerprint` (text) - Hash anónimo del dispositivo
      - `reaction_type` (text)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS en ambas tablas
    - Público puede leer historias y votar
    - Trigger automático para contar reacciones

  3. Indexes
    - Índices en category, created_at, total_reactions para queries rápidas
*/

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

CREATE TABLE IF NOT EXISTS story_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  voter_fingerprint text NOT NULL,
  reaction_type text NOT NULL CHECK (reaction_type IN ('red_flag', 'clown', 'wow')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(story_id, voter_fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_stories_category ON stories(category);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_total_reactions ON stories(total_reactions DESC);
CREATE INDEX IF NOT EXISTS idx_story_votes_story_id ON story_votes(story_id);
CREATE INDEX IF NOT EXISTS idx_story_votes_fingerprint ON story_votes(voter_fingerprint);

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read stories"
  ON stories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert stories"
  ON stories FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(content) > 10 
    AND char_length(content) <= 1000
    AND category IN ('red_flags', 'confesiones', 'excusas', 'aprendizajes')
  );

CREATE POLICY "System can update reaction counts"
  ON stories FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can read votes"
  ON story_votes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert votes"
  ON story_votes FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    reaction_type IN ('red_flag', 'clown', 'wow')
  );

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

DROP TRIGGER IF EXISTS trigger_update_story_reactions ON story_votes;
CREATE TRIGGER trigger_update_story_reactions
  AFTER INSERT OR DELETE ON story_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_story_reactions();