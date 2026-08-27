import { Link } from "react-router-dom";
import { ThemeToggle } from "../common/components/ThemeToggle/ThemeToggle";
import "./LandingPage.css";

const STEPS = [
  {
    title: "Browse services",
    body: "See the services STLAF offers and pick the one you need.",
  },
  {
    title: "Fill out a request",
    body: "Answer a short form tailored to that service — takes minutes.",
  },
  {
    title: "Get your document",
    body: "We generate your document and it's ready to download from your dashboard.",
  },
];

export function LandingPage() {
  return (
    <div className="landing">
      <div className="visual-blob visual-blob-gold" />
      <div className="visual-blob visual-blob-green" />

      <header className="landing-header">
        <span className="landing-wordmark">STLAF Draft</span>
        <div className="landing-header-actions">
          <ThemeToggle />
          <Link to="/login" className="landing-signin-btn">
            Log in
          </Link>
        </div>
      </header>

      <section className="landing-hero">
        <p className="landing-eyebrow">Client Portal</p>
        <h1 className="landing-headline">Request documents from STLAF, online.</h1>
        <p className="landing-subtext">
          Submit a request, and get your generated document without the back-and-forth.
        </p>
        <div className="landing-cta-row">
          <Link to="/signup" className="landing-cta-primary">
            Get started
          </Link>
          <Link to="/login" className="landing-cta-secondary">
            Log in
          </Link>
        </div>
      </section>

      <main className="landing-steps">
        {STEPS.map((step, index) => (
          <div key={step.title} className="landing-step-card">
            <span className="landing-step-number">{index + 1}</span>
            <h3 className="landing-step-title">{step.title}</h3>
            <p className="landing-step-body">{step.body}</p>
          </div>
        ))}
      </main>

      <footer className="landing-footer">
        Sadsad Tamesis Legal and Accountancy Firm
      </footer>
    </div>
  );
}
