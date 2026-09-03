import { useTheme } from "../../../theme/useTheme";
import logoDark from "../../../assets/dark.png";
import logoLight from "../../../assets/light.png";
import "./Loader.css";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
}

export function Spinner({ size = "md" }: SpinnerProps) {
  return (
    <span className={`spinner spinner-${size}`} aria-hidden="true">
      <span className="spinner-track" />
      <span className="spinner-arc" />
    </span>
  );
}

interface PageLoaderProps {
  label?: string;
}

export function PageLoader({ label = "Loading" }: PageLoaderProps) {
  const { theme } = useTheme();
  const logoSrc = theme === "dark" ? logoDark : logoLight;

  return (
    <div className="page-loader">
      <div className="page-loader-glow" aria-hidden="true" />
      <img className="page-loader-logo" src={logoSrc} alt="" />
      <span className="page-loader-bar" aria-hidden="true">
        <span className="page-loader-bar-sweep" />
      </span>
      <p className="page-loader-label">
        {label}
        <span className="page-loader-dots" aria-hidden="true">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </p>
    </div>
  );
}
