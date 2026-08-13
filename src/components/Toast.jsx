import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Automatically dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          pointerEvents: 'none',
          maxWidth: '380px',
          width: 'calc(100% - 48px)'
        }}
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{
                pointerEvents: 'auto',
                background: '#ffffff',
                border: toast.type === 'success' ? '1px solid rgba(57, 109, 78, 0.15)' : '1px solid rgba(214, 77, 98, 0.15)',
                borderLeft: toast.type === 'success' ? '5px solid var(--accent-emerald)' : '5px solid var(--accent-rose)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 8px 30px rgba(44, 62, 46, 0.08)',
                backdropFilter: 'var(--glass-blur)'
              }}
            >
              {toast.type === 'success' ? (
                <CheckCircle2 size={18} color="var(--accent-emerald)" style={{ flexShrink: 0 }} />
              ) : (
                <AlertCircle size={18} color="var(--accent-rose)" style={{ flexShrink: 0 }} />
              )}
              
              <span
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-sans)',
                  lineHeight: '1.4'
                }}
              >
                {toast.message}
              </span>

              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  marginLeft: 'auto',
                  fontSize: '1.2rem',
                  lineHeight: '1',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px'
                }}
              >
                &times;
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
