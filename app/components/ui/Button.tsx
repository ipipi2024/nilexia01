"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "success" | "danger" | "info" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, children, className = "", disabled, ...props }, ref) => {
    const cls = [
      "btn",
      `btn-${variant}`,
      size !== "md" ? `btn-${size}` : "",
      className,
    ].filter(Boolean).join(" ");

    return (
      <button
        ref={ref}
        className={cls}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <span className="spinner spinner--sm" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
