import { LegalDiagnosis, LegalPathway } from '@domain/entities/diagnosis';
import { Transaction } from '@domain/entities/transaction';
import { statusConfig, ReportStatus, formatDate } from './report-config';

interface DiagnosisSummaryCardProps {
    diagnosis: LegalDiagnosis;
    transaction: Transaction;
    overallStatus: ReportStatus;
}

function calculateTotalCost(pathways: LegalPathway[]): { min: number; max: number } {
    return pathways.reduce(
        (acc, p) => ({
            min: acc.min + (p.estimatedCost?.min ?? 0),
            max: acc.max + (p.estimatedCost?.max ?? 0),
        }),
        { min: 0, max: 0 }
    );
}

export function DiagnosisSummaryCard({ diagnosis, transaction, overallStatus }: DiagnosisSummaryCardProps) {
    const status = statusConfig[overallStatus];

    return (
        <div className="bg-white rounded border border-border overflow-hidden mb-8 shadow-sm">
            <div className={`p-6 border-b border-border flex items-start gap-4 ${status.color.replace('text-', 'bg-opacity-10 ')}`}>
                <div className={`p-3 rounded-full bg-white bg-opacity-60 border ${status.color.split(' ')[2]}`}>
                    {status.icon === 'shield-check' && (
                        <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                    {status.icon === 'exclamation' && (
                        <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    )}
                    {status.icon === 'hand' && (
                        <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    )}
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{status.label}</h2>
                    <p className="text-gray-700 leading-relaxed">{diagnosis.summary || diagnosis.propertyStatus}</p>
                </div>
            </div>

            <div className="p-6 bg-gray-50 grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Tipo de Transação</p>
                    <p className="text-sm font-medium text-gray-900">{transaction.type}</p>
                    {transaction.propertyAddress && (
                        <p className="text-xs text-gray-600">{transaction.propertyAddress}</p>
                    )}
                </div>
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Matrícula</p>
                    <p className="text-sm font-medium text-gray-900">
                        {transaction.registryNumber || 'Não informada'}
                    </p>
                    {transaction.registryOffice && (
                        <p className="text-xs text-gray-600">{transaction.registryOffice}</p>
                    )}
                </div>
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</p>
                    <p className="text-sm font-medium text-gray-900">{diagnosis.status}</p>
                </div>
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Criado em</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(diagnosis.createdAt)}</p>
                </div>
            </div>
        </div>
    );
}
