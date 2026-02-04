/**
 * Centralized pricing constants for services.
 * All values are in cents (BRL).
 */

export const PRICES = {
    /** Due Diligence / Diagnostic service */
    DIAGNOSTIC: {
        amount: 30000, // R$ 300,00
        currency: 'BRL',
    },
    /** Certificate search service (taxas cartorárias + emissão digital) */
    CERTIFICATE_SEARCH: {
        amount: 20000, // R$ 200,00
        currency: 'BRL',
    },
} as const;

/**
 * Helper to format price in cents to BRL currency string.
 */
export function formatPrice(cents: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(cents / 100);
}

/**
 * Helper to format price in cents to simple string (e.g., "300,00").
 */
export function formatPriceSimple(cents: number): string {
    return (cents / 100).toFixed(2).replace('.', ',');
}
