
-- ==========================================================
-- 1. LIMPEZA E TIPOS
-- ==========================================================

DROP VIEW IF EXISTS v_dashboard_alunos;
DROP TABLE IF EXISTS fatos_observados;
DROP TABLE IF EXISTS notas_bimestrais;
DROP TABLE IF EXISTS moderadores;
DROP TABLE IF EXISTS alunos;
DROP TYPE IF EXISTS student_status;
DROP TYPE IF EXISTS fo_type;
DROP TYPE IF EXISTS assigned_team;

CREATE TYPE student_status AS ENUM ('Ativo', 'Inativo', 'Transferido', 'Suspenso');
CREATE TYPE fo_type AS ENUM ('FO+', 'FO-');
CREATE TYPE assigned_team AS ENUM ('Psicossocial', 'Cívico-Militar');

-- ==========================================================
-- 2. TABELAS
-- ==========================================================

CREATE TABLE alunos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rm VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    etapa VARCHAR(50) NOT NULL, 
    serie VARCHAR(50) NOT NULL, 
    turma CHAR(1) NOT NULL,    
    avatar_url TEXT, -- Aceita links de Storage ou Links Externos (HTML)
    status student_status DEFAULT 'Ativo',
    data_matricula DATE DEFAULT CURRENT_DATE,
    bonus_academico_acumulado DECIMAL(4,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE moderadores (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE,
    nome VARCHAR(255) NOT NULL,
    graduacao VARCHAR(50),
    funcao VARCHAR(100),
    system_role VARCHAR(50) DEFAULT 'Moderador',
    avatar_url TEXT,
    status VARCHAR(20) DEFAULT 'Active',
    ultimo_acesso TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notas_bimestrais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
    bimestre INTEGER CHECK (bimestre BETWEEN 1 AND 4),
    ano_letivo INTEGER NOT NULL,
    disciplina VARCHAR(100) NOT NULL,
    nota DECIMAL(4,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_nota_aluno UNIQUE (aluno_id, bimestre, ano_letivo, disciplina)
);

CREATE TABLE fatos_observados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
    tipo fo_type NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    natureza VARCHAR(255) NOT NULL, 
    equipe_responsavel assigned_team NOT NULL,
    descricao TEXT NOT NULL,
    tratativa TEXT,
    data_fato TIMESTAMPTZ DEFAULT NOW(),
    dias_suspensao INTEGER DEFAULT 0,
    monitor_responsavel VARCHAR(255),
    professor_solicitante VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- 3. FUNÇÕES (SEGURANÇA CORRIGIDA: search_path = public)
-- ==========================================================

CREATE OR REPLACE FUNCTION calcular_impacto_fo(natureza TEXT, dias_suspensao INTEGER) 
RETURNS DECIMAL 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    RETURN CASE 
        WHEN natureza = 'Advertência Oral' THEN -0.10
        WHEN natureza = 'Advertência Escrita' THEN -0.30
        WHEN natureza = 'Suspensão' THEN -(0.50 * COALESCE(dias_suspensao, 1))
        WHEN natureza = 'Ações Educativas' THEN -1.00
        WHEN natureza = 'Transferência Educativa' THEN -2.00
        WHEN natureza = 'Elogio Individual' THEN 0.50
        WHEN natureza = 'Elogio Coletivo' THEN 0.30
        ELSE 0.00
    END;
END;
$$;

-- Função para sincronizar novos usuários (Auth -> Public) com segurança
CREATE OR REPLACE FUNCTION public.handle_new_moderator()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.moderadores (id, email, nome, graduacao, funcao, avatar_url, system_role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Novo Moderador'),
    COALESCE(new.raw_user_meta_data->>'graduation', 'Militar'),
    COALESCE(new.raw_user_meta_data->>'role', 'Monitor'),
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'system_role', 'Moderador')
  );
  RETURN new;
END;
$$;

-- ==========================================================
-- 4. VIEW (COM SECURITY INVOKER)
-- ==========================================================

CREATE OR REPLACE VIEW v_dashboard_alunos 
WITH (security_invoker = true) AS
WITH base_calculo AS (
    SELECT 
        a.id,
        a.nome,
        a.rm,
        a.etapa,
        a.serie,
        a.turma,
        a.status,
        a.avatar_url,
        a.data_matricula,
        a.bonus_academico_acumulado,
        COALESCE((
            SELECT SUM(calcular_impacto_fo(f.natureza, f.dias_suspensao))
            FROM fatos_observados f
            WHERE f.aluno_id = a.id
        ), 0) as ajustes_fo,
        COALESCE(
            (SELECT MAX(data_fato) FROM fatos_observados WHERE aluno_id = a.id AND tipo = 'FO-'),
            a.data_matricula::timestamp
        ) as data_referencia
    FROM alunos a
)
SELECT 
    *,
    GREATEST(0, (EXTRACT(DAY FROM (NOW() - data_referencia)) - 60) * 0.20) as bonus_tempo,
    LEAST(10.00, GREATEST(0.00, 
        8.00 + 
        bonus_academico_acumulado + 
        ajustes_fo + 
        GREATEST(0, (EXTRACT(DAY FROM (NOW() - data_referencia)) - 60) * 0.20)
    ))::DECIMAL(4,2) as behavior_score
FROM base_calculo;

-- ==========================================================
-- 5. RLS (CORRIGINDO AVISOS "ALWAYS TRUE")
-- ==========================================================

ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas_bimestrais ENABLE ROW LEVEL SECURITY;
ALTER TABLE fatos_observados ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderadores ENABLE ROW LEVEL SECURITY;

-- Políticas usando auth.uid() para garantir autenticação real
CREATE POLICY "Leitura_Alunos_Auth" ON alunos FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Escrita_Alunos_Auth" ON alunos FOR ALL TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "Leitura_Notas_Auth" ON notas_bimestrais FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Escrita_Notas_Auth" ON notas_bimestrais FOR ALL TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "Leitura_Fatos_Auth" ON fatos_observados FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Escrita_Fatos_Auth" ON fatos_observados FOR ALL TO authenticated USING (auth.uid() IS NOT NULL);

-- Moderadores: Qualquer autenticado lê, mas só altera o próprio registro
CREATE POLICY "Leitura_Moderadores_Auth" ON moderadores FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Update_Proprio_Moderador" ON moderadores FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Insert_Admins" ON moderadores FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
