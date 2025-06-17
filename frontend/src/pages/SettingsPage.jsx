import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  WifiOff,
  Mail,
  Save
} from 'lucide-react';
import { axiosInstance } from '../lib/axios.js';

// Mock toast for demonstration
// Create a proper toast implementation
const toast = {
  success: (message) => {
    // Create toast element
    const toastEl = document.createElement('div');
    toastEl.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
    toastEl.textContent = message;

    // Add to DOM
    document.body.appendChild(toastEl);

    // Animate in
    setTimeout(() => {
      toastEl.classList.remove('translate-x-full');
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
      toastEl.classList.add('translate-x-full');
      setTimeout(() => {
        if (document.body.contains(toastEl)) {
          document.body.removeChild(toastEl);
        }
      }, 300);
    }, 3000);

    console.log('Success:', message);
  },
  error: (message) => {
    // Create toast element
    const toastEl = document.createElement('div');
    toastEl.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
    toastEl.textContent = message;

    // Add to DOM
    document.body.appendChild(toastEl);

    // Animate in
    setTimeout(() => {
      toastEl.classList.remove('translate-x-full');
    }, 100);

    // Remove after 4 seconds (longer for errors)
    setTimeout(() => {
      toastEl.classList.add('translate-x-full');
      setTimeout(() => {
        if (document.body.contains(toastEl)) {
          document.body.removeChild(toastEl);
        }
      }, 300);
    }, 4000);

    console.log('Error:', message);
  }
};

