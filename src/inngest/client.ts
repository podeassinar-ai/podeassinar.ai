import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'podeassinar',
  eventKey: process.env.INNGEST_EVENT_KEY,
});

export type DiagnosisGenerateRequestedEvent = {
  name: 'diagnosis/generate-requested';
  data: {
    userId: string;
    transactionId: string;
  };
};

export type InngestEvents = DiagnosisGenerateRequestedEvent;
