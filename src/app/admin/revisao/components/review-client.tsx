'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DetailedDiagnosisItem, updateDiagnosis, approveDiagnosis } from '@app/actions/admin-actions';
import { Document } from '@domain/entities/document';
import { RiskItem, LegalPathway } from '@domain/entities/diagnosis';



export default function ReviewControlRoom({ data }: { data: DetailedDiagnosisItem }) {
    const router = useRouter();
    const [activeDoc, setActiveDoc] = useState<Document & { signedUrl: string } | null>(data.documents[0] || null);
    const [diagnosis] = useState(data.diagnosis);
    const [saving, setSaving] = useState(false);

    // Edit State
    const [summary, setSummary] = useState(diagnosis.summary || '');
    const [risks, setRisks] = useState<RiskItem[]>(diagnosis.risks || []);
    const [pathways, setPathways] = useState<LegalPathway[]>(diagnosis.pathways || []);

    async function handleSave(approve: boolean = false) {
        setSaving(true);
        try {
            await updateDiagnosis(diagnosis.id, {
                summary,
                risks,
                pathways,
            });

            if (approve) {
                await approveDiagnosis(diagnosis.id);
                router.push('/admin/revisao');
            }
        } catch (err) {
            console.error(err);
            alert('Erro ao salvar');
        } finally {
            setSaving(false);
        }
    }

    const getDocTypeLabel = (type: string) => {
        return type;
    };

    return (
        <div className="flex h-[calc(100vh-100px)] overflow-hidden gap-6">
            {/* LEFT PANE: Documents */}
            <div className="w-1/2 flex flex-col bg-slate-100 border border-slate-200 rounded-xl overflow-hidden shadow-inner">
                <div className="flex items-center gap-2 p-2 border-b border-slate-200 bg-white overflow-x-auto">
                    {data.documents.map((doc) => (
                        <button
                            key={doc.id}
                            onClick={() => setActiveDoc(doc)}
                            className={`
                                px-3 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-colors
                                ${activeDoc?.id === doc.id
                                    ? 'bg-orange-50 text-orange-600 border border-orange-100 shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                }
                            `}
                        >
                            {getDocTypeLabel(doc.type) || doc.fileName}
                        </button>
                    ))}
                    {data.documents.length === 0 && (
                        <span className="p-3 text-sm text-slate-500">Nenhum documento anexado.</span>
                    )}
                </div>

                <div className="flex-1 bg-slate-200 relative flex items-center justify-center p-4">
                    {activeDoc ? (
                        activeDoc.mimeType === 'application/pdf' ? (
                            <iframe
                                src={activeDoc.signedUrl}
                                className="w-full h-full border-0 rounded-lg shadow-sm bg-white"
                                title="Document Viewer"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full w-full bg-white rounded-lg shadow-sm overflow-hidden">
                                <img src={activeDoc.signedUrl} alt="Document" className="max-w-full max-h-full object-contain" />
                            </div>
                        )
                    ) : (
                        <div className="text-slate-500 font-medium">
                            Selecione um documento pare visualizar
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT PANE: Analysis Editor */}
            <div className="w-1/2 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xl">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white shadow-sm z-10">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Análise Jurídica</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">IA Confiança:</span>
                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                <div className={`h-full ${(diagnosis.aiConfidence || 0) > 0.8 ? 'bg-emerald-500' :
                                    (diagnosis.aiConfidence || 0) > 0.6 ? 'bg-amber-500' : 'bg-red-500'
                                    }`} style={{ width: `${(diagnosis.aiConfidence || 0) * 100}%` }}></div>
                            </div>
                            <span className="text-xs font-mono font-bold text-slate-600">{Math.round((diagnosis.aiConfidence || 0) * 100)}%</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleSave(false)}
                            disabled={saving}
                            className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-800 transition shadow-sm"
                        >
                            Salvar Rascunho
                        </button>
                        <button
                            onClick={() => handleSave(true)}
                            disabled={saving}
                            className="px-4 py-2 text-sm font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                        >
                            {saving ? 'Processando...' : 'Aprovar & Enviar'}
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50">

                    {/* Summary Section */}
                    <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative group focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all">
                        <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 rounded-l-xl group-focus-within:bg-orange-500 transition-colors"></div>
                        <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest pl-2">Resumo Executivo</h3>
                        <textarea
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            className="w-full h-32 bg-transparent border-0 p-2 text-slate-700 text-sm focus:ring-0 resize-none placeholder-slate-400 font-medium leading-relaxed"
                            placeholder="Escreva o resumo geral da análise..."
                        />
                    </section>

                    {/* Risks Section */}
                    <section>
                        <div className="flex justify-between items-center mb-4 px-1">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Riscos Identificados</h3>
                            <button
                                onClick={() => setRisks([...risks, { id: crypto.randomUUID(), level: 'MEDIUM', category: 'OUTROS', description: '', recommendation: '' }])}
                                className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                + Adicionar Risco
                            </button>
                        </div>

                        <div className="space-y-4">
                            {risks.map((risk, idx) => (
                                <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group">
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${risk.level === 'CRITICAL' ? 'bg-red-500' :
                                        risk.level === 'HIGH' ? 'bg-orange-500' :
                                            risk.level === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
                                        }`}></div>

                                    <div className="flex justify-between items-start mb-3 pl-3">
                                        <select
                                            value={risk.level}
                                            onChange={(e) => {
                                                const newRisks = [...risks];
                                                newRisks[idx].level = e.target.value as any;
                                                setRisks(newRisks);
                                            }}
                                            className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg px-2 py-1 text-slate-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
                                        >
                                            <option value="LOW">Risco Baixo</option>
                                            <option value="MEDIUM">Risco Médio</option>
                                            <option value="HIGH">Risco Alto</option>
                                            <option value="CRITICAL">Crítico</option>
                                        </select>
                                        <button
                                            onClick={() => setRisks(risks.filter((_, i) => i !== idx))}
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
                                            onChange={(e) => {
                                                const newRisks = [...risks];
                                                newRisks[idx].description = e.target.value;
                                                setRisks(newRisks);
                                            }}
                                            className="w-full bg-transparent border-0 border-b-2 border-slate-100 text-sm font-semibold text-slate-800 focus:border-orange-500 focus:ring-0 px-0 py-1 transition-colors"
                                            placeholder="Descrição do risco"
                                        />
                                        <div className="flex items-start gap-2">
                                            <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            <textarea
                                                value={risk.recommendation}
                                                onChange={(e) => {
                                                    const newRisks = [...risks];
                                                    newRisks[idx].recommendation = e.target.value;
                                                    setRisks(newRisks);
                                                }}
                                                className="w-full bg-transparent text-xs text-slate-600 focus:text-slate-900 placeholder-slate-400 focus:outline-none resize-none h-auto min-h-[40px]"
                                                placeholder="Recomendação de mitigação..."
                                                rows={2}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {risks.length === 0 && (
                                <div className="text-center py-8 bg-slate-100/50 rounded-xl border border-dashed border-slate-300">
                                    <p className="text-sm text-slate-500 font-medium">Nenhum risco identificado.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Pathways Section */}
                    <section>
                        <h3 className="text-xs font-bold text-slate-500 mb-4 px-1 uppercase tracking-widest">Caminhos Jurídicos</h3>
                        <div className="space-y-4">
                            {pathways.map((path, idx) => (
                                <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative pl-6">
                                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-indigo-500 rounded-l-xl opacity-20"></div>
                                    <input
                                        value={path.title}
                                        onChange={(e) => {
                                            const newPaths = [...pathways];
                                            newPaths[idx].title = e.target.value;
                                            setPathways(newPaths);
                                        }}
                                        className="w-full bg-transparent font-bold text-slate-800 mb-2 focus:outline-none focus:text-indigo-700 text-sm"
                                        placeholder="Título do caminho"
                                    />
                                    <textarea
                                        value={path.description}
                                        onChange={(e) => {
                                            const newPaths = [...pathways];
                                            newPaths[idx].description = e.target.value;
                                            setPathways(newPaths);
                                        }}
                                        className="w-full bg-transparent text-sm text-slate-600 focus:text-slate-900 h-16 resize-none focus:outline-none leading-relaxed"
                                        placeholder="Descrição detalhada..."
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
