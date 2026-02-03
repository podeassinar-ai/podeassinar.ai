export interface EmailRecipient {
    email: string;
    name?: string;
}

export interface EmailPayload {
    to: EmailRecipient[];
    subject: string;
    htmlBody: string;
    textBody?: string;
}

export interface IEmailService {
    send(payload: EmailPayload): Promise<{ messageId: string }>;
}