const SettingsPage = () => {
  const navigate = useNavigate();
  const {
    authUser,
    onlineUsers,
    socket,
    showOnlineOnly,
    setShowOnlineOnly,
    showOnlineStatus,
    setShowOnlineStatus,
    logout,
    checkAuth,
    isCheckingAuth
  } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  const [showPassword, setShowPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // Settings states - Use React state instead of localStorage
  const [settings, setSettings] = useState({
    soundEffects: true,
    notifications: true,
    emailNotifications: false,
    darkMode: theme === 'dark',
    autoSave: true,
    showOnlineStatus: showOnlineStatus,
    showOnlineUsersOnly: showOnlineOnly
  });

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
  });

  // Check if current user is considered online
  const isCurrentUserOnline = onlineUsers.includes(authUser?._id);
  const onlineUsersCount = onlineUsers.length;

  // Check authentication status on component mount ONLY
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('Authentication check failed:', error);
        toast.error('Session expired. Please login again.');
        await logout();
        navigate('/login', { replace: true });
      }
    };

    if (!authUser && !isCheckingAuth) {
      checkAuthentication();
    }
  }, []); // Empty dependency array - run only on mount

  // Redirect to login if no authenticated user after checking
  useEffect(() => {
    if (!isCheckingAuth && !authUser) {
      navigate('/login', { replace: true });
    }
  }, [authUser, isCheckingAuth, navigate]);

  // Update settings when store values change
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      darkMode: theme === 'dark',
      showOnlineStatus: showOnlineStatus,
      showOnlineUsersOnly: showOnlineOnly
    }));
  }, [theme, showOnlineStatus, showOnlineOnly]);

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
      toast.success(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode activated`);
      return;
    }

    // Handle show online status setting
    if (setting === 'showOnlineStatus') {
      setShowOnlineStatus(value);

      // If you want to notify server about the change (optional)
      if (socket?.connected) {
        socket.emit('updateOnlineStatusPreference', value);
      }

      if (value) {
        toast.success('Online status indicators are now visible throughout the app');
      } else {
        toast.success('Online status indicators are now hidden');
      }
      return;
    }

    // Handle show online users only setting
    if (setting === 'showOnlineUsersOnly') {
      setShowOnlineOnly(value);

      if (value) {
        toast.success('Chat sidebar will now show only online users');
      } else {
        toast.success('Chat sidebar will now show all users');
      }
      return;
    }

    // Handle sound effects
    if (setting === 'soundEffects') {
      if (value) {
        playNotificationSound();
        toast.success('Sound effects enabled - Test notification played!');
      } else {
        toast.success('Sound effects disabled - You won\'t hear notification sounds');
      }
      return;
    }

    // Handle browser notifications
    if (setting === 'notifications') {
      if (value && 'Notification' in window) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Chat Notifications Enabled!', {
              body: 'You\'ll now receive desktop notifications for new messages.',
              icon: '/favicon.ico'
            });
            toast.success('Desktop notifications enabled successfully');
          } else {
            setSettings(prev => ({ ...prev, notifications: false }));
            toast.error('Notification permission denied by browser');
          }
        });
      } else if (!value) {
        toast.success('Desktop notifications disabled');
      } else {
        toast.error('Desktop notifications not supported by your browser');
        setSettings(prev => ({ ...prev, notifications: false }));
      }
      return;
    }

    // Handle auto-save
    if (setting === 'autoSave') {
      if (value) {
        toast.success('Auto-save enabled - Message drafts will be saved as you type');
      } else {
        toast.success('Auto-save disabled - Drafts won\'t be saved automatically');
      }
      return;
    }

    // Handle email notifications
    if (setting === 'emailNotifications') {
      if (value) {
        toast.success('Email notifications enabled (requires server setup)');
      } else {
        toast.success('Email notifications disabled');
      }
      return;
    }

    // Fallback for any other settings
    const settingName = setting.replace(/([A-Z])/g, ' $1').toLowerCase();
    toast.success(`${settingName} ${value ? 'enabled' : 'disabled'}`);
  };

  // Function to play notification sound
  const playNotificationSound = () => {
    try {
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
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
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
      toast.error("Please fill in both password fields");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    setIsUpdating(true);
    try {
      // Make actual API call to update password
      const response = await axiosInstance.post('/auth/update-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      if (response.status === 200) {
        toast.success("Password updated successfully");
        setFormData({ currentPassword: '', newPassword: '' });
        setShowPasswordSection(false);
      }
    } catch (error) {
      console.error('Password update error:', error);

      if (error.response?.status === 401) {
        toast.error("Current password is incorrect");
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || "Invalid password format");
      } else if (error.response?.status === 403) {
        toast.error("Session expired. Please login again.");
        await logout();
        navigate('/login', { replace: true });
      } else {
        toast.error("Failed to update password. Please try again.");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if no authenticated user
  if (!authUser) {
    return null; // This will be handled by the useEffect above
  }

  const SettingCard = ({ title, icon: Icon, children, className = "" }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-xl ${className}`}>
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

  const ToggleSetting = ({ label, description, checked, onChange, disabled = false, icon: Icon }) => (
    <div className="flex items-start justify-between py-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 group hover:bg-gray-50 dark:hover:bg-gray-700/50 -mx-2 px-2 rounded-lg transition-colors duration-200">
      <div className="flex-1 pr-4">
        <div className="flex items-center gap-2 mb-1">
          {Icon && <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
          <div className="font-medium text-gray-800 dark:text-white">{label}</div>
        </div>
        {description && (
          <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{description}</div>
        )}
      </div>
      <div className="flex-shrink-0 pt-1">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed transition-colors duration-200"></div>
        </label>
      </div>
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
                <p className="text-sm text-gray-500 dark:text-gray-400">Customize your chat experience and account preferences</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Online Status Indicator */}
              {settings.showOnlineStatus && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  {socket?.connected ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <Wifi className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Online ({onlineUsersCount} users)
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <WifiOff className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Offline</span>
                    </>
                  )}
                </div>
              )}

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all duration-200 hover:scale-105"
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

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Account Information */}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Account Status
                </label>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 min-h-[48px] flex items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-700 dark:text-green-300 font-medium">Active</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Member Since
                </label>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 min-h-[48px] flex items-center transition-colors duration-200">
                  <span className="text-gray-800 dark:text-gray-200 font-medium">
                    {authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Not available'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </SettingCard>

        {/* Online Users Status Card */}
        {settings.showOnlineStatus && (
          <SettingCard title="Connection Status" icon={Users}>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium text-blue-900 dark:text-blue-100">
                      Users Currently Online
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      Active users in chat right now
                    </div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
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
                    <div className={`w-3 h-3 rounded-full ${isCurrentUserOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                      }`}></div>
                    <span className="font-medium">
                      {isCurrentUserOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Connection
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
                    Server Status
                  </div>
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Operational</span>
                  </div>
                </div>
              </div>
            </div>
          </SettingCard>
        )}

        {/* Security Settings */}
        <SettingCard title="Security & Privacy" icon={Shield}>
          <div className="space-y-4">
            <div
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 group"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
            >
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" />
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">Change Password</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Update your account security credentials</div>
                </div>
              </div>
              {showPasswordSection ? (
                <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
              )}
            </div>

            {showPasswordSection && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 space-y-6 transition-all duration-200 border border-gray-200 dark:border-gray-600">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter your current password"
                      autoComplete="current-password"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500"
                      value={formData.newPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password (minimum 6 characters)"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-11 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handlePasswordUpdate}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg"
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="animate-spin w-4 h-4" />
                          Updating Password...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Update Password
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordSection(false);
                        setFormData({ currentPassword: '', newPassword: '' });
                      }}
                      className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all duration-200"
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
              description="Use dark colors for reduced eye strain and better visibility in low light"
              checked={settings.darkMode}
              onChange={(checked) => handleSettingChange('darkMode', checked)}
              icon={theme === 'dark' ? Moon : Sun}
            />
          </div>
        </SettingCard>

        {/* Notification Settings */}
        <SettingCard title="Notifications" icon={Bell}>
          <div className="space-y-1">
            <ToggleSetting
              label="Desktop Notifications"
              description="Get instant desktop alerts when you receive new messages, even when the app is in the background"
              checked={settings.notifications}
              onChange={(checked) => handleSettingChange('notifications', checked)}
              icon={Bell}
            />
            <ToggleSetting
              label="Email Notifications"
              description="Receive email summaries of important messages and activity updates (requires server configuration)"
              checked={settings.emailNotifications}
              onChange={(checked) => handleSettingChange('emailNotifications', checked)}
              icon={Mail}
            />
            <ToggleSetting
              label="Sound Effects"
              description="Play audio alerts for new messages, typing indicators, and other chat events"
              checkeked={settings.soundEffects}
              onChange={(checked) => handleSettingChange('soundEffects', checked)}
              icon={Volume2}
            />
          </div>
        </SettingCard>

        {/* Privacy & Chat Settings */}
        <SettingCard title="Privacy & Chat Preferences" icon={Shield}>
          <div className="space-y-1">
            <ToggleSetting
              label="Show Online Status Indicators"
              description="Display green dots and online/offline labels next to usernames throughout the application"
              checked={settings.showOnlineStatus}
              onChange={(checked) => handleSettingChange('showOnlineStatus', checked)}
              icon={Users}
            />
            <ToggleSetting
              label="Show Only Online Users in Sidebar"
              description="Filter the chat sidebar to display only users who are currently online and available"
              checked={settings.showOnlineUsersOnly}
              onChange={(checked) => handleSettingChange('showOnlineUsersOnly', checked)}
              icon={Wifi}
            />
            <ToggleSetting
              label="Auto-Save Message Drafts"
              description="Automatically save your message drafts locally as you type to prevent data loss"
              checked={settings.autoSave}
              onChange={(checked) => handleSettingChange('autoSave', checked)}
              icon={Save}
            />
          </div>
        </SettingCard>
      </div>
    </div>
  );
};

export default SettingsPage;