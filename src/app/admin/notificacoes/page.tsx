import { NotificationList } from '@/components/admin/notification-list';

export default function NotificationsPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
                <p className="text-gray-500 mt-1">Gerencie suas notificações do sistema.</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <NotificationList />
            </div>
        </div>
    );
}
