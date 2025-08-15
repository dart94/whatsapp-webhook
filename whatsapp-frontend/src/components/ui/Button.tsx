import React from "react";
import clsx from "clsx";

type Variant = "default" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  className,
  children,
  variant = "default",
  size = "md",
  ...props
}: CustomButtonProps) {
  const baseStyles = "font-semibold rounded-lg transition duration-200 disabled:opacity-50";

  const variants: Record<Variant, string> = {
    default: "bg-purple-600 hover:bg-purple-700 text-white",
    outline: "border border-gray-300 text-gray-800 bg-white hover:bg-gray-50",
    ghost: "bg-transparent text-gray-800 hover:bg-gray-100",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  };

  const sizes: Record<Size, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-5 py-3 text-lg",
  };

  return (
    <button
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
