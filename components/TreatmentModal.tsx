
import React, { useState } from 'react';
import { FatoObservado, FOSeverity, FORating } from '../types';

interface TreatmentModalProps {
  fo: FatoObservado;
  onClose: () => void;
  onSave: (id: string, text: string, severity?: FOSeverity, rating?: string, days?: number) => void;
}

const TreatmentModal: React.FC<TreatmentModalProps> = ({ fo, onClose, onSave }) => {
  const [treatmentText, setTreatmentText] = useState(fo.treatment || '');
  const [severity, setSeverity] = useState<FOSeverity>(fo.severity || (fo.type === 'FO-' ? 'Falta Leve' : 'N/A'));
  const [rating, setRating] = useState<string>(fo.rating !== 'Pendente' ? fo.rating : (fo.type === 'FO-' ? 'Advertência Oral' : 'Elogio Individual'));
  const [penaltyDays, setPenaltyDays] = useState<number>(fo.penaltyDays || 1);

  const foNegativeRatings = ['Advertência Oral', 'Advertência Escrita', 'Suspensão', 'Ações Educativas', 'Transferência Educativa'];
  const foPositiveRatings = ['Elogio Individual', 'Elogio Coletivo'];
  const severities: FOSeverity[] = ['Falta Leve', 'Falta Média', 'Falta Grave'];

  const inputClasses = "block w-full px-4 py-3 bg-[#f8fafb] dark:bg-[#152625] border border-[#e5eaea] dark:border-[#2a3a39] rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium";
  const labelClasses = "block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white dark:bg-[#1a2b2a] w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        <div className="p-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-black/20">
          <div className="flex items-center gap-3">
            <div className={`size-10 rounded-xl flex items-center justify-center text-white ${fo.type === 'FO+' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
              <span className="material-symbols-outlined">{fo.type === 'FO+' ? 'add' : 'remove'}</span>
            </div>
            <div>
              <h3 className="font-black text-lg leading-tight font-display text-slate-900 dark:text-white">Análise Técnica e Tratativa</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{fo.category} • {fo.timestamp}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-all text-slate-400">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Relato do Fato</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{fo.description}"</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fo.type === 'FO-' && (
              <div className="space-y-2">
                <label className={labelClasses}>Gravidade do Fato *</label>
                <div className="flex gap-2 p-1 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/5">
                  {severities.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSeverity(s)}
                      className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${severity === s ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {s.replace('Falta ', '')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className={labelClasses}>Enquadramento Disciplinar *</label>
              <select 
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className={inputClasses}
                required
              >
                {(fo.type === 'FO+' ? foPositiveRatings : foNegativeRatings).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {rating === 'Suspensão' && (
            <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-200 dark:border-amber-500/20 animate-fade-in">
              <label className={labelClasses + " text-amber-600"}>Duração da Suspensão (Dias) *</label>
              <div className="flex items-center gap-4">
                <input 
                  type="number" 
                  min="1" 
                  max="30"
                  value={penaltyDays}
                  onChange={(e) => setPenaltyDays(parseInt(e.target.value))}
                  className={inputClasses + " w-32 border-amber-200"}
                />
                <p className="text-xs font-bold text-amber-700">Impacto no Score: -{(penaltyDays * 0.50).toFixed(2)} pontos</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className={labelClasses}>Parecer da Coordenação / Tratativa Realizada *</label>
            <textarea
              className="w-full px-4 py-3 bg-[#f8fafb] dark:bg-[#152625] border border-primary/20 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium min-h-[120px] resize-none dark:text-white"
              placeholder="Descreva as ações tomadas, conversas realizadas com o aluno e/ou responsáveis..."
              value={treatmentText}
              onChange={(e) => setTreatmentText(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-white/10 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={() => { onSave(fo.id, treatmentText, severity, rating, rating === 'Suspensão' ? penaltyDays : undefined); onClose(); }}
            className="px-10 py-2.5 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">assignment_turned_in</span> Concluir Análise
          </button>
        </div>
      </div>
    </div>
  );
};

export default TreatmentModal;
