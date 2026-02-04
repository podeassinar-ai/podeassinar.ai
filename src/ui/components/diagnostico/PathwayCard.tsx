import { LegalPathway } from '@domain/entities/diagnosis';
import { Button } from '@ui/components/common';

interface PathwayCardProps {
    pathways: LegalPathway[];
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

export function PathwayCard({ pathways }: PathwayCardProps) {
    const totalCost = calculateTotalCost(pathways);
    const primaryPathway = pathways[0];

    return (
        <div className="bg-white border border-border rounded p-6 shadow-sm">
            <div className="mb-6">
                <p className="text-sm font-medium text-gray-900 mb-1">Estimativa de Custo Total</p>
                <p className="text-2xl font-bold text-primary">
                    R$ {totalCost.min.toLocaleString('pt-BR')} - R$ {totalCost.max.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-gray-500">Taxas e emolumentos aproximados</p>
            </div>

            {primaryPathway && (
                <>
                    <div className="mb-6">
                        <p className="text-sm font-medium text-gray-900 mb-1">Tempo Estimado</p>
                        <p className="text-lg font-semibold text-gray-700">{primaryPathway.estimatedDuration}</p>
                    </div>

                    <div className="space-y-6 relative pl-2">
                        <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-gray-200"></div>
                        {primaryPathway.steps.map((step: string, idx: number) => (
                            <div key={idx} className="relative pl-6">
                                <div className="absolute left-0 top-1.5 w-3.5 h-3.5 bg-white border-2 border-primary rounded-full z-10"></div>
                                <p className="text-sm text-gray-700 leading-snug">{step}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {pathways.length === 0 && (
                <p className="text-gray-500 text-sm">Nenhum plano de regularização definido ainda.</p>
            )}

            <Button variant="primary" className="w-full mt-8">
                Iniciar Regularização
            </Button>
        </div>
    );
}
