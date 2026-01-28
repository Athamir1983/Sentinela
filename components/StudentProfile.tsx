
import React, { useState, useMemo } from 'react';
import { FatoObservado, Student, UserRole, FOSeverity } from '../types';
import TreatmentModal from './TreatmentModal';
import EditStudentModal from './EditStudentModal';
import ProfilePhotoCapture from './ProfilePhotoCapture';
import { supabase } from '../supabase';

interface StudentProfileProps {
  student: Student | null;
  user: { name: string, role: UserRole };
  onNewFO?: (context: {name: string, rm: string}) => void;
  incidents?: FatoObservado[];
  onBack?: () => void;
  onSaveTreatment?: (id: string, text: string, severity?: FOSeverity, rating?: string, days?: number) => void;
  onUpdateStudent?: (student: Student) => void;
}

const StudentProfile: React.FC<StudentProfileProps> = ({ student, user, onNewFO, incidents = [], onBack, onSaveTreatment, onUpdateStudent }) => {
  const [selectedFOForTreatment, setSelectedFOForTreatment] = useState<FatoObservado | null>(null);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);
  const [imgError, setImgError] = useState(false);

  const breakdown = useMemo(() => {
    if (!student) return null;
    let base = 8.00;
    
    let meritBonusCount = 0;
    student.grades.forEach(g => { if(g !== null && g >= 8.0) meritBonusCount++; });
    let meritBonus = meritBonusCount * 0.50;
    
    const negFOs = incidents.filter(i => i.type === 'FO-').sort((a, b) => 
      new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime()
    );
    
    const refDate = negFOs.length > 0 ? new Date(negFOs[0].dateIso) : new Date(student.enrollmentDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - refDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    let timeBonus = diffDays > 60 ? (diffDays - 60) * 0.20 : 0.00;

    let adjustments = 0;
    incidents.forEach(fo => {
      switch (fo.rating) {
        case 'Advertência Oral': adjustments -= 0.10; break;
        case 'Advertência Escrita': adjustments -= 0.30; break;
        case 'Suspensão': adjustments -= (0.50 * (fo.penaltyDays || 1)); break;
        case 'Elogio Individual': adjustments += 0.50; break;
        case 'Elogio Coletivo': adjustments += 0.30; break;
      }
    });

    const total = Math.min(10.0, Math.max(0.0, base + meritBonus + timeBonus + adjustments));
    return { base, meritBonus, timeBonus, adjustments, total, daysClean: diffDays, meritBonusCount };
  }, [student, incidents]);

  const handlePhotoUpdate = async (newUrl: string) => {
    if (!student || !onUpdateStudent) return;
    setImgError(false);
    
    const { error } = await supabase
      .from('alunos')
      .update({ avatar_url: newUrl })
      .eq('id', student.id);

    if (error) {
      alert("Erro ao vincular foto: " + error.message);
      return;
    }

    onUpdateStudent({ ...student, avatar: newUrl });
    setIsCapturingPhoto(false);
  };

  const category = useMemo(() => {
    if (!breakdown) return { label: 'N/A', color: 'text-slate-400', bg: 'bg-slate-400' };
    const score = breakdown.total;
    if (score >= 10) return { label: 'Excepcional', color: 'text-emerald-500', bg: 'bg-emerald-500' };
    if (score >= 9) return { label: 'Ótimo', color: 'text-emerald-400', bg: 'bg-emerald-400' };
    if (score >= 7) return { label: 'Bom', color: 'text-blue-500', bg: 'bg-blue-500' };
    if (score >= 5) return { label: 'Regular', color: 'text-amber-500', bg: 'bg-amber-500' };
    if (score >= 2) return { label: 'Insuficiente', color: 'text-rose-500', bg: 'bg-rose-500' };
    return { label: 'Incompatível', color: 'text-red-700', bg: 'bg-red-700' };
  }, [breakdown]);

  if (!student || !breakdown) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
        <span className="material-symbols-outlined text-6xl mb-4">person_off</span>
        <p className="text-lg font-bold">Nenhum aluno selecionado</p>
        <button onClick={onBack} className="mt-4 text-primary font-bold hover:underline">Voltar para a listagem</button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Ativo': return 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400';
      case 'Suspenso': return 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400';
      case 'Transferido': return 'text-slate-500 bg-slate-100 dark:bg-white/5 dark:text-slate-400';
      default: return 'text-slate-400 bg-slate-100';
    }
  };

  const avatarSrc = student.avatar && !imgError ? student.avatar : null;

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-[1600px] mx-auto animate-fade-in relative font-sans w-full">
      {selectedFOForTreatment && onSaveTreatment && (
        <TreatmentModal 
          fo={selectedFOForTreatment} 
          onClose={() => setSelectedFOForTreatment(null)} 
          onSave={onSaveTreatment} 
        />
      )}
      {isEditingStudent && onUpdateStudent && <EditStudentModal student={student} onClose={() => setIsEditingStudent(false)} onSave={onUpdateStudent} />}
      {isCapturingPhoto && (
        <ProfilePhotoCapture 
          rm={student.rm} 
          onUploadSuccess={handlePhotoUpdate} 
          onClose={() => setIsCapturingPhoto(false)} 
        />
      )}

      <aside className="w-full lg:w-80 shrink-0 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-[#dce5e4] dark:border-white/10 shadow-sm relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-primary"></div>
          
          <div className="flex flex-col items-center">
            <div 
              className="relative mb-6 group cursor-pointer" 
              onClick={() => user.role !== UserRole.USER ? setIsCapturingPhoto(true) : null}
            >
              {avatarSrc ? (
                <img 
                  src={avatarSrc} 
                  onError={() => setImgError(true)}
                  className="size-32 rounded-3xl object-cover ring-8 ring-slate-50 dark:ring-white/5 shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:ring-primary/20"
                  alt={student.name}
                />
              ) : (
                <div className="size-32 rounded-3xl bg-slate-100 dark:bg-white/5 flex flex-col items-center justify-center ring-8 ring-slate-50 dark:ring-white/5 shadow-xl transition-all group-hover:bg-primary/5">
                  <span className="material-symbols-outlined text-5xl text-slate-300 group-hover:text-primary transition-colors">person</span>
                  <span className="text-[8px] font-black uppercase text-slate-400 mt-2">{user.role !== UserRole.USER ? 'Vincular Foto' : 'Sem Identidade'}</span>
                </div>
              )}
              {user.role !== UserRole.USER && (
                <div className="absolute -bottom-2 -right-2 size-8 bg-primary rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-xs">add_a_photo</span>
                </div>
              )}
            </div>
            <h1 className="text-2xl font-black text-[#111817] dark:text-white leading-tight mb-1 font-display uppercase tracking-tight">{student.name}</h1>
            <p className="text-primary font-black text-[11px] uppercase tracking-[0.2em] mb-6">RM: {student.rm}</p>
            
            <div className={`w-full p-3 rounded-2xl border transition-all duration-300 mb-6 ${getStatusColor(student.status)}`}>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-black uppercase tracking-widest">{student.status}</span>
              </div>
            </div>

            <div className="w-full bg-slate-50 dark:bg-black/20 p-6 rounded-2xl border border-slate-100 dark:border-white/5 mb-6 text-center">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Grau de Comportamento</p>
               <div className="flex items-baseline justify-center gap-1">
                 <span className={`text-5xl font-black font-display ${category.color}`}>{breakdown.total.toFixed(2)}</span>
                 <span className="text-xs font-bold text-slate-400">/ 10.0</span>
               </div>
               <p className={`mt-2 text-[10px] font-black uppercase tracking-widest ${category.color}`}>{category.label}</p>
            </div>
          </div>
        </div>
        
        {user.role === UserRole.ADMIN && (
          <button 
            onClick={() => setIsEditingStudent(true)}
            className="w-full py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-primary hover:border-primary transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-base">settings</span>
            Configurações do Perfil
          </button>
        )}
      </aside>

      <section className="flex-1 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-[#dce5e4] dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-[#111817] dark:text-white font-display uppercase tracking-tight">Composição do Grau</h2>
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 px-4 py-2 rounded-full border border-blue-100 dark:border-blue-500/20">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm">history</span>
              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{breakdown.daysClean} Dias sem Faltas</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-white/5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Grau Base</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white font-display">{breakdown.base.toFixed(2)}</p>
            </div>
            <div className="p-5 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-2">Mérito Intelectual</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-emerald-600 font-display">+{breakdown.meritBonus.toFixed(2)}</p>
              </div>
            </div>
            <div className="p-5 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-500/20">
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-2">Bônus Exemplar</p>
              <p className="text-2xl font-black text-blue-600 font-display">+{breakdown.timeBonus.toFixed(2)}</p>
            </div>
            <div className="p-5 bg-rose-50 dark:bg-rose-500/10 rounded-2xl border border-rose-100 dark:border-rose-500/20">
              <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-2">Ajustes FO</p>
              <p className="text-2xl font-black text-rose-600 font-display">{breakdown.adjustments >= 0 ? '+' : ''}{breakdown.adjustments.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#dce5e4] dark:border-white/10 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 dark:border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-[#111817] dark:text-white font-display uppercase tracking-tight">Histórico Disciplinar</h2>
              <p className="text-sm text-slate-400 font-medium">Cronologia de fatos e méritos</p>
            </div>
            <div className="flex gap-3">
               <button onClick={onBack} className="px-6 py-2.5 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all">Voltar</button>
               <button onClick={() => onNewFO?.({name: student.name, rm: student.rm})} className="px-8 py-2.5 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                 <span className="material-symbols-outlined text-base">edit_note</span> Novo FO
               </button>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {incidents.length > 0 ? incidents.map((fo) => (
              <div key={fo.id} className="relative pl-8 border-l-2 border-slate-100 dark:border-white/5 pb-8 last:pb-0">
                <div className={`absolute -left-[9px] top-0 size-4 rounded-full border-4 border-white dark:border-slate-900 shadow-sm ${fo.type === 'FO+' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                <div className="bg-slate-50/50 dark:bg-black/10 rounded-2xl p-6 border border-slate-100 dark:border-white/5 group hover:border-primary/20 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{fo.timestamp}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${fo.type === 'FO+' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10'}`}>
                        {fo.category}
                      </span>
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 uppercase font-display tracking-tight">
                    {fo.subject} <span className="text-slate-400 font-medium lowercase">[{fo.rating}]</span>
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic mb-4">"{fo.description}"</p>

                  {/* Detalhes da Tratativa se existirem */}
                  {fo.treatment && (
                    <div className="mt-4 p-4 bg-white/50 dark:bg-black/20 rounded-xl border border-primary/5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary text-sm">verified_user</span>
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest">Parecer da Coordenação</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic">
                        {fo.treatment}
                      </p>
                    </div>
                  )}

                  {/* Botão de Analisar (Apenas para Admin/Moderador) */}
                  {user.role !== UserRole.USER && (
                    <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-white/5 flex justify-end">
                      <button 
                        onClick={() => setSelectedFOForTreatment(fo)}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-primary text-[9px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95"
                      >
                        <span className="material-symbols-outlined text-sm">assignment_turned_in</span>
                        {fo.treatment ? 'Revisar Análise' : 'Analisar e Tratar'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <div className="py-20 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-100 dark:text-white/5 mb-4">history_edu</span>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Sem registros no dossiê até o momento.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudentProfile;
