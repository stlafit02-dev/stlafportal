import { useEffect, useState } from "react";
import apiClient from "../common/api/apiClient";
import { LoginModal } from "../auth/LoginModal";
import { ThemeToggle } from "../common/components/ThemeToggle/ThemeToggle";
import "./LandingPage.css";

interface Announcement {
  id: string;
  title: string;
  body: string;
  department: string | null;
  publishedAt: string;
}

export function LandingPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    apiClient.get<Announcement[]>("/announcements").then((res) => {
      setAnnouncements(res.data);
    });
  }, []);

  return (
    <div className="landing">
      <div className="glow" />

      <header className="landing-header">
        {/* <img src={logo} alt="STLAF" className="wordmark-logo" /> */}
        <div className="header-actions">
          <ThemeToggle />
          <button className="signin-btn" onClick={() => setIsLoginOpen(true)}>
            Sign In
          </button>
        </div>
      </header>

      <section className="landing-hero">
        <h1 className="hero-title">Announcements</h1>
        <p className="hero-subtitle">
          Updates and notices from across the firm.
        </p>
      </section>

      <main className="landing-feed">
        {announcements.length === 0 && (
          <div className="empty-card">
            <p className="empty-text">No announcements yet.</p>
          </div>
        )}

        {announcements.map((a) => (
          <article key={a.id} className="notice-card">
            <div className="notice-meta">
              <span className="notice-tag">{a.department ?? "Firm-Wide"}</span>
              <span className="notice-date">
                {new Date(a.publishedAt).toLocaleDateString()}
              </span>
            </div>
            <h2 className="notice-title">{a.title}</h2>
            <p className="notice-body">{a.body}</p>
          </article>
        ))}
      </main>

      <footer className="landing-footer">
        Sadsad Tamesis Legal and Accountancy Firm
      </footer>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
