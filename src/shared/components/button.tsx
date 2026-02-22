import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { Upload, FolderCheck } from "lucide-react"

import { cn } from "@/shared/lib/utils"

// ---------------------------------------------------------------------------
// Base shared classes
// ---------------------------------------------------------------------------
const BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium" +
  " select-none cursor-pointer" +
  " transition-all duration-200 ease-out" +
  " active:scale-[0.97]" +
  " outline-none focus-visible:ring-2 focus-visible:ring-offset-2" +
  " disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none" +
  " [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0"

// ---------------------------------------------------------------------------
// Button variants
// ---------------------------------------------------------------------------
const buttonVariants = cva(BASE, {
  variants: {
    variant: {
      // Solid primary fill
      filled:
        "bg-primary text-white shadow-sm" +
        " hover:bg-primary/85 hover:shadow-md" +
        " focus-visible:ring-primary/40",

      // Transparent with primary border + text
      outlined:
        "border border-primary text-primary bg-transparent" +
        " hover:bg-primary/8" +
        " focus-visible:ring-primary/40",

      // No border or bg, just primary text
      ghost:
        "text-primary bg-transparent" +
        " hover:bg-primary/8" +
        " focus-visible:ring-primary/40",
    },
    size: {
      xs: "h-7 gap-1.5 px-2.5 text-xs rounded-md [&_svg:not([class*='size-'])]:size-3",
      sm: "h-8 gap-1.5 px-3 text-xs rounded-md",
      default: "h-9 px-4 py-2",
      lg: "h-11 px-6 text-base rounded-md",
      icon: "size-9",
      "icon-sm": "size-8",
      "icon-lg": "size-11",
    },
  },
  defaultVariants: {
    variant: "filled",
    size: "default",
  },
})

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------
function Button({
  className,
  variant = "filled",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

// ---------------------------------------------------------------------------
// Action button shared base (same as filled but with a custom color)
// ---------------------------------------------------------------------------
const ACTION_BASE = cn(
  BASE,
  "text-white shadow-sm hover:shadow-md focus-visible:ring-offset-2 h-9 px-4 py-2"
)

// ---------------------------------------------------------------------------
// Submit Project Button  — green (#1BA64F) + Upload icon
// ---------------------------------------------------------------------------
function SubmitProjectButton({
  className,
  children = "Submit Project",
  ...props
}: Omit<React.ComponentProps<"button">, "children"> & {
  children?: React.ReactNode
}) {
  return (
    <button
      data-slot="button"
      data-variant="submit-project"
      className={cn(
        ACTION_BASE,
        "bg-action-submit hover:bg-action-submit/85 focus-visible:ring-(--action-submit)/40",
        className
      )}
      {...props}
    >
      <Upload className="size-4 shrink-0" />
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Verify Project Button  — orange-red (#E84D0E) + FolderCheck icon
// ---------------------------------------------------------------------------
function VerifyProjectButton({
  className,
  children = "Verify Project",
  ...props
}: Omit<React.ComponentProps<"button">, "children"> & {
  children?: React.ReactNode
}) {
  return (
    <button
      data-slot="button"
      data-variant="verify-project"
      className={cn(
        ACTION_BASE,
        "bg-action-verify hover:bg-action-verify/85 focus-visible:ring-(--action-verify)/40",
        className
      )}
      {...props}
    >
      <FolderCheck className="size-4 shrink-0" />
      {children}
    </button>
  )
}

export { Button, buttonVariants, SubmitProjectButton, VerifyProjectButton }
