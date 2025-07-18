type CardContentProps = {
  children: React.ReactNode;
  className?: string;
};

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={`mt-4 space-y-4 ${className}`}>
      {children}
    </div>
  );
}
