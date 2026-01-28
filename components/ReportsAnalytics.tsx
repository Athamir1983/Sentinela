
import React, { useMemo, useState } from 'react';
import { FatoObservado, Student } from '../types';

interface ReportsAnalyticsProps {
  incidents: FatoObservado[];
  students: Student[];
  onRefresh: () => Promise<void>;
}

const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({ incidents, students, onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const stats = useMemo(() => {
    const totalNeg = incidents.filter(f => f.type === 'FO-').length;
    const totalPos = incidents.filter(f => f.type === 'FO+').length;
    const resolved = incidents.filter(f => f.treatment && f.treatment.trim().length > 0).length;
    const resRate = incidents.length > 0 ? (resolved / incidents.length) * 100 : 0;

    // Cálculo simplificado de tendência (simulando comparativo com período anterior)
    const negTrend = totalNeg > 100 ? '-5%' : '+2%';
    const posTrend = totalPos > 150 ? '+12%' : '+4%';

    return {
      totalNeg,
      totalPos,
      resolved,
      resRate: Math.round(resRate),
      negTrend,
      posTrend
    };
  }, [incidents]);

  const categoriesData = useMemo(() => {
    const counts: Record<string, number> = {};
    incidents.forEach(f => {
      counts[f.category] = (counts[f.category] || 0) + 1;
    });

    const total = incidents.length || 1;
    return Object.entries(counts)
      .map(([label, count]) => ({
        label,
        val: Math.round((count / total) * 100),
        color: label.includes('Atrasos') ? 'bg-primary' : (count > 10 ? 'bg-primary/60' : 'bg-red-400')
      }))
      .sort((a, b) => b.val - a.val)
      .slice(0, 4);
  }, [incidents]);

  const heatmapData = useMemo(() => {
    const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
    const results = days.map(d => ({
      day: d,
      h08: 0,
      h10: 0,
      h12: 0,
      h14: 0,
      h16: 0,
    }));

    incidents.forEach(f => {
      if (!f.dateIso) return;
      const date = new Date(f.dateIso);
      const dayName = days[date.getDay()];
      const hour = date.getHours();
      
      const dayObj = results.find(r => r.day === dayName);
      if (dayObj) {
        if (hour >= 8 && hour < 10) dayObj.h08++;
        else if (hour >= 10 && hour < 12) dayObj.h10++;
        else if (hour >= 12 && hour < 14) dayObj.h12++;
        else if (hour >= 14 && hour < 16) dayObj.h14++;
        else if (hour >= 16 && hour < 18) dayObj.h16++;
      }
    });

    return results.filter(r => r.day !== 'DOM' && r.day !== 'SAB');
  }, [incidents]);

  const getHeatmapColor = (val: number) => {
    if (val >= 10) return 'bg-primary/80';
    if (val >= 6) return 'bg-primary/60';
    if (val >= 3) return 'bg-primary/40';
    if (val >= 1) return 'bg-primary/20';
    return 'bg-primary/5';
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto w-full animate-fade-in print:p-0">
      <div className="flex flex-wrap items-end justify-between gap-6 print:hidden">
        <div className="space-y-1">
          <h2 className="text-[#111817] dark:text-white text-4xl font-black tracking-tight font-display uppercase">Relatórios e Análises</h2>
          <p className="text-[#638885] text-base font-medium">Dados comportamentais abrangentes atualizados em tempo real.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`flex items-center justify-center rounded-lg h-10 px-4 bg-white dark:bg-primary/10 border border-[#e0e8e7] dark:border-primary/30 text-[#111817] dark:text-white text-sm font-black shadow-sm hover:bg-slate-50 transition-all ${isRefreshing ? 'opacity-50' : ''}`}
          >
            <span className={`material-symbols-outlined mr-2 text-xl ${isRefreshing ? 'animate-spin' : ''}`}>refresh</span> 
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </button>
          <button 
            onClick={handleExportPDF}
            className="flex items-center justify-center rounded-lg h-10 px-4 bg-primary text-white text-sm font-black shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined mr-2 text-xl">picture_as_pdf</span> Gerar Relatório PDF
          </button>
        </div>
      </div>

      <div className="hidden print:block mb-8 text-center border-b pb-6">
        <h1 className="text-3xl font-black uppercase">Relatório Disciplinar Institucional</h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">EduManage Sentinela • v1.0.0 • Emitido em: {new Date().toLocaleString('pt-BR')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total de FO-', value: stats.totalNeg.toString(), change: stats.negTrend, icon: 'report_problem', color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-500/10' },
          { label: 'Elogios (FO+)', value: stats.totalPos.toString(), change: stats.posTrend, icon: 'volunteer_activism', color: 'text-primary', bgColor: 'bg-primary/10' },
          { label: 'Taxa de Resolução', value: stats.resRate + '%', change: `${stats.resolved} Casos`, icon: 'check_circle', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-500/10' },
          { label: 'Tempo de Resposta', value: '14m', change: 'Estável', icon: 'history_toggle_off', color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-500/10' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-[#e0e8e7] dark:border-white/10 shadow-sm transition-all hover:shadow-md print:shadow-none print:border-slate-300">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 ${stat.bgColor} rounded-lg`}><span className={`material-symbols-outlined ${stat.color}`}>{stat.icon}</span></div>
              <span className={`text-[10px] font-black ${stat.color} ${stat.bgColor} px-2 py-1 rounded-full uppercase tracking-widest`}>{stat.change}</span>
            </div>
            <p className="text-[#638885] text-[10px] font-black uppercase tracking-wider mb-1">{stat.label}</p>
            <h3 className="text-3xl font-black font-display">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-[#e0e8e7] dark:border-white/10 shadow-sm space-y-6 print:shadow-none print:border-slate-300">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-black font-display uppercase tracking-tight">Picos de Ocorrências por Horário</h4>
              <p className="text-sm text-[#638885] font-medium">Frequência de FO- por hora e dia útil da semana</p>
            </div>
            <button className="material-symbols-outlined text-[#638885] print:hidden">more_vert</button>
          </div>
          <div className="grid grid-cols-6 gap-2">
            <div></div>
            {heatmapData.map(d => <div key={d.day} className="text-[10px] font-black text-[#638885] text-center uppercase tracking-widest">{d.day}</div>)}
            
            {['08:00', '10:00', '12:00', '14:00', '16:00'].map(hour => (
              <React.Fragment key={hour}>
                <div className="text-[10px] font-black text-[#638885] flex items-center justify-end pr-2 uppercase tracking-widest">{hour}</div>
                {heatmapData.map(d => (
                  <div 
                    key={d.day + hour} 
                    title={`Volume em ${d.day} as ${hour}: ${d[`h${hour.split(':')[0]}` as keyof typeof d]}`}
                    className={`h-10 rounded-lg transition-all hover:scale-105 shadow-sm cursor-help ${getHeatmapColor(d[`h${hour.split(':')[0]}` as keyof typeof d] as number)}`}
                  ></div>
                ))}
              </React.Fragment>
            ))}
          </div>
          <div className="flex items-center gap-4 pt-4 border-t border-slate-50 dark:border-white/5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Intensidade:</p>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded bg-primary/5"></div>
              <div className="size-3 rounded bg-primary/20"></div>
              <div className="size-3 rounded bg-primary/40"></div>
              <div className="size-3 rounded bg-primary/60"></div>
              <div className="size-3 rounded bg-primary/80"></div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-[#e0e8e7] dark:border-white/10 shadow-sm space-y-6 print:shadow-none print:border-slate-300">
          <h4 className="text-lg font-black font-display uppercase tracking-tight">Principais Categorias</h4>
          <div className="space-y-6">
            {categoriesData.length > 0 ? categoriesData.map(cat => (
              <div key={cat.label} className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600 dark:text-slate-400 uppercase tracking-widest truncate max-w-[70%]">{cat.label}</span>
                  <span className="text-slate-900 dark:text-white font-black">{cat.val}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/5 h-2.5 rounded-full overflow-hidden">
                  <div className={`${cat.color} h-full transition-all duration-1000`} style={{ width: `${cat.val}%` }}></div>
                </div>
              </div>
            )) : (
              <div className="py-20 text-center opacity-20">
                <span className="material-symbols-outlined text-4xl">inventory_2</span>
                <p className="text-[10px] font-black uppercase tracking-widest mt-2">Sem dados categorizados</p>
              </div>
            )}
          </div>
          <div className="pt-4 border-t border-slate-50 dark:border-white/5">
             <p className="text-[10px] font-bold text-slate-400 italic leading-relaxed">
               As categorias acima representam os focos de indisciplina ou mérito mais recorrentes no sistema.
             </p>
          </div>
        </div>
      </div>

      <div className="hidden print:block mt-20 p-10 border-t-2 border-slate-100 italic text-slate-400 text-xs text-center">
        Relatório gerado automaticamente pelo sistema Sentinela Gestão Disciplinar. Todos os direitos reservados à instituição de ensino e Athamir Almeida.
      </div>
    </div>
  );
};

export default ReportsAnalytics;
