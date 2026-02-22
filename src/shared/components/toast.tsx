import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Info, AlertTriangle, CheckCircle, XCircle, X } from "lucide-react"

import { cn } from "@/shared/lib/utils"

const toastVariants = cva(
  "flex items-start gap-4 rounded-[20px] border px-6 py-5 w-full",
  {
    variants: {
      variant: {
        info: "bg-info-light border-info text-info",
        warning: "bg-warning-light border-warning text-warning",
        success: "bg-success-light border-success text-success",
        danger: "bg-danger-light border-danger text-danger",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
)

const icons = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  danger: XCircle,
} as const

type ToastVariant = NonNullable<VariantProps<typeof toastVariants>["variant"]>

interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  title: string
  description?: string
  onClose?: () => void
}

function Toast({ className, variant = "info", title, description, onClose, ...props }: ToastProps) {
  const Icon = icons[variant as ToastVariant]

  return (
    <div
      data-slot="toast"
      data-variant={variant}
      className={cn(toastVariants({ variant, className }))}
      {...props}
    >
      <Icon className="size-5 shrink-0 mt-0.5" />
      <div className="flex flex-col gap-0.5 flex-1">
        <p className="text-sm font-semibold leading-snug">{title}</p>
        {description && (
          <p className="text-sm leading-snug">{description}</p>
        )}
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
  )
}

export { Toast, toastVariants }
export type { ToastVariant }
