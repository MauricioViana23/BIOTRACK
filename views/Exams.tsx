import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Plus, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Exam, ExamStatus, ExamType } from '../types';
import { useCurrentPatient } from '../contexts/PatientContext';

export const Exams: React.FC = () => {
  const { currentPatient: patient } = useCurrentPatient();
  const [exams, setExams] = useState<Exam[]>([]);
  const [filter, setFilter] = useState<'ALL' | ExamStatus>('ALL');
  const [isAdding, setIsAdding] = useState(false);

  // New Exam Form
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<ExamType>(ExamType.BLOOD);
  const [newDate, setNewDate] = useState('');

  const refreshExams = async () => {
    if (patient) {
      const data = await dataService.getExams(patient.id);
      setExams(data);
    }
  };

  useEffect(() => {
    refreshExams();
  }, [patient]);

  if (!patient) return null;

  const getStatusColor = (status: ExamStatus) => {
    switch (status) {
      case ExamStatus.COMPLETED: return 'green';
      case ExamStatus.SCHEDULED: return 'blue';
      case ExamStatus.PENDING: return 'yellow';
      default: return 'gray';
    }
  };

  const filteredExams = filter === 'ALL' ? exams : exams.filter(e => e.status === filter);

  const handleSave = async () => {
    await dataService.addExam({
        patient_id: patient.id,
        name: newName,
        type: newType,
        status: newDate ? ExamStatus.SCHEDULED : ExamStatus.PENDING,
        scheduled_at: newDate || undefined
    });
    setIsAdding(false);
    setNewName('');
    setNewDate('');
    refreshExams();
  };

  return (
    <div className="space-y-6 pb-24">
       <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Exames</h1>
        <Button size="sm" onClick={() => setIsAdding(true)}>
          <Plus size={16} className="mr-1" /> Novo
        </Button>
      </div>

      {isAdding && (
          <Card className="mb-6 border-emerald-200 bg-emerald-50">
              <h3 className="font-bold mb-3">Adicionar Exame</h3>
              <div className="space-y-3">
                  <input placeholder="Nome do exame (ex: Colesterol)" className="w-full p-2 rounded border" value={newName} onChange={e => setNewName(e.target.value)} />
                  <div className="grid grid-cols-2 gap-3">
                    <select className="p-2 rounded border" value={newType} onChange={e => setNewType(e.target.value as ExamType)}>
                        {Object.values(ExamType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input type="date" className="p-2 rounded border" value={newDate} onChange={e => setNewDate(e.target.value)} />
                  </div>
                  <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Cancelar</Button>
                      <Button size="sm" onClick={handleSave}>Salvar</Button>
                  </div>
              </div>
          </Card>
      )}

      {/* Summary Chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <button onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
              Todos ({exams.length})
          </button>
          <button onClick={() => setFilter(ExamStatus.COMPLETED)} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === ExamStatus.COMPLETED ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
              Concluídos ({exams.filter(e => e.status === ExamStatus.COMPLETED).length})
          </button>
          <button onClick={() => setFilter(ExamStatus.SCHEDULED)} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === ExamStatus.SCHEDULED ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'}`}>
              Agendados ({exams.filter(e => e.status === ExamStatus.SCHEDULED).length})
          </button>
      </div>

      <div className="space-y-3">
        {filteredExams.map((exam) => (
            <Card key={exam.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-slate-800">{exam.name}</div>
                    <Badge color={getStatusColor(exam.status)}>{exam.status}</Badge>
                </div>
                <div className="text-sm text-slate-500 mb-3">{exam.type}</div>
                
                <div className="flex items-center gap-2 text-xs">
                    {exam.status === ExamStatus.COMPLETED ? (
                        <div className="flex items-center text-emerald-600 gap-1 bg-emerald-50 px-2 py-1 rounded">
                            <CheckCircle size={12} />
                            Realizado em {exam.completed_at ? new Date(exam.completed_at).toLocaleDateString('pt-BR') : '-'}
                        </div>
                    ) : exam.status === ExamStatus.SCHEDULED ? (
                         <div className="flex items-center text-blue-600 gap-1 bg-blue-50 px-2 py-1 rounded">
                            <Clock size={12} />
                            Agendado: {exam.scheduled_at ? new Date(exam.scheduled_at).toLocaleDateString('pt-BR') : '-'}
                        </div>
                    ) : (
                        <div className="flex items-center text-amber-600 gap-1 bg-amber-50 px-2 py-1 rounded">
                            <AlertCircle size={12} />
                            Necessita agendamento
                        </div>
                    )}
                </div>
            </Card>
        ))}
        {filteredExams.length === 0 && (
            <div className="text-center py-10 text-slate-400">
                Nenhum exame encontrado.
            </div>
        )}
      </div>
    </div>
  );
};
