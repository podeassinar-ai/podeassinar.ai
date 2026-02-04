import { RiskItem } from '@domain/entities/diagnosis';
import { Card } from '@ui/components/common';
import { riskLevelConfig } from './report-config';

interface RiskListProps {
    risks: RiskItem[];
}

export function RiskList({ risks }: RiskListProps) {
    if (risks.length === 0) {
        return (
            <Card>
                <p className="text-gray-500 text-center py-4">Nenhum risco identificado.</p>
            </Card>
        );
    }

    return (
        <>
            {risks.map((risk: RiskItem, idx: number) => {
                const riskConfig = riskLevelConfig[risk.level];
                return (
                    <Card key={risk.id || idx} className={`border-l-4 ${riskConfig.borderClass}`}>
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${riskConfig.class}`}>
                                Risco {riskConfig.label}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">{risk.category}</span>
                        </div>
                        <h4 className="text-base font-bold text-gray-900 mb-2">{risk.description}</h4>

                        <div className="bg-gray-50 p-3 rounded border border-gray-100">
                            <p className="text-xs font-bold text-gray-700 mb-1 uppercase">Recomendação Jurídica</p>
                            <p className="text-sm text-gray-800">{risk.recommendation}</p>
                        </div>

                        {risk.estimatedCost && (
                            <p className="text-xs text-gray-500 mt-2">
                                Custo estimado: R$ {risk.estimatedCost.min.toLocaleString('pt-BR')} - R$ {risk.estimatedCost.max.toLocaleString('pt-BR')}
                            </p>
                        )}
                    </Card>
                );
            })}
        </>
    );
}
