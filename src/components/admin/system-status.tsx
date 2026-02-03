'use client';

interface SystemService {
    name: string;
    status: 'operational' | 'degraded' | 'down' | 'maintenance';
    latency?: string;
}

const statusConfig = {
    operational: { color: 'bg-emerald-500', text: 'text-emerald-700 bg-emerald-100 border-emerald-200', label: 'Operacional' },
    degraded: { color: 'bg-amber-500', text: 'text-amber-700 bg-amber-100 border-amber-200', label: 'Degradado' },
    down: { color: 'bg-red-500', text: 'text-red-700 bg-red-100 border-red-200', label: 'Indisponível' },
    maintenance: { color: 'bg-blue-500', text: 'text-blue-700 bg-blue-100 border-blue-200', label: 'Manutenção' },
};

export function SystemStatus({ services }: { services: SystemService[] }) {
    return (
        <div className="space-y-4">
            {services.map((service) => {
                const config = statusConfig[service.status];
                return (
                    <div key={service.name} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0 hover:bg-slate-50 px-2 -mx-2 rounded-lg transition-colors">
                        <span className="text-sm text-slate-600 font-medium">{service.name}</span>
                        <div className="flex items-center gap-3">
                            {service.latency && (
                                <span className="text-xs text-slate-400 font-mono tracking-tight">{service.latency}</span>
                            )}
                            <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border ${config.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${config.color} animate-pulse`}></span>
                                <span className="text-[10px] font-bold uppercase tracking-wider">
                                    {config.label}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
