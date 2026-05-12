/* eslint-disable */
const { useState, useMemo, useRef, useEffect, useCallback } = React;

/* ──────────────────────────────────────────────────────────────────────────
   Susret 05 — strojno učenje, kreditna procjena i pristranost
   Interaktivni blokovi za vježbu pojmova.
   ────────────────────────────────────────────────────────────────────────── */

function App() {
  const [tab, setTab] = useState("concepts");
  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="../">
          <span className="brand-mark" aria-hidden="true">D</span>
          <span>
            <span className="brand-name">Dragutin Oreški</span>
            <span className="brand-meta">UI Suputnik · Susret 05</span>
          </span>
        </a>
        <nav className="topbar-right">
          <a href="../">← Svi susreti</a>
          <a href="../susret-03/">← Susret 03</a>
        </nav>
      </header>

      <section className="hero">
        <div className="kicker"><span className="dot"></span>Susret 05 · Strojno učenje i pristranost</div>
        <h1>Modeli uče iz <em>podataka</em>. Pitanje je kojih.</h1>
        <p className="hero-sub">
          Pet kratkih interaktiva za sat 13-15: strojno učenje, znanost o podacima i duboko učenje
          kroz poslovne primjere, Waldovi avioni, kreditna procjena, paradoks točnosti i povratna petlja.
        </p>
      </section>

      <nav className="tabs" role="tablist">
        <button className={"tab" + (tab === "concepts" ? " is-active" : "")} onClick={() => setTab("concepts")}>1 · Preporuke</button>
        <button className={"tab" + (tab === "wald" ? " is-active" : "")} onClick={() => setTab("wald")}>2 · Wald</button>
        <button className={"tab" + (tab === "credit" ? " is-active" : "")} onClick={() => setTab("credit")}>3 · Kredit</button>
        <button className={"tab" + (tab === "paradox" ? " is-active" : "")} onClick={() => setTab("paradox")}>4 · Točnost</button>
        <button className={"tab" + (tab === "loop" ? " is-active" : "")} onClick={() => setTab("loop")}>5 · Petlja</button>
      </nav>

      {tab === "concepts" && <ConceptsDemo />}
      {tab === "wald" && <WaldDemo />}
      {tab === "credit" && <CreditScoringDemo />}
      {tab === "paradox" && <AccuracyParadoxDemo />}
      {tab === "loop" && <PolicingLoopDemo />}

      <footer className="colophon">
        <span>UI Suputnik · materijali za kolegij</span>
        <span>Anonimna analitika · bez snimanja sesije</span>
        <span><a href="../">Početna</a></span>
      </footer>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   1) PREPORUKE SADRŽAJA — sličnost sadržaja + slični gledatelji
   ══════════════════════════════════════════════════════════════════════════ */

const GENRES = [
  ["akcija", "akcija"],
  ["triler", "triler"],
  ["komedija", "komedija"],
  ["romansa", "romansa"],
  ["dokumentarno", "dokumentarno"],
  ["znanstvena", "znanstvena fantastika"],
  ["hrana", "hrana"],
  ["sport", "sport"],
];

const WATCHED_TITLES = [
  { id: "space", title: "Svemirska potjera", meta: "akcija · znanstvena fantastika", genres: { akcija: 1, znanstvena: 1, triler: 0.4 } },
  { id: "island", title: "Misterij na otoku", meta: "triler · kriminalistička priča", genres: { triler: 1, akcija: 0.2 } },
  { id: "office", title: "Uredski kaos", meta: "komedija", genres: { komedija: 1 } },
  { id: "kitchen", title: "Kuhinja pod pritiskom", meta: "hrana · natjecanje", genres: { hrana: 1, dokumentarno: 0.3 } },
  { id: "ocean", title: "Planet oceana", meta: "dokumentarno", genres: { dokumentarno: 1 } },
];

const CANDIDATE_TITLES = [
  { id: "agent", title: "Noćni agent", meta: "akcija · triler", popularity: 74, genres: { akcija: 1, triler: 1 } },
  { id: "sea", title: "More tišine", meta: "znanstvena fantastika · drama", popularity: 58, genres: { znanstvena: 1, triler: 0.35 } },
  { id: "dessert", title: "Savršeni desert", meta: "hrana · natjecanje", popularity: 66, genres: { hrana: 1, komedija: 0.2 } },
  { id: "villa", title: "Tajna jadranske vile", meta: "triler · romansa", popularity: 49, genres: { triler: 0.75, romansa: 1 } },
  { id: "planet", title: "Divlji planet", meta: "dokumentarno · priroda", popularity: 62, genres: { dokumentarno: 1 } },
  { id: "laugh", title: "Smijeh na poslu", meta: "komedija", popularity: 53, genres: { komedija: 1 } },
  { id: "match", title: "Zadnja utakmica", meta: "sport · drama", popularity: 41, genres: { sport: 1, dokumentarno: 0.3 } },
  { id: "case", title: "Dosje Zagreb", meta: "kriminalistički triler", popularity: 69, genres: { triler: 1, akcija: 0.25 } },
];

