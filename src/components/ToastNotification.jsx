import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastNotification() {
  const { toasts, dismissToast } = useApp();

  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => {
        let Icon = Info;
        let toastClass = 'toast-info';

        if (toast.type === 'safe') {
          Icon = CheckCircle2;
          toastClass = 'toast-safe';
        } else if (toast.type === 'danger') {
          Icon = AlertCircle;
          toastClass = 'toast-danger';
        }

        return (
          <div key={toast.id} className={`toast ${toastClass}`}>
            <Icon size={18} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button 
              onClick={() => dismissToast(toast.id)}
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
