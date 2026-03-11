import { useEffect, useState, useRef } from "react";
import axios from "axios";

export default function NotificationsCenter() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const previousUnreadCountRef = useRef(0);
  const audioContextRef = useRef(null);

  // Play a notification sound using Web Audio API
  const playNotificationSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (
          window.AudioContext || window.webkitAudioContext
        )();
      }
      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Play a pleasant notification tone (3 short beeps)
      oscillator.frequency.value = 800; // Higher pitch
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);

      // Second beep
      const osc2 = audioContext.createOscillator();
      osc2.connect(gainNode);
      osc2.frequency.value = 1000;
      osc2.start(audioContext.currentTime + 0.15);
      osc2.stop(audioContext.currentTime + 0.25);

      // Third beep
      const osc3 = audioContext.createOscillator();
      osc3.connect(gainNode);
      osc3.frequency.value = 1200;
      osc3.start(audioContext.currentTime + 0.3);
      osc3.stop(audioContext.currentTime + 0.4);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + 0.4);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
    } catch (err) {
      console.error("Error playing notification sound:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 10 seconds
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/notifications`,
        {
          withCredentials: true,
        },
      );

      const currentUnreadCount = response.data.filter((n) => !n.read).length;

      // Play sound if there are new unread notifications and sound is enabled
      if (
        soundEnabled &&
        currentUnreadCount > previousUnreadCountRef.current &&
        previousUnreadCountRef.current > 0
      ) {
        playNotificationSound();
      }

      previousUnreadCountRef.current = currentUnreadCount;
      setNotifications(response.data);
      setError("");
    } catch (err) {
      setError("Failed to load notifications");
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/notifications/${notificationId}`,
        { read: true },
        {
          withCredentials: true,
        },
      );
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif,
        ),
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/notifications/${notificationId}`,
        {
          withCredentials: true,
        },
      );
      setNotifications((prev) =>
        prev.filter((notif) => notif._id !== notificationId),
      );
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-6">
        <p className="text-gray-500 dark:text-gray-400">
          Loading notifications...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white">
          Customer Contact Requests
        </h2>
        <div className="flex items-center gap-4">
          <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full dark:bg-blue-900 dark:text-blue-200">
            {notifications.filter((n) => !n.read).length} New
          </span>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-1 rounded text-sm font-semibold transition ${
              soundEnabled
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
            }`}
            title={soundEnabled ? "Sound ON" : "Sound OFF"}
          >
            {soundEnabled ? "🔔 ON" : "🔇 OFF"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded dark:bg-red-900 dark:text-red-200">
          {error}
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">
            No notifications yet
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`p-4 rounded-lg border-l-4 transition-all ${
                notif.read
                  ? "border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600"
                  : "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3
                    className={`font-semibold ${notif.read ? "text-gray-600 dark:text-gray-400" : "text-blue-900 dark:text-blue-200"}`}
                  >
                    {notif.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {notif.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  {!notif.read && (
                    <button
                      onClick={() => markAsRead(notif._id)}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notif._id)}
                    className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition dark:bg-red-600 dark:hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
