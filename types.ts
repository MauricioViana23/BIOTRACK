export enum Tab {
  DASHBOARD = 'Dashboard',
  MEDICATION = 'Medicação',
  BIOIMPEDANCE = 'Bioimpedância',
  EXAMS = 'Exames',
  INTERVENTIONS = 'Intervenções'
}

export type Role = 'patient' | 'doctor';

export interface Patient {
  id: number;
  user_id?: string; // Links to Supabase Auth
  doctor_id?: number; // Links to a Doctor (who is also a user in patients table for simplicity or separate profile)
  role: Role;
  name: string;
  email?: string;
  age: number;
  weight_goal_kg: number;
  created_at?: string;
  avatar_url?: string;
}

export interface MedicationDose {
  id?: number;
  patient_id: number;
  medication_name: string;
  dose_mg: number;
  applied_at: string; // ISO date string
  next_dose_at: string; // ISO date string
  notes?: string;
  side_effects?: string;
}

export interface Bioimpedance {
  id?: number;
  patient_id: number;
  measured_at: string;
  weight_kg: number;
  fat_mass_kg: number;
  lean_mass_kg: number;
  fat_percentage: number;
  water_percentage: number;
  muscle_mass_kg: number;
  notes?: string;
  // New fields for Phase 2 AI Analysis
  bone_mass_kg?: number;
  visceral_fat_level?: number;
  metabolic_age?: number;
  basal_metabolic_rate?: number;
}

export enum ExamStatus {
  COMPLETED = 'Concluído',
  SCHEDULED = 'Agendado',
  PENDING = 'Pendente'
}

export enum ExamType {
  BLOOD = 'Sangue',
  IMAGING = 'Imagem',
  CONSULTATION = 'Consulta',
  OTHER = 'Outro'
}

export interface Exam {
  id?: number;
  patient_id: number;
  name: string;
  type: ExamType;
  description?: string;
  scheduled_at?: string;
  completed_at?: string;
  status: ExamStatus;
  result_notes?: string;
  doctor?: string;
}

export enum InterventionStatus {
  ACTIVE = 'Ativo',
  PENDING = 'Pendente',
  COMPLETED = 'Concluído'
}

export enum InterventionType {
  MEDICATION = 'Medicamento',
  PROCEDURE = 'Procedimento',
  CONSULTATION = 'Consulta',
  EXAM = 'Exame'
}

export interface Intervention {
  id?: number;
  patient_id: number;
  name: string;
  type: InterventionType;
  dose?: string;
  frequency?: string;
  duration?: string;
  doctor?: string;
  instructions?: string;
  status: InterventionStatus;
  start_date?: string;
  end_date?: string;
  notes?: string;
}

export interface ExerciseLog {
  id?: number;
  patient_id: number;
  exercised_on: string; // Date string YYYY-MM-DD
  notes?: string;
}

export type NotificationType = 'dose' | 'exam' | 'intervention' | 'checkin';

export interface Notification {
  id: string;
  patient_id: number;
  type: NotificationType;
  title: string;
  message: string;
  scheduled_for: string;
  read_at?: string;
  created_at: string;
}
