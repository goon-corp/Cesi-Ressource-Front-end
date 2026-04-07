import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from './AppText';

type ToastType = 'success' | 'error';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

let addToast: ((type: ToastType, message: string) => void) | null = null;

export const toast = {
  success: (message: string) => addToast?.('success', message),
  error: (message: string) => addToast?.('error', message),
};

function ToastCard({ item, onRemove }: { item: ToastItem; onRemove: () => void }) {
  const { colors } = useTheme();
  const ref = useRef<HTMLDivElement>(null);

  const isSuccess = item.type === 'success';
  const bg = isSuccess ? colors.successLight : colors.errorLight;
  const fg = isSuccess ? colors.success : colors.error;
  const Icon = isSuccess ? CheckCircle : AlertCircle;

  useEffect(() => {
    requestAnimationFrame(() => {
      if (ref.current) {
        ref.current.style.opacity = '1';
        ref.current.style.transform = 'translateY(0)';
      }
    });
    const timer = setTimeout(() => {
      if (ref.current) {
        ref.current.style.opacity = '0';
        ref.current.style.transform = 'translateY(-12px)';
      }
      setTimeout(onRemove, 250);
    }, 3500);
    return () => clearTimeout(timer);
  }, [onRemove]);

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 16px',
        borderRadius: 8,
        backgroundColor: bg,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        opacity: 0,
        transform: 'translateY(-12px)',
        transition: 'opacity 0.25s, transform 0.25s',
        pointerEvents: 'auto',
        maxWidth: 420,
        width: '100%',
      }}
    >
      <Icon size={20} color={fg} style={{ flexShrink: 0 }} />
      <AppText variant="bodySmall" style={{ flex: 1, color: fg, fontWeight: '500' }}>
        {item.message}
      </AppText>
      <button
        onClick={onRemove}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', flexShrink: 0 }}
      >
        <X size={16} color={fg} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const add = useCallback((type: ToastType, message: string) => {
    const id = ++idRef.current;
    setItems((prev) => [...prev, { id, type, message }]);
  }, []);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    addToast = add;
    return () => { addToast = null; };
  }, [add]);

  if (items.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: 'center',
        pointerEvents: 'none',
        padding: '0 16px',
        width: '100%',
        maxWidth: 460,
        boxSizing: 'border-box',
      }}
    >
      {items.map((item) => (
        <ToastCard key={item.id} item={item} onRemove={() => remove(item.id)} />
      ))}
    </div>
  );
}
