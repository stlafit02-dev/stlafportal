import { useEffect, useState } from "react";
import { LoginModal } from "../auth/LoginModal";
import { ThemeToggle } from "../common/components/ThemeToggle/ThemeToggle";
import { useTheme } from "../theme/useTheme";
import apiClient from "../common/api/apiClient";
import logoLight from "../assets/light.png";
import logoDark from "../assets/dark.png";
import "./LandingPage.css";

interface Announcement {
  id: string;
  title: string;
  body: string;
  department: string | null;
  publishedAt: string;
}

export function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    apiClient.get<Announcement[]>("/announcements").then((res) => {
      setAnnouncements(res.data);
    });
  }, []);

  return (
    <div className="landing">
      <div className="visual-blob visual-blob-gold" />
      <div className="visual-blob visual-blob-green" />

      <header className="landing-header">
        <ThemeToggle />
        <button className="signin-btn" onClick={() => setIsLoginOpen(true)}>
          Sign In
        </button>
      </header>

      <section className="landing-hero">
        <img
          src={theme === "dark" ? logoDark : logoLight}
          alt="STLAF"
          className="landing-logo"
        />
      </section>

      <main className="landing-feed">
        <h2 className="landing-feed-title">Announcements</h2>

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
            <h3 className="notice-title">{a.title}</h3>
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