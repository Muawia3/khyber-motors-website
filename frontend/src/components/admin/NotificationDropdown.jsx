import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  MessageSquare,
  Car,
  Users,
  Wrench,
  Clock,
  X,
  ExternalLink,
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';

export const NotificationDropdown = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Fetch notifications and unread count
  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications(30);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.warn('Failed to load notifications:', err.message);
    }
  };

  // Setup periodic 10-second polling for real-time notification sync
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(() => {
      loadNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      loadNotifications();
    }
    setIsOpen((prev) => !prev);
  };

  const handleMarkAsRead = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Failed to mark all as read:', err);
    }
  };

  const handleDelete = async (e, id, isRead) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (!isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.warn('Failed to delete notification:', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await notificationService.markAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.warn('Error marking as read on click:', err);
      }
    }

    setIsOpen(false);

    // Route based on notification type
    switch (notif.type) {
      case 'TEST_DRIVE':
        navigate('/admin/test-drives');
        break;
      case 'SERVICE_REQUEST':
        navigate('/admin/operations/services');
        break;
      case 'CONTACT_FORM':
      case 'LEAD':
      default:
        navigate('/admin/leads');
        break;
    }
  };

  const renderTypeIcon = (type) => {
    switch (type) {
      case 'TEST_DRIVE':
        return <Car className="w-4 h-4 text-blue-600" />;
      case 'SERVICE_REQUEST':
        return <Wrench className="w-4 h-4 text-amber-600" />;
      case 'CONTACT_FORM':
        return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      case 'LEAD':
      default:
        return <Users className="w-4 h-4 text-[#C8102E]" />;
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button with Red Unread Count Badge */}
      <button
        type="button"
        onClick={handleToggle}
        className="relative p-2 rounded-xs text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        title="Admin Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#C8102E] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xs border border-gray-200 shadow-xl z-50 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="p-3.5 bg-gray-900 text-white flex items-center justify-between border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#C8102E]" />
              <span className="text-xs font-bold uppercase tracking-wider">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-[#C8102E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="text-[11px] text-gray-300 hover:text-white underline font-medium transition-colors"
                  title="Mark all as read"
                >
                  Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400 space-y-2">
                <Bell className="w-8 h-8 text-gray-300 mx-auto opacity-50" />
                <p className="text-xs font-medium text-gray-600">No notifications yet.</p>
                <p className="text-[11px] text-gray-400">New leads and bookings will appear here automatically.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    notif.isRead
                      ? 'bg-white hover:bg-gray-50/80 text-gray-700'
                      : 'bg-red-50/40 hover:bg-red-50/70 text-gray-900 border-l-2 border-[#C8102E]'
                  }`}
                >
                  <div className="p-2 bg-gray-100 rounded-xs shrink-0 border border-gray-200 mt-0.5">
                    {renderTypeIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-xs truncate ${
                          notif.isRead ? 'font-semibold text-gray-800' : 'font-extrabold text-gray-900'
                        }`}
                      >
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-mono shrink-0">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 leading-snug line-clamp-2">{notif.message}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    {!notif.isRead && (
                      <button
                        type="button"
                        onClick={(e) => handleMarkAsRead(e, notif.id)}
                        className="p-1 text-gray-400 hover:text-emerald-600 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, notif.id, notif.isRead)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Link */}
          <div className="p-2.5 bg-gray-50 border-t border-gray-100 text-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/admin/leads');
              }}
              className="text-xs font-bold text-[#C8102E] hover:text-red-700 flex items-center justify-center gap-1 mx-auto"
            >
              <span>View All Leads & Inquiries</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
