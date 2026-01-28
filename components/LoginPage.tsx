
import React, { useState } from 'react';
import { UserRole } from '../types';

interface LoginPageProps {
  onLogin: (credentials: { email: string, pass: string }) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const activeColor = "#E3B838";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ email, pass: password });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans overflow-hidden bg-[#091C47] text-slate-900">
      <div className="md:w-[60%] bg-[#091C47] p-12 md:pl-24 lg:pl-40 flex flex-col justify-between text-white relative h-screen">
        <div className="animate-fade-in relative z-10">
          <div 
            className="size-14 rounded-2xl flex items-center justify-center text-black shadow-2xl"
            style={{ backgroundColor: activeColor, boxShadow: `0 0 30px ${activeColor}33` }}
          >
            <span className="material-symbols-outlined !text-3xl font-black">shield</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center space-y-4 relative z-10">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black font-display tracking-tight leading-[0.85] animate-slide-up">
            Gestão<br />
            <span style={{ color: activeColor }}>Disciplinar</span>
          </h1>
          <p className="text-base md:text-lg text-slate-400 max-w-md font-medium leading-relaxed animate-fade-in delay-200">
            Monitoramento de conduta militar, registros de FO e análise de méritos em tempo real.
          </p>
        </div>

        <div className="animate-fade-in delay-500 relative z-10 flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 w-fit">
            <span className="size-2 rounded-full" style={{ backgroundColor: activeColor }}></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Acesso Restrito ao Efetivo</span>
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            v1.0.0 (Atual) 2026@AthamirAlmeida
          </p>
        </div>

        <div className="absolute -bottom-24 -left-24 size-96 rounded-full blur-[120px] opacity-10" style={{ backgroundColor: activeColor }}></div>
      </div>

      <div className="md:w-[40%] bg-[#0C255E] p-8 flex flex-col items-center justify-center relative">
        <div className="w-full max-w-[380px] animate-fade-in flex flex-col">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-white tracking-tight uppercase font-display tracking-widest">Login de Serviço</h2>
            <div className="h-1 w-12 mx-auto mt-2 rounded-full" style={{ backgroundColor: activeColor }}></div>
          </div>

          <div className="w-full bg-[#FFFFFF] rounded-[32px] p-8 md:p-10 shadow-2xl border border-white/10">
            
            <div className="mb-8 border-b border-slate-100 pb-6 text-center">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">Credenciais</h3>
              <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">Acesse com e-mail institucional</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">E-mail</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-black transition-colors !text-xl">mail</span>
                  <input 
                    className="w-full pl-12 pr-4 py-3.5 bg-[#f8fafb] border border-slate-200 rounded-xl text-black outline-none focus:ring-4 focus:ring-slate-50 focus:border-slate-300 transition-all font-medium placeholder:text-slate-400 text-sm" 
                    placeholder="acesso@instituicao.gov.br" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Senha</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-black transition-colors !text-xl">lock</span>
                  <input 
                    className="w-full pl-12 pr-12 py-3.5 bg-[#f8fafb] border border-slate-200 rounded-xl text-black outline-none focus:ring-4 focus:ring-slate-50 focus:border-slate-300 transition-all font-medium placeholder:text-slate-400 text-sm" 
                    placeholder="Senha do sistema" 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black transition-colors focus:outline-none"
                  >
                    <span className="material-symbols-outlined !text-xl">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button 
                className="w-full text-black font-black py-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 hover:brightness-110 tracking-widest uppercase text-[11px]" 
                type="submit"
                style={{ backgroundColor: activeColor }}
              >
                <span>Autenticar Acesso</span>
                <span className="material-symbols-outlined !text-lg">verified_user</span>
              </button>
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase tracking-wider opacity-60 max-w-[280px] mx-auto">
              Em conformidade com a LGPD e diretrizes de segurança institucional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
