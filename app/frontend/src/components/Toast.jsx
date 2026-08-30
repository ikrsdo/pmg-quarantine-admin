import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

const TONE_STYLES = {
  success: {
    icon: CheckCircle2,
    iconClass: 'text-emerald-500',
    barClass: 'bg-emerald-500',
  },
  danger: {
    icon: XCircle,
    iconClass: 'text-red-500',
    barClass: 'bg-red-500',
  },
  info: {
    icon: Info,
    iconClass: 'text-blue-500',
    barClass: 'bg-blue-500',
  },
};

export default function Toast({ message, tone = 'success', duration = 5000, onDone }) {
  const [shrink, setShrink] = useState(false);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShrink(true));
    const timeout = setTimeout(() => onDoneRef.current(), duration);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, [duration]);

  const { icon: Icon, iconClass, barClass } = TONE_STYLES[tone];

  return (
    <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start gap-2 px-4 py-3">
        <Icon className={`size-5 shrink-0 ${iconClass}`} />
        <p className="text-sm text-zinc-700 dark:text-zinc-300">{message}</p>
      </div>
      <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className={`h-full ${barClass} transition-[width] ease-linear`}
          style={{
            width: shrink ? '0%' : '100%',
            transitionDuration: `${duration}ms`,
          }}
        />
      </div>
    </div>
  );
}
