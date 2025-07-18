type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
};

export function Label({ required, className, ...props }: LabelProps) {
  return (
    <label
      className={`block text-sm font-medium text-gray-700 ${className}`}
      {...props}
    >
      {props.children}
      {required && <span className="text-red-500">*</span>}
    </label>
  );
}