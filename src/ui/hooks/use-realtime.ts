'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { TransactionStatus } from '@domain/entities/transaction';
import { DiagnosisStatus } from '@domain/entities/diagnosis';

interface RealtimeTransactionUpdate {
  id: string;
  status: TransactionStatus;
  updatedAt: Date;
}

export function useTransactionStatus(transactionId: string) {
  const [status, setStatus] = useState<TransactionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function fetchInitialStatus() {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('status')
          .eq('id', transactionId)
          .single();

        if (error) throw error;
        setStatus(data.status as TransactionStatus);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchInitialStatus();

    const channel = supabase
      .channel(`transaction-${transactionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions',
          filter: `id=eq.${transactionId}`,
        },
        (payload) => {
          const newStatus = payload.new.status as TransactionStatus;
          setStatus(newStatus);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [transactionId]);

  return { status, loading, error };
}

export function useDiagnosisStatus(transactionId: string) {
  const [diagnosis, setDiagnosis] = useState<{ id: string; status: DiagnosisStatus } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function fetchInitialStatus() {
      try {
        const { data, error } = await supabase
          .from('diagnoses')
          .select('id, status')
          .eq('transaction_id', transactionId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setDiagnosis(null);
          } else {
            throw error;
          }
        } else {
          setDiagnosis({ id: data.id, status: data.status as DiagnosisStatus });
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchInitialStatus();

    const channel = supabase
      .channel(`diagnosis-${transactionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'diagnoses',
          filter: `transaction_id=eq.${transactionId}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setDiagnosis(null);
          } else {
            const data = payload.new as any;
            setDiagnosis({ id: data.id, status: data.status as DiagnosisStatus });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [transactionId]);

  return { diagnosis, loading, error };
}

export function useUserTransactions(userId: string) {
  const [transactions, setTransactions] = useState<RealtimeTransactionUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('id, status, updated_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(
        data.map((t: any) => ({
          id: t.id,
          status: t.status as TransactionStatus,
          updatedAt: new Date(t.updated_at),
        }))
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    refetch();

    const channel = supabase
      .channel(`user-transactions-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTx = payload.new as any;
            setTransactions((prev) => [
              {
                id: newTx.id,
                status: newTx.status as TransactionStatus,
                updatedAt: new Date(newTx.updated_at),
              },
              ...prev,
            ]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as any;
            setTransactions((prev) =>
              prev.map((t) =>
                t.id === updated.id
                  ? {
                      id: updated.id,
                      status: updated.status as TransactionStatus,
                      updatedAt: new Date(updated.updated_at),
                    }
                  : t
              )
            );
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as any;
            setTransactions((prev) => prev.filter((t) => t.id !== deleted.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refetch]);

  return { transactions, loading, error, refetch };
}
