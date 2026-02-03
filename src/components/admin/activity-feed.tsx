'use client';

import Link from 'next/link';

export interface ActivityItem {
    id: string;
    type: 'TRANSACTION' | 'USER' | 'DIAGNOSIS' | 'SYSTEM';
    title: string;
    description: string;
    timestamp: Date;
    status?: 'success' | 'warning' | 'error' | 'info';
    href?: string;
}

const ActivityIcon = ({ type, status }: { type: ActivityItem['type']; status?: string }) => {
    if (type === 'TRANSACTION') {
        return (
            <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100 shadow-sm">
                <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        );
    }
    if (type === 'USER') {
        return (
            <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
            </div>
        );
    }
    if (type === 'DIAGNOSIS') {
        return (
            <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center border border-purple-100 shadow-sm">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            </div>
        );
    }
    return (
        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm">
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
    );
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
    if (!items || items.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500 text-sm">
                Nenhuma atividade recente.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {items.map((item) => (
                <div key={item.id} className="group flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <ActivityIcon type={item.type} status={item.status} />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                            <p className="text-sm font-semibold text-slate-900 truncate pr-4">
                                {item.title}
                            </p>
                            <span className="text-xs text-slate-500 whitespace-nowrap font-medium">
                                {new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(item.timestamp))}
                            </span>
                        </div>
                        <p className="text-xs text-slate-600 mb-1.5 line-clamp-2 leading-relaxed">
                            {item.description}
                        </p>
                        {item.href && (
                            <Link href={item.href} className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors inline-flex items-center gap-1 group-hover:translate-x-0.5 transform duration-200">
                                Ver detalhes
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