const VIEWERS = [
  {
    name: "Ana",
    watched: { space: 1, island: 1, office: -1, kitchen: -1, ocean: 0 },
    candidates: { agent: 1, sea: 1, villa: 0, case: 1, planet: -1, laugh: -1 },
  },
  {
    name: "Marko",
    watched: { space: -1, island: 0, office: 1, kitchen: 1, ocean: 0 },
    candidates: { dessert: 1, laugh: 1, match: 0, agent: -1, sea: -1 },
  },
  {
    name: "Sara",
    watched: { space: 0, island: 1, office: 1, kitchen: 0, ocean: 1 },
    candidates: { villa: 1, planet: 1, case: 1, laugh: 1, dessert: 0 },
  },
  {
    name: "Ivan",
    watched: { space: 1, island: -1, office: 0, kitchen: -1, ocean: 1 },
    candidates: { sea: 1, planet: 1, match: 1, agent: 0, dessert: -1 },
  },
];

const INITIAL_RATINGS = { space: 1, island: 1, office: 0, kitchen: -1, ocean: 1 };

function ConceptsDemo() {
  const [ratings, setRatings] = useState(INITIAL_RATINGS);
  const [similarWeight, setSimilarWeight] = useState(55);
  const [popularityWeight, setPopularityWeight] = useState(15);

  const setRating = (id, value) => {
    setRatings((prev) => ({ ...prev, [id]: value }));
  };

  const profile = useMemo(() => {
    const sums = {};
    WATCHED_TITLES.forEach((item) => {
      const rating = ratings[item.id] || 0;
      Object.entries(item.genres).forEach(([genre, value]) => {
        sums[genre] = (sums[genre] || 0) + rating * value;
      });
    });
    const max = Math.max(1, ...Object.values(sums).map((v) => Math.abs(v)));
    return Object.fromEntries(GENRES.map(([key]) => [key, (sums[key] || 0) / max]));
  }, [ratings]);

  const similarities = useMemo(() => VIEWERS.map((viewer) => {
    let dot = 0, userNorm = 0, viewerNorm = 0;
    WATCHED_TITLES.forEach((item) => {
      const a = ratings[item.id] || 0;
      const b = viewer.watched[item.id] || 0;
      dot += a * b;
      userNorm += a * a;
      viewerNorm += b * b;
    });
    const raw = userNorm && viewerNorm ? dot / (Math.sqrt(userNorm) * Math.sqrt(viewerNorm)) : 0;
    return { ...viewer, similarity: Math.max(0, raw) };
  }).sort((a, b) => b.similarity - a.similarity), [ratings]);

  const recommendations = useMemo(() => {
    const similarShare = similarWeight / 100;
    const contentShare = 1 - similarShare;
    const popShare = popularityWeight / 100;
    const simTotal = Math.max(0.01, similarities.reduce((sum, viewer) => sum + viewer.similarity, 0));

    return CANDIDATE_TITLES.map((item) => {
      const contentRaw = Object.entries(item.genres).reduce((sum, [genre, value]) => (
        sum + (profile[genre] || 0) * value
      ), 0);
      const contentScore = clamp(50 + contentRaw * 28, 0, 100);

      const neighborRaw = similarities.reduce((sum, viewer) => (
        sum + viewer.similarity * (viewer.candidates[item.id] || 0)
      ), 0) / simTotal;
      const neighborScore = clamp(50 + neighborRaw * 45, 0, 100);
      const finalScore = clamp(
        contentShare * contentScore + similarShare * neighborScore + popShare * (item.popularity - 50),
        0,
        100
      );

      const topGenre = Object.entries(item.genres).sort((a, b) => b[1] - a[1])[0][0];
      const bestViewer = similarities.find((viewer) => (viewer.candidates[item.id] || 0) > 0);
      const reason = bestViewer && bestViewer.similarity > 0.05
        ? `${bestViewer.name} ti je sličan/slična i pozitivno je ocijenio/la ovaj naslov.`
        : `Sadržajno je blizu tvojem profilu za žanr: ${genreLabel(topGenre)}.`;

      return { ...item, contentScore, neighborScore, finalScore, reason };
    }).sort((a, b) => b.finalScore - a.finalScore);
  }, [profile, similarities, similarWeight, popularityWeight]);

  const topRecommendation = recommendations[0];

  return (
    <div>
      <div className="section-explainer">
        <p>
          Zamisli naslovnicu Netflixa. Sustav ne zna što želiš gledati, nego iz tvoje povijesti i ponašanja sličnih gledatelja
          procjenjuje što bi moglo biti relevantno. U ovoj vježbi mijenjaš ulazne podatke i odmah vidiš kako se mijenja rang preporuka.
        </p>
        <aside className="aside">
          <strong>Ideja.</strong> Preporuka nije jedna odluka, nego poredak kandidata. Model kombinira sličnost sadržaja,
          ponašanje sličnih gledatelja i opću popularnost.
        </aside>
      </div>

      <div className="recommendation-lab">
        <section className="reco-panel">
          <div className="panel-title">
            <span>Korak 1</span>
            <h3>Ocijeni što si gledao/la</h3>
          </div>
          <div className="watched-list">
            {WATCHED_TITLES.map((item) => (
              <article key={item.id} className="watched-card">
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.meta}</small>
                </div>
                <div className="rating-buttons" role="group" aria-label={`Ocjena za ${item.title}`}>
                  <button className={ratings[item.id] === 1 ? "is-active" : ""} onClick={() => setRating(item.id, 1)}>Sviđa mi se</button>
                  <button className={ratings[item.id] === 0 ? "is-active" : ""} onClick={() => setRating(item.id, 0)}>Neutralno</button>
                  <button className={ratings[item.id] === -1 ? "is-active warn" : ""} onClick={() => setRating(item.id, -1)}>Ne sviđa mi se</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="reco-panel">
          <div className="panel-title">
            <span>Korak 2</span>
            <h3>Podesi logiku preporuke</h3>
          </div>
          <div className="reco-controls">
            <label>
              Utjecaj sličnih gledatelja
              <input type="range" min="0" max="100" value={similarWeight} onChange={(e) => setSimilarWeight(+e.target.value)} />
              <span>{similarWeight} %</span>
            </label>
            <label>
              Utjecaj opće popularnosti
              <input type="range" min="0" max="40" value={popularityWeight} onChange={(e) => setPopularityWeight(+e.target.value)} />
              <span>{popularityWeight} %</span>
            </label>
          </div>

          <div className="taste-bars">
            <h4>Tvoj profil žanrova</h4>
            {GENRES.map(([key, label]) => {
              const value = profile[key] || 0;
              return (
                <div key={key} className="taste-row">
                  <span>{label}</span>
                  <div className="taste-track">
                    <i style={{
                      left: value < 0 ? (50 + value * 50) + "%" : "50%",
                      width: Math.abs(value) * 50 + "%"
                    }} className={value < 0 ? "negative" : ""}></i>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="reco-panel">
          <div className="panel-title">
            <span>Korak 3</span>
            <h3>Usporedi slične gledatelje</h3>
          </div>
          <div className="viewer-list">
            {similarities.map((viewer) => (
              <div key={viewer.name} className="viewer-row">
                <span>{viewer.name}</span>
                <div className="viewer-track"><i style={{ width: Math.round(viewer.similarity * 100) + "%" }}></i></div>
                <strong>{Math.round(viewer.similarity * 100)}%</strong>
              </div>
            ))}
          </div>
          <div className="mini-matrix" aria-label="Matrica ocjena gledatelja">
            <span></span>
            <strong>Ti</strong>
            {VIEWERS.map((viewer) => <strong key={viewer.name}>{viewer.name}</strong>)}
            {WATCHED_TITLES.map((item) => (
              <React.Fragment key={item.id}>
                <span>{item.title}</span>
                <b>{ratingSymbol(ratings[item.id])}</b>
                {VIEWERS.map((viewer) => <b key={viewer.name}>{ratingSymbol(viewer.watched[item.id])}</b>)}
              </React.Fragment>
            ))}
          </div>
        </section>

        <section className="reco-panel recommendations-panel">
          <div className="panel-title">
            <span>Rezultat</span>
            <h3>Rang preporuka</h3>
          </div>
          <div className="recommendations-list">
            {recommendations.map((item, index) => (
              <article key={item.id} className={index === 0 ? "is-top" : ""}>
                <div className="rank">{index + 1}</div>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.meta}</small>
                  <p>{item.reason}</p>
                </div>
                <div className="reco-score">
                  <span>{Math.round(item.finalScore)}%</span>
                  <i style={{ width: item.finalScore + "%" }}></i>
                </div>
              </article>
            ))}
          </div>
          <div className="callout neutral">
            <strong>Zašto je prvi naslov prvi?</strong> {topRecommendation.reason}
            {" "}Njegova završna procjena kombinira sličnost sadržaja ({Math.round(topRecommendation.contentScore)} %),
            slične gledatelje ({Math.round(topRecommendation.neighborScore)} %) i popularnost.
          </div>
        </section>
      </div>

      <div className="qrow">
        <strong>Promisli</strong>
        <p>
          Što se dogodi ako namjerno označiš dokumentarce kao „ne sviđa mi se”? Hoće li sustav prestati nuditi korisne dokumentarce?
          Gdje je granica između dobre personalizacije i zatvaranja u uski krug sličnog sadržaja?
        </p>
      </div>
    </div>
  );
}

function ratingSymbol(value) {
  if (value > 0) return "+";
  if (value < 0) return "−";
  return "·";
}

function genreLabel(key) {
  const found = GENRES.find(([id]) => id === key);
  return found ? found[1] : key;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/* ════════════════════════════════════════════════════════════════════════════
   2) WALDOVI AVIONI — pristranost preživljavanja
   ══════════════════════════════════════════════════════════════════════════ */

// Hidden hits — where the *missing* planes were hit (planes that didn't come back).
const MISSING_HITS = [
  [236, 68], [245, 96], [236, 124], [405, 68], [394, 96], [405, 124],
  [305, 36], [319, 62], [333, 36],
  [286, 425], [319, 452], [352, 425],
];

function WaldDemo() {
  const [reinforce, setReinforce] = useState([]); // {x, y}
  const [revealed, setRevealed] = useState(false);
  const svgRef = useRef(null);

  const onPlaneClick = (e) => {
    if (revealed) return;
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svgRef.current.getScreenCTM().inverse();
    const local = pt.matrixTransform(ctm);
    setReinforce((prev) => [...prev, { x: local.x, y: local.y }]);
  };

  const reset = () => { setReinforce([]); setRevealed(false); };
  // Visible sample: wing panels and the middle fuselage, away from engines/nose/tail.
  const onWingArea = reinforce.filter((r) =>
    ((r.x > 10 && r.x < 285) || (r.x > 352 && r.x < 628)) && r.y > 135 && r.y < 245
  ).length;
  const onFuselageMiddle = reinforce.filter((r) => r.x > 278 && r.x < 360 && r.y > 140 && r.y < 390).length;
  const onMissingArea = reinforce.filter((r) =>
    (r.x > 214 && r.x < 266 && r.y > 45 && r.y < 145) ||
    (r.x > 372 && r.x < 424 && r.y > 45 && r.y < 145) ||
    (r.x > 286 && r.x < 352 && r.y > 18 && r.y < 96) ||
    (r.x > 250 && r.x < 390 && r.y > 405 && r.y < 470)
  ).length;

  return (
    <div>
      <div className="section-explainer">
        <p>
          Drugi svjetski rat. Saveznički bombarderi se vraćaju izrešetani — najviše po krilima i sredini trupa.
          Treba odlučiti gdje staviti dodatni oklop, ali oklop je težak i ne možemo pojačati cijeli avion.
          Najprije označi dijelove koje bi ti zaštitio.
        </p>
        <aside className="aside">
          <strong>Prije otkrivanja.</strong> Gledaš samo avione koji su se vratili u bazu. Pitanje je:
          jesu li rupe koje vidiš dokaz gdje je avion slab, ili dokaz gdje može preživjeti pogodak?
        </aside>
      </div>

      <div className="bias-layout">
        <div className="bias-controls">
          <div className="readout">
            <strong>Korak 1.</strong> Klikni na dijelove aviona koje bi pojačao. Vidiš rupe od metaka — gdje bi stavio dodatni oklop?
          </div>
          <div className="readout" style={{ color: "var(--muted)" }}>
            Označeno: <span style={{ color: "var(--ink)" }}>{reinforce.length}</span> točaka
          </div>
          <div className="btn-row">
            <button className="btn" onClick={() => setRevealed(true)} disabled={revealed || reinforce.length === 0}>
              Otkrij što nedostaje →
            </button>
            <button className="btn ghost" onClick={reset}>Resetiraj</button>
          </div>
          <div className="readout" style={{ marginTop: 6 }}>
            {revealed ? (
              <span>Istaknute zone i točke su mjesta gdje su <em>nestali</em> avioni bili pogođeni. Te avione nikad ne vidimo u podacima — pa ih lako previdimo.</span>
            ) : (
              <span style={{ color: "var(--muted)" }}>Nakon što napraviš odabir, pritisni <em>Otkrij</em>.</span>
            )}
          </div>
          <div className="swatch-row" aria-hidden="true">
            <span className="swatch hit"><span></span>Rupe na vraćenim avionima</span>
            <span className="swatch reinforce"><span></span>Tvoj odabir</span>
            {revealed && <span className="swatch missing"><span></span>Rupe na nestalim avionima</span>}
          </div>
        </div>

        <div className="bias-stage plane-stage">
          <svg
            ref={svgRef}
            className="plane-svg"
            viewBox="0 0 638 495"
            onClick={onPlaneClick}
            style={{ cursor: revealed ? "default" : "crosshair" }}
            aria-label="Pogled odozgo na bombarder s rupama od metaka"
          >
            <rect className="plane-sky" x="0" y="0" width="638" height="495" rx="8" />
            <image
              className="wald-plane-image"
              href="assets/wald-plane.png"
              x="0"
              y="0"
              width="638"
              height="495"
              preserveAspectRatio="xMidYMid meet"
            />

            {/* ── user reinforce markers ── */}
            {reinforce.map((r, i) => (
              <circle key={"r" + i} cx={r.x} cy={r.y} r="11" className="reinforce" />
            ))}

            {revealed && (
              <g>
                {/* reveal zones overlaying critical, never-shown areas */}
                <ellipse className="reveal-zone" cx="240" cy="96" rx="34" ry="58" />
                <ellipse className="reveal-zone" cx="399" cy="96" rx="34" ry="58" />
                <ellipse className="reveal-zone" cx="319" cy="56" rx="42" ry="44" />
                <ellipse className="reveal-zone" cx="319" cy="440" rx="86" ry="36" />
                {MISSING_HITS.map((p, i) => (
                  <circle key={"m" + i} cx={p[0]} cy={p[1]} r="5" className="missing-hit" />
                ))}
                <text className="plane-label" x="293" y="18">kabina</text>
                <text className="plane-label" x="214" y="38">motori</text>
                <text className="plane-label" x="300" y="488">rep</text>
              </g>
            )}
          </svg>

          {revealed && (
            <div className={"callout " + (onMissingArea > (onWingArea + onFuselageMiddle) ? "" : "warn")}>
              {onMissingArea > (onWingArea + onFuselageMiddle) ? (
                <span><strong>Bravo.</strong> Ako si pretežno klikao po motorima, pilotskoj kabini ili repu —
                upravo si zaštitio dijelove koji u podacima nisu vidljivi, ali su kritični.
                To je ideja pristranosti preživjelih: podaci često pokazuju samo one koji su preživjeli selekciju.</span>
              ) : (
                <span><strong>Klasična zamka.</strong> Većina ljudi reinforcira tamo gdje vidi najviše rupa — krila i trup.
                Avioni s rupama tamo su <em>preživjeli</em>. Avioni pogođeni u motore, kabinu ili rep — nisu se vratili.
                Klikova na krila i trup: {onWingArea + onFuselageMiddle}. Klikova u kritične zone: {onMissingArea}.
                To je pristranost preživjelih: zaključujemo iz vidljivih slučajeva, a nedostaju nam oni koji su ispali iz uzorka.</span>
              )}
            </div>
          )}

          {revealed && (
            <div className="lesson-reveal">
              <h3>Što je ovdje trik?</h3>
              <p>
                Abraham Wald je zaključio da treba ojačati dijelove na kojima se na vraćenim avionima vidi malo rupa:
                motore, kabinu i rep. Avioni pogođeni u te dijelove često se nisu vratili, pa ih nema u podacima.
              </p>
              <p>
                Ista greška se pojavljuje u strojnom učenju: vidimo klijente kojima je kredit odobren, kandidate koji su prošli filtar,
                korisnike koji su ostali u aplikaciji. Ako model uči samo iz „preživjelih”, pogrešno procjenjuje one koje nikad nije vidio.
              </p>
            </div>
          )}

          <div className="qrow">
            <strong>Promisli</strong>
            <p>
              Gdje u podacima koje koristite svakodnevno možda nedostaju „nestali avioni&#8221;? (klijenti koje banka odbila i nikad ne saznamo bi li vratili kredit;
              CV-jevi koji su filtrirani prije razgovora; tweets koje algoritam nikad nije prikazao; pacijenti koji nisu došli na pregled.)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   2) PRISTRANA KREDITNA PROCJENA — nerazmjeran učinak + pravilo 4/5
   ══════════════════════════════════════════════════════════════════════════ */

function CreditScoringDemo() {
  // Dvije skupine s istim stvarnim rizikom, ali različitim povijesnim odobravanjima.
  const [approveA, setApproveA] = useState(85); // %
  const [approveB, setApproveB] = useState(45); // %
  const [modelStrength, setModelStrength] = useState(70);

  // Ista stvarna kreditna sposobnost: 60 % svake skupine stvarno uredno vraća kredit.
  const truePosRate = 60;

  // Model uči mješavinu stvarne kreditne sposobnosti i povijesnih odobravanja.
  const s = modelStrength / 100;
  const modelApproveA = Math.round(truePosRate * (1 - s) + approveA * s);
  const modelApproveB = Math.round(truePosRate * (1 - s) + approveB * s);

  // Omjer nerazmjernog učinka: B / A
  const di = modelApproveA > 0 ? modelApproveB / modelApproveA : 0;
  const passes4_5 = di >= 0.8;

  // Kvalificirani ljudi koje model propušta među stvarno kreditno sposobnima.
  const denialOfQualifiedB = Math.max(0, 60 - modelApproveB);
  const denialOfQualifiedA = Math.max(0, 60 - modelApproveA);

  return (
    <div>
      <div className="section-explainer">
        <p>
          Dvije skupine kandidata. Iste financijske navike, iste prihode, isti rizik — 60 % u svakoj skupini
          stvarno može uredno vraćati kredit. Ali u <em>povijesnim</em> podacima banka je odobravala kredite različito.
          Klizač „pristranost povijesti&#8221; pokazuje koliko se model oslanja na te povijesne odluke umjesto na stvarne karakteristike.
        </p>
        <aside className="aside">
          <strong>Pravilo 4/5.</strong> Jednostavna provjera pravednosti: stopa odobravanja niže skupine
          ne bi smjela pasti ispod 80 % stope više skupine. Nerazmjeran učinak = stopa B ÷ stopa A.
          Ispod 0,8 — model je vjerojatno diskriminatoran.
        </aside>
      </div>

      <div className="bias-layout">
        <div className="bias-controls">
          <label>
            Povijesno odobravanje · Skupina A
            <input type="range" min="20" max="98" value={approveA} onChange={(e) => setApproveA(+e.target.value)} />
            <span className="readout">{approveA} %</span>
          </label>
          <label>
            Povijesno odobravanje · Skupina B
            <input type="range" min="5" max="98" value={approveB} onChange={(e) => setApproveB(+e.target.value)} />
            <span className="readout">{approveB} %</span>
          </label>
          <label>
            Koliko model „uči&#8221; iz pristrane povijesti
            <input type="range" min="0" max="100" value={modelStrength} onChange={(e) => setModelStrength(+e.target.value)} />
            <span className="readout">{modelStrength} %</span>
          </label>
          <div className="readout" style={{ color: "var(--muted)" }}>
            Stvarni rizik u obje skupine identičan je: <span style={{ color: "var(--ink)" }}>60 %</span> stvarno uredno vraća kredit.
          </div>
        </div>

        <div className="bias-stage">
          <div className="bias-bars" aria-label="Usporedba stopa odobravanja">
            <div className="bias-bar">
              <span className="label">Povijest A</span>
              <div className="track"><div className="fill" style={{ width: approveA + "%" }}></div></div>
              <span className="val">{approveA}%</span>
            </div>
            <div className="bias-bar">
              <span className="label">Povijest B</span>
              <div className="track"><div className="fill group-b" style={{ width: approveB + "%" }}></div></div>
              <span className="val">{approveB}%</span>
            </div>
            <div className="bias-bar">
              <span className="label">Model A</span>
              <div className="track"><div className="fill" style={{ width: modelApproveA + "%" }}></div></div>
              <span className="val">{modelApproveA}%</span>
            </div>
            <div className="bias-bar">
              <span className="label">Model B</span>
              <div className="track"><div className="fill group-b" style={{ width: modelApproveB + "%" }}></div></div>
              <span className="val">{modelApproveB}%</span>
            </div>
          </div>

          <div className="di-card">
            <div className={"stat " + (passes4_5 ? "pass" : "fail")}>
              <span className="label">Nerazmjeran učinak (B / A)</span>
              <span className="value">{di.toFixed(2)}</span>
            </div>
            <div className={"stat " + (passes4_5 ? "pass" : "fail")}>
              <span className="label">Pravilo 4/5</span>
              <span className="value">{passes4_5 ? "✓ prolazi" : "✗ pada"}</span>
            </div>
          </div>

          <div className={"callout " + (passes4_5 ? "" : "warn")}>
            {passes4_5 ? (
              <span><strong>Trenutno u redu.</strong> Stopa odobravanja niže skupine je {Math.round(di * 100)} % stope više —
              iznad praga 80 %.</span>
            ) : (
              <span><strong>Pristrani ishod.</strong> Iako su obje skupine podjednako kreditno sposobne (60 %),
              model odobrava {modelApproveB} % skupini B i {modelApproveA} % skupini A. Među stvarno kreditno sposobnim ljudima
              {denialOfQualifiedB > 0 ? <> odbijamo otprilike <strong>{denialOfQualifiedB} %</strong> kvalificiranih iz skupine B</> : <></>}
              {denialOfQualifiedA > 0 ? <> i {denialOfQualifiedA} % iz skupine A</> : <></>} — jer model uči iz povijesne diskriminacije, a ne iz stvarnog rizika.</span>
            )}
          </div>

          <div className="qrow">
            <strong>Promisli</strong>
            <p>
              Ako uklonimo „pripadnost skupini&#8221; iz modela, hoće li problem nestati? Kratko: ne uvijek.
              Model može tu informaciju rekonstruirati iz <em>zamjenskih signala</em> poput poštanskog broja, imena ili vrste posla.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   3) PARADOKS TOČNOSTI — neuravnotežene klase
   ══════════════════════════════════════════════════════════════════════════ */

function AccuracyParadoxDemo() {
  // Populacija je uvijek 1000.
  const N = 1000;
  const [fraudPct, setFraudPct] = useState(2); // 0.1 .. 50
  const [recallPct, setRecallPct] = useState(60);
  const [fprPct, setFprPct] = useState(5);

  const positives = Math.max(1, Math.round((fraudPct / 100) * N));
  const negatives = N - positives;
  const tp = Math.round(positives * (recallPct / 100));
  const fn = positives - tp;
  const fp = Math.round(negatives * (fprPct / 100));
  const tn = negatives - fp;

  const accuracy = ((tp + tn) / N) * 100;
  const precision = tp + fp > 0 ? (tp / (tp + fp)) * 100 : 0;
  const recall = positives > 0 ? (tp / positives) * 100 : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  // Osnovni model: uvijek predvidi negativnu klasu.
  const baselineAcc = (negatives / N) * 100;
  const baselineBeatsModel = baselineAcc > accuracy;

  return (
    <div>
      <div className="section-explainer">
        <p>
          „Naš model za otkrivanje prijevara ima 99 % točnosti.&#8221; Zvuči moćno — dok ne shvatiš da
          prijevara čini manje od 1 % svih transakcija. Model koji <em>uvijek</em> kaže „nije prijevara&#8221;
          ima istu točnost. Pomakni klizače i vidi kad „glupi&#8221; osnovni model pobjeđuje pametan model.
        </p>
        <aside className="aside">
          <strong>Neuravnotežene klase.</strong> Kad jedna klasa ima 99 % primjera, sama točnost postaje varljiva metrika.
          Treba gledati preciznost i odziv, te ih povezati s troškom propuštene prijevare i lažne uzbune.
        </aside>
      </div>

      <div className="bias-layout">
        <div className="bias-controls">
          <label>
            Stopa prijevare u populaciji
            <input type="range" min="1" max="500" step="1" value={fraudPct * 10}
              onChange={(e) => setFraudPct(+e.target.value / 10)} />
            <span className="readout">{fraudPct.toFixed(1)} %</span>
          </label>
          <label>
            Osjetljivost modela (odziv na prijevarama)
            <input type="range" min="0" max="100" value={recallPct} onChange={(e) => setRecallPct(+e.target.value)} />
            <span className="readout">{recallPct} %</span>
          </label>
          <label>
            Stopa lažnih uzbuna kod poštenih transakcija
            <input type="range" min="0" max="30" value={fprPct} onChange={(e) => setFprPct(+e.target.value)} />
            <span className="readout">{fprPct} %</span>
          </label>
          <div className="readout" style={{ color: "var(--muted)" }}>
            Uzorak: {N.toLocaleString("hr-HR")} transakcija ·
            stvarno prijevara: <span style={{ color: "var(--ink)" }}>{positives}</span> ·
            pošteno: <span style={{ color: "var(--ink)" }}>{negatives}</span>
          </div>
        </div>

        <div className="bias-stage">
          <div className="cm-grid" aria-label="Matrica zabune">
            <div className="corner"></div>
            <div className="col-head">Stvarno: prijevara</div>
            <div className="col-head">Stvarno: pošteno</div>
            <div className="row-head">Model: prijevara</div>
            <div className="cell tp"><div><span className="big">{tp}</span><span className="small">ispravno blokirano</span></div></div>
            <div className="cell fp"><div><span className="big">{fp}</span><span className="small">lažna uzbuna</span></div></div>
            <div className="row-head">Model: pošteno</div>
            <div className="cell fn"><div><span className="big">{fn}</span><span className="small">propuštena prijevara</span></div></div>
            <div className="cell tn"><div><span className="big">{tn}</span><span className="small">ispravno propušteno</span></div></div>
          </div>

          <div className="metrics-row">
            <div className="metric">
              <span className="label">Točnost</span>
              <span className="value">{accuracy.toFixed(1)} %</span>
            </div>
            <div className="metric">
              <span className="label">Preciznost</span>
              <span className="value">{precision.toFixed(1)} %</span>
            </div>
            <div className="metric">
              <span className="label">Odziv</span>
              <span className="value">{recall.toFixed(1)} %</span>
            </div>
            <div className="metric">
              <span className="label">F1</span>
              <span className="value">{f1.toFixed(1)} %</span>
            </div>
          </div>

          <div className={"callout " + (baselineBeatsModel ? "warn" : "")}>
            {baselineBeatsModel ? (
              <span><strong>Osnovni model pobjeđuje.</strong> Model „uvijek pošteno&#8221; ima točnost {baselineAcc.toFixed(1)} %, a tvoj model {accuracy.toFixed(1)} %.
              Točnost ovdje nije korisna metrika — model bez odziva propušta sve prijevare.</span>
            ) : (
              <span><strong>Model je bolji od osnovnog modela.</strong> „Uvijek pošteno&#8221; bi imao {baselineAcc.toFixed(1)} % točnosti, tvoj model {accuracy.toFixed(1)} %.
              Ali pogledaj preciznost i odziv odvojeno — koliko je model stvarno koristan?</span>
            )}
          </div>

          <div className="qrow">
            <strong>Promisli</strong>
            <p>
              U području prijevara, što je gore: propustiti jednu prijevaru ili lažno optužiti poštenog korisnika?
              A u medicini — propustiti tumor ili lažno reći da ga ima? Pomakni klizače dok ne nađeš ravnotežu za svaki scenarij.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   4) PETLJA POJAČAVANJA — prediktivno policijsko usmjeravanje
   ══════════════════════════════════════════════════════════════════════════ */

const ROWS = 4;
const COLS = 5;
const TRUE_CRIME = 5; // ista stvarna stopa svugdje

function emptyState() {
  // broj uhićenja po ćeliji
  return Array.from({ length: ROWS * COLS }, () => 0);
}

function PolicingLoopDemo() {
  const [arrests, setArrests] = useState(emptyState);
  const [round, setRound] = useState(0);
  const [patrolled, setPatrolled] = useState([2]); // start: one initial "tip"
  const [autoRunning, setAutoRunning] = useState(false);
  const rngRef = useRef(seededRng(42));

  // After each step, choose top-K cells by arrests so far as next-round patrols.
  // First step: patrol the initial seed (already set).
  const step = useCallback(() => {
    setArrests((prev) => {
      const next = prev.slice();
      patrolled.forEach((idx) => {
        // Detection: ~80% of true crimes when patrolled.
        const detected = Math.round(TRUE_CRIME * 0.8 + (rngRef.current() - 0.5) * 1.5);
        next[idx] += Math.max(0, detected);
      });
      // Non-patrolled cells: ~5% detection rate from ambient reports.
      for (let i = 0; i < next.length; i++) {
        if (!patrolled.includes(i)) {
          const ambient = rngRef.current() < 0.2 ? 1 : 0;
          next[i] += ambient;
        }
      }
      return next;
    });
    setRound((r) => r + 1);
  }, [patrolled]);

  // Choose next patrols based on arrests AFTER this step.
  useEffect(() => {
    if (round === 0) return;
    setPatrolled(() => {
      const ranked = arrests
        .map((v, i) => ({ v, i }))
        .sort((a, b) => b.v - a.v);
      return ranked.slice(0, 3).map((r) => r.i);
    });
  }, [round]); // eslint-disable-line

  // Automatsko pokretanje
  useEffect(() => {
    if (!autoRunning) return;
    if (round >= 8) { setAutoRunning(false); return; }
    const t = setTimeout(() => step(), 700);
    return () => clearTimeout(t);
  }, [autoRunning, round, step]);

  const reset = () => {
    setArrests(emptyState());
    setRound(0);
    setPatrolled([2]);
    setAutoRunning(false);
    rngRef.current = seededRng(42);
  };

  const totalArrests = arrests.reduce((a, b) => a + b, 0);
  const maxArrests = Math.max(...arrests, 1);
  const untouched = arrests.filter((v) => v === 0).length;
  const totalTrueCrime = ROWS * COLS * TRUE_CRIME * Math.max(1, round); // total true crime if we counted everywhere

  return (
    <div>
      <div className="section-explainer">
        <p>
          Zamisli {ROWS * COLS} kvartova u kojima se zapravo događa <em>jednako</em> kriminala — {TRUE_CRIME} djela po krugu, svugdje isto.
          Algoritam ne zna stvarnu stopu kriminala. Vidi samo broj uhićenja. Šalje patrole tamo gdje je prethodno bilo najviše uhićenja.
          Kada povučeš nekoliko krugova, vidjet ćeš kako se uhićenja koncentriraju iako stvarni kriminal stoji.
        </p>
        <aside className="aside">
          <strong>Povratna petlja.</strong> Model gleda <em>posljedice</em> svojih prošlih odluka i smatra ih dokazom.
          Ista logika vrijedi za preporuke sadržaja, kreditno odobravanje i algoritme za ljudske resurse — svi oni „nauče&#8221; iz vlastite povijesti.
        </aside>
      </div>

      <div className="bias-layout">
        <div className="bias-controls">
          <div className="readout"><strong>Krug:</strong> {round}</div>
          <div className="readout"><strong>Patrole u sljedećem krugu:</strong> {patrolled.length} kvarta</div>
          <div className="btn-row">
            <button className="btn" onClick={step} disabled={autoRunning}>Sljedeći krug →</button>
            <button className="btn ghost" onClick={() => setAutoRunning(true)} disabled={autoRunning}>Automatski (8 krugova)</button>
            <button className="btn ghost" onClick={reset}>Resetiraj</button>
          </div>
          <div className="readout" style={{ color: "var(--muted)" }}>
            Stvarni kriminal po kvartu: <span style={{ color: "var(--ink)" }}>{TRUE_CRIME}</span> djela po krugu (identično svugdje).
            Detekcija s patrolom: ~80 %. Bez patrole: ~10 %.
          </div>

          <div className="loop-stats">
            <div className="metric">
              <span className="label">Ukupno uhićenja</span>
              <span className="value">{totalArrests}</span>
            </div>
            <div className="metric">
              <span className="label">Najviše u jednom kvartu</span>
              <span className="value">{maxArrests}</span>
            </div>
            <div className="metric">
              <span className="label">Neposjećenih kvartova</span>
              <span className="value">{untouched}</span>
            </div>
          </div>
        </div>

        <div className="bias-stage">
          <div className="grid-map" role="grid" aria-label="Mapa kvartova">
            {arrests.map((v, i) => {
              const isPatrolled = patrolled.includes(i);
              const intensity = v / Math.max(1, maxArrests);
              const bg = `rgba(138, 58, 31, ${0.08 + 0.55 * intensity})`;
              return (
                <div
                  key={i}
                  className={"cell" + (isPatrolled ? " patrolled" : "")}
                  style={{ background: v > 0 ? bg : undefined }}
                  role="gridcell"
                  aria-label={`Kvart ${i + 1}: ${v} uhićenja${isPatrolled ? ", patrola aktivna" : ""}`}
                >
                  <span className="truth">stvarno: {TRUE_CRIME}</span>
                  <span className="arrests">{v}</span>
                  {isPatrolled && <span className="patrol">patrola</span>}
                </div>
              );
            })}
          </div>

          <div className={"callout " + (maxArrests >= TRUE_CRIME * 3 ? "warn" : "neutral")}>
            {round === 0 ? (
              <span><strong>Početak.</strong> Sjeme: jedan kvart je dobio dojavu i tamo se šalje prva patrola. Stvarni kriminal je posvuda identičan.</span>
            ) : maxArrests >= TRUE_CRIME * 3 ? (
              <span><strong>Petlja je u tijeku.</strong> Jedan kvart sada ima {maxArrests} uhićenja, drugi nula —
              iako je u stvarnosti svuda događa isti broj djela. Algoritam je „naučio&#8221; geografiju koja ne postoji.</span>
            ) : (
              <span><strong>Razlika počinje rasti.</strong> Kvartovi s patrolom prikupljaju više uhićenja, što sutra znači još više patrola.</span>
            )}
          </div>

          <div className="qrow">
            <strong>Promisli</strong>
            <p>
              Kako biste prekinuli petlju? (Nasumične patrole; mjerenje stvarnih događaja umjesto uhićenja; revizija zamjenskih varijabli;
              tjedna provjera razlike između očekivanog i stvarnog.) Gdje još u svakodnevici vidite ovu logiku?
              („Više klikamo politike — pa nam algoritam šalje još politike.&#8221;)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Util
   ────────────────────────────────────────────────────────────────────────── */
function seededRng(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/* ──────────────────────────────────────────────────────────────────────────
   Mount
   ────────────────────────────────────────────────────────────────────────── */
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
