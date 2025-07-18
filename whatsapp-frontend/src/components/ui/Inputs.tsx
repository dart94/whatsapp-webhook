type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col space-y-1 w-full">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        className={`px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${className}`}
        {...props}
      />
    </div>
  );
}
