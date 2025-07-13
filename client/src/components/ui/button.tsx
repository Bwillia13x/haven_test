import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "gradient-primary text-primary-foreground rounded-lg shadow-elevation-2 hover:shadow-elevation-3 hover:scale-105",
        destructive:
          "bg-destructive text-destructive-foreground rounded-lg shadow-elevation-2 hover:bg-destructive/90 hover:shadow-elevation-3",
        outline:
          "border border-border bg-surface/50 backdrop-blur-sm rounded-lg shadow-elevation-1 hover:bg-surface hover:border-primary/50 hover:shadow-elevation-2",
        secondary:
          "bg-secondary/10 text-secondary border border-secondary/20 rounded-lg hover:bg-secondary/20 hover:border-secondary/40",
        ghost:
          "text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface rounded-lg",
        link:
          "text-primary underline-offset-4 hover:underline rounded-lg",
        glass:
          "glass-panel text-on-surface rounded-lg hover:bg-surface-variant/30",
        gradient:
          "gradient-accent text-primary-foreground rounded-lg shadow-elevation-2 hover:shadow-elevation-3 hover:scale-105",
        neumorphic:
          "neumorphic text-on-surface rounded-lg hover:neumorphic-inset active:neumorphic-inset",
      },
      size: {
        xs: "h-6 px-2 text-xs rounded-md",
        sm: "h-8 px-3 text-xs rounded-lg",
        default: "h-10 px-4 py-2 rounded-lg",
        lg: "h-12 px-6 text-base rounded-lg",
        xl: "h-14 px-8 text-lg rounded-xl",
        icon: "h-10 w-10 rounded-lg",
        "icon-sm": "h-8 w-8 rounded-lg",
        "icon-lg": "h-12 w-12 rounded-lg",
      },
      animation: {
        none: "",
        subtle: "hover:scale-102",
        normal: "hover:scale-105",
        bounce: "hover:scale-105 active:scale-95",
        glow: "animate-glow",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "normal",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    animation,
    asChild = false,
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, animation, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && <span className="mr-1">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="ml-1">{rightIcon}</span>}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
