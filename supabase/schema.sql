-- =====================================================
-- BIOTRACK - Schema do banco de dados no Supabase
-- Execute este script no SQL Editor do Supabase
-- https://app.supabase.com -> SQL Editor -> New query
-- =====================================================

-- Tabela de perfis de pacientes/médicos
CREATE TABLE IF NOT EXISTS patients (
  id              SERIAL PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  email           TEXT,
  age             INTEGER NOT NULL DEFAULT 0,
  weight_goal_kg  DECIMAL(5,2) NOT NULL DEFAULT 70,
  role            TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'doctor')),
  doctor_id       INTEGER REFERENCES patients(id) ON DELETE SET NULL,
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de doses de medicamentos
CREATE TABLE IF NOT EXISTS medication_doses (
  id               SERIAL PRIMARY KEY,
  patient_id       INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  medication_name  TEXT NOT NULL,
  dose_mg          DECIMAL(6,2) NOT NULL,
  applied_at       DATE NOT NULL,
  next_dose_at     DATE,
  notes            TEXT,
  side_effects     TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de bioimpedância
CREATE TABLE IF NOT EXISTS bioimpedance (
  id                   SERIAL PRIMARY KEY,
  patient_id           INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  measured_at          DATE NOT NULL,
  weight_kg            DECIMAL(5,2),
  fat_mass_kg          DECIMAL(5,2),
  lean_mass_kg         DECIMAL(5,2),
  fat_percentage       DECIMAL(5,2),
  water_percentage     DECIMAL(5,2),
  muscle_mass_kg       DECIMAL(5,2),
  bone_mass_kg         DECIMAL(5,2),
  visceral_fat_level   INTEGER,
  metabolic_age        INTEGER,
  basal_metabolic_rate INTEGER,
  notes                TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de exames
CREATE TABLE IF NOT EXISTS exams (
  id            SERIAL PRIMARY KEY,
  patient_id    INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'Outro',
  description   TEXT,
  scheduled_at  DATE,
  completed_at  DATE,
  status        TEXT NOT NULL DEFAULT 'Pendente',
  result_notes  TEXT,
  doctor        TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de intervenções
CREATE TABLE IF NOT EXISTS interventions (
  id           SERIAL PRIMARY KEY,
  patient_id   INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  type         TEXT NOT NULL DEFAULT 'Medicamento',
  dose         TEXT,
  frequency    TEXT,
  duration     TEXT,
  doctor       TEXT,
  instructions TEXT,
  status       TEXT NOT NULL DEFAULT 'Pendente',
  start_date   DATE,
  end_date     DATE,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de log de exercícios
CREATE TABLE IF NOT EXISTS exercise_log (
  id           SERIAL PRIMARY KEY,
  patient_id   INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  exercised_on DATE NOT NULL,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE patients        ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_doses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bioimpedance     ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams            ENABLE ROW LEVEL SECURITY;
ALTER TABLE interventions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_log     ENABLE ROW LEVEL SECURITY;

-- Paciente pode ler/editar o próprio perfil
CREATE POLICY "patient_read_own"   ON patients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "patient_update_own" ON patients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "patient_insert_own" ON patients FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Médico pode ler pacientes vinculados a ele
CREATE POLICY "doctor_read_patients" ON patients FOR SELECT USING (
  doctor_id IN (SELECT id FROM patients WHERE user_id = auth.uid() AND role = 'doctor')
);

-- Paciente acessa seus próprios dados nas demais tabelas
CREATE POLICY "patient_own_doses"        ON medication_doses FOR ALL USING (
  patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
);
CREATE POLICY "patient_own_bioimpedance" ON bioimpedance     FOR ALL USING (
  patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
);
CREATE POLICY "patient_own_exams"        ON exams            FOR ALL USING (
  patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
);
CREATE POLICY "patient_own_interventions" ON interventions   FOR ALL USING (
  patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
);
CREATE POLICY "patient_own_exercise"     ON exercise_log     FOR ALL USING (
  patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
);

-- Médico acessa dados dos seus pacientes
CREATE POLICY "doctor_read_doses" ON medication_doses FOR SELECT USING (
  patient_id IN (
    SELECT id FROM patients WHERE doctor_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid() AND role = 'doctor'
    )
  )
);
CREATE POLICY "doctor_read_bioimpedance" ON bioimpedance FOR SELECT USING (
  patient_id IN (
    SELECT id FROM patients WHERE doctor_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid() AND role = 'doctor'
    )
  )
);
CREATE POLICY "doctor_read_exams" ON exams FOR SELECT USING (
  patient_id IN (
    SELECT id FROM patients WHERE doctor_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid() AND role = 'doctor'
    )
  )
);
CREATE POLICY "doctor_read_interventions" ON interventions FOR SELECT USING (
  patient_id IN (
    SELECT id FROM patients WHERE doctor_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid() AND role = 'doctor'
    )
  )
);
