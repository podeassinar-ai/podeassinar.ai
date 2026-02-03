'use client';

import { useEffect, useState, useMemo } from 'react';
import { UserListItem, getAllUsers, updateUserRole, deactivateUser } from '@/app/actions/admin-actions';
import { UserRole, getRoleLabel } from '@domain/entities/user';
import { Button, Card, Input, Select, Modal } from '@ui/components/common';

function getRoleBadgeColor(role: UserRole): string {
    switch (role) {
        case 'SYSTEM_ADMIN':
            return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'ADMIN':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'LAWYER':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'DPO':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'COMPANY_ADMIN':
            return 'bg-orange-100 text-orange-800 border-orange-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
}

const ASSIGNABLE_ROLES = [
    { value: 'CLIENT', label: 'Cliente' },
    { value: 'LAWYER', label: 'Advogado' },
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'DPO', label: 'DPO' },
    { value: 'SYSTEM_ADMIN', label: 'Super Admin' },
    { value: 'COMPANY_ADMIN', label: 'Admin Empresa' },
];

export default function UsersManagementPage() {
    const [users, setUsers] = useState<UserListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState<string>('ALL');

    // Modal states
    const [deactivateModal, setDeactivateModal] = useState<{ isOpen: boolean; userId: string | null }>({
        isOpen: false,
        userId: null,
    });

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await getAllUsers();
            setUsers(data);
        } catch (err) {
            console.error('Error loading users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const matchesSearch =
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = selectedRole === 'ALL' || user.role === selectedRole;
            return matchesSearch && matchesRole;
        });
    }, [users, searchQuery, selectedRole]);

    async function handleRoleChange(userId: string, newRole: UserRole) {
        try {
            await updateUserRole(userId, newRole);
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === userId ? { ...u, role: newRole, roleLabel: getRoleLabel(newRole) } : u
                )
            );
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Erro ao atualizar papel');
        }
    }

    async function confirmDeactivate() {
        if (!deactivateModal.userId) return;
        try {
            await deactivateUser(deactivateModal.userId);
            setUsers((prev) =>
                prev.map((u) => (u.id === deactivateModal.userId ? { ...u, isActive: false } : u))
            );
            setDeactivateModal({ isOpen: false, userId: null });
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Erro ao desativar usuário');
        }
    }

    if (loading && users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500 font-medium">Carregando usuários...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-primary to-indigo-700 rounded-2xl p-8 text-white shadow-xl theme-transition">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h1>
                    <p className="mt-2 text-primary-foreground/80 max-w-2xl">
                        Controle de permissões, papéis e acesso ao sistema. Gerencie sua equipe e clientes em um único lugar.
                    </p>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl"></div>
            </div>

            {/* Filters Bar */}
            <Card className="p-4 bg-white/80 backdrop-blur-md border border-white/20 shadow-lg sticky top-6 z-20">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Buscar por nome ou email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-gray-50/50"
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <Select
                            options={[{ value: 'ALL', label: 'Todos os Papéis' }, ...ASSIGNABLE_ROLES]}
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="bg-gray-50/50"
                        />
                    </div>
                    <Button variant="secondary" onClick={loadUsers} className="flex-shrink-0">
                        Sincronizar
                    </Button>
                </div>
            </Card>

            {/* Users Table / List */}
            <Card className="overflow-hidden shadow-xl border-none">
                {filteredUsers.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4 font-bold text-2xl">
                            🔍
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Nenhum usuário encontrado</h3>
                        <p className="text-gray-500">Tente ajustar seus filtros de busca.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-widest">Usuário</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-widest">Papel & Permissões</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-widest">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className={`hover:bg-gray-50/80 transition-colors ${!user.isActive ? 'opacity-50' : ''}`}>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                                                    <div className="text-xs text-gray-500 font-medium">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getRoleBadgeColor(user.role)}`}>
                                                    {user.roleLabel}
                                                </span>
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                                    className="text-xs text-indigo-600 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer focus:ring-0"
                                                >
                                                    {ASSIGNABLE_ROLES.map(r => (
                                                        <option key={r.value} value={r.value}>{r.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                <span className={`mr-1.5 w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                {user.isActive ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-right text-sm">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDeactivateModal({ isOpen: true, userId: user.id })}
                                                    disabled={!user.isActive}
                                                    className="text-red-500 hover:bg-red-50"
                                                >
                                                    Desativar
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Confirmation Modal */}
            <Modal
                isOpen={deactivateModal.isOpen}
                onClose={() => setDeactivateModal({ isOpen: false, userId: null })}
                title="Confirmar Desativação"
            >
                <div className="p-4">
                    <p className="text-gray-600 mb-6 font-medium">
                        Tem certeza que deseja desativar este acesso? O usuário perderá acesso imediato a todas as funcionalidades do sistema.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setDeactivateModal({ isOpen: false, userId: null })}>
                            Cancelar
                        </Button>
                        <Button variant="primary" onClick={confirmDeactivate} className="bg-red-600 hover:bg-red-700 border-none shadow-lg shadow-red-200">
                            Confirmar Desativação
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
