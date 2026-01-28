
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { AppView, FatoObservado, Student, UserRole, Moderator, FOSeverity } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import RegistryForm from './components/RegistryForm';
import ClassDirectory from './components/ClassDirectory';
import ReportsAnalytics from './components/ReportsAnalytics';
import StudentProfile from './components/StudentProfile';
import LoginPage from './components/LoginPage';
import AddStudentForm from './components/AddStudentForm';
import ModeratorList from './components/ModeratorList';
import { supabase } from './supabase';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN);
  const [currentUser, setCurrentUser] = useState<{name: string, role: UserRole, function: string, avatar?: string} | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [prefilledStudent, setPrefilledStudent] = useState<{name: string, rm: string} | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [students, setStudents] = useState<Student[]>([]);
  const [fatoObservados, setFatoObservados] = useState<FatoObservado[]>([]);
  const [moderators, setModerators] = useState<Moderator[]>([]);

  // Toggle dark mode class on document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Fetch moderator profile by email
  const fetchUserProfile = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('moderadores')
        .select('*')
        .eq('email', email)
        .single();

      if (error) throw error;
      
      setCurrentUser({
        name: data.nome,
        role: data.system_role as UserRole,
        function: data.funcao,
        avatar: data.avatar_url || ''
      });
      setCurrentView(AppView.DASHBOARD);
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  // Check for active Supabase session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user.email!);
      } else {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  // Load students from database
  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase.from('v_dashboard_alunos').select('*');
      if (error) throw error;
      if (data) {
        setStudents(data.map(s => ({
          id: s.id,
          name: s.nome,
          rm: s.rm,
          grade: s.serie,
          section: s.turma,
          avatar: s.avatar_url || '',
          status: s.status,
          behaviorScore: s.behavior_score,
          foPositiveCount: 0,
          foNegativeCount: 0,
          grades: [null, null, null, null],
          enrollmentDate: s.data_matricula
        })));
      }
    } catch (err) { console.error('Erro ao buscar alunos:', err); }
  };

  // Load observed facts (FOs) and link with student basic info
  const fetchIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from('fatos_observados')
        .select('*, alunos(nome, rm)')
        .order('data_fato', { ascending: false });
      if (error) throw error;
      if (data) {
        setFatoObservados(data.map(f => {
          let displaySubject = 'Geral';
          let displayDescription = f.descricao || '';
          const subjectMatch = displayDescription.match(/^\[(.*?)\]\s?(.*)$/);
          
          if (subjectMatch) {
            displaySubject = subjectMatch[1];
            displayDescription = subjectMatch[2];
          }

          return {
            id: f.id,
            studentName: f.alunos?.nome || 'Desconhecido',
            studentRm: f.alunos?.rm || '',
            type: f.tipo,
            category: f.categoria,
            rating: f.natureza,
            team: f.equipe_responsavel,
            description: displayDescription,
            subject: displaySubject,
            professor: f.professor_solicitante || '',
            monitor: f.monitor_responsavel || '',
            treatment: f.tratativa || '',
            timestamp: new Date(f.data_fato).toLocaleString('pt-BR'),
            dateIso: f.data_fato,
            penaltyDays: f.dias_suspensao
          };
        }));
      }
    } catch (err) { console.error('Erro ao buscar incidentes:', err); }
  };

  // Helper to refresh main school data
  const refreshAllData = async () => {
    await Promise.all([fetchStudents(), fetchIncidents()]);
  };

  // Load moderator team members
  const fetchModerators = async () => {
    try {
      const { data, error } = await supabase.from('moderadores').select('*').order('nome');
      if (error) throw error;
      if (data) {
        setModerators(data.map(m => ({
          id: m.id,
          name: m.nome,
          email: m.email,
          graduation: m.graduacao,
          role: m.funcao,
          systemRole: m.system_role as UserRole || UserRole.USER,
          avatar: m.avatar_url || '',
          lastAccess: m.ultimo_acesso,
          status: m.status as 'Active' | 'Inactive'
        })));
      }
    } catch (err) { console.error('Erro ao buscar moderadores:', err); }
  };

  // Refresh data when user authenticates
  useEffect(() => {
    if (currentUser) {
      fetchStudents();
      fetchIncidents();
      fetchModerators();
    }
  }, [currentUser]);

  // Handle system login via Supabase Auth
  const handleLogin = async (credentials: { email: string, pass: string }) => {
    try {
      setLoading(true);
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.pass
      });

      if (authError) throw authError;
      await fetchUserProfile(credentials.email);
    } catch (err: any) {
      alert("ACESSO NEGADO: " + err.message);
      setLoading(false);
    }
  };

  // Handle system logout
  const handleLogout = () => {
    supabase.auth.signOut();
    setCurrentUser(null);
    setCurrentView(AppView.LOGIN);
  };

  // Create new student record
  const handleSaveStudent = async (studentData: any) => {
    try {
      const { error } = await supabase.from('alunos').insert([studentData]);
      if (error) throw error;
      await fetchStudents();
    } catch (err) {
      console.error("Erro ao salvar aluno:", err);
      throw err;
    }
  };

  // Register new moderator into auth and public profile
  const handleSaveModerator = async (mod: Partial<Moderator> & { password?: string }) => {
    try {
      const { error: authError } = await supabase.auth.signUp({
        email: mod.email!,
        password: mod.password!,
        options: {
          data: {
            full_name: mod.name,
            graduation: mod.graduation,
            role: mod.role,
            system_role: mod.systemRole
          }
        }
      });
      if (authError) throw authError;
      await fetchModerators();
    } catch (err: any) {
      console.error("Erro ao salvar moderador:", err);
      throw err;
    }
  };

  // Update existing moderator data
  const handleUpdateModerator = async (mod: Moderator) => {
    try {
      const { error } = await supabase
        .from('moderadores')
        .update({
          nome: mod.name,
          graduacao: mod.graduation,
          funcao: mod.role,
          system_role: mod.systemRole,
          status: mod.status,
          avatar_url: mod.avatar
        })
        .eq('id', mod.id);
      if (error) throw error;
      await fetchModerators();
    } catch (err) {
      console.error("Erro ao atualizar moderador:", err);
    }
  };

  // Remove moderator access
  const handleDeleteModerator = async (id: string) => {
    try {
      const { error } = await supabase.from('moderadores').delete().eq('id', id);
      if (error) throw error;
      await fetchModerators();
    } catch (err) {
      console.error("Erro ao deletar moderador:", err);
    }
  };

  // Finalize FO analysis and treatment
  const handleSaveTreatment = async (foId: string, treatment: string, severity?: FOSeverity, rating?: string, penaltyDays?: number) => {
    try {
      const { error } = await supabase
        .from('fatos_observados')
        .update({
          tratativa: treatment,
          natureza: rating,
          dias_suspensao: penaltyDays
        })
        .eq('id', foId);
      if (error) throw error;
      await refreshAllData();
    } catch (err) {
      console.error("Erro ao salvar tratativa:", err);
      alert("Erro ao gravar análise. Tente novamente.");
    }
  };

  // Update student dossier info
  const handleUpdateStudent = async (student: Student) => {
    try {
      const { error } = await supabase
        .from('alunos')
        .update({
          nome: student.name,
          turma: student.section,
          status: student.status,
          avatar_url: student.avatar
        })
        .eq('id', student.id);
      if (error) throw error;
      await fetchStudents();
    } catch (err) {
      console.error("Erro ao atualizar aluno:", err);
    }
  };

  // Register new FO from the form
  const handleSaveFO = async (fo: FatoObservado) => {
    try {
      const student = students.find(s => s.rm === fo.studentRm);
      if (!student) throw new Error("Aluno não encontrado");

      const { error } = await supabase.from('fatos_observados').insert([{
        aluno_id: student.id,
        tipo: fo.type,
        categoria: fo.category,
        natureza: fo.rating,
        equipe_responsavel: fo.team,
        descricao: `[${fo.subject}] ${fo.description}`,
        professor_solicitante: fo.professor,
        monitor_responsavel: fo.monitor,
        tratativa: fo.treatment,
        data_fato: fo.dateIso
      }]);

      if (error) throw error;
      
      // Atualiza os dados primeiro para que o score mude no perfil
      await refreshAllData();
      
      // Limpa dados temporários
      setPrefilledStudent(null);
      
      // Retorna para o perfil do aluno para ver o FO no histórico
      setSelectedStudentId(student.id);
      setCurrentView(AppView.PROFILE);
    } catch (err: any) {
      console.error("Erro ao salvar FO:", err);
      alert("Falha ao salvar o Fato Observado: " + err.message);
    }
  };

  // Loading state screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#091c47] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-16 border-4 border-[#E3B838] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#E3B838] font-black uppercase tracking-widest text-xs">Carregando Sentinela...</p>
        </div>
      </div>
    );
  }

  // Auth guard: Login page if not authenticated
  if (currentView === AppView.LOGIN) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // View routing logic
  const renderContent = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return (
          <Dashboard 
            students={students} 
            onAddStudent={() => setCurrentView(AppView.ADD_STUDENT)} 
            onSelectStudent={(s) => { setSelectedStudentId(s.id); setCurrentView(AppView.PROFILE); }} 
          />
        );
      case AppView.STUDENTS:
        return (
          <ClassDirectory 
            students={students} 
            onSelectStudent={(s) => { setSelectedStudentId(s.id); setCurrentView(AppView.PROFILE); }} 
          />
        );
      case AppView.REGISTRY:
        return (
          <RegistryForm 
            onBack={() => setCurrentView(AppView.PROFILE)} 
            prefilledStudent={prefilledStudent}
            onSave={handleSaveFO}
          />
        );
      case AppView.REPORTS:
        return <ReportsAnalytics incidents={fatoObservados} students={students} onRefresh={refreshAllData} />;
      case AppView.PROFILE:
        const selStudent = students.find(s => s.id === selectedStudentId) || null;
        const studentIncidents = fatoObservados.filter(f => f.studentRm === selStudent?.rm);
        return (
          <StudentProfile 
            student={selStudent} 
            user={currentUser!} 
            onBack={() => setCurrentView(AppView.STUDENTS)}
            onNewFO={(ctx) => { setPrefilledStudent(ctx); setCurrentView(AppView.REGISTRY); }}
            incidents={studentIncidents}
            onSaveTreatment={handleSaveTreatment}
            onUpdateStudent={handleUpdateStudent}
          />
        );
      case AppView.ADD_STUDENT:
        return <AddStudentForm onBack={() => setCurrentView(AppView.STUDENTS)} onSave={handleSaveStudent} />;
      case AppView.MODERATORS:
        return (
          <ModeratorList 
            moderators={moderators} 
            onAddModerator={handleSaveModerator}
            onUpdateModerator={handleUpdateModerator}
            onDeleteModerator={handleDeleteModerator}
            onRefresh={fetchModerators}
          />
        );
      default:
        return <Dashboard students={students} onAddStudent={() => setCurrentView(AppView.ADD_STUDENT)} onSelectStudent={(s) => { setSelectedStudentId(s.id); setCurrentView(AppView.PROFILE); }} />;
    }
  };

  return (
    <div className={`min-h-screen flex bg-slate-50 dark:bg-[#0d1a19] text-slate-900 dark:text-white font-sans ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        onLogout={handleLogout} 
        user={currentUser!} 
        isOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>
        <Header 
          title={currentView} 
          user={currentUser!} 
          onOpenMenu={() => setIsSidebarOpen(true)}
          isMenuOpen={isSidebarOpen}
        />
        
        <div className="p-4 sm:p-8 flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
