
import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Student } from '../types';

interface DashboardProps {
  onAddStudent: () => void;
  students: Student[];
  onSelectStudent: (student: Student) => void;
}

type FilterEtapa = 'Todos' | 'Fundamental' | 'Médio';

const Dashboard: React.FC<DashboardProps> = ({ onAddStudent, students, onSelectStudent }) => {
  const [filterEtapa, setFilterEtapa] = useState<FilterEtapa>('Todos');
  const [filterSerie, setFilterSerie] = useState<string>('Todas');
  const [filterTurma, setFilterTurma] = useState<string>('Todas');

  const seriesFundamental = ['6º Ano', '7º Ano', '8º Ano', '9º Ano'];
  const seriesMedio = ['1º Ano', '2º Ano', '3º Ano'];
  const secoes = ['A', 'B', 'C'];

  // Sincroniza filtros locais com a Etapa Global
  useEffect(() => {
    setFilterSerie('Todas');
    setFilterTurma('Todas');
  }, [filterEtapa]);

  // Filtragem dos estudantes para os cards de métricas e lista de atenção
  const filteredStudents = useMemo(() => {
    let result = students;
    
    if (filterEtapa === 'Fundamental') {
      result = students.filter(s => seriesFundamental.includes(s.grade));
    } else if (filterEtapa === 'Médio') {
      result = students.filter(s => seriesMedio.includes(s.grade));
    }
    
    if (filterSerie !== 'Todas') {
      result = result.filter(s => s.grade === filterSerie);
    }
    
    if (filterTurma !== 'Todas') {
      result = result.filter(s => s.section === filterTurma);
    }
    
    return result;
  }, [students, filterEtapa, filterSerie, filterTurma]);

  // Lógica de Expansão do Gráfico conforme solicitado
  const dynamicGraphData = useMemo(() => {
    const activeSeriesOptions = filterEtapa === 'Todos' 
      ? [...seriesFundamental, ...seriesMedio]
      : filterEtapa === 'Fundamental' ? seriesFundamental : seriesMedio;

    // CASO 1: Série específica selecionada + Todas as Turmas = Expandir por Turma (Barra A, Barra B, Barra C)
    if (filterSerie !== 'Todas' && filterTurma === 'Todas') {
      return secoes.map(secao => {
        const studentsInGroup = students.filter(s => s.grade === filterSerie && s.section === secao);
        const media = studentsInGroup.length > 0 
          ? studentsInGroup.reduce((acc, s) => acc + s.behaviorScore, 0) / studentsInGroup.length
          : 0;
        return {
          name: `${filterSerie} ${secao}`,
          media: parseFloat(media.toFixed(2))
        };
      }).filter(d => d.media > 0);
    }

    // CASO 2: "Todas as Séries" selecionada ou Turma específica selecionada
    const displaySeries = filterSerie === 'Todas' ? activeSeriesOptions : [filterSerie];
    
    return displaySeries.map(serie => {
      const studentsInGroup = students.filter(s => 
        s.grade === serie && 
        (filterTurma === 'Todas' || s.section === filterTurma)
      );
      
      const media = studentsInGroup.length > 0 
        ? studentsInGroup.reduce((acc, s) => acc + s.behaviorScore, 0) / studentsInGroup.length
        : 0;
      
      return {
        name: filterTurma !== 'Todas' ? `${serie} ${filterTurma}` : serie,
        media: parseFloat(media.toFixed(2))
      };
    }).filter(data => data.media > 0);
  }, [students, filterEtapa, filterSerie, filterTurma]);

  const studentsInRisk = useMemo(() => {
    return filteredStudents
      .filter(s => s.behaviorScore < 7.0)
      .sort((a, b) => a.behaviorScore - b.behaviorScore);
  }, [filteredStudents]);

  const averageScore = useMemo(() => {
    if (filteredStudents.length === 0) return '0.00';
    const sum = filteredStudents.reduce((acc, s) => acc + s.behaviorScore, 0);
    return (sum / filteredStudents.length).toFixed(2);
  }, [filteredStudents]);

  const exemplaryCount = useMemo(() => {
    return filteredStudents.filter(s => s.behaviorScore >= 9.5).length;
  }, [filteredStudents]);

  const getScoreColor = (score: number) => {
    if (score < 2) return 'text-red-700';
    if (score < 5) return 'text-rose-600';
    return 'text-amber-600';
  };

  const getScoreLabel = (score: number) => {
    if (score < 2) return 'Incompatível';
    if (score < 5) return 'Insuficiente';
    return 'Regular';
  };

  const currentSeriesList = filterEtapa === 'Todos' ? [...seriesFundamental, ...seriesMedio] : (filterEtapa === 'Fundamental' ? seriesFundamental : seriesMedio);
  const isGlobalAll = filterEtapa === 'Todos';

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-fade-in w-full">
      {/* Header do Dashboard */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a] dark:text-white font-display tracking-tight uppercase">Painel de Controle</h1>
          <p className="text-slate-500 dark:text-slate-400 font-sans text-sm mt-1">Monitoramento em tempo real do efetivo escolar</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex gap-1 bg-white dark:bg-[#1a2b2a] p-1 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
            {(['Todos', 'Fundamental', 'Médio'] as FilterEtapa[]).map((e) => (
              <button 
                key={e}
                onClick={() => setFilterEtapa(e)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterEtapa === e ? 'bg-[#0f8076] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}`}
              >
                {e === 'Fundamental' ? 'Ensino Fundamental' : e === 'Médio' ? 'Ensino Médio' : 'Visão Geral'}
              </button>
            ))}
          </div>

          <button 
            onClick={onAddStudent}
            className="bg-[#0f172a] hover:bg-black text-white px-6 py-2.5 rounded-lg font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 shadow-lg active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Novo Aluno
          </button>
        </div>
      </div>

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Alunos Selecionados', value: filteredStudents.length.toString(), sub: isGlobalAll ? 'Efetivo Geral' : `Efetivo ${filterEtapa}`, icon: 'groups', color: 'text-blue-600' },
          { label: 'Média Comportamental', value: averageScore, sub: 'Média do Grupo', icon: 'show_chart', color: 'text-emerald-500' },
          { label: 'Alunos em Risco', value: studentsInRisk.length.toString(), sub: 'Score < 7.0', icon: 'report_problem', color: 'text-rose-500' },
          { label: 'Alunos Exemplares', value: exemplaryCount.toString(), sub: 'Score > 9.5', icon: 'grade', color: 'text-amber-400' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#1a2b2a] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[#638885] text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
              <span className={`material-symbols-outlined ${stat.color} text-2xl`}>{stat.icon}</span>
            </div>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white font-display mb-2">{stat.value}</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Card do Gráfico com Filtros Locais Reestruturados */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1a2b2a] p-8 rounded-2xl border-2 border-blue-400/30 shadow-xl flex flex-col relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white font-display uppercase tracking-tight">
                Desempenho por Série
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Médias reais baseadas em FO e bônus</p>
            </div>
            
            {/* Filtros do Card */}
            <div className="flex flex-wrap items-center gap-3">
              <div className={`flex items-center gap-2 bg-slate-50 dark:bg-black/20 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/5 transition-all focus-within:ring-2 focus-within:ring-primary/20 ${isGlobalAll ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                <span className="material-symbols-outlined text-sm text-slate-400">calendar_month</span>
                <select 
                  value={filterSerie} 
                  onChange={(e) => setFilterSerie(e.target.value)}
                  disabled={isGlobalAll}
                  className="bg-transparent border-none p-0 pr-6 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
                >
                  <option value="Todas">Todas as Séries</option>
                  {currentSeriesList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className={`flex items-center gap-2 bg-slate-50 dark:bg-black/20 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/5 transition-all focus-within:ring-2 focus-within:ring-primary/20 ${isGlobalAll ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                <span className="material-symbols-outlined text-sm text-slate-400">groups</span>
                <select 
                  value={filterTurma} 
                  onChange={(e) => setFilterTurma(e.target.value)}
                  disabled={isGlobalAll}
                  className="bg-transparent border-none p-0 pr-6 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
                >
                  <option value="Todas">Todas as Turmas</option>
                  <option value="A">Turma A</option>
                  <option value="B">Turma B</option>
                  <option value="C">Turma C</option>
                </select>
              </div>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dynamicGraphData} margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} 
                  dy={10}
                />
                <YAxis 
                  domain={[0, 10]} 
                  ticks={[0, 2, 4, 6, 8, 10]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontFamily: 'Inter', fontWeight: 'bold', fontSize: '12px' }}
                />
                <Bar 
                  dataKey="media" 
                  fill="#0f172a" 
                  radius={[6, 6, 0, 0]} 
                  barSize={dynamicGraphData.length > 5 ? 30 : 60} 
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card Atenção Necessária */}
        <div className="bg-white dark:bg-[#1a2b2a] rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col relative overflow-hidden border-l-[6px] border-l-rose-500 h-[500px]">
          <div className="p-6 border-b border-slate-50 dark:border-white/5 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-rose-500 text-xl font-black">warning</span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white font-display uppercase tracking-tight">Atenção Necessária</h3>
            </div>
            <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">{studentsInRisk.length} Alunos</span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {studentsInRisk.length > 0 ? (
              <div className="space-y-1">
                {studentsInRisk.map((aluno) => (
                  <button
                    key={aluno.id}
                    onClick={() => onSelectStudent(aluno)}
                    className="w-full flex items-center gap-5 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-left group"
                  >
                    {aluno.avatar && aluno.avatar.length > 5 ? (
                      <div className="size-11 rounded-xl bg-cover bg-center border border-slate-200 dark:border-slate-700 shadow-sm group-hover:scale-110 transition-transform" style={{ backgroundImage: `url("${aluno.avatar}")` }}></div>
                    ) : (
                      <div className="size-11 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-700 shadow-sm group-hover:scale-110 transition-transform flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-400">person</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate font-display uppercase">{aluno.name}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RM: {aluno.rm} • {aluno.grade} {aluno.section}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-black font-display ${getScoreColor(aluno.behaviorScore)}`}>
                        {aluno.behaviorScore.toFixed(2)}
                      </p>
                      <p className={`text-[8px] font-black uppercase tracking-tighter ${getScoreColor(aluno.behaviorScore)}`}>
                        {getScoreLabel(aluno.behaviorScore)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-10 text-center space-y-4">
                <div className="size-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-500 text-4xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>shield_with_heart</span>
                </div>
                <p className="text-slate-400 dark:text-slate-500 font-bold text-sm">Nenhum aluno em risco crítico no filtro atual.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
