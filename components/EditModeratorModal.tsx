
import React, { useState } from 'react';
import { Moderator, UserRole } from '../types';

interface EditModeratorModalProps {
  moderator: Moderator;
  onClose: () => void;
  onSave: (updatedModerator: Moderator) => void;
}

const EditModeratorModal: React.FC<EditModeratorModalProps> = ({ moderator, onClose, onSave }) => {
  const [formData, setFormData] = useState<Moderator>({ ...moderator });

  const inputClasses = "block w-full px-4 py-3 bg-[#f8fafb] dark:bg-[#152625] border border-[#e5eaea] dark:border-[#2a3a39] rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium";
  const labelClasses = "block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white dark:bg-[#1a2b2a] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        <div className="p-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-black/20">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">person_edit</span>
            </div>
            <h3 className="font-black text-lg leading-tight font-display">Editar Moderador</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-all text-slate-400">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); onClose(); }} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className={labelClasses}>Nome do Moderador</label>
              <input 
                className={inputClasses} 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                required
              />
            </div>

            <div className="space-y-2">
              <label className={labelClasses}>Graduação</label>
              <input 
                className={inputClasses} 
                value={formData.graduation} 
                onChange={(e) => setFormData({...formData, graduation: e.target.value})} 
                required
                placeholder="Ex: Capitão, Sargento..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelClasses}>Cargo / Função</label>
                <input 
                  className={inputClasses} 
                  value={formData.role} 
                  onChange={(e) => setFormData({...formData, role: e.target.value})} 
                  required
                />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>Status de Acesso</label>
                <select 
                  className={inputClasses} 
                  value={formData.status} 
                  onChange={(e) => setFormData({...formData, status: e.target.value as 'Active' | 'Inactive'})}
                >
                  <option value="Active">Ativo</option>
                  <option value="Inactive">Inativo</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelClasses}>Nível de Acesso (Papel no Sistema)</label>
              <select 
                className={inputClasses} 
                value={formData.systemRole} 
                onChange={(e) => setFormData({...formData, systemRole: e.target.value as UserRole})}
              >
                <option value={UserRole.ADMIN}>Admin</option>
                <option value={UserRole.MODERATOR}>Moderador</option>
                <option value={UserRole.USER}>Usuário</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-[2] py-3 px-4 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Salvar Dados
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModeratorModal;
