'use client';

import { LegalPathway } from '@domain/entities/diagnosis';

interface PathwayEditorItemProps {
    pathway: LegalPathway;
    index: number;
    onUpdate: (index: number, updates: Partial<LegalPathway>) => void;
}

export function PathwayEditorItem({ pathway, index, onUpdate }: PathwayEditorItemProps) {
    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative pl-6">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-indigo-500 rounded-l-xl opacity-20"></div>
            <input
                value={pathway.title}
                onChange={(e) => onUpdate(index, { title: e.target.value })}
                className="w-full bg-transparent font-bold text-slate-800 mb-2 focus:outline-none focus:text-indigo-700 text-sm"
                placeholder="Título do caminho"
            />
            <textarea
                value={pathway.description}
                onChange={(e) => onUpdate(index, { description: e.target.value })}
                className="w-full bg-transparent text-sm text-slate-600 focus:text-slate-900 h-16 resize-none focus:outline-none leading-relaxed"
                placeholder="Descrição detalhada..."
            />
        </div>
    );
}
