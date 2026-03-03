import React, { useState } from 'react';
import { Tab } from './types';
import { LayoutDashboard, Syringe, Scale, ClipboardList, Stethoscope } from 'lucide-react';
import { Dashboard } from './views/Dashboard';
import { Medication } from './views/Medication';
import { BioimpedanceView } from './views/Bioimpedance';
import { Exams } from './views/Exams';
import { Interventions } from './views/Interventions';
import { Login } from './views/Login';
import { DoctorPortal } from './views/DoctorPortal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PatientProvider } from './contexts/PatientContext';

// Main App Layout for Patients
const PatientApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);

  const renderContent = () => {
    switch (activeTab) {
      case Tab.DASHBOARD: return <Dashboard />;
      case Tab.MEDICATION: return <Medication />;
      case Tab.BIOIMPEDANCE: return <BioimpedanceView />;
      case Tab.EXAMS: return <Exams />;
      case Tab.INTERVENTIONS: return <Interventions />;
      default: return <Dashboard />;
    }
  };

  const NavItem = ({ tab, icon: Icon, label }: { tab: Tab, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${
        activeTab === tab ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      <Icon size={24} strokeWidth={activeTab === tab ? 2.5 : 2} />
      <span className="text-[10px] mt-1 font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <main className="max-w-md mx-auto min-h-screen bg-white shadow-xl relative">
        <div className="h-full overflow-y-auto no-scrollbar p-5">
            {renderContent()}
        </div>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50 max-w-md mx-auto">
          <div className="flex justify-between items-center h-16 px-2">
            <NavItem tab={Tab.DASHBOARD} icon={LayoutDashboard} label="Painel" />
            <NavItem tab={Tab.MEDICATION} icon={Syringe} label="Medicação" />
            <NavItem tab={Tab.BIOIMPEDANCE} icon={Scale} label="Bioimp." />
            <NavItem tab={Tab.EXAMS} icon={ClipboardList} label="Exames" />
            <NavItem tab={Tab.INTERVENTIONS} icon={Stethoscope} label="Interv." />
          </div>
          {/* Safe Area for Mobile */}
          <div className="h-safe-area-bottom w-full bg-white"></div>
        </nav>
      </main>
    </div>
  );
};

// Route Switcher
const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center text-slate-400">Carregando MedTrack...</div>;

  if (!user) {
    return <Login />;
  }

  if (user.role === 'doctor') {
    return <DoctorPortal />;
  }

  return <PatientApp />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <PatientProvider>
        <AppRoutes />
      </PatientProvider>
    </AuthProvider>
  );
};

export default App;
