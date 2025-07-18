type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "solid" | "outline";
};

export function Badge({ variant = "solid", className, ...props }: BadgeProps) {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        variant === "solid"
          ? "bg-green-600 text-white"
          : "border border-green-600 text-green-600"
      } ${className}`}
      {...props}
    >
      {props.children}
    </div>
  );
}