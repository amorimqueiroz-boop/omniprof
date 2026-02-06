-- Omniprof — Schema inicial (projeto Supabase independente do Omnisfera)
-- Rode no SQL Editor do seu projeto Supabase Omniprof

-- Extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de professores (opcional — para login/favoritos futuros)
CREATE TABLE IF NOT EXISTS omniprof_professores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  nome text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_omniprof_professores_email ON omniprof_professores(email);

-- Tabela de uso de IA (para créditos/métricas futuros)
CREATE TABLE IF NOT EXISTS omniprof_uso_ia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id uuid REFERENCES omniprof_professores(id) ON DELETE SET NULL,
  engine text NOT NULL,
  source text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_omniprof_uso_ia_created ON omniprof_uso_ia(created_at);
CREATE INDEX IF NOT EXISTS idx_omniprof_uso_ia_professor ON omniprof_uso_ia(professor_id);

-- RLS (por enquanto liberado para service_key; ajuste depois com auth)
ALTER TABLE omniprof_professores ENABLE ROW LEVEL SECURITY;
ALTER TABLE omniprof_uso_ia ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for service" ON omniprof_professores;
DROP POLICY IF EXISTS "Allow all for service" ON omniprof_uso_ia;
CREATE POLICY "Allow all for service" ON omniprof_professores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service" ON omniprof_uso_ia FOR ALL USING (true) WITH CHECK (true);

COMMENT ON TABLE omniprof_professores IS 'Professores Omniprof (independente do Omnisfera)';
COMMENT ON TABLE omniprof_uso_ia IS 'Registro de uso de IA para métricas/créditos';
