
import React, { useState, useMemo } from 'react';
import { Student } from '../types';

interface ClassDirectoryProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
}

type Etapa = 'Todos' | 'Fundamental' | 'Médio';

const ClassDirectory: React.FC<ClassDirectoryProps> = ({ students, onSelectStudent }) => {
  const [etapa, setEtapa] = useState<Etapa>('Todos');
  const [serie, setSerie] = useState<string>('Todos');
  const [turma, setTurma] = useState<string>('Todas');

  const seriesFundamental = ['6º Ano', '7º Ano', '8º Ano', '9º Ano'];
  const seriesMedio = ['1º Ano', '2º Ano', '3º Ano'];

  const filteredAlunos = useMemo(() => {
    return students.filter(a => {
      const matchEtapa = etapa === 'Todos' || (etapa === 'Fundamental' ? seriesFundamental.includes(a.grade) : seriesMedio.includes(a.grade));
      const matchSerie = serie === 'Todos' || a.grade === serie;
      const matchTurma = turma === 'Todas' || a.section === turma;
      return matchEtapa && matchSerie && matchTurma;
    });
  }, [students, etapa, serie, turma]);

  const getBehaviorCategory = (score: number) => {
    if (score >= 10) return { label: 'Excepcional', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20' };
    if (score >= 9) return { label: 'Ótimo', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20' };
    if (score >= 7) return { label: 'Bom', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/20' };
    if (score >= 5) return { label: 'Regular', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20' };
    if (score >= 2) return { label: 'Insuficiente', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/20' };
    return { label: 'Incompatível', color: 'text-red-700', bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-200 dark:border-red-500/20' };
  };

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'Ativo': return 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
      case 'Transferido': return 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10';
      case 'Suspenso': return 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
      default: return 'bg-slate-100 text-slate-400';
    }
  };

  const isGeneralView = etapa === 'Todos';

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-fade-in w-full">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight font-display uppercase">Efetivo de Alunos</h2>
          <p className="text-slate-500 dark:text-slate-400 font-sans text-sm font-medium">Gerenciamento centralizado de dossiês disciplinares e status.</p>
        </div>
        <div className="flex gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {(['Todos', 'Fundamental', 'Médio'] as Etapa[]).map((e) => (
            <button 
              key={e}
              onClick={() => { 
                setEtapa(e); 
                setSerie('Todos'); 
                setTurma('Todas');
              }}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${etapa === e ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}`}
            >
              {e === 'Fundamental' ? 'Ensino Fundamental' : e === 'Médio' ? 'Ensino Médio' : 'Todos'}
            </button>
          ))}
        </div>
      </div>

      {/* Painel de Filtros Integrado */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border-2 border-blue-400/30 shadow-xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 flex-1 w-full">
          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ${isGeneralView ? 'text-slate-300' : 'text-slate-400'}`}>Ano/Série</label>
            <select 
              value={serie} 
              onChange={(e) => setSerie(e.target.value)} 
              className={`w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-sm font-bold focus:ring-primary transition-all ${isGeneralView ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              disabled={isGeneralView}
            >
              <option value="Todos">{isGeneralView ? 'Todos os Anos' : 'Selecionar Série'}</option>
              {etapa === 'Fundamental' && seriesFundamental.map(s => <option key={s} value={s}>{s}</option>)}
              {etapa === 'Médio' && seriesMedio.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ${isGeneralView ? 'text-slate-300' : 'text-slate-400'}`}>Turma</label>
            <select 
              value={turma} 
              onChange={(e) => setTurma(e.target.value)} 
              className={`w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-sm font-bold focus:ring-primary transition-all ${isGeneralView ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              disabled={isGeneralView}
            >
              <option value="Todas">Todas as Turmas</option>
              <option value="A">Turma A</option>
              <option value="B">Turma B</option>
              <option value="C">Turma C</option>
            </select>
          </div>
        </div>

        {/* Contador Centralizado */}
        <div className="flex flex-col items-center justify-center px-8 border-x border-slate-100 dark:border-slate-800 min-w-[200px]">
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Efetivo Localizado</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black font-display text-slate-900 dark:text-white leading-none">{filteredAlunos.length}</span>
            <span className="text-xs font-bold text-slate-400 uppercase">Alunos</span>
          </div>
        </div>

        {/* Botão de Limpar */}
        <div className="w-full md:w-auto">
          <button 
            onClick={() => { setEtapa('Todos'); setSerie('Todos'); setTurma('Todas'); }} 
            className="w-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2 border border-transparent hover:border-slate-300 active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">filter_list_off</span>
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Tabela de Resultados */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <th className="px-8 py-5 font-black">Identificação do Aluno</th>
                <th className="px-6 py-5 font-black text-center">Status</th>
                <th className="px-6 py-5 font-black text-center">Saldo FO</th>
                <th className="px-6 py-5 font-black text-center">Grau</th>
                <th className="px-6 py-5 font-black text-center">Comportamento</th>
                <th className="px-8 py-5 font-black text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
              {filteredAlunos.length > 0 ? filteredAlunos.map((aluno) => {
                const category = getBehaviorCategory(aluno.behaviorScore);
                return (
                  <tr key={aluno.id} onClick={() => onSelectStudent(aluno)} className="group hover:bg-slate-50/80 dark:hover:bg-white/5 transition-all cursor-pointer">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-5">
                        {aluno.avatar && aluno.avatar.length > 5 ? (
                          <div className="size-12 rounded-2xl bg-cover bg-center border-2 border-slate-200 dark:border-slate-700 shadow-sm group-hover:scale-110 transition-transform" style={{ backgroundImage: `url("${aluno.avatar}")` }}></div>
                        ) : (
                          <div className="size-12 rounded-2xl bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-slate-700 shadow-sm group-hover:scale-110 transition-transform flex items-center justify-center">
                            <span className="material-symbols-outlined text-slate-300 dark:text-slate-600">person</span>
                          </div>
                        )}
                        <div>
                          <p className="text-base font-bold text-slate-900 dark:text-white font-display uppercase tracking-tight">{aluno.name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RM: {aluno.rm} • {aluno.grade} {aluno.section}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm ${getStatusConfig(aluno.status)}`}>
                        {aluno.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-4">
                        <div className="text-center group-hover:scale-110 transition-transform">
                          <span className="text-[9px] font-black text-emerald-500 uppercase block tracking-tighter">FO+</span>
                          <span className="text-base font-black text-slate-700 dark:text-slate-300">{aluno.foPositiveCount}</span>
                        </div>
                        <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-800"></div>
                        <div className="text-center group-hover:scale-110 transition-transform">
                          <span className="text-[9px] font-black text-rose-500 uppercase block tracking-tighter">FO-</span>
                          <span className="text-base font-black text-slate-700 dark:text-slate-300">{aluno.foNegativeCount}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`text-xl font-black font-display ${category.color}`}>
                        {aluno.behaviorScore.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-md transition-all ${category.bg} ${category.color} ${category.border} group-hover:shadow-lg group-hover:px-6`}>
                        {category.label}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="px-6 py-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95">
                        Abrir Dossiê
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <span className="material-symbols-outlined text-5xl text-slate-200 dark:text-slate-800" style={{ fontVariationSettings: "'wght' 100" }}>person_search</span>
                      <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Nenhum aluno encontrado para os filtros selecionados.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClassDirectory;
