import React, { useState, useEffect, createContext, useContext } from 'react';

// Notification Context
const NotificationContext = createContext();

// Notification Provider Component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const newNotification = {
      type: 'info',
      duration: 4000,
      ...notification
    };

    // Check for duplicate notifications (same message and type within 1 second)
    const isDuplicate = notifications.some(existing => 
      existing.message === newNotification.message && 
      existing.type === newNotification.type &&
      (Date.now() - existing.timestamp) < 1000
    );

    if (isDuplicate) {
      console.log('Duplicate notification prevented:', newNotification.message);
      return null;
    }

    const id = Date.now() + Math.random();
    const finalNotification = {
      ...newNotification,
      id,
      timestamp: Date.now()
    };

    setNotifications(prev => [...prev, finalNotification]);

    // Auto remove after duration
    if (finalNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, finalNotification.duration);
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const showSuccess = (message, options = {}) => {
    return addNotification({
      type: 'success',
      message,
      ...options
    });
  };

  const showError = (message, options = {}) => {
    return addNotification({
      type: 'error',
      message,
      duration: 6000, // Longer duration for errors
      ...options
    });
  };

  const showWarning = (message, options = {}) => {
    return addNotification({
      type: 'warning',
      message,
      ...options
    });
  };

  const showInfo = (message, options = {}) => {
    return addNotification({
      type: 'info',
      message,
      ...options
    });
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      showSuccess,
      showError,
      showWarning,
      showInfo
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Hook to use notifications
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Individual Notification Component
const Notification = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(notification.id), 300);
  };

  const getNotificationStyles = () => {
    const baseStyles = "relative overflow-hidden backdrop-blur-md border rounded-xl shadow-xl";
    
    switch (notification.type) {
      case 'success':
        return `${baseStyles} bg-emerald-500/10 border-emerald-400/30 shadow-emerald-500/20`;
      case 'error':
        return `${baseStyles} bg-red-500/10 border-red-400/30 shadow-red-500/20`;
      case 'warning':
        return `${baseStyles} bg-amber-500/10 border-amber-400/30 shadow-amber-500/20`;
      case 'info':
      default:
        return `${baseStyles} bg-blue-500/10 border-blue-400/30 shadow-blue-500/20`;
    }
  };

  const getIconAndColor = () => {
    switch (notification.type) {
      case 'success':
        return { icon: 'fas fa-check-circle', color: 'text-emerald-400' };
      case 'error':
        return { icon: 'fas fa-exclamation-circle', color: 'text-red-400' };
      case 'warning':
        return { icon: 'fas fa-exclamation-triangle', color: 'text-amber-400' };
      case 'info':
      default:
        return { icon: 'fas fa-info-circle', color: 'text-blue-400' };
    }
  };

  const getProgressBarColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-gradient-to-r from-emerald-400 to-emerald-600';
      case 'error':
        return 'bg-gradient-to-r from-red-400 to-red-600';
      case 'warning':
        return 'bg-gradient-to-r from-amber-400 to-amber-600';
      case 'info':
      default:
        return 'bg-gradient-to-r from-blue-400 to-blue-600';
    }
  };

  const { icon, color } = getIconAndColor();

  return (
    <div
      className={`
        ${getNotificationStyles()}
        transform transition-all duration-300 ease-out
        ${isVisible && !isRemoving ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
        ${isRemoving ? 'translate-x-full opacity-0 scale-95' : ''}
        min-w-[320px] max-w-[400px] p-4 mb-3
      `}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 to-slate-800/50 rounded-xl"></div>
      
      {/* Progress bar (for timed notifications) */}
      {notification.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700/50 rounded-b-xl overflow-hidden">
          <div 
            className={`h-full ${getProgressBarColor()} animate-shrink-width`}
            style={{
              animation: `shrinkWidth ${notification.duration}ms linear`
            }}
          ></div>
        </div>
      )}

      {/* Content */}
      <div className="relative flex items-start space-x-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${color} text-lg mt-0.5`}>
          <i className={icon}></i>
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          {notification.title && (
            <h4 className="text-white font-semibold text-sm mb-1">
              {notification.title}
            </h4>
          )}
          <p className="text-slate-300 text-sm leading-relaxed">
            {notification.message}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={handleRemove}
          className="flex-shrink-0 text-slate-400 hover:text-white transition-colors duration-200 
                   hover:bg-slate-700/50 rounded-lg p-1"
        >
          <i className="fas fa-times text-sm"></i>
        </button>
      </div>

      {/* Subtle border glow */}
      <div className="absolute inset-0 rounded-xl border border-transparent 
                    bg-gradient-to-r from-slate-600/20 to-slate-500/20 opacity-50"></div>
    </div>
  );
};

// Notification Container Component
const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
      <div className="space-y-2 pointer-events-auto">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationProvider;

