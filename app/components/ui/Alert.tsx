type AlertVariant = "error" | "success" | "info" | "warning";

interface AlertProps {
  variant:    AlertVariant;
  children:   React.ReactNode;
  className?: string;
}

export default function Alert({ variant, children, className = "" }: AlertProps) {
  return (
    <div className={`alert alert-${variant} ${className}`.trim()}>
      {children}
    </div>
  );
}
