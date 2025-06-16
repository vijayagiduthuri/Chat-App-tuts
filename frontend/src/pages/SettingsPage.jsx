import React, { useState, useEffect } from 'react';
import { useThemeStore } from "../store/useThemeStore.js";
import { useAuthStore } from "../store/useAuthStore.js";
import {
  Moon,
  Sun,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ChevronDown,
  ChevronRight,
  Bell,
  Volume2,
  User,
  Shield,
  Palette,
  Settings,
  Users,
  Wifi,
  WifiOff
} from 'lucide-react';

// Mock toast for demonstration
const toast = {
  success: (message) => console.log('Success:', message),
  error: (message) => console.log('Error:', message)
};

const SettingsPage = () => {
  const { authUser, onlineUsers, socket, showOnlineOnly, setShowOnlineOnly, showOnlineStatus, setShowOnlineStatus } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  const [showPassword, setShowPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // Settings states - Initialize from localStorage to persist across navigation
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('userSettings');
    const defaultSettings = {
      soundEffects: true,
      notifications: true,
      emailNotifications: false,
      darkMode: theme === 'dark',
      autoSave: true,
      showOnlineStatus: showOnlineStatus, // Sync with store
      showOnlineUsersOnly: showOnlineOnly // Add this to sync with store
    };

    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        return { ...defaultSettings, ...parsed, darkMode: theme === 'dark', showOnlineUsersOnly: showOnlineOnly, showOnlineStatus: showOnlineStatus };
      } catch (error) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
  });

  // Check if current user is considered online
  const isCurrentUserOnline = onlineUsers.includes(authUser?._id);
  const onlineUsersCount = onlineUsers.length;

  // Save settings to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
  }, [settings]);

  // Sync settings with Zustand store on mount
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      showOnlineUsersOnly: showOnlineOnly,
      showOnlineStatus: showOnlineStatus
    }));
  }, [showOnlineOnly, showOnlineStatus]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setSettings(prev => ({ ...prev, darkMode: newTheme === 'dark' }));
    toast.success(`Switched to ${newTheme} mode`);
  };

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({ ...prev, [setting]: value }));

    // Handle dark mode toggle from the settings section
    if (setting === 'darkMode') {
      const newTheme = value ? 'dark' : 'light';
      setTheme(newTheme);
    }

    // Handle show online users only setting - UPDATE ZUSTAND STORE
    if (setting === 'showOnlineUsersOnly') {
      setShowOnlineOnly(value);
      if (value) {
        toast.success('Sidebar now shows only online users');
      } else {
        toast.success('Sidebar now shows all users');
      }
      return;
    }

    // Handle settings that can actually work
    if (setting === 'soundEffects') {
      if (value) {
        playNotificationSound();
        toast.success('Sound effects enabled - Test sound played!');
      } else {
        toast.success('Sound effects disabled');
      }
      return;
    }

    if (setting === 'notifications') {
      if (value && 'Notification' in window) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Notifications Enabled!', {
              body: 'You will now receive push notifications.',
              icon: '/favicon.ico'
            });
            toast.success('Browser notifications enabled');
          } else {
            setSettings(prev => ({ ...prev, notifications: false }));
            toast.error('Notification permission denied');
          }
        });
      } else if (!value) {
        toast.success('Browser notifications disabled');
      } else {
        toast.error('Browser notifications not supported');
        setSettings(prev => ({ ...prev, notifications: false }));
      }
      return;
    }

    if (setting === 'autoSave') {
      if (value) {
        toast.success('Auto-save enabled - Message drafts will be saved locally');
      } else {
        toast.success('Auto-save disabled');
      }
      return;
    }

    // Handle online status visibility - this actually works now!
    if (setting === 'showOnlineStatus') {
      setShowOnlineStatus(value); // Update Zustand store
      if (value) {
        toast.success('Online status indicators are now visible');
      } else {
        toast.success('Online status indicators are now hidden');
      }
      return;
    }

    if (setting === 'emailNotifications') {
      toast.success('Email notifications updated (requires backend integration)');
      return;
    }

    toast.success(`${setting.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value ? 'enabled' : 'disabled'}`);
  };

  // Function to play notification sound
  const playNotificationSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  // Check notification permission on component mount
  useEffect(() => {
    if ('Notification' in window) {
      setSettings(prev => ({
        ...prev,
        notifications: Notification.permission === 'granted' && prev.notifications
      }));
    }
  }, []);

  const handlePasswordUpdate = async () => {
    if (!formData.currentPassword || !formData.newPassword) {
      toast.error("Please fill in both fields");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    setIsUpdating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Password updated successfully");
      setFormData({ currentPassword: '', newPassword: '' });
      setShowPasswordSection(false);
    } catch (err) {
      toast.error("Failed to update password");
    } finally {
      setIsUpdating(false);
    }
  };

  const SettingCard = ({ title, icon: Icon, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-200">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg transition-colors duration-200">
            <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h2>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );

  const ToggleSetting = ({ label, description, checked, onChange, disabled = false }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <div className="flex-1">
        <div className="font-medium text-gray-800 dark:text-white">{label}</div>
        {description && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</div>
        )}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 transition-colors duration-200"></div>
      </label>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 pt-16">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200 sticky top-16 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg transition-colors duration-200">
                <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account and preferences</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Online Status Indicator - Only show if showOnlineStatus is enabled */}
              {settings.showOnlineStatus && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  {socket?.connected ? (
                    <>
                      <Wifi className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Connected ({onlineUsersCount} online)
                      </span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Disconnected</span>
                    </>
                  )}
                </div>
              )}

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-500" />
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {theme === 'light' ? 'Dark' : 'Light'} Mode
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Account Information - Simplified */}
        <SettingCard title="Account Information" icon={User}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 min-h-[48px] flex items-center transition-colors duration-200">
                  <span className="text-gray-800 dark:text-gray-200 font-medium">
                    {authUser?.fullName || 'Not provided'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 min-h-[48px] flex items-center transition-colors duration-200">
                  <span className="text-gray-800 dark:text-gray-200 font-medium">
                    {authUser?.email || 'Not provided'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </SettingCard>

        {/* Online Users Status Card - Only show if showOnlineStatus is enabled */}
        {settings.showOnlineStatus && (
          <SettingCard title="Online Users" icon={Users}>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium text-blue-900 dark:text-blue-100">
                      Total Online Users
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      Including yourself
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {onlineUsersCount}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Status
                  </div>
                  <div className={`flex items-center gap-2 ${isCurrentUserOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                    <div className={`w-3 h-3 rounded-full ${isCurrentUserOnline ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                    <span className="font-medium">
                      {isCurrentUserOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Socket Connection
                  </div>
                  <div className={`flex items-center gap-2 ${socket?.connected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                    {socket?.connected ? (
                      <Wifi className="w-4 h-4" />
                    ) : (
                      <WifiOff className="w-4 h-4" />
                    )}
                    <span className="font-medium">
                      {socket?.connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Member Since
                  </div>
                  <div className="text-gray-800 dark:text-gray-200 font-medium">
                    {authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString() : 'Not available'}
                  </div>
                </div>
              </div>
            </div>
          </SettingCard>
        )}

        {/* Security Settings */}
        <SettingCard title="Security" icon={Shield}>
          <div className="space-y-4">
            <div
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
            >
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">Change Password</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Update your account password</div>
                </div>
              </div>
              {showPasswordSection ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </div>

            {showPasswordSection && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4 transition-colors duration-200">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                      autoComplete="current-password"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      value={formData.newPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password (min 6 characters)"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handlePasswordUpdate}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="animate-spin w-4 h-4" />
                          Updating...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordSection(false);
                        setFormData({ currentPassword: '', newPassword: '' });
                      }}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SettingCard>

        {/* Appearance Settings */}
        <SettingCard title="Appearance" icon={Palette}>
          <div className="space-y-1">
            <ToggleSetting
              label="Dark Mode"
              description="Switch between light and dark themes"
              checked={settings.darkMode}
              onChange={(checked) => handleSettingChange('darkMode', checked)}
            />
          </div>
        </SettingCard>

        {/* Notification Settings */}
        <SettingCard title="Notifications" icon={Bell}>
          <div className="space-y-1">
            <ToggleSetting
              label="Push Notifications"
              description="Receive browser notifications for new messages (works locally)"
              checked={settings.notifications}
              onChange={(checked) => handleSettingChange('notifications', checked)}
            />
            <ToggleSetting
              label="Email Notifications"
              description="Receive email updates (requires backend integration)"
              checked={settings.emailNotifications}
              onChange={(checked) => handleSettingChange('emailNotifications', checked)}
            />
            <ToggleSetting
              label="Sound Effects"
              description="Play sounds for notifications (works locally)"
              checked={settings.soundEffects}
              onChange={(checked) => handleSettingChange('soundEffects', checked)}
            />
          </div>
        </SettingCard>

        {/* Privacy Settings */}
        <SettingCard title="Privacy" icon={Shield}>
          <div className="space-y-1">
            <ToggleSetting
              label="Show Online Status Indicators"
              description="Show green dots and online/offline text for users (affects entire app)"
              checked={settings.showOnlineStatus}
              onChange={(checked) => handleSettingChange('showOnlineStatus', checked)}
            />
            <ToggleSetting
              label="Show Online Users Only in Sidebar"
              description="Filter sidebar to show only online users (affects chat sidebar)"
              checked={settings.showOnlineUsersOnly}
              onChange={(checked) => handleSettingChange('showOnlineUsersOnly', checked)}
            />
            <ToggleSetting
              label="Auto Save Messages"
              description="Automatically save message drafts locally"
              checked={settings.autoSave}
              onChange={(checked) => handleSettingChange('autoSave', checked)}
            />
          </div>
        </SettingCard>
      </div>
    </div>
  );
};

export default SettingsPage;