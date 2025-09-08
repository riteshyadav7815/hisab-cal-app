"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await api.get('/notifications');
                setNotifications(res.data);
            } catch (error) {
                console.error('Failed to fetch notifications', error);
            }
        };

        fetchNotifications();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('hisab_token');
        router.push('/login');
    };

    return (
        <div className="dashboard-layout">
            <Sidebar onLogout={handleLogout} />
            <main className="main-content">
                <div className="header">
                    <h1>Notifications</h1>
                </div>
                <div className="notifications-list">
                    {notifications.length > 0 ? (
                        notifications.map(n => (
                            <div key={n.id} className="notification-item">
                                <div className="notification-message">{n.message}</div>
                                <div className="notification-time">{new Date(n.created_at).toLocaleString()}</div>
                            </div>
                        ))
                    ) : (
                        <p>No new notifications.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default NotificationsPage;
