'use client';

import { useEffect, useState } from 'react';
import { AdminNotification } from '@domain/entities/admin-notification';
import {
    getAdminNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from '@/app/actions/admin-actions';
import Link from 'next/link';

function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-BR');
}

function getPriorityBadge(priority: string) {
    switch (priority) {
        case 'HIGH':
            return <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">Alta</span>;
        case 'MEDIUM':
            return <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">Média</span>;
        default:
            return <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">Baixa</span>;
    }
}

export function NotificationList() {
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNotifications() {
            try {
                const data = await getAdminNotifications(50);
                setNotifications(data);
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchNotifications();
    }, []);

    async function handleMarkAsRead(notificationId: string) {
        try {
            await markNotificationAsRead(notificationId);
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notificationId ? { ...n, readAt: new Date() } : n
                )
            );
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    }

    async function handleMarkAllAsRead() {
        try {
            await markAllNotificationsAsRead();
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, readAt: n.readAt || new Date() }))
            );
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p>Nenhuma notificação no momento.</p>
            </div>
        );
    }

    const unreadCount = notifications.filter((n) => !n.readAt).length;

    return (
        <div>
            {unreadCount > 0 && (
                <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-600">
                        {unreadCount} notificação{unreadCount !== 1 ? 'ões' : ''} não lida{unreadCount !== 1 ? 's' : ''}
                    </p>
                    <button
                        onClick={handleMarkAllAsRead}
                        className="text-sm text-primary hover:underline"
                    >
                        Marcar todas como lidas
                    </button>
                </div>
            )}

            <ul className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                    <li
                        key={notification.id}
                        className={`py-4 px-4 -mx-4 ${!notification.readAt ? 'bg-blue-50' : ''}`}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notification.readAt ? 'bg-primary' : 'bg-transparent'}`} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    {getPriorityBadge(notification.payload.priority)}
                                    <span className="text-xs text-gray-500">
                                        {formatRelativeTime(new Date(notification.createdAt))}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-900 mb-1">{notification.payload.message}</p>
                                {notification.payload.transactionId && (
                                    <Link
                                        href={`/admin/revisao`}
                                        className="text-sm text-primary hover:underline"
                                    >
                                        Ver diagnóstico →
                                    </Link>
                                )}
                            </div>
                            {!notification.readAt && (
                                <button
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="text-xs text-gray-500 hover:text-gray-700"
                                >
                                    Marcar como lida
                                </button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
