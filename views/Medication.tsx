import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Plus, Syringe, Clock } from 'lucide-react';
import { dataService } from '../services/dataService';
import { MedicationDose } from '../types';
import { useCurrentPatient } from '../contexts/PatientContext';

export const Medication: React.FC = () => {
  const { currentPatient: patient } = useCurrentPatient();
  const [doses, setDoses] = useState<MedicationDose[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [newDoseDate, setNewDoseDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDoseMg, setNewDoseMg] = useState(2.5);
  const [newDoseSideEffects, setNewDoseSideEffects] = useState('');

  const refreshDoses = async () => {
    if (patient) {
      const data = await dataService.getDoses(patient.id);
      setDoses(data);
    }
  };

  useEffect(() => {
    refreshDoses();
  }, [patient]);

  if (!patient) return null;

  const handleSave = async () => {
    const nextDate = new Date(newDoseDate);
    nextDate.setDate(nextDate.getDate() + 7); // Mounjaro is weekly

    await dataService.addDose({
      patient_id: patient.id,
      medication_name: 'Mounjaro',
      dose_mg: newDoseMg,
      applied_at: newDoseDate,
      next_dose_at: nextDate.toISOString().split('T')[0],
      notes: 'Registro manual',
      side_effects: newDoseSideEffects
    });
    setIsAdding(false);
    refreshDoses();
  };

  if (isAdding) {
    return (
      <div className="space-y-6 pb-24">
        <h2 className="text-xl font-bold">Registrar Aplicação</h2>
        <Card>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data da Aplicação</label>
              <input 
                type="date" 
                value={newDoseDate}
                onChange={(e) => setNewDoseDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Dose (mg)</label>
              <select 
                value={newDoseMg}
                onChange={(e) => setNewDoseMg(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2.5"
              >
                <option value={2.5}>2.5 mg</option>
                <option value={5.0}>5.0 mg</option>
                <option value={7.5}>7.5 mg</option>
                <option value={10.0}>10.0 mg</option>
                <option value={12.5}>12.5 mg</option>
                <option value={15.0}>15.0 mg</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Efeitos Colaterais</label>
              <textarea 
                rows={3}
                value={newDoseSideEffects}
                onChange={(e) => setNewDoseSideEffects(e.target.value)}
                placeholder="Náusea, dor de cabeça, etc..."
                className="w-full rounded-lg border border-slate-300 p-2.5"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" fullWidth onClick={() => setIsAdding(false)}>Cancelar</Button>
              <Button fullWidth onClick={handleSave}>Salvar</Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const latestDose = doses[0];
  const nextDose = latestDose ? new Date(latestDose.next_dose_at) : null;

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Medicação</h1>
        <Button size="sm" onClick={() => setIsAdding(true)}>
          <Plus size={16} className="mr-1" /> Registrar
        </Button>
      </div>

      {/* Active Med Card */}
      <Card className="bg-blue-50 border-blue-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
            <Syringe size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-slate-800">Mounjaro (Tirzepatida)</h3>
            <p className="text-sm text-slate-600">Uso contínuo • Injetável</p>
            
            <div className="mt-4 flex items-center justify-between text-sm">
                <div>
                    <span className="block text-slate-400 text-xs">Dose Atual</span>
                    <span className="font-semibold text-slate-800">{latestDose?.dose_mg || '-'} mg</span>
                </div>
                <div className="text-right">
                    <span className="block text-slate-400 text-xs">Próxima</span>
                    <span className="font-semibold text-blue-600">
                        {nextDose ? nextDose.toLocaleDateString('pt-BR') : '-'}
                    </span>
                </div>
            </div>
          </div>
        </div>
      </Card>

      {/* History Timeline */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
          <Clock size={18} /> Histórico de Aplicações
        </h3>
        
        <div className="space-y-3">
          {doses.map((dose) => (
            <Card key={dose.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">
                        {new Date(dose.applied_at).getDate()}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase mt-1">
                        {new Date(dose.applied_at).toLocaleDateString('pt-BR', { month: 'short' })}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Aplicação de {dose.dose_mg}mg</p>
                    {dose.side_effects && dose.side_effects !== 'Nenhum' && (
                       <p className="text-xs text-amber-600 mt-1">⚠️ {dose.side_effects}</p>
                    )}
                    {(!dose.side_effects || dose.side_effects === 'Nenhum') && (
                       <p className="text-xs text-slate-400 mt-1">Nenhum efeito colateral relatado</p>
                    )}
                  </div>
                </div>
                <Badge color="green">Concluído</Badge>
              </div>
            </Card>
          ))}
          {doses.length === 0 && <p className="text-center text-slate-500 py-4">Nenhum registro encontrado.</p>}
        </div>
      </div>
    </div>
  );
};
