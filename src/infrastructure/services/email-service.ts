import { IEmailService, EmailPayload } from '@domain/interfaces/email-service';

/**
 * Console-based email service for development/testing.
 * In production, replace with Resend, SendGrid, or AWS SES implementation.
 */
export class ConsoleEmailService implements IEmailService {
    async send(payload: EmailPayload): Promise<{ messageId: string }> {
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

        console.log('='.repeat(60));
        console.log('[EMAIL SERVICE] Sending email');
        console.log(`  Message ID: ${messageId}`);
        console.log(`  To: ${payload.to.map((r) => `${r.name} <${r.email}>`).join(', ')}`);
        console.log(`  Subject: ${payload.subject}`);
        console.log('  Body:');
        console.log(payload.textBody || payload.htmlBody);
        console.log('='.repeat(60));

        return { messageId };
    }
}

/**
 * Resend email service implementation.
 * Requires RESEND_API_KEY environment variable.
 */
export class ResendEmailService implements IEmailService {
    private apiKey: string;
    private fromAddress: string;

    constructor(apiKey?: string, fromAddress = 'noreply@podeassinar.ai') {
        this.apiKey = apiKey || process.env.RESEND_API_KEY || '';
        this.fromAddress = fromAddress;
    }

    async send(payload: EmailPayload): Promise<{ messageId: string }> {
        if (!this.apiKey) {
            console.warn('[ResendEmailService] No API key configured, falling back to console');
            return new ConsoleEmailService().send(payload);
        }

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: this.fromAddress,
                to: payload.to.map((r) => r.email),
                subject: payload.subject,
                html: payload.htmlBody,
                text: payload.textBody,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to send email via Resend: ${errorText}`);
        }

        const result = await response.json();
        return { messageId: result.id };
    }
}
