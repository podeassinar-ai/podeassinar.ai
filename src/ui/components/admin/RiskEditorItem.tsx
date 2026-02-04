'use client';

import { RiskItem } from '@domain/entities/diagnosis';

interface RiskEditorItemProps {
    risk: RiskItem;
    index: number;
    onUpdate: (index: number, updates: Partial<RiskItem>) => void;
    onRemove: (index: number) => void;
}

export function RiskEditorItem({ risk, index, onUpdate, onRemove }: RiskEditorItemProps) {
    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group">
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${risk.level === 'CRITICAL' ? 'bg-red-500' :
                risk.level === 'HIGH' ? 'bg-orange-500' :
                    risk.level === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}></div>

            <div className="flex justify-between items-start mb-3 pl-3">
                <select
                    value={risk.level}
                    onChange={(e) => onUpdate(index, { level: e.target.value as any })}
                    className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg px-2 py-1 text-slate-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
                >
                    <option value="LOW">Risco Baixo</option>
                    <option value="MEDIUM">Risco Médio</option>
                    <option value="HIGH">Risco Alto</option>
                    <option value="CRITICAL">Crítico</option>
                </select>
                <button
                    onClick={() => onRemove(index)}
                    className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="pl-3 space-y-3">
                <input
                    value={risk.description}
                    onChange={(e) => onUpdate(index, { description: e.target.value })}
                    className="w-full bg-transparent border-0 border-b-2 border-slate-100 text-sm font-semibold text-slate-800 focus:border-orange-500 focus:ring-0 px-0 py-1 transition-colors"
                    placeholder="Descrição do risco"
                />
                <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <textarea
                        value={risk.recommendation}
                        onChange={(e) => onUpdate(index, { recommendation: e.target.value })}
                        className="w-full bg-transparent text-xs text-slate-600 focus:text-slate-900 placeholder-slate-400 focus:outline-none resize-none h-auto min-h-[40px]"
                        placeholder="Recomendação de mitigação..."
                        rows={2}
                    />
                </div>
            </div>
        </div>
    );
}
