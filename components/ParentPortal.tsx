
import React from 'react';

const ParentPortal: React.FC = () => {
  return (
    <div className="max-w-[1200px] mx-auto w-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-white/5 p-6 rounded-xl border border-[#dce5e4] dark:border-white/10">
        <div className="flex items-center gap-5">
          <div className="size-20 rounded-full bg-cover bg-center ring-4 ring-primary/10" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCVMNbl6Qi4KhNvcuvQqFoPCZ-QO8cbfEUnJXOPpFmzLK7XqDHDMxLXM-x0Xj4KMkzEY0a2Icd6HBGjGkrwrBwnbvpn82Ecbu5afkCJhZ0D-ubV9PG66KYN1YWyZ8bUb5d3Rpw4Y-mE6i7WMl7Fm8NTBiybe3avthuPOH0JaYHhH5tG03M_vHF-W_FXhddCXdzeog5sNgGn_kTj0nBG-s2cVn2d48t42DepLAasM8WD3T8g_cYD1XNVYOAC8cyuY9Jpi1RjbBs2L8M")'}}></div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Alex Johnson</h1>
            <p className="text-[#638885] font-medium">8º Ano • Seção B • RM #24</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="size-2 rounded-full bg-green-500"></span>
              <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">Situação: Excelente</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-sm">mail</span> Contatar Coordenador
          </button>
          <button className="px-6 py-2.5 bg-[#f0f4f4] dark:bg-white/10 text-[#111817] dark:text-white font-bold rounded-lg hover:bg-[#e2eaea] transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">event</span> Agendar Reunião
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-white/5 p-5 rounded-xl border border-[#dce5e4] dark:border-white/10 group hover:border-primary transition-colors">
              <p className="text-[#638885] text-sm font-semibold uppercase tracking-wider mb-2">Elogios (FO+)</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">3</span>
                <span className="text-green-500 text-sm font-bold">+10%</span>
              </div>
            </div>
            <div className="bg-white dark:bg-white/5 p-5 rounded-xl border border-[#dce5e4] dark:border-white/10 group hover:border-primary transition-colors">
              <p className="text-[#638885] text-sm font-semibold uppercase tracking-wider mb-2">Frequência</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">98%</span>
                <span className="text-[#638885] text-sm font-bold">0%</span>
              </div>
            </div>
            <div className="bg-white dark:bg-white/5 p-5 rounded-xl border border-[#dce5e4] dark:border-white/10 group hover:border-primary transition-colors">
              <p className="text-[#638885] text-sm font-semibold uppercase tracking-wider mb-2">Nota de Conduta</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">85</span>
                <span className="text-green-500 text-sm font-bold">+5</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-white/5 p-6 rounded-xl border border-[#dce5e4] dark:border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Progresso Comportamental</h3>
              <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded">Top 5% da Turma</span>
            </div>
            <div className="relative w-full h-4 bg-[#f0f4f4] dark:bg-white/10 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-primary rounded-full" style={{ width: '85%' }}></div>
            </div>
            <p className="text-[#638885] text-sm italic mt-3">"Seu filho está indo muito bem! Alex demonstra grande engajamento em atividades de equipe."</p>
          </div>

          <div className="space-y-4">
             <h3 className="text-xl font-bold">Feed de Feedback Recente</h3>
             {[
               { tag: 'Elogio (FO+)', time: '2 horas atrás', text: '"Alex demonstrou liderança excepcional hoje ao auxiliar um colega durante o projeto complexo de geometria."', teacher: 'Prof. Silva • Depto. Matemática', color: 'text-accent-amber', bgColor: 'bg-accent-amber/10', icon: 'award_star' },
               { tag: 'Nota Administrativa', time: 'Ontem', text: '"Por favor, lembre-se de assinar e devolver o formulário de consentimento para a excursão de Ciências até sexta-feira."', teacher: 'Profa. Davis • Professora Conselheira', color: 'text-muted-blue', bgColor: 'bg-slate-100', icon: 'sticky_note_2' }
             ].map((fb, i) => (
               <div key={i} className="bg-white dark:bg-white/5 p-5 rounded-xl border border-[#dce5e4] dark:border-white/10">
                 <div className="flex items-center justify-between mb-2">
                   <span className={`${fb.bgColor} ${fb.color} text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded`}>{fb.tag}</span>
                   <span className="text-[#638885] text-xs">{fb.time}</span>
                 </div>
                 <p className="text-[#111817] dark:text-white font-medium mb-3 leading-relaxed">{fb.text}</p>
                 <div className="flex items-center gap-2">
                   <div className="size-6 rounded-full bg-gray-200"></div>
                   <span className="text-sm font-semibold text-slate-500">{fb.teacher}</span>
                 </div>
               </div>
             ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-white/5 rounded-xl border border-[#dce5e4] dark:border-white/10 overflow-hidden">
            <div className="p-4 bg-background-light dark:bg-white/5 border-b border-[#dce5e4] dark:border-white/10 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">campaign</span>
              <h3 className="font-bold">Comunicados Escolares</h3>
            </div>
            <div className="divide-y divide-[#dce5e4] dark:divide-white/10">
              {['Informativo Mensal - Abril', 'Reuniões de Pais e Mestres', 'Recesso de Semana Santa'].map(title => (
                <a key={title} className="block p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group" href="#">
                  <h4 className="text-sm font-bold group-hover:underline">{title}</h4>
                  <p className="text-xs text-[#638885] mt-1">Breve resumo do comunicado escolar aqui...</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentPortal;
