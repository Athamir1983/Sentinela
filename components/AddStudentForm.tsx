
import React, { useState } from 'react';

interface AddStudentFormProps {
  onBack: () => void;
  onSave?: (studentData: any) => Promise<void>;
}

const AddStudentForm: React.FC<AddStudentFormProps> = ({ onBack, onSave }) => {
  const [etapa, setEtapa] = useState<'Fundamental' | 'Médio'>('Fundamental');
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    rm: '',
    serie: '6º Ano',
    turma: 'A',
    avatar_url: ''
  });

  const seriesFundamental = ['6º Ano', '7º Ano', '8º Ano', '9º Ano'];
  const seriesMedio = ['1º Ano', '2º Ano', '3º Ano'];

  const handleQuickFill = () => {
    const firstNames = ['Lucas', 'Ana', 'Gabriel', 'Mariana', 'Vitor', 'Camila', 'Rafael', 'Juliana', 'Rodrigo', 'Beatriz', 'Mateus', 'Leticia'];
    const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Lima', 'Ferreira', 'Costa', 'Rodrigues', 'Almeida', 'Mendes', 'Nunes'];
    const randomName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    const randomRM = `${2024 + Math.floor(Math.random() * 2)}.${Math.floor(1000000 + Math.random() * 9000000)}`;
    
    // Lista de fotos reais de jovens para simular o efetivo
    const realStudentPhotos = [
      'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=200&h=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517677129300-07b130802f46?q=80&w=200&h=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&h=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&h=200&auto=format&fit=crop'
    ];
    const randomAvatar = realStudentPhotos[Math.floor(Math.random() * realStudentPhotos.length)];

    setFormData({
      ...formData,
      nome: randomName,
      rm: randomRM,
      avatar_url: randomAvatar
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSave) return;

    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        etapa: etapa
      });
      alert('Aluno Cadastrado com Sucesso!');
      onBack();
    } catch (err: any) {
      alert('Erro ao cadastrar: ' + (err.message || 'Verifique se o RM já existe.'));
    } finally {
      setIsSaving(false);
    }
  };

  const inputClasses = "block w-full px-4 py-3 bg-[#f8fafb] dark:bg-[#152625] border border-[#e5eaea] dark:border-[#2a3a39] rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium dark:text-white";
  const labelClasses = "block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2";

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      <nav className="flex items-center gap-2 text-sm text-[#638885] font-medium">
        <button onClick={onBack} className="hover:text-primary transition-colors">Efetivo de Alunos</button>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-[#111817] dark:text-gray-200">Novo Cadastro de Aluno</span>
      </nav>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-[#111817] dark:text-white tracking-tight font-display uppercase">Incluir Novo Aluno</h1>
          <p className="text-[#638885] text-sm font-medium">Insira as informações básicas ou use o gerador para popular a base rapidamente.</p>
        </div>
        <button 
          type="button"
          onClick={handleQuickFill}
          className="px-4 py-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 border border-amber-200 dark:border-amber-500/30 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-amber-100 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-sm">magic_button</span>
          Gerar Dados de Teste
        </button>
      </div>

      <div className="bg-white dark:bg-[#1e2e2d] rounded-3xl shadow-2xl border border-[#e5eaea] dark:border-[#2a3a39] overflow-hidden">
        <form className="p-6 sm:p-10 space-y-8" onSubmit={handleSubmit}>
          
          <div className="flex flex-col items-center gap-4 mb-8">
            <div 
              className="size-28 rounded-3xl bg-slate-100 dark:bg-black/20 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 relative group cursor-pointer overflow-hidden transition-all hover:border-primary/50"
              style={formData.avatar_url && formData.avatar_url.length > 5 ? { backgroundImage: `url(${formData.avatar_url})`, backgroundSize: 'cover', borderStyle: 'solid' } : {}}
            >
              {(!formData.avatar_url || formData.avatar_url.length <= 5) && <span className="material-symbols-outlined text-4xl text-slate-400 group-hover:text-primary transition-colors">add_a_photo</span>}
              {formData.avatar_url && formData.avatar_url.length > 5 && (
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Alterar Foto</span>
                 </div>
              )}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visualização do Avatar</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className={labelClasses}>Nome Completo *</label>
              <input 
                className={inputClasses} 
                placeholder="Ex: João da Silva" 
                type="text" 
                required 
                value={formData.nome}
                onChange={e => setFormData({...formData, nome: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className={labelClasses}>Registro de Matrícula (RM) *</label>
              <input 
                className={inputClasses} 
                placeholder="Ex: 2024.123" 
                type="text" 
                required 
                value={formData.rm}
                onChange={e => setFormData({...formData, rm: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className={labelClasses}>Etapa Escolar *</label>
              <div className="flex gap-1 p-1 bg-[#f8fafb] dark:bg-[#152625] rounded-xl border border-[#e5eaea] dark:border-[#2a3a39]">
                <button 
                  type="button" 
                  onClick={() => {
                    setEtapa('Fundamental');
                    setFormData({...formData, serie: '6º Ano'});
                  }}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${etapa === 'Fundamental' ? 'bg-primary text-white shadow-md' : 'text-slate-400'}`}
                >
                  Fund.
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setEtapa('Médio');
                    setFormData({...formData, serie: '1º Ano'});
                  }}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${etapa === 'Médio' ? 'bg-primary text-white shadow-md' : 'text-slate-400'}`}
                >
                  Médio
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelClasses}>Ano/Série *</label>
              <select 
                className={inputClasses} 
                required
                value={formData.serie}
                onChange={e => setFormData({...formData, serie: e.target.value})}
              >
                {(etapa === 'Fundamental' ? seriesFundamental : seriesMedio).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className={labelClasses}>Turma *</label>
              <select 
                className={inputClasses} 
                required
                value={formData.turma}
                onChange={e => setFormData({...formData, turma: e.target.value})}
              >
                <option value="A">Turma A</option>
                <option value="B">Turma B</option>
                <option value="C">Turma C</option>
                <option value="D">Turma D</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClasses}>URL Direta da Imagem (Link do HTML) *</label>
            <div className="relative group">
               <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-xl">link</span>
               <input 
                  className={inputClasses + " pl-12"} 
                  placeholder="Cole aqui o link direto (ex: https://site.com/foto.jpg)" 
                  type="url" 
                  value={formData.avatar_url}
                  onChange={e => setFormData({...formData, avatar_url: e.target.value})}
               />
            </div>
            <p className="text-[9px] text-slate-400 italic mt-1 font-medium">Recomendado: Utilize links de repositórios de imagens ou do site institucional para exibir a foto real do aluno.</p>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-end gap-4 border-t border-slate-100 dark:border-slate-800">
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
                <span className="material-symbols-outlined text-lg">how_to_reg</span>
              )}
              {isSaving ? 'Salvando...' : 'Confirmar Cadastro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentForm;
