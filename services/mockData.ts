import { Patient, MedicationDose, Bioimpedance, Exam, Intervention, ExerciseLog, ExamStatus, ExamType, InterventionStatus, InterventionType } from '../types';

// Initial Mock Data - Clean State

export const mockPatients: Patient[] = [
  {
    id: 1,
    name: 'Paciente Exemplo',
    email: 'paciente@medtrack.app',
    age: 30,
    weight_goal_kg: 70.0,
    role: 'patient',
    doctor_id: 99
  },
  {
    id: 2,
    name: 'Maria Silva',
    email: 'maria@email.com',
    age: 45,
    weight_goal_kg: 65.0,
    role: 'patient',
    doctor_id: 99
  },
  {
    id: 99,
    name: 'Dr. Fernando',
    email: 'doctor@medtrack.app',
    age: 40,
    weight_goal_kg: 80,
    role: 'doctor'
  }
];

// Helper to get patient 1 by default
export const mockPatient = mockPatients[0];

export const mockDoses: MedicationDose[] = [
  { id: 101, patient_id: 1, medication_name: 'Mounjaro', dose_mg: 2.5, applied_at: '2023-10-01', next_dose_at: '2023-10-08', notes: 'Mock data' }
];

export const mockBioimpedance: Bioimpedance[] = [];

export const mockExams: Exam[] = [];

export const mockInterventions: Intervention[] = [];

export const mockExerciseLog: ExerciseLog[] = [];
