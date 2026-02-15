-- Biblioteca pessoal do professor — conteúdos salvos
-- Rode no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS omniprof_biblioteca (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  ferramenta text NOT NULL,
  titulo text NOT NULL DEFAULT '',
  conteudo text NOT NULL DEFAULT '',
  analise text DEFAULT '',
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_omniprof_biblioteca_user ON omniprof_biblioteca(user_id);
CREATE INDEX IF NOT EXISTS idx_omniprof_biblioteca_ferramenta ON omniprof_biblioteca(ferramenta);
CREATE INDEX IF NOT EXISTS idx_omniprof_biblioteca_created ON omniprof_biblioteca(created_at DESC);

ALTER TABLE omniprof_biblioteca ENABLE ROW LEVEL SECURITY;

-- Cada professor só acessa seus próprios itens
DROP POLICY IF EXISTS "Users can manage own items" ON omniprof_biblioteca;
CREATE POLICY "Users can manage own items" ON omniprof_biblioteca
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE omniprof_biblioteca IS 'Biblioteca pessoal — conteúdos salvos pelo professor';
