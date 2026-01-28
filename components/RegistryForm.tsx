
import React, { useState, useEffect } from 'react';
import { FOType, AssignedTeam, FatoObservado } from '../types';

interface RegistryFormProps {
  onBack: () => void;
  prefilledStudent?: {name: string, rm: string} | null;
  onSave?: (fo: FatoObservado) => Promise<void> | void;
}

const RegistryForm: React.FC<RegistryFormProps> = ({ onBack, prefilledStudent, onSave }) => {
  const [foType, setFoType] = useState<FOType>('FO-');
  const [category, setCategory] = useState('');
  const [assignedTeam, setAssignedTeam] = useState<AssignedTeam>('Cívico-Militar');
  const [isSaving, setIsSaving] = useState(false);
  
  const [subject, setSubject] = useState('');
  const [professor, setProfessor] = useState('');
  const [monitor, setMonitor] = useState('');
  const [description, setDescription] = useState('');
  const [treatment, setTreatment] = useState('');

  // Lógica para roteamento automático baseado na categoria
  useEffect(() => {
    const psychosocialCategories = ['Preconceito', 'Bullying', 'Escuta Ativa', 'Racismo', 'Elogio', 'Outros (Psi)'];
    const civicMilitaryCategories = [
      'Agressão', 
      'Desrespeito', 
      'Uso Celular/Ap. Eletrônico', 
      'Dano ao Patrimônio', 
      'Brinco', 
      'Atraso', 
      'Uniforme', 
      'Pod/Vap',
      'Outros (Mil)'
    ];

    if (psychosocialCategories.includes(category) || foType === 'FO+') {
      setAssignedTeam('Psicossocial');
    } else if (civicMilitaryCategories.includes(category)) {
      setAssignedTeam('Cívico-Militar');
    }
  }, [category, foType]);

  const categories = foType === 'FO+' 
    ? ['Elogio', 'Participação', 'Liderança', 'Proatividade', 'Outros (Psi)']
    : [
        'Atraso',
        'Uniforme',
        'Brinco',
        'Pod/Vap',
        'Uso Celular/Ap. Eletrônico', 
        'Desrespeito', 
        'Agressão', 
        'Bullying',
        'Preconceito', 
        'Racismo',
        'Escuta Ativa', 
        'Dano ao Patrimônio', 
        'Outros (Mil)', 
        'Outros (Psi)'
      ];

  const inputClasses = "block w-full px-4 py-3 bg-[#f8fafb] dark:bg-[#152625] border border-[#e5eaea] dark:border-[#2a3a39] rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm placeholder:text-slate-400 placeholder:italic dark:text-white";
  const labelClasses = "block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prefilledStudent || isSaving) return;

    setIsSaving(true);
    
    const newFO: FatoObservado = {
      id: Math.random().toString(36).substr(2, 9),
      studentName: prefilledStudent.name,
      studentRm: prefilledStudent.rm,
      type: foType,
      category,
      rating: 'Pendente',
      team: assignedTeam,
      subject,
      professor,
      monitor,
      description,
      treatment,
      timestamp: 'Agora mesmo',
      dateIso: new Date().toISOString()
    };

    try {
      if (onSave) {
        await onSave(newFO);
      }
    } catch (error) {
      console.error("Erro ao salvar formulário:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fade-in">
      <nav className="flex items-center gap-2 text-sm text-[#638885] font-medium">
        <button onClick={onBack} className="hover:text-primary transition-colors">Dossiê</button>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-[#111817] dark:text-gray-200">Lançamento de FO</span>
      </nav>

      <div className="bg-white dark:bg-[#1e2e2d] rounded-3xl shadow-2xl border border-[#e5eaea] dark:border-[#2a3a39] overflow-hidden">
        <form className="p-6 sm:p-10 space-y-8" onSubmit={handleSubmit}>
          
          <div className="flex flex-col lg:flex-row gap-8 items-end border-b border-slate-100 dark:border-slate-800 pb-8">
            <div className="flex-1 space-y-2 w-full">
              <label className={labelClasses}>Identificação do Aluno</label>
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-3xl">account_circle</span>
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white leading-none mb-1 font-display">
                    {prefilledStudent?.name || "Aluno não selecionado"}
                  </h2>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                    Registro de Matrícula: {prefilledStudent?.rm || "---"}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-80 space-y-2">
              <label className={labelClasses}>Tipo de Registro</label>
              <div className="flex gap-2 p-1 bg-[#f8fafb] dark:bg-[#152625] rounded-xl border border-[#e5eaea] dark:border-[#2a3a39]">
                <button 
                  type="button"
                  onClick={() => setFoType('FO+')}
                  className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${foType === 'FO+' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400'}`}
                >
                  <span className="material-symbols-outlined text-sm">add</span> FO+ (Positivo)
                </button>
                <button 
                  type="button"
                  onClick={() => setFoType('FO-')}
                  className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${foType === 'FO-' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-400'}`}
                >
                  <span className="material-symbols-outlined text-sm">remove</span> FO- (Negativo)
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className={labelClasses}>Natureza da Ocorrência *</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClasses + " font-bold italic dark:bg-[#152625]"} 
                required
              >
                <option value="">Selecione uma categoria...</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className={labelClasses}>Disciplina / Matéria *</label>
              <input 
                className={inputClasses} 
                placeholder="Ex: Matemática, Português, Educação Física..." 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className={labelClasses}>Professor Solicitante *</label>
                <input 
                  className={inputClasses} 
                  placeholder="Nome do professor..." 
                  type="text" 
                  value={professor}
                  onChange={(e) => setProfessor(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>Monitor Militar de Serviço *</label>
                <input 
                  className={inputClasses} 
                  placeholder="Nome do monitor..." 
                  type="text" 
                  value={monitor}
                  onChange={(e) => setMonitor(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelClasses}>Relato Detalhado dos Fatos *</label>
              <textarea 
                className={inputClasses + " resize-none min-h-[160px]"} 
                placeholder="Descreva minuciosamente o ocorrido, citando horários e testemunhas se houver..." 
                rows={6} 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>
          </div>

          <div className="pt-8 space-y-6">
            <div className="p-5 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`size-12 rounded-xl flex items-center justify-center text-white shadow-lg ${assignedTeam === 'Psicossocial' ? 'bg-blue-500' : 'bg-slate-700'}`}>
                  <span className="material-symbols-outlined text-2xl">{assignedTeam === 'Psicossocial' ? 'psychology' : 'shield_person'}</span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">Unidade Destino</p>
                  <h4 className="font-black text-[#111817] dark:text-white text-lg">Equipe {assignedTeam}</h4>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white dark:bg-black/20 px-4 py-2 rounded-xl border border-primary/10">
                <span className="size-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Aguardando Análise</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4">
              <button 
                onClick={onBack} 
                className="w-full sm:w-auto px-10 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-gray-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all disabled:opacity-50" 
                type="button"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button 
                className="w-full sm:w-auto px-12 py-3.5 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed" 
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span className="material-symbols-outlined text-lg">send</span>
                )}
                {isSaving ? 'Salvando...' : 'Salvar e Encaminhar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistryForm;
