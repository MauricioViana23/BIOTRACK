import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrentPatient } from '../contexts/PatientContext';
import { dataService } from '../services/dataService';
import { Patient } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Users, Search, ChevronRight, LogOut, FileText, UserPlus } from 'lucide-react';
import { Dashboard } from './Dashboard';
import { Medication } from './Medication';
import { BioimpedanceView } from './Bioimpedance';
import { Exams } from './Exams';
import { Interventions } from './Interventions';

export const DoctorPortal: React.FC = () => {
  const { user, signOut } = useAuth();
  const { currentPatient, setCurrentPatient } = useCurrentPatient();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activeTab, setActiveTab] = useState('painel');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === 'doctor') {
      const fetchPatients = async () => {
        const data = await dataService.getDoctorPatients(user.id);
        setPatients(data);
        setLoading(false);
      };
      fetchPatients();
    }
  }, [user]);

  if (!currentPatient) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0">
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
               <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-600">
                 <Users size={20} />
               </div>
               Portal Médico
            </h2>
            <p className="text-xs text-slate-500 mt-1">Dr. {user?.name.split(' ')[0]}</p>
          </div>
          
          <div className="p-4">
             <Button fullWidth size="sm" variant="outline" className="mb-4">
                <UserPlus size={16} className="mr-2" /> Adicionar Paciente
             </Button>
             <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input 
                    placeholder="Buscar paciente..." 
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
             </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
            {loading ? <p className="text-center text-slate-400 text-sm py-4">Carregando...</p> : (
                patients.map(p => (
                    <div 
                        key={p.id} 
                        onClick={() => setCurrentPatient(p)}
                        className="p-3 rounded-xl border border-slate-100 bg-white hover:border-emerald-200 hover:shadow-sm cursor-pointer transition-all group"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-slate-800 text-sm">{p.name}</p>
                                <p className="text-xs text-slate-500">{p.age} anos • Meta: {p.weight_goal_kg}kg</p>
                            </div>
                            <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500" />
                        </div>
                    </div>
                ))
            )}
          </div>

          <div className="p-4 border-t border-slate-100">
            <Button variant="ghost" fullWidth onClick={signOut} className="text-red-500 hover:bg-red-50 hover:text-red-600">
                <LogOut size={16} className="mr-2" /> Sair
            </Button>
          </div>
        </div>

        {/* Empty State Main Area */}
        <div className="ml-80 flex-1 p-10 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                <Users size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Selecione um Paciente</h2>
            <p className="text-slate-500 mt-2 max-w-sm">
                Escolha um paciente na barra lateral para visualizar prontuário, prescrever medicações e acompanhar evolução.
            </p>
        </div>
      </div>
    );
  }

  // Patient Selected View
  return (
    <div className="min-h-screen bg-slate-50 pl-80">
        {/* Sidebar (Collapsed/Fixed) - Re-rendered here for simplicity in this file structure */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-20">
             <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-emerald-50">
                <div>
                    <h2 className="font-bold text-sm text-emerald-800">{currentPatient.name}</h2>
                    <p className="text-xs text-emerald-600">Em consulta</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setCurrentPatient(null as any)}>Voltar</Button>
             </div>
             
             <div className="p-2 space-y-1">
                {[
                    {id: 'painel', label: 'Visão Geral'},
                    {id: 'medication', label: 'Medicação'},
                    {id: 'bio', label: 'Bioimpedância'},
                    {id: 'exams', label: 'Exames'},
                    {id: 'interventions', label: 'Intervenções'},
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            activeTab === tab.id 
                            ? 'bg-slate-100 text-slate-900' 
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
             </div>
        </div>

        {/* Main Content Area */}
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 capitalize">{activeTab}</h1>
                <Badge color="blue">Modo Médico</Badge>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-[500px]">
                {activeTab === 'painel' && <Dashboard />}
                {activeTab === 'medication' && <Medication />}
                {activeTab === 'bio' && <BioimpedanceView />}
                {activeTab === 'exams' && <Exams />}
                {activeTab === 'interventions' && <Interventions />}
            </div>
        </div>
    </div>
  );
};
