import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Upload, FileText, Activity, Scale, FileDown } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Bioimpedance, MedicationDose, Intervention } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { analyzeBioimpedanceImage } from '../services/geminiService';
import { useCurrentPatient } from '../contexts/PatientContext';
import { PDFExportButton } from '../components/PDFReport';

export const BioimpedanceView: React.FC = () => {
  const { currentPatient: patient, isDoctor } = useCurrentPatient();
  const [history, setHistory] = useState<Bioimpedance[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  
  // Data for PDF Report
  const [doses, setDoses] = useState<MedicationDose[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);

  // Manual Form State
  const [formData, setFormData] = useState({
    measured_at: new Date().toISOString().split('T')[0],
    weight_kg: '',
    fat_mass_kg: '',
    lean_mass_kg: '',
    fat_percentage: '',
  });

  const refreshData = async () => {
    if (!patient) return;
    const data = await dataService.getBioimpedance(patient.id);
    const d = await dataService.getDoses(patient.id);
    const i = await dataService.getInterventions(patient.id);
    setHistory(data);
    setDoses(d);
    setInterventions(i);
  };

  useEffect(() => {
    refreshData();
  }, [patient]);

  if (!patient) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAnalyzing(true);
      try {
        const file = e.target.files[0];
        const extractedData = await analyzeBioimpedanceImage(file);
        
        setFormData({
            measured_at: new Date().toISOString().split('T')[0],
            weight_kg: extractedData.weight_kg?.toString() || '',
            fat_mass_kg: extractedData.fat_mass_kg?.toString() || '',
            lean_mass_kg: extractedData.lean_mass_kg?.toString() || '',
            fat_percentage: extractedData.fat_percentage?.toString() || ''
        });
        setShowManualForm(true);
      } catch (error) {
        alert("Erro na análise da imagem.");
      } finally {
        setAnalyzing(false);
      }
    }
  };

  const handleSave = async () => {
    await dataService.addBioimpedance({
      patient_id: patient.id,
      measured_at: formData.measured_at,
      weight_kg: Number(formData.weight_kg),
      fat_mass_kg: Number(formData.fat_mass_kg),
      lean_mass_kg: Number(formData.lean_mass_kg),
      fat_percentage: Number(formData.fat_percentage),
      water_percentage: 0,
      muscle_mass_kg: Number(formData.lean_mass_kg) * 0.9 
    });
    setShowManualForm(false);
    refreshData();
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Bioimpedância</h1>
        {isDoctor && (
             <div className="hidden md:block">
                 <PDFExportButton 
                    patient={patient} 
                    bioimpedance={history} 
                    doses={doses} 
                    interventions={interventions} 
                 />
             </div>
        )}
      </div>

      {/* Upload Section */}
      {!showManualForm && (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50">
            <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-3">
                    {analyzing ? <Activity className="animate-spin" /> : <Upload />}
                </div>
                <h3 className="font-semibold text-slate-700">Adicionar Novo Exame</h3>
                <p className="text-xs text-slate-500 mb-4 max-w-[200px]">
                    {history.length === 0 
                      ? "Envie uma foto de bioimpedância para começar." 
                      : "IA analisa: Peso, Gordura, Massa Magra, Idade Metabólica..."}
                </p>
                <div className="relative">
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileUpload}
                        disabled={analyzing}
                    />
                    <Button disabled={analyzing}>
                        {analyzing ? 'Analisando...' : 'Carregar Imagem'}
                    </Button>
                </div>
                <button 
                    onClick={() => setShowManualForm(true)}
                    className="mt-3 text-xs text-slate-500 underline"
                >
                    Entrar dados manualmente
                </button>
            </div>
        </Card>
      )}

      {/* Manual Entry Form */}
      {showManualForm && (
          <Card>
              <h3 className="font-bold mb-4">Confirmar Dados</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs text-slate-500">Data</label>
                    <input type="date" className="w-full border rounded p-2 text-sm" value={formData.measured_at} onChange={e => setFormData({...formData, measured_at: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Peso (kg)</label>
                    <input type="number" className="w-full border rounded p-2 text-sm" value={formData.weight_kg} onChange={e => setFormData({...formData, weight_kg: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Gordura (kg)</label>
                    <input type="number" className="w-full border rounded p-2 text-sm" value={formData.fat_mass_kg} onChange={e => setFormData({...formData, fat_mass_kg: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Massa Magra (kg)</label>
                    <input type="number" className="w-full border rounded p-2 text-sm" value={formData.lean_mass_kg} onChange={e => setFormData({...formData, lean_mass_kg: e.target.value})} />
                  </div>
              </div>
              <div className="flex gap-2">
                  <Button variant="outline" fullWidth onClick={() => setShowManualForm(false)}>Cancelar</Button>
                  <Button fullWidth onClick={handleSave}>Salvar</Button>
              </div>
          </Card>
      )}

      {/* Charts */}
      {history.length > 0 ? (
          <>
            <Card>
                <h3 className="font-semibold mb-4 text-sm text-slate-700">Evolução do Peso Total</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={history}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis 
                                dataKey="measured_at" 
                                tickFormatter={(str) => new Date(str).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})} 
                                tick={{fontSize: 10}}
                            />
                            <YAxis domain={['auto', 'auto']} width={30} tick={{fontSize: 10}} />
                            <Tooltip />
                            <Line type="monotone" dataKey="weight_kg" stroke="#10b981" strokeWidth={3} dot={{r: 4}} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card>
                <h3 className="font-semibold mb-4 text-sm text-slate-700">Composição Corporal</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="measured_at" 
                                tickFormatter={(str) => new Date(str).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})} 
                                tick={{fontSize: 10}}
                            />
                            <YAxis width={30} tick={{fontSize: 10}} />
                            <Tooltip />
                            <Area type="monotone" dataKey="lean_mass_kg" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Massa Magra" />
                            <Area type="monotone" dataKey="fat_mass_kg" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Gordura" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>
            
             {/* Data Table */}
            <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-4 py-3">Data</th>
                                <th className="px-4 py-3">Peso</th>
                                <th className="px-4 py-3">% Gordura</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[...history].reverse().map((item) => (
                                <tr key={item.id}>
                                    <td className="px-4 py-3">{new Date(item.measured_at).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-4 py-3 font-medium">{item.weight_kg} kg</td>
                                    <td className="px-4 py-3 text-amber-600">{item.fat_percentage}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
          </>
      ) : (
          <div className="text-center py-10 text-slate-400">
              <Scale size={48} className="mx-auto mb-3 opacity-20" />
              <p>Nenhum registro de bioimpedância.</p>
          </div>
      )}
    </div>
  );
};
