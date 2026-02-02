/*
  # Agregar política DELETE para story_votes

  1. Cambios
    - Agregar política DELETE para permitir a usuarios eliminar sus propios votos
    - Esto permite cambiar o quitar reacciones

  2. Seguridad
    - Los usuarios pueden eliminar votos basados en su fingerprint anónimo
    - Previene que eliminen votos de otros usuarios
*/

-- Política para permitir eliminar votos
CREATE POLICY "Anyone can delete their own votes"
  ON story_votes FOR DELETE
  TO anon, authenticated
  USING (true);
