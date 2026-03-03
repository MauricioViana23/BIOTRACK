import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Activity, Mail, Lock, User, Target, Calendar, CheckCircle } from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabaseClient';

type Mode = 'login' | 'register';

export const Login: React.FC = () => {
  const { signInWithPassword, signUpWithPassword, mockLogin } = useAuth();
  const [mode, setMode] = useState<Mode>('login');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAge, setRegAge] = useState('');
  const [regWeightGoal, setRegWeightGoal] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await signInWithPassword(loginEmail, loginPassword);
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const age = parseInt(regAge);
    const weightGoal = parseFloat(regWeightGoal);

    if (!regName.trim()) { setError('Informe seu nome completo.'); setLoading(false); return; }
    if (isNaN(age) || age < 1) { setError('Informe uma idade válida.'); setLoading(false); return; }
    if (isNaN(weightGoal) || weightGoal < 1) { setError('Informe um peso meta válido.'); setLoading(false); return; }

    const { error } = await signUpWithPassword(regEmail, regPassword, regName.trim(), age, weightGoal);
    if (error) {
      setError(error.message);
    } else {
      setRegistered(true);
    }
    setLoading(false);
  };

  const InputField = ({
    label, type = 'text', value, onChange, placeholder, icon: Icon
  }: {
    label: string; type?: string; value: string; onChange: (v: string) => void; placeholder: string; icon: any;
  }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-3 text-slate-400" size={18} />
        <input
          type={type}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
          placeholder={placeholder}
        />
      </div>
    </div>
  );

  if (registered) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Cadastro realizado!</h3>
            <p className="text-slate-500 mt-2">
              Conta criada com sucesso. Verifique seu email para confirmar o cadastro e depois faça login.
            </p>
            <Button className="mt-6" fullWidth onClick={() => { setRegistered(false); setMode('login'); }}>
              Ir para Login
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-emerald-100 rounded-2xl text-emerald-600 mb-4">
            <Activity size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">BioTrack</h1>
          <p className="text-slate-500 mt-2">Acompanhamento médico inteligente</p>
        </div>

        <Card className="p-8">
          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === 'login' ? 'bg-white shadow text-emerald-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === 'register' ? 'bg-white shadow text-emerald-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Cadastrar
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <InputField label="Email" type="email" value={loginEmail} onChange={setLoginEmail} placeholder="seu@email.com" icon={Mail} />
              <InputField label="Senha" type="password" value={loginPassword} onChange={setLoginPassword} placeholder="••••••••" icon={Lock} />
              <Button fullWidth size="lg" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <InputField label="Nome completo" value={regName} onChange={setRegName} placeholder="Seu nome" icon={User} />
              <InputField label="Email" type="email" value={regEmail} onChange={setRegEmail} placeholder="seu@email.com" icon={Mail} />
              <InputField label="Senha" type="password" value={regPassword} onChange={setRegPassword} placeholder="Mínimo 6 caracteres" icon={Lock} />
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Idade" type="number" value={regAge} onChange={setRegAge} placeholder="Ex: 35" icon={Calendar} />
                <InputField label="Meta de peso (kg)" type="number" value={regWeightGoal} onChange={setRegWeightGoal} placeholder="Ex: 70" icon={Target} />
              </div>
              <Button fullWidth size="lg" disabled={loading}>
                {loading ? 'Cadastrando...' : 'Criar conta'}
              </Button>
            </form>
          )}

          {!isSupabaseConfigured && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-xs text-center text-slate-400 uppercase tracking-wider font-semibold mb-3">
                Modo Demo
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm" onClick={() => mockLogin('patient')}>
                  Demo Paciente
                </Button>
                <Button variant="secondary" size="sm" onClick={() => mockLogin('doctor')}>
                  Demo Médico
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
