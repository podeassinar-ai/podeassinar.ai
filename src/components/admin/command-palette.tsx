'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CommandItem {
    id: string;
    label: string;
    href?: string;
    action?: () => void;
    icon?: React.ReactNode;
    category: 'Navigation' | 'Action' | 'System';
}

export function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const router = useRouter();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen((open) => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const commands: CommandItem[] = [
        { id: 'dash', label: 'Go to Dashboard', href: '/admin/dashboard', category: 'Navigation' },
        { id: 'review', label: 'Go to Review Queue', href: '/admin/revisao', category: 'Navigation' },
        { id: 'certs', label: 'Go to Certificates', href: '/admin/certidoes', category: 'Navigation' },
        { id: 'users', label: 'Go to Users', href: '/admin/usuarios', category: 'Navigation' },
        { id: 'compliance', label: 'Go to Compliance', href: '/admin/compliance', category: 'Navigation' },
    ];

    const filtered = commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

    const handleSelect = (item: CommandItem) => {
        if (item.href) {
            router.push(item.href);
        }
        if (item.action) {
            item.action();
        }
        setIsOpen(false);
        setQuery('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[20vh]" onClick={() => setIsOpen(false)}>
            <div
                className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center border-b border-slate-800 px-4">
                    <svg className="w-5 h-5 text-slate-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        autoFocus
                        className="flex-1 bg-transparent py-4 text-white placeholder-slate-500 focus:outline-none"
                        placeholder="Type a command or search..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold text-slate-500 bg-slate-800 rounded border border-slate-700">ESC</kbd>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {filtered.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 text-sm">No results found.</div>
                    ) : (
                        <div className="space-y-1">
                            {filtered.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelect(item)}
                                    className="w-full flex items-center px-4 py-3 text-sm text-slate-300 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors group"
                                >
                                    <span className="flex-1 text-left">{item.label}</span>
                                    <span className="text-xs text-slate-600 group-hover:text-indigo-200">{item.category}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 text-xs text-slate-500 flex justify-between">
                    <span>Use arrows to navigate</span>
                    <span>PodeAssinar Console</span>
                </div>
            </div>
        </div>
    );
}
