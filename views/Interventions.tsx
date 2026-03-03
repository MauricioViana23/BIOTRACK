import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Plus, Pill, Stethoscope, FileHeart } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Intervention, InterventionType, InterventionStatus } from '../types';
import { useCurrentPatient } from '../contexts/PatientContext';

export const Interventions: React.FC = () => {
  const { currentPatient: patient } = useCurrentPatient();
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const refresh = async () => {
    if (patient) {
      const data = await dataService.getInterventions(patient.id);
      setInterventions(data);
    }
  };

  useEffect(() => {
    refresh();
  }, [patient]);

  if (!patient) return null;

  const getIcon = (type: InterventionType) => {
    switch (type) {
        case InterventionType.MEDICATION: return <Pill size={18} />;
        case InterventionType.PROCEDURE: return <Stethoscope size={18} />;
        default: return <FileHeart size={18} />;
    }
  };

  const handleSave = async () => {
      if(!newName) return;
      await dataService.addIntervention({
          patient_id: patient.id,
          name: newName,
          type: InterventionType.MEDICATION,
          status: InterventionStatus.ACTIVE,
          frequency: 'Diário'
      });
      setIsAdding(false);
      setNewName('');
      refresh();
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Intervenções</h1>
        <Button size="sm" onClick={() => setIsAdding(true)}>
          <Plus size={16} className="mr-1" /> Adicionar
        </Button>
      </div>

      {isAdding && (
          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 mb-4">
              <label className="text-xs font-bold text-slate-500 mb-1 block">Nome do Medicamento ou Procedimento</label>
              <input 
                className="w-full border p-2 rounded mb-3" 
                value={newName} 
                onChange={e => setNewName(e.target.value)}
                placeholder="Ex: Metformina"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave}>Salvar Rápido</Button>
                <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>Cancelar</Button>
              </div>
          </div>
      )}

      <div className="space-y-3">
        {interventions.map((item) => (
            <Card key={item.id} className="p-0 overflow-hidden">
                <div className="border-l-4 border-emerald-500 p-4">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <div className="text-emerald-600 bg-emerald-50 p-1.5 rounded-md">
                                {getIcon(item.type)}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">{item.name}</h3>
                                <p className="text-xs text-slate-500">{item.dose} • {item.frequency}</p>
                            </div>
                        </div>
                        <Badge color={item.status === InterventionStatus.ACTIVE ? 'green' : 'gray'}>
                            {item.status}
                        </Badge>
                    </div>
                    {item.instructions && (
                        <div className="mt-3 bg-slate-50 p-2 rounded text-xs text-slate-600">
                            <strong>Instruções:</strong> {item.instructions}
                        </div>
                    )}
                    <div className="mt-3 flex justify-between items-center text-xs text-slate-400">
                        <span>Médico: {item.doctor || 'N/A'}</span>
                    </div>
                </div>
            </Card>
        ))}
      </div>
    </div>
  );
};
