
import React, { useState, useEffect } from 'react';
import { Moderator, UserRole } from '../types';
import EditModeratorModal from './EditModeratorModal';

interface ModeratorListProps {
  moderators: Moderator[];
  onAddModerator: (mod: Partial<Moderator> & { password?: string }) => Promise<void>;
  onUpdateModerator: (mod: Moderator) => Promise<void>;
  onDeleteModerator: (id: string) => Promise<void>;
  onRefresh?: () => Promise<void>;
}

const ModeratorList: React.FC<ModeratorListProps> = ({ moderators, onAddModerator, onUpdateModerator, onDeleteModerator, onRefresh }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingModerator, setEditingModerator] = useState<Moderator | null>(null);
  const [moderatorToDelete, setModeratorToDelete] = useState<Moderator | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'done'>('idle');
  
  const [newMod, setNewMod] = useState({ 
    name: '', 
    graduation: '', 
    role: '',
    systemRole: UserRole.MODERATOR,
    email: '',
    password: '',
    confirmPassword: '',
    avatarUrl: ''
  });

  useEffect(() => {
    if (syncStatus === 'done') {
      const timer = setTimeout(() => setSyncStatus('idle'), 5000);
      return () => clearTimeout(timer);
    }
  }, [syncStatus]);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleAddModerator = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(false);

    if (newMod.password !== newMod.confirmPassword) {
      setPasswordError(true);
      alert("ERRO: As senhas digitadas não conferem.");
      return;
    }

    if (newMod.password.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsSaving(true);
    try {
      const finalAvatar = newMod.avatarUrl.trim();
      
      await onAddModerator({
        name: newMod.name,
        email: newMod.email,
        graduation: newMod.graduation,
        role: newMod.role,
        systemRole: newMod.systemRole,
        password: newMod.password,
        avatar: finalAvatar,
      });

      setNewMod({ name: '', graduation: '', role: '', systemRole: UserRole.MODERATOR, email: '', password: '', confirmPassword: '', avatarUrl: '' });
      setIsAdding(false);
      setSyncStatus('syncing');
      setTimeout(() => setSyncStatus('done'), 4000);
      
    } catch (err) {
      console.error("Erro no fluxo do ModeratorList:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateModerator = async (updatedMod: Moderator) => {
    setIsSaving(true);
    try {
      await onUpdateModerator(updatedMod);
      setEditingModerator(null);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (moderatorToDelete) {
      setIsSaving(true);
      try {
        await onDeleteModerator(moderatorToDelete.id);
        setModeratorToDelete(null);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const inputClasses = "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-primary/20 text-sm transition-all";
  const labelClasses = "text-[10px] font-black text-slate-400 uppercase tracking-widest";

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-fade-in font-sans w-full">
      {editingModerator && (
        <EditModeratorModal 
          moderator={editingModerator}
          onClose={() => setEditingModerator(null)}
          onSave={handleUpdateModerator}
        />
      )}

      {moderatorToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#091c47]/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1a2b2a] w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-scale-in border border-rose-100 dark:border-rose-500/20">
            <div className="p-8 text-center">
              <div className="size-20 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-rose-500 text-4xl animate-pulse">warning</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white font-display uppercase tracking-tight mb-2">Revogar Acesso?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Remover acesso de <span className="font-bold text-slate-900 dark:text-white">{moderatorToDelete.name}</span>.
              </p>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-black/20 flex gap-3">
              <button disabled={isSaving} onClick={() => setModeratorToDelete(null)} className="flex-1 py-3.5 px-4 rounded-xl text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Cancelar</button>
              <button disabled={isSaving} onClick={confirmDelete} className="flex-1 py-3.5 px-4 rounded-xl bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-500/20 flex items-center justify-center gap-2">
                {isSaving ? <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <span className="material-symbols-outlined text-sm">delete_forever</span>}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-display uppercase">Equipe Militar</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Gestão de credenciais de monitoria.</p>
          </div>
          
          {syncStatus !== 'idle' && (
            <div className={`flex items-center gap-3 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest animate-fade-in ${syncStatus === 'syncing' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
              <span className={`material-symbols-outlined text-sm ${syncStatus === 'syncing' ? 'animate-spin' : ''}`}>
                {syncStatus === 'syncing' ? 'sync' : 'check_circle'}
              </span>
              {syncStatus === 'syncing' ? 'Sincronizando Banco de Dados...' : 'Efetivo Sincronizado'}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-primary rounded-xl border border-slate-200 dark:border-white/10 shadow-sm transition-all active:scale-95"
            title="Atualizar Lista"
          >
            <span className={`material-symbols-outlined text-xl ${isRefreshing ? 'animate-spin' : ''}`}>refresh</span>
          </button>
          
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-primary text-white px-6 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            Novo Moderador
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-primary/20 shadow-xl animate-scale-in relative">
          <div className="flex items-center justify-between mb-6">
             <h3 className="font-display font-black text-lg uppercase tracking-tight">Cadastro de Novo Moderador</h3>
             <button onClick={() => { setIsAdding(false); setPasswordError(false); }} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
             </button>
          </div>
          <form onSubmit={handleAddModerator} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className={labelClasses}>Nome Completo</label>
                <input required value={newMod.name} onChange={e => setNewMod({...newMod, name: e.target.value})} className={inputClasses} placeholder="Ex: Sgt. Francisco" />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>Graduação</label>
                <input required value={newMod.graduation} onChange={e => setNewMod({...newMod, graduation: e.target.value})} className={inputClasses} placeholder="Ex: 1º Sargento" />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>Cargo / Função</label>
                <input required value={newMod.role} onChange={e => setNewMod({...newMod, role: e.target.value})} className={inputClasses} placeholder="Monitor Disciplinar" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className={labelClasses}>Nível de Acesso (Status)</label>
                <select 
                  className={inputClasses}
                  value={newMod.systemRole}
                  onChange={e => setNewMod({...newMod, systemRole: e.target.value as UserRole})}
                >
                  <option value={UserRole.ADMIN}>Admin</option>
                  <option value={UserRole.MODERATOR}>Moderador</option>
                  <option value={UserRole.USER}>Usuário</option>
                </select>
              </div>
              <div className="space-y-2 col-span-2">
                <label className={labelClasses}>Link Direto da Imagem (Opcional)</label>
                <input value={newMod.avatarUrl} onChange={e => setNewMod({...newMod, avatarUrl: e.target.value})} className={inputClasses} placeholder="https://exemplo.com/foto.jpg" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className={labelClasses}>E-mail de Acesso</label>
                <input required type="email" value={newMod.email} onChange={e => setNewMod({...newMod, email: e.target.value})} className={inputClasses} placeholder="acesso@instituicao.gov.br" />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>Senha</label>
                <input required type="password" value={newMod.password} onChange={e => {setNewMod({...newMod, password: e.target.value}); setPasswordError(false);}} className={`${inputClasses} ${passwordError ? 'ring-2 ring-rose-500' : ''}`} />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>Confirmar Senha</label>
                <input required type="password" value={newMod.confirmPassword} onChange={e => {setNewMod({...newMod, confirmPassword: e.target.value}); setPasswordError(false);}} className={`${inputClasses} ${passwordError ? 'ring-2 ring-rose-500' : ''}`} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 rounded-lg text-slate-400 font-black text-[10px] uppercase tracking-widest transition-all">Descartar</button>
              <button type="submit" disabled={isSaving} className="bg-primary text-white px-10 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center gap-2 active:scale-95 transition-all">
                {isSaving ? <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <span className="material-symbols-outlined text-sm">verified_user</span>}
                {isSaving ? 'Gravando...' : 'Finalizar Cadastro'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {moderators.length > 0 ? moderators.map((mod) => (
          <div key={mod.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm relative group hover:shadow-md transition-all animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              {mod.avatar && mod.avatar.length > 5 ? (
                <div className="size-16 rounded-2xl bg-cover bg-center border-2 border-slate-100 dark:border-slate-800 shadow-sm" style={{backgroundImage: `url("${mod.avatar}")`}}></div>
              ) : (
                <div className="size-16 rounded-2xl bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-300 dark:text-slate-600">shield</span>
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">{mod.graduation}</p>
                <h4 className="font-display font-black text-slate-900 dark:text-white text-lg leading-tight uppercase truncate">{mod.name}</h4>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">{mod.role}</p>
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-white/5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-black uppercase tracking-widest text-[9px]">Acesso</span>
                <span className="text-slate-600 dark:text-slate-300 font-bold uppercase tracking-widest text-[9px]">{mod.systemRole}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-black uppercase tracking-widest text-[9px]">Status</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${mod.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-slate-100 text-slate-400'}`}>
                  {mod.status === 'Active' ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>

            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <button onClick={() => setEditingModerator(mod)} className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg">
                <span className="material-symbols-outlined text-base">edit</span>
              </button>
              <button onClick={() => setModeratorToDelete(mod)} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg">
                <span className="material-symbols-outlined text-base">delete</span>
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center text-slate-400 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-3xl">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-20">shield_person</span>
            <p className="text-xs font-black uppercase tracking-widest">Nenhum moderador listado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModeratorList;
