import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Activity, Calendar, TrendingDown, TrendingUp, Target, Scale } from 'lucide-react';
import { dataService } from '../services/dataService';
import { MedicationDose, Bioimpedance, ExerciseLog } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useCurrentPatient } from '../contexts/PatientContext';

export const Dashboard: React.FC = () => {
  const { currentPatient: patient } = useCurrentPatient();
  const [latestDose, setLatestDose] = useState<MedicationDose | null>(null);
  const [latestBio, setLatestBio] = useState<Bioimpedance | null>(null);
  const [previousBio, setPreviousBio] = useState<Bioimpedance | null>(null);
  const [weeklyExercise, setWeeklyExercise] = useState<ExerciseLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patient) return;
    
    const fetchData = async () => {
      const doses = await dataService.getDoses(patient.id);
      const bios = await dataService.getBioimpedance(patient.id);
      const exercises = await dataService.getExerciseLog(patient.id);

      setLatestDose(doses[0] || null);
      
      if (bios.length > 0) {
        setLatestBio(bios[bios.length - 1]);
        if (bios.length > 1) {
          setPreviousBio(bios[bios.length - 2]);
        }
      } else {
        setLatestBio(null);
        setPreviousBio(null);
      }

      // Filter exercises
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const recentExercises = exercises.filter(e => new Date(e.exercised_on) >= oneWeekAgo);
      setWeeklyExercise(recentExercises);

      setLoading(false);
    };

    fetchData();
  }, [patient]);

  if (!patient) return <div className="p-6">Selecione um paciente</div>;
  if (loading) return <div className="p-6 text-center text-slate-500">Carregando painel...</div>;

  // Calculations
  const nextDoseDate = latestDose ? new Date(latestDose.next_dose_at) : null;
  const daysToNextDose = nextDoseDate 
    ? Math.ceil((nextDoseDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)) 
    : null;
  
  const weightDiff = (latestBio && previousBio) 
    ? (latestBio.weight_kg - previousBio.weight_kg).toFixed(1) 
    : null;
  
  const weightTrend = weightDiff && Number(weightDiff) <= 0 ? 'down' : 'up';
  
  const targetWeight = patient.weight_goal_kg || 70;
  const currentWeight = latestBio?.weight_kg || 0;
  
  // Progress calculation
  let progressPercent = 0;
  if (currentWeight > 0) {
    const startWeight = previousBio ? previousBio.weight_kg : (currentWeight > targetWeight ? currentWeight + 5 : currentWeight);
    const totalToLose = startWeight - targetWeight;
    const lostSoFar = startWeight - currentWeight;
    if (totalToLose > 0) {
        progressPercent = Math.min(100, Math.max(0, (lostSoFar / totalToLose) * 100));
    }
  }

  return (
    <div className="space-y-4 pb-24">
      <h1 className="text-2xl font-bold text-slate-800">Olá, {patient.name.split(' ')[0]} 👋</h1>
      
      {/* 1. Mounjaro Card */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                <Activity size={20} />
              </div>
              <span className="font-semibold text-emerald-900">Mounjaro</span>
            </div>
            <p className="text-3xl font-bold text-slate-800">{latestDose ? `${latestDose.dose_mg} mg` : '--'}</p>
            <p className="text-sm text-slate-500 mt-1">Dose atual</p>
          </div>
          <div className="text-right">
             {daysToNextDose !== null ? (
                <>
                 <Badge color="blue" className="mb-1">
                    {daysToNextDose > 0 ? `Em ${daysToNextDose} dias` : 'Hoje'}
                 </Badge>
                 <p className="text-xs text-slate-400">Próxima dose</p>
                </>
             ) : (
                <Badge color="gray">Não agendado</Badge>
             )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {/* 2. Weight Card */}
        <Card>
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Scale size={18} />
              <span className="text-xs font-medium uppercase">Peso Atual</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{currentWeight > 0 ? currentWeight : '--'} <span className="text-sm font-normal text-slate-500">kg</span></p>
              
              {weightDiff !== null ? (
                  <div className={`flex items-center text-xs mt-1 ${weightTrend === 'down' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {weightTrend === 'down' ? <TrendingDown size={14} className="mr-1"/> : <TrendingUp size={14} className="mr-1"/>}
                    {Math.abs(Number(weightDiff))} kg vs anterior
                  </div>
              ) : (
                  <div className="text-xs text-slate-400 mt-1">Sem histórico</div>
              )}
            </div>
          </div>
        </Card>

        {/* 4. Exercise Card */}
        <Card>
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Activity size={18} />
              <span className="text-xs font-medium uppercase">Exercícios</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{weeklyExercise.length} <span className="text-sm font-normal text-slate-500">/ 5</span></p>
              <p className="text-xs text-slate-500 mt-1">dias essa semana</p>
            </div>
          </div>
        </Card>
      </div>

      {/* 5. Progress Goal */}
      <Card>
        <CardHeader 
            title="Meta de Peso" 
            subtitle={currentWeight > 0 ? `Faltam ${(currentWeight - targetWeight).toFixed(1)} kg para o objetivo` : 'Defina seu peso inicial'}
            action={<Target className="text-slate-400" size={20} />}
        />
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block text-emerald-600">
                {progressPercent.toFixed(0)}%
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-slate-600">
                Meta: {targetWeight}kg
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-emerald-100">
            <div style={{ width: `${progressPercent}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500"></div>
          </div>
        </div>
      </Card>
    </div>
  );
};
