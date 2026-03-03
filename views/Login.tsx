import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Activity, Mail, ShieldAlert } from 'lucide-react';

export const Login: React.FC = () => {
  const { signInWithEmail, mockLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signInWithEmail(email);
    if (!error) {
        setSent(true);
    } else {
        alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-emerald-100 rounded-2xl text-emerald-600 mb-4">
                <Activity size={32} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">MedTrack</h1>
            <p className="text-slate-500 mt-2">Acompanhamento médico inteligente</p>
        </div>

        <Card className="p-8">
            {!sent ? (
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                placeholder="seu@email.com"
                            />
                        </div>
                    </div>
                    <Button fullWidth size="lg" disabled={loading}>
                        {loading ? 'Enviando...' : 'Entrar com Email'}
                    </Button>
                </form>
            ) : (
                <div className="text-center py-6">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                        <Mail size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Verifique seu email</h3>
                    <p className="text-slate-500 mt-2">Enviamos um link de acesso mágico para <strong>{email}</strong></p>
                    <Button variant="ghost" className="mt-6" onClick={() => setSent(false)}>
                        Tentar outro email
                    </Button>
                </div>
            )}

            {/* DEMO MODE SECTION */}
            <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-xs text-center text-slate-400 uppercase tracking-wider font-semibold mb-4">
                    Modo de Demonstração (Sem Supabase)
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="sm" onClick={() => mockLogin('patient')}>
                        Sou Paciente
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => mockLogin('doctor')}>
                        Sou Médico
                    </Button>
                </div>
            </div>
        </Card>
      </div>
    </div>
  );
};
