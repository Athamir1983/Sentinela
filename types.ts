
export enum AppView {
  LOGIN = 'login',
  DASHBOARD = 'dashboard',
  STUDENTS = 'students',
  INCIDENTS = 'incidents',
  REGISTRY = 'registry',
  REPORTS = 'reports',
  PROFILE = 'profile',
  ADD_STUDENT = 'add_student',
  MODERATORS = 'moderators'
}

export enum UserRole {
  ADMIN = 'Admin',
  MODERATOR = 'Moderador',
  USER = 'Usuário'
}

export type FOType = 'FO+' | 'FO-';
export type FOSeverity = 'Falta Leve' | 'Falta Média' | 'Falta Grave' | 'N/A';
export type FORating = 'Elogio Individual' | 'Elogio Coletivo' | 'Advertência Oral' | 'Advertência Escrita' | 'Suspensão' | 'Ações Educativas' | 'Transferência Educativa' | 'Pendente';
export type AssignedTeam = 'Psicossocial' | 'Cívico-Militar';

export type StudentStatus = 'Ativo' | 'Inativo' | 'Transferido' | 'Suspenso';

export interface Student {
  id: string;
  name: string;
  grade: string;
  section: string;
  avatar: string;
  foPositiveCount: number;
  foNegativeCount: number;
  behaviorScore: number;
  status: StudentStatus;
  rm: string;
  grades: (number | null)[]; // Notas dos 4 bimestres
  enrollmentDate: string;
}

export interface Moderator {
  id: string;
  name: string;
  email?: string;
  graduation: string;
  role: string;
  systemRole: UserRole; // Novo campo para controle de permissões
  avatar: string;
  lastAccess: string;
  status: 'Active' | 'Inactive';
}

export interface FatoObservado {
  id: string;
  studentName: string;
  studentRm: string;
  type: FOType;
  rating: string;
  severity?: FOSeverity;
  category: string;
  team: AssignedTeam;
  description: string;
  subject: string;
  professor: string;
  monitor: string;
  treatment: string;
  timestamp: string;
  dateIso: string;
  penaltyDays?: number;
}
