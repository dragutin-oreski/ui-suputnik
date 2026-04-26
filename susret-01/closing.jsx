// Definicija constructor + Sažetak + Roadmap
const D4 = window.UISuputnikData;

function DefinicijaPanel() {
  // Single phase now (no prije/poslije toggle — Dragutin: drop the toggle)
  const [pieces, setPieces] = React.useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("ui-suputnik-def-pieces-v2") || "[]");
      return Array.isArray(stored) ? stored : [];
    } catch { return []; }
  });

  React.useEffect(() => {
    localStorage.setItem("ui-suputnik-def-pieces-v2", JSON.stringify(pieces));
  }, [pieces]);

  const togglePiece = (label) => {
    setPieces((cur) => cur.includes(label) ? cur.filter(x => x !== label) : [...cur, label]);
  };

  const removeAt = (idx) => {
    setPieces((cur) => {
      const next = [...cur];
      next.splice(idx, 1);
      return next;
    });
  };

  const sentenceText = pieces.join(" ").toLowerCase();
  const checks = D4.defChecks.map((c) => ({
    ...c,
    met: c.match.some((m) => sentenceText.includes(m)),
  }));
  const metCount = checks.filter((c) => c.met).length;

  return (
    <div className="def">
      <div className="def-builder">
        <span className="kicker kicker--accent">Konstruktor definicije</span>
        <h4 style={{ margin: "8px 0 12px", color: "var(--ink-2)" }}>
          Slaži vlastitu definiciju — klikni dijelove ispod
        </h4>

        <div className="def-canvas">
          {pieces.map((label, i) => (
            <span key={i} className="def-piece" onClick={() => removeAt(i)} title="Klik = ukloni">
              {label} <span className="x">×</span>
            </span>
          ))}
        </div>

        <div className="def-bank">
          {Object.entries(D4.defPieces).map(([group, items]) => (
            <div className="bank-group" key={group}>
              <h5>{group}</h5>
              <div className="bank-row">
                {items.map((label) => (
                  <button
                    key={label}
                    className={`bank-piece ${pieces.includes(label) ? "used" : ""}`}
                    onClick={() => togglePiece(label)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="def-checks">
        <span className="kicker">Kriteriji dobre definicije</span>
        <h4 style={{ margin: "8px 0 4px", color: "var(--ink-2)" }}>{metCount} / {checks.length} pokriveno</h4>
        <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 14 }}>
          Cilj nije akademska definicija — nego ona koja pomaže razlikovati sustave.
        </p>
        {checks.map((c) => (
          <div key={c.id} className={`check-item ${c.met ? "met" : ""}`}>
            <span className="box">✓</span>
            <span>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TakeawayPanel({ classifierStats }) {
  const [status, setStatus] = React.useState("");

  const text = `UI Suputnik · Susret 01 — ${classifierStats.correct}/${classifierStats.total} klasifikacija točno. Ključ: UI nije sve što je automatizirano. Pita se tko je napisao pravilo — čovjek ili podaci?`;

  const copy = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => setStatus("Kopirano u međuspremnik."))
        .catch(() => setStatus("Kopiraj ručno: " + text));
    } else {
      setStatus(text);
    }
    setTimeout(() => setStatus(""), 4000);
  };

  return (
    <div className="takeaway">
      <div className="takeaway-card">
        <span className="stamp">Susret 01 · zaključak</span>
        <p className="quote">
          UI nije sve što je <em>automatizirano</em>. Ključno pitanje je slijedi li sustav <em>ručno napisana pravila</em>, uči <em>obrasce iz podataka</em> ili koristi <em>model</em> za predviđanje, klasifikaciju ili generiranje sadržaja.
        </p>
        <div className="takeaway-stats">
          <div>
            <div className="label">Sortirnica</div>
            <div className="value">{classifierStats.correct}/{classifierStats.total}</div>
          </div>
          <div>
            <div className="label">Sljedeći most</div>
            <div className="value">Score lab</div>
          </div>
          <div>
            <div className="label">Vraća se u</div>
            <div className="value">Susret 15</div>
          </div>
        </div>
        <div className="takeaway-actions">
          <button className="btn" onClick={copy}>Kopiraj sažetak</button>
          <span className="copy-status">{status}</span>
        </div>
      </div>

      <div className="share-side">
        <span className="kicker">Što odnijeti sa susreta</span>
        <h4 style={{ color: "var(--ink-2)" }}>Jedno ključno pitanje</h4>
        <p style={{
          margin: "8px 0 0",
          fontFamily: "var(--serif)",
          fontSize: 22,
          fontStyle: "italic",
          color: "var(--accent)",
          lineHeight: 1.3,
        }}>
          Tko je napisao pravilo — čovjek ili podaci?
        </p>
        <p style={{ color: "var(--ink-2)", fontSize: 13, marginTop: 12, lineHeight: 1.55 }}>
          Sve ostalo proizlazi iz ovog. Ako pravila piše čovjek — automatizacija ili ekspertni sustav. Ako ih sustav vadi iz podataka — strojno učenje. To je granica koju trebaš osjetiti prije svake sljedeće odluke.
        </p>
        <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid var(--line)" }}>
          <span className="kicker">Sljedeći put</span>
          <p className="next-up" style={{ marginTop: 6 }}>Score lab — pravila, ponderi i pristranost na konkretnom slučaju.</p>
        </div>
      </div>
    </div>
  );
}

function RoadmapPanel() {
  const cols = D4.spineSteps.map((step) => ({
    ...step,
    items: D4.roadmap.filter((r) => r.spine === step.id),
  }));

  return (
    <div className="roadmap">
      <div className="roadmap-spine">
        {D4.spineSteps.map((s) => (
          <div className="roadmap-step" key={s.id}>
            <span className="pin"></span>
            <span className="name">{s.name}</span>
          </div>
        ))}
      </div>
      <div className="roadmap-grid">
        {cols.map((col) => (
          <div className="roadmap-col" key={col.id}>
            {col.items.map((it) => (
              <div className="roadmap-card" key={it.klasa + it.title} style={it.here ? { background: "var(--accent-wash)", borderColor: "var(--accent)" } : null}>
                <div className="klasa">{it.klasa}</div>
                <div className="ttl">{it.title}</div>
                {!it.here && <span className="lock">⌁ uskoro</span>}
                {it.here && <span className="lock" style={{ color: "var(--accent)" }}>● ovdje</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
      <p style={{ margin: "20px 16px 0", fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--muted)", fontSize: 14 }}>
        Svaki sljedeći susret nadovezuje se na isti obrazac. Ova mapa čuva taj ritam.
      </p>
    </div>
  );
}

window.DefinicijaPanel = DefinicijaPanel;
window.TakeawayPanel = TakeawayPanel;
window.RoadmapPanel = RoadmapPanel;
