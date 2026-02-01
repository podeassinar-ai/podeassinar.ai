'use client';

import { useEffect, useState } from 'react';
import { 
  getPendingFulfillments, 
  assignFulfillment, 
  completeFulfillment,
  addFulfillmentNotes,
} from '@app/actions/admin-actions';
import { FulfillmentRequest, FulfillmentStatus } from '@domain/entities/fulfillment-request';
import { Button, Card } from '@ui/components/common';

type EnhancedFulfillment = FulfillmentRequest & { userName: string; userEmail: string };

const statusConfig: Record<FulfillmentStatus, { label: string; class: string }> = {
  PENDING: { label: 'Pendente', class: 'bg-yellow-100 text-yellow-800' },
  IN_PROGRESS: { label: 'Em Andamento', class: 'bg-blue-100 text-blue-800' },
  COMPLETED: { label: 'Concluído', class: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelado', class: 'bg-gray-100 text-gray-800' },
};

export default function CertidoesQueuePage() {
  const [items, setItems] = useState<EnhancedFulfillment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [notesModal, setNotesModal] = useState<{ id: string; notes: string } | null>(null);

  async function loadItems() {
    try {
      const data = await getPendingFulfillments();
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

  async function handleAssign(id: string) {
    setProcessing(id);
    try {
      const updated = await assignFulfillment(id);
      setItems(items.map(item => 
        item.id === id ? { ...item, ...updated } : item
      ));
    } catch (err: any) {
      alert('Erro ao assumir: ' + err.message);
    } finally {
      setProcessing(null);
    }
  }

  async function handleComplete(id: string) {
    setProcessing(id);
    try {
      await completeFulfillment(id);
      setItems(items.filter(item => item.id !== id));
    } catch (err: any) {
      alert('Erro ao concluir: ' + err.message);
    } finally {
      setProcessing(null);
    }
  }

  async function handleSaveNotes() {
    if (!notesModal) return;
    setProcessing(notesModal.id);
    try {
      const updated = await addFulfillmentNotes(notesModal.id, notesModal.notes);
      setItems(items.map(item => 
        item.id === notesModal.id ? { ...item, notes: updated.notes } : item
      ));
      setNotesModal(null);
    } catch (err: any) {
      alert('Erro ao salvar notas: ' + err.message);
    } finally {
      setProcessing(null);
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
          <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Pedidos de Certidões</h1>
          <p className="mt-1 text-sm text-gray-500">
            Solicitações de matrículas e certidões para processamento manual
          </p>
        </div>
        <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium">
          {items.length} pendentes
        </span>
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum pedido pendente</h3>
            <p className="mt-1 text-sm text-gray-500">
              Todos os pedidos de certidões foram processados.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const statusInfo = statusConfig[item.status];
            return (
              <Card key={item.id}>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-mono text-gray-500">
                          #{item.id.slice(0, 8)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${statusInfo.class}`}>
                          {statusInfo.label}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {item.requestType}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase">Matrícula</p>
                          <p className="text-lg font-medium text-gray-900">{item.registryNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase">Cartório</p>
                          <p className="text-sm text-gray-700">{item.registryOffice}</p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Solicitante:</span> {item.userName}
                        </p>
                        <p className="text-xs text-gray-500">{item.userEmail}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Solicitado em: {formatDate(item.createdAt)}
                        </p>
                      </div>

                      {item.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Notas</p>
                          <p className="text-sm text-gray-700">{item.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {item.status === 'PENDING' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleAssign(item.id)}
                          disabled={processing === item.id}
                        >
                          {processing === item.id ? 'Assumindo...' : 'Assumir'}
                        </Button>
                      )}
                      {item.status === 'IN_PROGRESS' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleComplete(item.id)}
                          disabled={processing === item.id}
                        >
                          {processing === item.id ? 'Concluindo...' : 'Concluir'}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setNotesModal({ id: item.id, notes: item.notes || '' })}
                      >
                        Adicionar Notas
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {notesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Adicionar Notas</h3>
            <textarea
              className="w-full border border-gray-300 rounded-md p-3 h-32 resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={notesModal.notes}
              onChange={(e) => setNotesModal({ ...notesModal, notes: e.target.value })}
              placeholder="Digite suas observações sobre este pedido..."
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => setNotesModal(null)}>
                Cancelar
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSaveNotes}
                disabled={processing === notesModal.id}
              >
                {processing === notesModal.id ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
