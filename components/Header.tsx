
import React from 'react';
import { UserRole } from '../types';

interface HeaderProps {
  title: string;
  user?: { name: string, role: UserRole, function: string, avatar?: string };
  onOpenMenu?: () => void;
  isMenuOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, user, onOpenMenu, isMenuOpen }) => {
  const getTranslatedTitle = (viewTitle: string) => {
    switch (viewTitle.toLowerCase()) {
      case 'dashboard': return 'Monitoramento';
      case 'students': return 'Painel de Alunos';
      case 'incidents': return 'Registro de Fatos Observados';
      case 'registry': return 'Lançamento de Novo FO';
      case 'reports': return 'Estatísticas Comportamentais';
      case 'profile': return 'Dossiê Disciplinar';
      case 'add_student': return 'Cadastro de Novo Aluno';
      case 'moderators': return 'Gestão de Equipe';
      default: return viewTitle;
    }
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-[#1a2b2a]/80 backdrop-blur-md sticky top-0 z-20 border-b border-[#dce5e4] dark:border-[#2d3f3e] px-4 sm:px-8 flex items-center justify-between">
      <div className="flex items-center gap-6">
        {!isMenuOpen && (
          <button 
            onClick={onOpenMenu}
            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all"
          >
            <span className="material-symbols-outlined !text-2xl">menu</span>
          </button>
        )}
        <h2 className="text-lg sm:text-xl font-bold tracking-tight truncate max-w-[200px] sm:max-w-none">
          {getTranslatedTitle(title)}
        </h2>
      </div>
      
      <div className="flex items-center gap-5 cursor-pointer group">
        <div className="text-right hidden lg:block">
          <p className="text-sm font-semibold group-hover:text-primary transition-colors">{user?.name || 'Administrador'}</p>
          <p className="text-[10px] text-[#638885] font-bold uppercase tracking-widest">{user?.function || 'ADMINISTRADOR CENTRAL'}</p>
        </div>
        {user?.avatar && user.avatar.length > 5 ? (
          <div 
            className="size-8 sm:size-10 rounded-full bg-cover bg-center border-2 border-primary/20" 
            style={{ backgroundImage: `url("${user.avatar}")` }}
          ></div>
        ) : (
          <div className="size-8 sm:size-10 rounded-full bg-slate-100 dark:bg-white/5 border-2 border-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-400 text-xl">account_circle</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
