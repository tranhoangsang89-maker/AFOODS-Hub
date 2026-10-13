import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const STYLES = {
  success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  error: 'border-red-500/40 bg-red-500/10 text-red-400',
  info: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
  warning: 'border-orange-500/40 bg-orange-500/10 text-orange-400',
};

export default function Toast({ message, type = 'success', onClose }) {
  const Icon = ICONS[type] || CheckCircle;

  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl border glass-dark shadow-2xl max-w-sm toast ${STYLES[type]}`}>
      <Icon size={18} className="flex-shrink-0" />
      <span className="text-sm font-medium text-slate-200 flex-1">{message}</span>
      <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
        <X size={14} />
      </button>
    </div>
  );
}
