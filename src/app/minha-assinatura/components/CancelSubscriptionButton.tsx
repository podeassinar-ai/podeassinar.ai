'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Modal, useToast } from '@ui/components/common';
import { cancelSubscriptionAction } from '@app/actions/subscription-actions';
import { mapGenericError } from '@/utils/error-mapping';

interface CancelSubscriptionButtonProps {
    subscriptionId: string;
    currentPeriodEnd: Date;
}

export function CancelSubscriptionButton({
    subscriptionId,
    currentPeriodEnd,
}: CancelSubscriptionButtonProps) {
    const router = useRouter();
    const { addToast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const formattedEndDate = new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date(currentPeriodEnd));

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await cancelSubscriptionAction(subscriptionId);
            setIsOpen(false);
            addToast('Assinatura cancelada com sucesso.', 'success');
            router.refresh();
        } catch (error: any) {
            addToast(`Erro ao cancelar assinatura. ${mapGenericError(error.message)}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="ghost"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 justify-center"
                onClick={() => setIsOpen(true)}
            >
                Cancelar Assinatura
            </Button>

            <Modal isOpen={isOpen} onClose={() => !loading && setIsOpen(false)} title="Tem certeza?">
                <div className="space-y-6">
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                        <p className="text-sm text-red-800">
                            Ao cancelar, sua assinatura deixa de renovar automaticamente. O acesso continua
                            disponível até <strong>{formattedEndDate}</strong>.
                        </p>
                    </div>

                    <p className="text-sm text-text-secondary">
                        Você ainda poderá usar seus benefícios durante o período já pago. Após essa data,
                        será necessário assinar um novo plano para continuar.
                    </p>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Button variant="secondary" onClick={() => setIsOpen(false)} disabled={loading}>
                            Manter Assinatura
                        </Button>
                        <Button
                            variant="primary"
                            className="bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700"
                            onClick={handleConfirm}
                            loading={loading}
                        >
                            Confirmar Cancelamento
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
