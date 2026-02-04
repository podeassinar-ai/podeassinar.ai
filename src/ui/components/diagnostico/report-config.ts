import { RiskLevel, RiskItem } from '@domain/entities/diagnosis';

export type ReportStatus = 'SAFE' | 'CAUTION' | 'CRITICAL';

export const statusConfig = {
    SAFE: { label: 'Compra Segura', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: 'shield-check' },
    CAUTION: { label: 'Aprovado com Ressalvas', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: 'exclamation' },
    CRITICAL: { label: 'Alto Risco', color: 'bg-red-100 text-red-800 border-red-200', icon: 'hand' },
};

export const riskLevelConfig: Record<RiskLevel, { label: string; class: string; borderClass: string }> = {
    LOW: { label: 'Baixo', class: 'bg-blue-100 text-blue-800', borderClass: 'border-l-blue-400' },
    MEDIUM: { label: 'Médio', class: 'bg-yellow-100 text-yellow-800', borderClass: 'border-l-yellow-400' },
    HIGH: { label: 'Alto', class: 'bg-orange-100 text-orange-800', borderClass: 'border-l-orange-400' },
    CRITICAL: { label: 'Crítico', class: 'bg-red-100 text-red-800', borderClass: 'border-l-red-400' },
};

export function determineOverallStatus(risks: RiskItem[]): ReportStatus {
    if (risks.some(r => r.level === 'CRITICAL')) return 'CRITICAL';
    if (risks.some(r => r.level === 'HIGH' || r.level === 'MEDIUM')) return 'CAUTION';
    return 'SAFE';
}

export function formatDate(date: Date) {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}
