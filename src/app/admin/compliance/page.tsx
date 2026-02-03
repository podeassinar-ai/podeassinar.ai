'use client';

export default function CompliancePage() {
    const policies = [
        { title: 'Retenção de Certidões', description: 'Documentos são retidos por 30 dias após emissão.', status: 'active' },
        { title: 'Exclusão Automática', description: 'Arquivos temporários são removidos após 24h.', status: 'active' },
        { title: 'Anonimização de Usuários', description: 'Dados pessoais são anonimizados após cancelamento.', status: 'pending' },
    ];

    const accessLogs = [
        { id: 1, user: 'Admin User', action: 'VIEW_DOCUMENT', resource: 'Doc-4422', timestamp: '2023-10-25 14:30', ip: '192.168.1.1' },
        { id: 2, user: 'System IA', action: 'PROCESS_DATA', resource: 'Tx-9921', timestamp: '2023-10-25 14:28', ip: '10.0.0.5' },
        { id: 3, user: 'Admin User', action: 'LOGIN', resource: 'System', timestamp: '2023-10-25 09:00', ip: '192.168.1.1' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Compliance & LGPD</h1>
                <p className="text-slate-500 mt-1">Painel de controle do Encarregado de Dados (DPO)</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Access Logs */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-semibold text-slate-900">Logs de Acesso Recentes (Audit Trail)</h3>
                            <button className="text-xs text-orange-600 hover:text-orange-700 font-medium transition-colors">Exportar CSV</button>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
                                <tr>
                                    <th className="px-6 py-3">Timestamp</th>
                                    <th className="px-6 py-3">Usuário</th>
                                    <th className="px-6 py-3">Ação</th>
                                    <th className="px-6 py-3">Recurso</th>
                                    <th className="px-6 py-3">IP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {accessLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3 text-slate-500 font-mono text-xs">{log.timestamp}</td>
                                        <td className="px-6 py-3 text-slate-900 font-medium">{log.user}</td>
                                        <td className="px-6 py-3">
                                            <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-orange-600 font-mono text-xs">{log.resource}</td>
                                        <td className="px-6 py-3 text-slate-400 text-xs">{log.ip}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Policies Status */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-4">Políticas de Dados Ativas</h3>
                        <div className="space-y-4">
                            {policies.map((policy, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${policy.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{policy.title}</p>
                                        <p className="text-xs text-slate-500 leading-relaxed">{policy.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* DPO Contact */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-lg">
                        <h3 className="font-semibold text-white mb-2">DPO Encarregado</h3>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                                LG
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-200">Legal Department</p>
                                <p className="text-xs text-slate-400">dpo@podeassinar.ai</p>
                            </div>
                        </div>
                        <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-all shadow-md hover:shadow-lg">
                            Iniciar Relatório de Incidente
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
