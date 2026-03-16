import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Info, X } from 'lucide-react';
import { toast as sonnerToast } from 'sonner';
import { cn } from '@/shared/lib/utils';

const notificationVariants = cva(
  'flex items-start gap-4 rounded-[20px] border px-6 py-5 w-full max-w-none',
  {
    variants: {
      variant: {
        info: 'bg-blue-50 border-blue-200 text-blue-700',
        warning: 'bg-orange-50 border-orange-200 text-orange-700',
        success: 'bg-green-50 border-green-200 text-green-700',
        danger: 'bg-red-50 border-red-200 text-red-700',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

type NotificationVariant = NonNullable<VariantProps<typeof notificationVariants>['variant']>;

interface NotificationProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof notificationVariants> {
  title: string;
  description?: string;
  onClose?: () => void;
}

function Notification({
  className,
  variant = 'info',
  title,
  description,
  onClose,
  ...props
}: Readonly<NotificationProps>) {
  return (
    <div
      data-slot="notification"
      data-variant={variant}
      className={cn(notificationVariants({ variant, className }))}
      {...props}
    >
      <Info className="size-5 shrink-0 mt-0.5" />
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <p className="text-sm font-semibold leading-snug">{title}</p>
        {description && <p className="text-sm leading-snug">{description}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="shrink-0 -mr-2 -mt-1 p-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

export { Notification, notificationVariants };
export type { NotificationVariant };

export function showNotification(
  variant: NotificationVariant,
  title: string,
  description: string
) {
  sonnerToast.custom(
    (id) => (
      <Notification
        variant={variant}
        title={title}
        description={description}
        onClose={() => sonnerToast.dismiss(id)}
        className="shadow-lg"
      />
    ),
    {
      duration: 4000,
      position: 'top-center',
      style: {
        width: 'min(600px, calc(100vw - 32px))',
        '--offset': '20px',
      } as React.CSSProperties,
    }
  );
}
