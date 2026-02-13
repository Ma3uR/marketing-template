import { CheckCircle2, XCircle, Clock, History, ArrowLeft } from 'lucide-react';
import type { OrderStatus } from '@/types/database';

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  Approved: {
    label: 'Підтверджено',
    color: '#22c55e',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  Declined: {
    label: 'Відхилено',
    color: '#ef4444',
    icon: <XCircle className="w-3 h-3" />,
  },
  InProcessing: {
    label: 'В обробці',
    color: '#eab308',
    icon: <Clock className="w-3 h-3" />,
  },
  Expired: {
    label: 'Термін вийшов',
    color: '#6b7280',
    icon: <History className="w-3 h-3" />,
  },
  Refunded: {
    label: 'Повернено',
    color: '#3b82f6',
    icon: <ArrowLeft className="w-3 h-3" />,
  },
};

export default function StatusPill({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Expired;

  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold w-fit uppercase tracking-wider"
      style={{
        backgroundColor: `${config.color}20`,
        color: config.color,
        border: `1px solid ${config.color}40`,
      }}
    >
      {config.icon}
      {config.label}
    </div>
  );
}
