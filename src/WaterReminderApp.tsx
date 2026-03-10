import React, { useState, useEffect, useRef } from "react";
import { Droplets, Clock, Play, Pause, Settings } from "lucide-react";

export default function WaterReminderApp() {
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("21:00");
  const [intervalHours, setIntervalHours] = useState(1);
  const [lastNotification, setLastNotification] = useState(null);
  const [nextNotification, setNextNotification] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const audioRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Check notification permission on mount
    if ("Notification" in window) {
      setPermissionGranted(Notification.permission === "granted");
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setPermissionGranted(permission === "granted");
      return permission === "granted";
    }
    return false;
  };

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .catch((e) => console.log("Audio play failed:", e));
    }
  };

  const isWithinTimeRange = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return currentTime >= startMinutes && currentTime <= endMinutes;
  };

  const calculateNextNotification = () => {
    const now = new Date();
    const next = new Date(now.getTime() + intervalHours * 60 * 60 * 1000);
    return next;
  };

  const sendNotification = () => {
    if (!isWithinTimeRange()) {
      console.log("Outside time range, skipping notification");
      return;
    }

    playSound();

    if (permissionGranted && "Notification" in window) {
      const notification = new Notification("💧 Time to Drink Water!", {
        body: `Stay hydrated! Drink a glass of water now.`,
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%234FC3F7" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
        badge:
          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234FC3F7"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
        tag: "water-reminder",
        requireInteraction: false,
        silent: false,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }

    setLastNotification(new Date());
    setNextNotification(calculateNextNotification());
  };

  const startReminders = async () => {
    if (!permissionGranted) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        alert("Please enable notifications to use this app!");
        return;
      }
    }

    setIsActive(true);

    // Send first notification immediately
    sendNotification();

    // Set up recurring notifications
    intervalRef.current = setInterval(() => {
      sendNotification();
    }, intervalHours * 60 * 60 * 1000); // Convert hours to milliseconds
  };

  const stopReminders = () => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setNextNotification(null);
  };

  const testNotification = async () => {
    if (!permissionGranted) {
      await requestNotificationPermission();
    }
    sendNotification();
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = (date) => {
    if (!date) return "--:--";
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-400 to-blue-500 p-6 flex items-center justify-center">
      <audio ref={audioRef} preload="auto">
        <source src="/new-notification-022-370046.mp3" type="audio/wav" />
      </audio>

      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-8 text-center relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
            <div className="w-24 h-24 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse">
              <Droplets className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Water Reminder
            </h1>
            <p className="text-cyan-100">Stay hydrated, stay healthy!</p>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    disabled={isActive}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    disabled={isActive}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reminder Interval (hours)
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    max="24"
                    step="0.5"
                    value={intervalHours}
                    onChange={(e) =>
                      setIntervalHours(parseFloat(e.target.value))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    disabled={isActive}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-8">
            {/* Status */}
            <div className="mb-8 text-center">
              <div
                className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                  isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {isActive ? "🟢 Active" : "⚫ Inactive"}
              </div>
            </div>

            {/* Time Info */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-cyan-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Active Hours
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {startTime} - {endTime}
                </span>
              </div>

              {isActive && nextNotification && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-1">
                    Next reminder at
                  </div>
                  <div className="text-2xl font-bold text-cyan-600">
                    {formatTime(nextNotification)}
                  </div>
                </div>
              )}

              {lastNotification && (
                <div className="text-center text-sm text-gray-500">
                  Last reminder: {formatTime(lastNotification)}
                </div>
              )}
            </div>

            {/* Control Buttons */}
            <div className="space-y-3">
              {!isActive ? (
                <button
                  onClick={startReminders}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Start Reminders
                </button>
              ) : (
                <button
                  onClick={stopReminders}
                  className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Pause className="w-5 h-5" />
                  Stop Reminders
                </button>
              )}

              <button
                onClick={testNotification}
                className="w-full py-3 bg-white border-2 border-cyan-500 text-cyan-600 rounded-xl font-semibold hover:bg-cyan-50 transition-all flex items-center justify-center gap-2"
              >
                <Droplets className="w-5 h-5" />
                Test Notification
              </button>
            </div>

            {/* Info */}
            {!permissionGranted && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-sm text-yellow-800 text-center">
                  ⚠️ Please enable notifications to receive reminders
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-white/80 text-sm">
          <p>💧 Drink 8 glasses of water daily for optimal health</p>
        </div>
      </div>
    </div>
  );
}
