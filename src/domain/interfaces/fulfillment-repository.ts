import { FulfillmentRequest, FulfillmentStatus } from '../entities/fulfillment-request';

export interface IFulfillmentRepository {
  create(request: FulfillmentRequest): Promise<FulfillmentRequest>;
  findById(id: string): Promise<FulfillmentRequest | null>;
  findByTransactionId(transactionId: string): Promise<FulfillmentRequest | null>;
  findByStatus(status: FulfillmentStatus): Promise<FulfillmentRequest[]>;
  findPending(): Promise<FulfillmentRequest[]>;
  updateStatus(id: string, status: FulfillmentStatus): Promise<FulfillmentRequest>;
  assign(id: string, assignedTo: string): Promise<FulfillmentRequest>;
  markCompleted(id: string): Promise<FulfillmentRequest>;
  addNotes(id: string, notes: string): Promise<FulfillmentRequest>;
  delete(id: string): Promise<void>;
}
