'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DetailedDiagnosisItem, updateDiagnosis, approveDiagnosis } from '@app/actions/admin-actions';
import { Document } from '@domain/entities/document';
import { RiskItem, LegalPathway } from '@domain/entities/diagnosis';

import { DocumentViewer } from '@ui/components/admin/DocumentViewer';
import { RiskEditorItem } from '@ui/components/admin/RiskEditorItem';
import { PathwayEditorItem } from '@ui/components/admin/PathwayEditorItem';

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

    function handleRiskUpdate(index: number, updates: Partial<RiskItem>) {
        const newRisks = [...risks];
        newRisks[index] = { ...newRisks[index], ...updates };
        setRisks(newRisks);
    }

    function handleRiskRemove(index: number) {
        setRisks(risks.filter((_, i) => i !== index));
    }

    function handleAddRisk() {
        setRisks([...risks, { id: crypto.randomUUID(), level: 'MEDIUM', category: 'OUTROS', description: '', recommendation: '' }]);
    }

    function handlePathwayUpdate(index: number, updates: Partial<LegalPathway>) {
        const newPaths = [...pathways];
        newPaths[index] = { ...newPaths[index], ...updates };
        setPathways(newPaths);
    }

    return (
        <div className="flex h-[calc(100vh-100px)] overflow-hidden gap-6">
            {/* LEFT PANE: Documents */}
            <DocumentViewer
                documents={data.documents}
                activeDoc={activeDoc}
                setActiveDoc={setActiveDoc}
            />

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
                                onClick={handleAddRisk}
                                className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                + Adicionar Risco
                            </button>
                        </div>

                        <div className="space-y-4">
                            {risks.map((risk, idx) => (
                                <RiskEditorItem
                                    key={idx}
                                    risk={risk}
                                    index={idx}
                                    onUpdate={handleRiskUpdate}
                                    onRemove={handleRiskRemove}
                                />
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
                                <PathwayEditorItem
                                    key={idx}
                                    pathway={path}
                                    index={idx}
                                    onUpdate={handlePathwayUpdate}
                                />
                            ))}
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
