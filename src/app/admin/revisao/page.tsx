'use client';

import { useEffect, useState, useMemo } from 'react';
import { getPendingReviews, approveDiagnosis, PendingReviewItem } from '@app/actions/admin-actions';
import { Button, Card } from '@ui/components/common';
import { RiskItem, LegalPathway } from '@domain/entities/diagnosis';

const riskLevelColors: Record<string, string> = {
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

function getConfidenceBadge(confidence?: number) {
  if (confidence === undefined) {
    return { color: 'bg-gray-100 text-gray-600', label: 'N/A', priority: 2 };
  }
  if (confidence >= 0.8) {
    return { color: 'bg-green-100 text-green-800', label: 'Alta', priority: 3 };
  }
  if (confidence >= 0.5) {
    return { color: 'bg-yellow-100 text-yellow-800', label: 'Media', priority: 2 };
  }
  return { color: 'bg-red-100 text-red-800', label: 'Baixa', priority: 1 };
}

function hasCriticalRisks(risks: RiskItem[]): boolean {
  return risks.some(r => r.level === 'CRITICAL');
}

function hasHighRisks(risks: RiskItem[]): boolean {
  return risks.some(r => r.level === 'HIGH' || r.level === 'CRITICAL');
}

function getAttentionPoints(item: PendingReviewItem): string[] {
  const points: string[] = [];
  const confidence = item.diagnosis.aiConfidence;
  
  if (confidence !== undefined && confidence < 0.5) {
    points.push('Baixa confianca da IA - revisar com atencao');
  }
  
  const criticalRisks = item.diagnosis.risks.filter(r => r.level === 'CRITICAL');
  if (criticalRisks.length > 0) {
    points.push(`${criticalRisks.length} risco(s) critico(s) identificado(s)`);
  }
  
  const highRisks = item.diagnosis.risks.filter(r => r.level === 'HIGH');
  if (highRisks.length > 0) {
    points.push(`${highRisks.length} risco(s) alto(s) identificado(s)`);
  }
  
  if (!item.diagnosis.summary && !item.diagnosis.propertyStatus) {
    points.push('Resumo ausente');
  }
  
  return points;
}

function calculatePriority(item: PendingReviewItem): number {
  let score = 0;
  
  if (hasCriticalRisks(item.diagnosis.risks)) score += 100;
  if (hasHighRisks(item.diagnosis.risks)) score += 50;
  
  const confidence = item.diagnosis.aiConfidence;
  if (confidence !== undefined) {
    score += Math.round((1 - confidence) * 30);
  } else {
    score += 15;
  }
  
  return score;
}

export default function ReviewQueuePage() {
  const [items, setItems] = useState<PendingReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => calculatePriority(b) - calculatePriority(a));
  }, [items]);

  const stats = useMemo(() => {
    const needsAttention = items.filter(
      item => (item.diagnosis.aiConfidence ?? 1) < 0.5 || hasCriticalRisks(item.diagnosis.risks)
    ).length;
    return { needsAttention, total: items.length };
  }, [items]);

  async function loadItems() {
    try {
      const data = await getPendingReviews();
      setItems(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function handleApprove(diagnosisId: string) {
    setApproving(diagnosisId);
    try {
      await approveDiagnosis(diagnosisId);
      setItems(items.filter(item => item.diagnosis.id !== diagnosisId));
    } catch (err: any) {
      alert('Erro ao aprovar: ' + err.message);
    } finally {
      setApproving(null);
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-64"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fila de Revisao</h1>
          <p className="mt-1 text-sm text-gray-500">
            Diagnosticos gerados pela IA aguardando aprovacao humana
          </p>
        </div>
        <div className="flex items-center gap-3">
          {stats.needsAttention > 0 && (
            <span className="bg-red-100 text-red-800 px-3 py-1.5 rounded-full text-sm font-medium">
              {stats.needsAttention} requer atencao
            </span>
          )}
          <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-medium">
            {stats.total} pendentes
          </span>
        </div>
      </div>

      {items.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum item pendente</h3>
            <p className="mt-1 text-sm text-gray-500">
              Todos os diagnosticos foram revisados.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedItems.map((item) => {
            const confidenceBadge = getConfidenceBadge(item.diagnosis.aiConfidence);
            const attentionPoints = getAttentionPoints(item);
            const needsAttention = attentionPoints.length > 0;

            return (
              <Card 
                key={item.diagnosis.id} 
                className={`overflow-hidden ${needsAttention ? 'ring-2 ring-orange-300' : ''}`}
              >
                <div className="p-6">
                  {needsAttention && (
                    <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <h4 className="text-sm font-semibold text-orange-800 mb-1">Pontos de Atencao</h4>
                      <ul className="text-sm text-orange-700 space-y-1">
                        {attentionPoints.map((point, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-mono text-gray-500">
                          #{item.diagnosis.id.slice(0, 8)}
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          {item.transaction.type}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${confidenceBadge.color}`}>
                          IA: {confidenceBadge.label}
                          {item.diagnosis.aiConfidence !== undefined && (
                            <span className="ml-1 opacity-75">
                              ({Math.round(item.diagnosis.aiConfidence * 100)}%)
                            </span>
                          )}
                        </span>
                        {hasCriticalRisks(item.diagnosis.risks) && (
                          <span className="text-xs bg-red-600 text-white px-2 py-1 rounded font-medium">
                            CRITICO
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.transaction.propertyAddress || 'Endereco nao informado'}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Cliente: {item.userName} ({item.userEmail})
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Gerado em: {formatDate(item.diagnosis.aiGeneratedAt ?? item.diagnosis.updatedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setExpandedId(expandedId === item.diagnosis.id ? null : item.diagnosis.id)}
                      >
                        {expandedId === item.diagnosis.id ? 'Ocultar' : 'Ver Detalhes'}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApprove(item.diagnosis.id)}
                        disabled={approving === item.diagnosis.id}
                      >
                        {approving === item.diagnosis.id ? 'Aprovando...' : 'Aprovar'}
                      </Button>
                    </div>
                  </div>

                  {expandedId === item.diagnosis.id && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Resumo</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                          {item.diagnosis.summary || item.diagnosis.propertyStatus || 'Sem resumo disponivel'}
                        </p>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Riscos Identificados ({item.diagnosis.risks.length})
                        </h4>
                        <div className="space-y-2">
                          {item.diagnosis.risks
                            .sort((a, b) => {
                              const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
                              return order[a.level] - order[b.level];
                            })
                            .map((risk: RiskItem, idx: number) => (
                              <div key={risk.id || idx} className="bg-gray-50 p-3 rounded text-sm">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${riskLevelColors[risk.level]}`}>
                                    {risk.level}
                                  </span>
                                  <span className="text-gray-500">{risk.category}</span>
                                </div>
                                <p className="text-gray-700">{risk.description}</p>
                                <p className="text-gray-500 mt-1 text-xs">
                                  Recomendacao: {risk.recommendation}
                                </p>
                              </div>
                            ))}
                          {item.diagnosis.risks.length === 0 && (
                            <p className="text-gray-500 text-sm">Nenhum risco identificado</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Caminhos Sugeridos ({item.diagnosis.pathways.length})
                        </h4>
                        <div className="space-y-2">
                          {item.diagnosis.pathways.map((pathway: LegalPathway, idx: number) => (
                            <div key={pathway.id || idx} className="bg-gray-50 p-3 rounded text-sm">
                              <p className="font-medium text-gray-900">{pathway.title}</p>
                              <p className="text-gray-600 mt-1">{pathway.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Duracao: {pathway.estimatedDuration} | 
                                Custo: R$ {pathway.estimatedCost?.min?.toLocaleString('pt-BR')} - R$ {pathway.estimatedCost?.max?.toLocaleString('pt-BR')}
                              </p>
                            </div>
                          ))}
                          {item.diagnosis.pathways.length === 0 && (
                            <p className="text-gray-500 text-sm">Nenhum caminho sugerido</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
