import "./Loader.css";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
}

export function Spinner({ size = "md" }: SpinnerProps) {
  return <span className={`spinner spinner-${size}`} aria-hidden="true" />;
}

interface PageLoaderProps {
  label?: string;
}

export function PageLoader({ label = "Loading…" }: PageLoaderProps) {
  return (
    <div className="page-loader">
      <Spinner size="lg" />
      <p className="page-loader-label">{label}</p>
    </div>
  );
}