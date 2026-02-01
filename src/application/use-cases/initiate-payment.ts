import { ITransactionRepository } from '@domain/interfaces/transaction-repository';
import { IPaymentRepository } from '@domain/interfaces/payment-repository';
import { IPaymentGateway } from '@domain/interfaces/payment-gateway';
import { IUserRepository } from '@domain/interfaces/user-repository';
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
    private userRepository: IUserRepository,
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

    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.phone) {
      throw new Error('User phone number is required for payment');
    }

    if (!user.documentNumber) {
      throw new Error('User document number (CPF/CNPJ) is required for payment');
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
      customer: {
        email: user.email,
        name: user.name,
        cellphone: user.phone,
        taxId: user.documentNumber,
      },
    });

    return {
      payment: savedPayment,
      checkoutUrl: checkoutResult.checkoutUrl,
    };
  }
}
