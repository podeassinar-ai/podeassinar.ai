'use client';

import { useEffect, useState } from 'react';
import { getUnreadNotificationCount } from '@/app/actions/admin-actions';

interface NotificationBadgeProps {
    className?: string;
}

export function NotificationBadge({ className = '' }: NotificationBadgeProps) {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCount() {
            try {
                const unreadCount = await getUnreadNotificationCount();
                setCount(unreadCount);
            } catch (error) {
                console.error('Failed to fetch notification count:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchCount();

        // Poll every 30 seconds for new notifications
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading || count === 0) {
        return null;
    }

    return (
        <span
            className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full ${className}`}
        >
            {count > 99 ? '99+' : count}
        </span>
    );
}
