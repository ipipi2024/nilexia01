import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, className = "", id, children, ...props }, ref) => (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={id}>
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={`form-select ${error ? "form-select--error" : ""} ${className}`.trim()}
        {...props}
      >
        {children}
      </select>
      {hint && !error && <span className="form-hint">{hint}</span>}
      {error && <span className="form-error-text">{error}</span>}
    </div>
  )
);

Select.displayName = "Select";
export default Select;
