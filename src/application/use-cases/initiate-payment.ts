import { ITransactionRepository } from '@domain/interfaces/transaction-repository';
import { IPaymentRepository } from '@domain/interfaces/payment-repository';
import { IPaymentGateway, CheckoutResult } from '@domain/interfaces/payment-gateway';
import { createPayment, Payment } from '@domain/entities/payment';
import { v4 as uuidv4 } from 'uuid';

const DIAGNOSTIC_PRICE = {
  amount: 30000,
  currency: 'BRL',
};

export interface InitiatePaymentInput {
  userId: string;
  transactionId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface InitiatePaymentOutput {
  payment: Payment;
  checkoutUrl: string;
}

export class InitiatePaymentUseCase {
  constructor(
    private transactionRepository: ITransactionRepository,
    private paymentRepository: IPaymentRepository,
    private paymentGateway: IPaymentGateway
  ) {}

  async execute(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const transaction = await this.transactionRepository.findById(input.transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.userId !== input.userId) {
      throw new Error('Unauthorized access to transaction');
    }

    if (transaction.status !== 'PENDING_PAYMENT') {
      throw new Error('Transaction is not ready for payment');
    }

    const existingPayments = await this.paymentRepository.findByTransactionId(input.transactionId);
    const pendingPayment = existingPayments.find(p => p.status === 'PENDING' || p.status === 'PROCESSING');
    if (pendingPayment) {
      throw new Error('A payment is already in progress for this transaction');
    }

    const payment = createPayment({
      id: uuidv4(),
      transactionId: input.transactionId,
      userId: input.userId,
      type: 'DIAGNOSTIC',
      amount: DIAGNOSTIC_PRICE.amount,
      currency: DIAGNOSTIC_PRICE.currency,
    });

    const savedPayment = await this.paymentRepository.create(payment);

    const checkoutResult = await this.paymentGateway.createCheckout({
      amount: DIAGNOSTIC_PRICE.amount,
      currency: DIAGNOSTIC_PRICE.currency,
      description: 'Diagnóstico Jurídico Imobiliário - PodeAssinar.ai',
      metadata: {
        paymentId: savedPayment.id,
        transactionId: input.transactionId,
        userId: input.userId,
      },
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
    });

    return {
      payment: savedPayment,
      checkoutUrl: checkoutResult.checkoutUrl,
    };
  }
}
