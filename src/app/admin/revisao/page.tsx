'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPendingReviews, PendingReviewItem } from '@app/actions/admin-actions';

function PriorityBadge({ score }: { score: number }) {
  let color = 'bg-slate-100 text-slate-600 border-slate-200';
  if (score > 80) color = 'bg-red-50 text-red-700 border-red-200';
  else if (score > 50) color = 'bg-amber-50 text-amber-700 border-amber-200';
  else if (score > 20) color = 'bg-blue-50 text-blue-700 border-blue-200';

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${color}`}>
      {score}
    </span>
  );
}

function calculatePriority(item: PendingReviewItem): number {
  let score = 0;
  // Critical risks boost propriety
  const risks = item.diagnosis.risks || [];
  if (risks.some(r => r.level === 'CRITICAL')) score += 50;
  if (risks.some(r => r.level === 'HIGH')) score += 30;

  // Lower confidence boosts priority (needs attention)
  const confidence = item.diagnosis.aiConfidence ?? 1;
  score += Math.round((1 - confidence) * 20);

  // Time decay could be added here (older = higher priority)

  return Math.min(score, 100);
}

export default function ReviewQueuePage() {
  const [items, setItems] = useState<PendingReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getPendingReviews();
        setItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-slate-200 rounded w-1/4"></div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white border border-slate-200 rounded-xl"></div>)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fila de Revisão</h1>
          <p className="text-slate-500 mt-1">Gerencie e aprove diagnósticos gerados pela IA</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold text-orange-600 font-mono">{items.length}</span>
          <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">Pendentes</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
              <th className="px-6 py-4">Transação ID</th>
              <th className="px-6 py-4">Cliente / Imóvel</th>
              <th className="px-6 py-4 w-48">Confiança IA</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Prioridade</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  Nenhum item pendente para revisão.
                </td>
              </tr>
            ) : items.map((item) => {
              const priority = calculatePriority(item);
              return (
                <tr key={item.diagnosis.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-slate-600 font-medium">#{item.transaction.id.slice(0, 8)}</span>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(item.transaction.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-900">{item.userName}</p>
                    <p className="text-xs text-slate-500 truncate max-w-[200px]" title={item.transaction.propertyAddress}>
                      {item.transaction.propertyAddress || 'Endereço não informado'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {item.diagnosis.status === 'DRAFT' ? (
                      <span className="text-xs text-slate-400 italic">Aguardando IA...</span>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className={`h-full rounded-full ${(item.diagnosis.aiConfidence || 0) > 0.8 ? 'bg-emerald-500' :
                              (item.diagnosis.aiConfidence || 0) > 0.6 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                            style={{ width: `${(item.diagnosis.aiConfidence || 0) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-600 min-w-[3ch]">
                          {Math.round((item.diagnosis.aiConfidence || 0) * 100)}%
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {item.diagnosis.status === 'DRAFT' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200 animate-pulse">
                        Analisando IA
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        Aguardando
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <PriorityBadge score={priority} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    {item.diagnosis.status === 'DRAFT' ? (
                      <span className="inline-flex items-center px-4 py-2 text-xs font-bold text-slate-400 bg-slate-100 rounded-lg cursor-not-allowed">
                        Processando...
                      </span>
                    ) : (
                      <Link
                        href={`/admin/revisao/${item.diagnosis.id}`}
                        className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-orange-600 rounded-lg transition-all shadow-sm hover:shadow-md"
                      >
                        Revisar
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
