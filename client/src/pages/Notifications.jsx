import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Bell, CheckCheck, Clock, AlertCircle, Calendar, Trophy, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Notifications() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/notifications?userId=${user?.id}&_sort=timestamp&_order=desc`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Create mock notifications for demo
      setNotifications(generateMockNotifications());
    } finally {
      setLoading(false);
    }
  };

  const generateMockNotifications = () => {
    const now = new Date();
    return [
      {
        id: 'n1',
        userId: user?.id,
        type: 'attendance',
        title: 'Attendance Marked',
        message: 'Your attendance for Programming Fundamentals has been recorded.',
        timestamp: new Date(now - 1000 * 60 * 30).toISOString(), // 30 min ago
        read: false,
        icon: CheckCheck,
        color: 'green'
      },
      {
        id: 'n2',
        userId: user?.id,
        type: 'reminder',
        title: 'Upcoming Class',
        message: 'Data Structures starts in 1 hour. Don\'t forget to attend!',
        timestamp: new Date(now - 1000 * 60 * 60).toISOString(), // 1 hour ago
        read: false,
        icon: Clock,
        color: 'blue'
      },
      {
        id: 'n3',
        userId: user?.id,
        type: 'warning',
        title: 'Low Attendance Alert',
        message: 'Your attendance in Database Systems is at 75%. Attend next class to stay on track.',
        timestamp: new Date(now - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
        read: true,
        icon: AlertCircle,
        color: 'orange'
      },
      {
        id: 'n4',
        userId: user?.id,
        type: 'achievement',
        title: 'Streak Milestone! 🔥',
        message: 'Congratulations! You\'ve maintained a 15-day attendance streak.',
        timestamp: new Date(now - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        read: true,
        icon: Trophy,
        color: 'yellow'
      },
      {
        id: 'n5',
        userId: user?.id,
        type: 'schedule',
        title: 'Timetable Update',
        message: 'Web Development class has been rescheduled to Thursday 2:00 PM.',
        timestamp: new Date(now - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        read: true,
        icon: Calendar,
        color: 'purple'
      }
    ];
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`http://localhost:8000/notifications/${notificationId}`, {
        read: true
      });
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      // Local update for demo
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      await Promise.all(
        unreadIds.map(id =>
          axios.patch(`http://localhost:8000/notifications/${id}`, { read: true })
        )
      );
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      // Local update for demo
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`http://localhost:8000/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      // Local delete for demo
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notification deleted');
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return time.toLocaleDateString();
  };

  const getIconColors = (color) => {
    const colors = {
      green: 'bg-green-100 text-green-600',
      blue: 'bg-blue-100 text-blue-600',
      orange: 'bg-orange-100 text-orange-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      purple: 'bg-purple-100 text-purple-600',
      red: 'bg-red-100 text-red-600'
    };
    return colors[color] || colors.blue;
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-500 mt-1">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-4">
            {['all', 'unread', 'read'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filter === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'unread' && unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-white text-blue-600 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="animate-pulse mx-auto mb-2" size={32} />
              <p>Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="mx-auto mb-2 opacity-50" size={32} />
              <p>No {filter !== 'all' ? filter : ''} notifications</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconColors(notification.color)}`}>
                      <Icon size={20} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className={`text-sm font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {getTimeAgo(notification.timestamp)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <CheckCheck size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Empty State Illustration */}
        {!loading && notifications.length === 0 && (
          <div className="mt-8 text-center">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="text-gray-400" size={40} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications yet</h3>
            <p className="text-sm text-gray-500">
              We'll notify you about attendance updates, reminders, and achievements here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
