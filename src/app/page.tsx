import { dict } from "@/lib/i18n";

export default function Home() {
  const t = dict.en;
  return (
    <div className="app">
      <div className="topbar"><h1>🐾 {t.appName}</h1></div>
      <h2>{t.tagline}</h2>
      <p className="sub">{t.taglineSub}</p>
      <p className="muted">Real app scaffold. The clickable prototype lives in /prototype.</p>
    </div>
  );
}
