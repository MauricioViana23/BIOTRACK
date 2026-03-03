import { supabase, isSupabaseConfigured } from './supabaseClient';
import { 
  mockPatients, mockDoses, mockBioimpedance, mockExams, mockInterventions, mockExerciseLog 
} from './mockData';
import { Patient, MedicationDose, Bioimpedance, Exam, Intervention, ExerciseLog } from '../types';

// Helper to simulate async delay for mock data
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

class DataService {
  async getPatient(id: number): Promise<Patient | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('patients').select('*').eq('id', id).single();
      if (error) console.error(error);
      return data;
    }
    await delay(300);
    return mockPatients.find(p => p.id === id) || null;
  }

  // Get patients for a specific doctor
  async getDoctorPatients(doctorId: number): Promise<Patient[]> {
    if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('patients').select('*').eq('doctor_id', doctorId);
        if (error) console.error(error);
        return data || [];
    }
    await delay(300);
    return mockPatients.filter(p => p.doctor_id === doctorId);
  }

  // Find patient by email (Mock Auth helper)
  async getPatientByEmail(email: string): Promise<Patient | null> {
    if (isSupabaseConfigured && supabase) {
        // In real Supabase, we query by auth user_id, but for this hybrid setup:
        const { data } = await supabase.from('patients').select('*').eq('email', email).single();
        return data;
    }
    await delay(500);
    return mockPatients.find(p => p.email === email) || null;
  }

  // --- Doses ---
  async getDoses(patientId: number): Promise<MedicationDose[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('medication_doses').select('*').eq('patient_id', patientId).order('applied_at', { ascending: false });
      return data || [];
    }
    await delay(300);
    return mockDoses
      .filter(d => d.patient_id === patientId)
      .sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime());
  }

  async addDose(dose: Omit<MedicationDose, 'id'>): Promise<MedicationDose | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('medication_doses').insert(dose).select().single();
      if (error) console.error(error);
      return data;
    }
    await delay(300);
    const newDose = { ...dose, id: Math.random() };
    mockDoses.unshift(newDose);
    return newDose;
  }

  // --- Bioimpedance ---
  async getBioimpedance(patientId: number): Promise<Bioimpedance[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('bioimpedance').select('*').eq('patient_id', patientId).order('measured_at', { ascending: true });
      return data || [];
    }
    await delay(300);
    return mockBioimpedance
      .filter(b => b.patient_id === patientId)
      .sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime());
  }

  async addBioimpedance(entry: Omit<Bioimpedance, 'id'>): Promise<Bioimpedance | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('bioimpedance').insert(entry).select().single();
      if (error) console.error(error);
      return data;
    }
    await delay(300);
    const newEntry = { ...entry, id: Math.random() };
    mockBioimpedance.push(newEntry); 
    return newEntry;
  }

  // --- Exams ---
  async getExams(patientId: number): Promise<Exam[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('exams').select('*').eq('patient_id', patientId).order('scheduled_at', { ascending: true });
      return data || [];
    }
    await delay(300);
    return mockExams.filter(e => e.patient_id === patientId);
  }

  async addExam(exam: Omit<Exam, 'id'>): Promise<Exam | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('exams').insert(exam).select().single();
      if (error) console.error(error);
      return data;
    }
    await delay(300);
    const newExam = { ...exam, id: Math.random() };
    mockExams.push(newExam);
    return newExam;
  }

  // --- Interventions ---
  async getInterventions(patientId: number): Promise<Intervention[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('interventions').select('*').eq('patient_id', patientId);
      return data || [];
    }
    await delay(300);
    return mockInterventions.filter(i => i.patient_id === patientId);
  }

  async addIntervention(intervention: Omit<Intervention, 'id'>): Promise<Intervention | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('interventions').insert(intervention).select().single();
      if (error) console.error(error);
      return data;
    }
    await delay(300);
    const newInt = { ...intervention, id: Math.random() };
    mockInterventions.push(newInt);
    return newInt;
  }

  // --- Exercise ---
  async getExerciseLog(patientId: number): Promise<ExerciseLog[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('exercise_log').select('*').eq('patient_id', patientId);
      return data || [];
    }
    await delay(300);
    return mockExerciseLog.filter(e => e.patient_id === patientId);
  }

  async addExerciseLog(log: Omit<ExerciseLog, 'id'>): Promise<ExerciseLog | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('exercise_log').insert(log).select().single();
      if (error) console.error(error);
      return data;
    }
    await delay(300);
    const newLog = { ...log, id: Math.random() };
    mockExerciseLog.push(newLog);
    return newLog;
  }
}

export const dataService = new DataService();
