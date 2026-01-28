
import React from 'react';
import { AppView, UserRole } from '../types';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
  user: { name: string, role: UserRole, function: string, avatar?: string };
  isOpen: boolean;
  onToggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onNavigate, 
  onLogout, 
  user, 
  isOpen, 
  onToggleSidebar 
}) => {
  const navItems = [
    { view: AppView.DASHBOARD, icon: 'grid_view', label: 'Dashboard' },
    { view: AppView.STUDENTS, icon: 'group', label: 'Alunos' },
    { view: AppView.REPORTS, icon: 'analytics', label: 'Estatísticas' },
  ];

  const activeBorderColor = "#E3B838";

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          onClick={onToggleSidebar}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
        />
      )}

      <aside className={`w-72 bg-[#091c47] border-r border-white/10 flex flex-col fixed h-full z-40 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-7 flex flex-col gap-9 h-full relative">
          
          <button 
            onClick={onToggleSidebar}
            className="absolute top-7 right-4 lg:right-2 p-1.5 text-white/40 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-xl">
              {isOpen ? 'first_page' : 'last_page'}
            </span>
          </button>

          <div className="flex items-center gap-5 px-2">
            <div 
              className="size-11 rounded-lg flex items-center justify-center text-black shadow-lg"
              style={{ backgroundColor: activeBorderColor, boxShadow: `0 0 15px ${activeBorderColor}33` }}
            >
              <span className="material-symbols-outlined !text-2xl font-black">shield</span>
            </div>
            <div>
              <h1 className="text-white text-xl font-black leading-tight tracking-tight font-display">Gestão</h1>
              <p className="text-[#E3B838] text-[11px] font-bold uppercase tracking-[0.2em]">Disciplinar</p>
            </div>
          </div>

          <nav className="flex flex-col gap-2.5 flex-1 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => onNavigate(item.view)}
                  className={`flex items-center gap-6 px-6 py-4 rounded-xl font-bold text-base transition-all duration-300 group border ${
                    isActive
                      ? `border-[#E3B838] bg-white/5 text-white shadow-[0_0_15px_rgba(227,184,56,0.05)]`
                      : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={`material-symbols-outlined !text-xl transition-all duration-300 ${isActive ? 'text-[#E3B838] scale-110' : 'text-[#E3B838]'}`}>
                    {item.icon}
                  </span>
                  <span className={`transition-colors duration-300 font-sans ${isActive ? 'text-white' : 'text-white/90'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
            
            <div className="mt-5 pt-5 border-t border-white/5 space-y-1.5">
              {user.role === UserRole.ADMIN && (
                <button 
                  onClick={() => onNavigate(AppView.MODERATORS)}
                  className={`w-full flex items-center gap-6 px-6 py-3.5 rounded-xl font-bold text-base transition-all group border ${
                    currentView === AppView.MODERATORS 
                    ? 'border-[#E3B838] bg-white/5 text-white' 
                    : 'border-transparent text-white/50 hover:text-[#E3B838] hover:bg-white/5'
                  }`}
                >
                  <span className={`material-symbols-outlined !text-xl text-[#E3B838]`}>manage_accounts</span>
                  <span className="font-sans">Moderadores</span>
                </button>
              )}
            </div>
          </nav>

          <div className="mt-auto space-y-5">
            <div className="px-2 flex items-center gap-6 py-5 border-t border-white/10">
              {user.avatar && user.avatar.length > 5 ? (
                <div 
                  className="size-11 rounded-full bg-cover bg-center border border-white/20 shrink-0"
                  style={{ backgroundImage: `url("${user.avatar}")` }}
                ></div>
              ) : (
                <div className="size-11 rounded-full bg-white/10 border border-white/20 shrink-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white/40">account_circle</span>
                </div>
              )}
              <div className="flex-1">
                <p className="text-white text-base font-bold font-sans leading-tight break-words">{user.name}</p>
                <p className="text-[#E3B838] text-[10px] font-black uppercase tracking-widest truncate mt-0.5">
                  {user.function}
                </p>
              </div>
            </div>

            <button 
              onClick={onLogout}
              className="w-full bg-transparent hover:bg-white/5 border border-white/10 text-[#FF0000] py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-4 active:scale-95 group font-sans"
            >
              <span className="material-symbols-outlined text-xl text-[#FF0000] group-hover:scale-110 transition-transform">logout</span>
              Sair do Sistema
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
