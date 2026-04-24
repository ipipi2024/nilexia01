interface PageContainerProps {
  children:   React.ReactNode;
  size?:      "default" | "narrow" | "medium";
  className?: string;
}

export default function PageContainer({
  children,
  size = "default",
  className = "",
}: PageContainerProps) {
  const sizeClass =
    size === "narrow" ? "page-container--narrow" :
    size === "medium" ? "page-container--medium" : "";

  return (
    <div className={`page-container ${sizeClass} ${className}`.trim()}>
      {children}
    </div>
  );
}
