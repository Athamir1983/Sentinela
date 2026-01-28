
import React, { useState } from 'react';
import { Student, StudentStatus } from '../types';

interface EditStudentModalProps {
  student: Student;
  onClose: () => void;
  onSave: (updatedStudent: Student) => void;
}

const EditStudentModal: React.FC<EditStudentModalProps> = ({ student, onClose, onSave }) => {
  const [formData, setFormData] = useState<Student>({ ...student });

  const inputClasses = "block w-full px-4 py-3 bg-[#f8fafb] dark:bg-[#152625] border border-[#e5eaea] dark:border-[#2a3a39] rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium";
  const labelClasses = "block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2";

  const handleGradeChange = (index: number, value: string) => {
    const newGrades = [...formData.grades];
    if (value === "") {
      newGrades[index] = null;
    } else {
      const numValue = parseFloat(value);
      newGrades[index] = isNaN(numValue) ? null : numValue;
    }
    setFormData({ ...formData, grades: newGrades });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#1a2b2a] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        <div className="p-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-black/20">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">edit_square</span>
            </div>
            <h3 className="font-black text-lg leading-tight font-display">Editar Dossiê</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-all text-slate-400">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); onClose(); }} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className={labelClasses}>Nome Completo</label>
              <input className={inputClasses} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>

            <div className="space-y-4">
              <label className={labelClasses}>Histórico Acadêmico (Notas Bimestrais)</label>
              <div className="grid grid-cols-4 gap-3">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="space-y-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase text-center">{i+1}º B</p>
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="10" 
                      placeholder="—"
                      value={formData.grades[i] === null ? "" : formData.grades[i]!} 
                      onChange={(e) => handleGradeChange(i, e.target.value)}
                      className="w-full text-center px-2 py-2.5 bg-slate-50 dark:bg-[#152625] border border-[#e5eaea] dark:border-[#2a3a39] rounded-lg text-sm font-bold"
                    />
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-slate-500 italic mt-2">Deixe em branco para bimesters em que o aluno não estava presente (Transferência).</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelClasses}>Situação Atual</label>
                <select className={inputClasses} value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as StudentStatus})}>
                  <option value="Ativo">Ativo</option>
                  <option value="Transferido">Transferido</option>
                  <option value="Suspenso">Suspenso</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>Turma</label>
                <input className={inputClasses} value={formData.section} onChange={(e) => setFormData({...formData, section: e.target.value})} required />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3 border-t border-slate-100 dark:border-white/5">
            <button type="button" onClick={onClose} className="flex-1 py-3 px-4 rounded-xl text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">Descartar</button>
            <button type="submit" className="flex-[2] py-3 px-4 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">Salvar Alterações</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentModal;
