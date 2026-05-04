/* eslint-disable */
const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ──────────────────────────────────────────────────────────────────────────
   Susret 03 — Genetski algoritmi, računalni vid (CNN) i GenAI
   Three live demos for in-class use.
   ────────────────────────────────────────────────────────────────────────── */

function App() {
  const [tab, setTab] = useState("ga");
  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="../">
          <span className="brand-mark" aria-hidden="true">D</span>
          <span>
            <span className="brand-name">Dragutin Oreški</span>
            <span className="brand-meta">UI Suputnik · Susret 03</span>
          </span>
        </a>
        <nav className="topbar-right">
          <a href="../">← Svi susreti</a>
          <a href="../susret-02/">← Susret 02</a>
        </nav>
      </header>

      <section className="hero">
        <div className="kicker"><span className="dot"></span>Susret 03 · Teorija II</div>
        <h1><em>Evolucija</em>, vid i jezik.</h1>
        <p className="hero-sub">
          Tri interaktivna primjera: kako genetski algoritam pronalazi najkraći put,
          kako konvolucija mijenja sliku, i kako jezični model bira sljedeću riječ —
          i kad pogriješi.
        </p>
      </section>

      <nav className="tabs" role="tablist">
        <button className={"tab" + (tab === "ga" ? " is-active" : "")} onClick={() => setTab("ga")}>1 · Genetski algoritam</button>
        <button className={"tab" + (tab === "cv" ? " is-active" : "")} onClick={() => setTab("cv")}>2 · Konvolucije</button>
        <button className={"tab" + (tab === "llm" ? " is-active" : "")} onClick={() => setTab("llm")}>3 · Sljedeći token</button>
      </nav>

      {tab === "ga" && <GADemo />}
      {tab === "cv" && <ConvDemo />}
      {tab === "llm" && <LLMDemo />}

      <footer className="colophon">
        <span>UI Suputnik · materijali za nastavu</span>
        <span>Anonimna analitika · bez snimanja sesije</span>
        <span><a href="../">Početna</a></span>
      </footer>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   1) GENETIC ALGORITHM — Travelling Salesman
   ══════════════════════════════════════════════════════════════════════════ */

function seededRng(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function makeCities(n, seed) {
  const rng = seededRng(seed);
  const cities = [];
  for (let i = 0; i < n; i++) {
    cities.push({ x: 60 + rng() * 720, y: 40 + rng() * 380 });
  }
  return cities;
}

function tourLength(cities, tour) {
  let d = 0;
  for (let i = 0; i < tour.length; i++) {
    const a = cities[tour[i]];
    const b = cities[tour[(i + 1) % tour.length]];
    d += Math.hypot(a.x - b.x, a.y - b.y);
  }
  return d;
}

function shuffled(n, rng) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function tournamentSelect(pop, fits, k, rng) {
  let best = -1;
  for (let i = 0; i < k; i++) {
    const idx = Math.floor(rng() * pop.length);
    if (best === -1 || fits[idx] > fits[best]) best = idx;
  }
  return pop[best];
}

// Ordered crossover (OX1)
function orderedCrossover(a, b, rng) {
  const n = a.length;
  const i = Math.floor(rng() * n);
  const j = i + Math.floor(rng() * (n - i));
  const child = new Array(n).fill(-1);
  for (let k = i; k <= j; k++) child[k] = a[k];
  let pos = (j + 1) % n;
  for (let k = 0; k < n; k++) {
    const idx = (j + 1 + k) % n;
    const gene = b[idx];
    if (!child.includes(gene)) {
      child[pos] = gene;
      pos = (pos + 1) % n;
    }
  }
  return child;
}

function swapMutation(tour, rate, rng) {
  const out = tour.slice();
  for (let i = 0; i < out.length; i++) {
    if (rng() < rate) {
      const j = Math.floor(rng() * out.length);
      [out[i], out[j]] = [out[j], out[i]];
    }
  }
  return out;
}

function nearestNeighbour(cities) {
  const n = cities.length;
  const visited = new Array(n).fill(false);
  const tour = [0];
  visited[0] = true;
  for (let step = 1; step < n; step++) {
    const cur = cities[tour[tour.length - 1]];
    let best = -1, bestD = Infinity;
    for (let i = 0; i < n; i++) {
      if (visited[i]) continue;
      const d = Math.hypot(cur.x - cities[i].x, cur.y - cities[i].y);
      if (d < bestD) { bestD = d; best = i; }
    }
    visited[best] = true;
    tour.push(best);
  }
  return tour;
}

function GADemo() {
  const [numCities, setNumCities] = useState(25);
  const [popSize, setPopSize] = useState(80);
  const [mutRate, setMutRate] = useState(0.02);
  const [seed, setSeed] = useState(7);
  const [running, setRunning] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [bestLen, setBestLen] = useState(0);
  const [avgLen, setAvgLen] = useState(0);
  const [bestTour, setBestTour] = useState(null);
  const [history, setHistory] = useState([]);
  const [greedyLen, setGreedyLen] = useState(0);
  const [selectedRank, setSelectedRank] = useState(1); // 1 = najbolja, popSize = najgora

  const cities = useMemo(() => makeCities(numCities, seed), [numCities, seed]);
  const popRef = useRef(null);
  const rngRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const rafRef = useRef(null);

  // Reset whenever cities change
  useEffect(() => {
    rngRef.current = seededRng(seed * 31 + 1);
    const rng = rngRef.current;
    const pop = [];
    for (let i = 0; i < popSize; i++) pop.push(shuffled(numCities, rng));
    popRef.current = pop;
    const fits = pop.map((t) => 1 / tourLength(cities, t));
    let bi = 0;
    for (let i = 1; i < pop.length; i++) if (fits[i] > fits[bi]) bi = i;
    setGeneration(0);
    setBestTour(pop[bi]);
    setBestLen(tourLength(cities, pop[bi]));
    setAvgLen(pop.reduce((s, t) => s + tourLength(cities, t), 0) / pop.length);
    setHistory([]);
    const greedy = nearestNeighbour(cities);
    setGreedyLen(tourLength(cities, greedy));
  }, [cities, popSize]);

  // GA step
  const stepOnce = useCallback(() => {
    const rng = rngRef.current;
    const pop = popRef.current;
    const fits = pop.map((t) => 1 / tourLength(cities, t));
    // Elitism: keep best 2
    const sorted = pop.map((_, i) => i).sort((a, b) => fits[b] - fits[a]);
    const next = [pop[sorted[0]], pop[sorted[1]]];
    while (next.length < pop.length) {
      const a = tournamentSelect(pop, fits, 3, rng);
      const b = tournamentSelect(pop, fits, 3, rng);
      let child = orderedCrossover(a, b, rng);
      child = swapMutation(child, mutRate, rng);
      next.push(child);
    }
    popRef.current = next;
    const newFits = next.map((t) => 1 / tourLength(cities, t));
    let bi = 0;
    for (let i = 1; i < next.length; i++) if (newFits[i] > newFits[bi]) bi = i;
    const bl = tourLength(cities, next[bi]);
    const al = next.reduce((s, t) => s + tourLength(cities, t), 0) / next.length;
    setBestTour(next[bi]);
    setBestLen(bl);
    setAvgLen(al);
    setGeneration((g) => g + 1);
    setHistory((h) => [...h.slice(-499), { best: bl, avg: al }]);
  }, [cities, mutRate]);

  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      stepOnce();
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelled = true; cancelAnimationFrame(rafRef.current); };
  }, [running, stepOnce]);

  // Compute the selected individual (by rank) from current population
  const selectedInfo = useMemo(() => {
    if (!popRef.current || popRef.current.length === 0) return null;
    const sorted = popRef.current
      .map((t) => ({ tour: t, len: tourLength(cities, t) }))
      .sort((a, b) => a.len - b.len);
    const rankIdx = Math.min(Math.max(0, selectedRank - 1), sorted.length - 1);
    return { ...sorted[rankIdx], rank: rankIdx + 1, total: sorted.length };
  // depend on generation/cities so it recomputes after each GA step
  }, [cities, generation, selectedRank, bestTour]);

  // Map canvas
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    // background grid
    ctx.fillStyle = "#f3ede1";
    ctx.fillRect(0, 0, c.width, c.height);
    // draw 5 sample tours faintly (population samples)
    if (popRef.current) {
      ctx.strokeStyle = "rgba(111, 103, 84, 0.18)";
      ctx.lineWidth = 1;
      const sample = Math.min(8, popRef.current.length);
      for (let s = 0; s < sample; s++) {
        const t = popRef.current[Math.floor(s * popRef.current.length / sample)];
        ctx.beginPath();
        for (let i = 0; i < t.length; i++) {
          const cur = cities[t[i]];
          if (i === 0) ctx.moveTo(cur.x, cur.y);
          else ctx.lineTo(cur.x, cur.y);
        }
        ctx.lineTo(cities[t[0]].x, cities[t[0]].y);
        ctx.stroke();
      }
    }
    // selected individual (gray dashed) — drawn behind best so best stays prominent
    if (selectedInfo && selectedInfo.rank > 1) {
      const t = selectedInfo.tour;
      ctx.strokeStyle = "rgba(58, 53, 44, 0.78)";
      ctx.lineWidth = 2.2;
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      for (let i = 0; i < t.length; i++) {
        const cur = cities[t[i]];
        if (i === 0) ctx.moveTo(cur.x, cur.y);
        else ctx.lineTo(cur.x, cur.y);
      }
      ctx.lineTo(cities[t[0]].x, cities[t[0]].y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // best tour
    if (bestTour) {
      ctx.strokeStyle = "#6b4f1d";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      for (let i = 0; i < bestTour.length; i++) {
        const cur = cities[bestTour[i]];
        if (i === 0) ctx.moveTo(cur.x, cur.y);
        else ctx.lineTo(cur.x, cur.y);
      }
      ctx.lineTo(cities[bestTour[0]].x, cities[bestTour[0]].y);
      ctx.stroke();
    }
    // cities
    for (const city of cities) {
      ctx.fillStyle = "#1a1814";
      ctx.beginPath();
      ctx.arc(city.x, city.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    // small legend top-left
    ctx.font = "11px JetBrains Mono, monospace";
    ctx.fillStyle = "#6b4f1d";
    ctx.fillText("─── najbolja jedinka", 12, 18);
    if (selectedInfo && selectedInfo.rank > 1) {
      ctx.fillStyle = "#3a352c";
      ctx.fillText("- - - odabrana (rang " + selectedInfo.rank + ")", 12, 34);
    }
  }, [cities, bestTour, generation, selectedInfo]);

  // Chart canvas
  useEffect(() => {
    const c = chartRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#f3ede1";
    ctx.fillRect(0, 0, c.width, c.height);
    if (history.length < 2) {
      ctx.fillStyle = "#6f6754";
      ctx.font = "12px JetBrains Mono, monospace";
      ctx.fillText("Pokreni GA da vidiš krivulju.", 14, 22);
      return;
    }
    const pad = { l: 40, r: 12, t: 12, b: 24 };
    const w = c.width, h = c.height;
    const innerW = w - pad.l - pad.r, innerH = h - pad.t - pad.b;
    const allVals = history.flatMap((p) => [p.best, p.avg, greedyLen]);
    const lo = Math.min(...allVals) * 0.97;
    const hi = Math.max(...allVals) * 1.03;
    const xAt = (i) => pad.l + (i / (history.length - 1)) * innerW;
    const yAt = (v) => pad.t + (1 - (v - lo) / (hi - lo)) * innerH;
    // axes
    ctx.strokeStyle = "#cfc4ac";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, h - pad.b); ctx.lineTo(w - pad.r, h - pad.b);
    ctx.stroke();
    // greedy reference
    if (greedyLen > 0 && greedyLen < hi && greedyLen > lo) {
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "#8a3a1f";
      ctx.beginPath();
      ctx.moveTo(pad.l, yAt(greedyLen));
      ctx.lineTo(w - pad.r, yAt(greedyLen));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#8a3a1f";
      ctx.font = "10px JetBrains Mono, monospace";
      ctx.fillText("pohlepna", w - pad.r - 60, yAt(greedyLen) - 4);
    }
    // avg
    ctx.strokeStyle = "rgba(111, 103, 84, 0.6)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    history.forEach((p, i) => {
      const x = xAt(i), y = yAt(p.avg);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    // best
    ctx.strokeStyle = "#2a5d57";
    ctx.lineWidth = 2;
    ctx.beginPath();
    history.forEach((p, i) => {
      const x = xAt(i), y = yAt(p.best);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    // labels
    ctx.fillStyle = "#6f6754";
    ctx.font = "10px JetBrains Mono, monospace";
    ctx.fillText("duljina rute (px)", 4, 16);
    ctx.fillText("generacija →", w - pad.r - 70, h - 6);
  }, [history, greedyLen]);

  return (
    <div>
      <div className="section-intro">
        <p>
          Problem trgovačkog putnika: pronađi najkraću rutu kroz <em>N</em> gradova. GA radi na <em>populaciji</em> ruta,
          ocjenjuje ih funkcijom kondicije (<code>1 / duljina</code>), kombinira najbolje (<em>križanje</em>) i povremeno
          mijenja gen (<em>mutacija</em>). Crvena točkasta linija je rezultat <em>pohlepne</em> heuristike — vidiš kako GA
          s vremenom padne ispod nje.
        </p>
        <div className="aside">
          <strong>Što gledati:</strong> tanke sive linije su ostatak populacije; debela smeđa je trenutno najbolja ruta.
          Donji graf — zelena krivulja je najbolji pojedinac, siva je prosjek populacije. Razlika između njih je
          <em> raznolikost</em>.
        </div>
      </div>

      <div className="panel">
        <div className="canvas-wrap smooth">
          <canvas ref={canvasRef} width={840} height={460}></canvas>
        </div>
        <div className="controls">
          <div className="control">
            <div className="control-label"><span>Broj gradova</span><span className="val">{numCities}</span></div>
            <input type="range" min="6" max="50" value={numCities} onChange={(e) => { setRunning(false); setNumCities(+e.target.value); }} />
          </div>
          <div className="control">
            <div className="control-label"><span>Veličina populacije</span><span className="val">{popSize}</span></div>
            <input type="range" min="20" max="200" step="10" value={popSize} onChange={(e) => { setRunning(false); setPopSize(+e.target.value); }} />
          </div>
          <div className="control">
            <div className="control-label"><span>Stopa mutacije</span><span className="val">{(mutRate * 100).toFixed(1)}%</span></div>
            <input type="range" min="0" max="0.15" step="0.005" value={mutRate} onChange={(e) => setMutRate(+e.target.value)} />
          </div>
          <div className="control">
            <div className="control-label"><span>Sjeme (seed)</span><span className="val">{seed}</span></div>
            <input type="range" min="1" max="50" value={seed} onChange={(e) => { setRunning(false); setSeed(+e.target.value); }} />
          </div>
          <div className="control">
            <div className="control-label"><span>Pregledaj jedinku · rang</span><span className="val">{selectedRank}<span style={{ color: "var(--muted)" }}> / {popSize}</span></span></div>
            <input type="range" min="1" max={popSize} value={Math.min(selectedRank, popSize)} onChange={(e) => setSelectedRank(+e.target.value)} />
          </div>
        </div>
        <div className="actions">
          <button className="btn primary" onClick={() => setRunning((r) => !r)}>
            {running ? "Pauziraj" : "Pokreni"}
          </button>
          <button className="btn" onClick={stepOnce} disabled={running}>Korak (jedna generacija)</button>
          <button className="btn" onClick={() => { setRunning(false); setSeed((s) => s + 1); }}>Resetiraj s novim gradovima</button>
          <button className="btn warn" onClick={() => {
            setRunning(false);
            const greedy = nearestNeighbour(cities);
            setBestTour(greedy);
            setBestLen(tourLength(cities, greedy));
          }}>Pokaži pohlepnu rutu</button>
        </div>
        <div className="metrics">
          <div className="metric"><span className="lbl">Generacija</span><span className="num">{generation}</span></div>
          <div className="metric"><span className="lbl">Najbolja duljina</span><span className="num">{bestLen.toFixed(0)}<span className="unit">px</span></span></div>
          <div className="metric"><span className="lbl">Prosjek populacije</span><span className="num">{avgLen.toFixed(0)}<span className="unit">px</span></span></div>
          <div className="metric"><span className="lbl">Pohlepna ruta</span><span className="num">{greedyLen.toFixed(0)}<span className="unit">px</span></span></div>
          <div className="metric"><span className="lbl">GA / pohlepna</span><span className="num">{greedyLen ? ((bestLen / greedyLen) * 100).toFixed(0) : 0}<span className="unit">%</span></span></div>
        </div>

        {selectedInfo && (
          <div style={{
            marginTop: 14, padding: "14px 16px",
            background: selectedInfo.rank === 1 ? "var(--accent-wash)" : "var(--paper-2)",
            border: "1px solid " + (selectedInfo.rank === 1 ? "var(--accent-soft)" : "var(--line-2)"),
            borderRadius: 10,
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(140px, auto)",
            gap: 18, alignItems: "center"
          }}>
            <div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                Odabrana jedinka {selectedInfo.rank === 1 ? "· najbolja" : selectedInfo.rank === selectedInfo.total ? "· najgora" : ""}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 22px", fontFamily: "var(--mono)", fontSize: 12.5 }}>
                <span><span style={{ color: "var(--muted)" }}>rang: </span><strong>{selectedInfo.rank}</strong> / {selectedInfo.total}</span>
                <span><span style={{ color: "var(--muted)" }}>duljina: </span><strong>{selectedInfo.len.toFixed(0)} px</strong></span>
                <span><span style={{ color: "var(--muted)" }}>kondicija (1000 / duljina): </span><strong>{(1000 / selectedInfo.len).toFixed(2)}</strong></span>
                <span><span style={{ color: "var(--muted)" }}>od najbolje: </span><strong>+{((selectedInfo.len / bestLen - 1) * 100).toFixed(1)}%</strong></span>
              </div>
              <div style={{ marginTop: 10, fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--ink-2)", wordBreak: "break-all" }}>
                redoslijed: [{selectedInfo.tour.join(", ")}]
              </div>
            </div>
            <div style={{ width: 180 }}>
              <MiniTour cities={cities} tour={selectedInfo.tour} w={200} h={130}
                color={selectedInfo.rank === 1 ? "#6b4f1d" : "#3a352c"} />
            </div>
          </div>
        )}
        <div className="canvas-wrap smooth" style={{ marginTop: 18 }}>
          <canvas ref={chartRef} width={840} height={180}></canvas>
        </div>

        <div className="callout">
          <strong>Što je pohlepni pristup?</strong> Najjednostavnija heuristika: kreni od bilo kojeg grada i u svakom koraku idi
          u <em>najbližeg</em> neposjećenog. Brz je i lako se programira, ali ne gleda unaprijed pa često zaglavi u <em>lokalnom
          optimumu</em> — ruta koja se čini dobra lokalno, ali globalno postoji puno bolja koju ovaj postupak nikad ne pronađe.
          Kao kad bi planirao odmor i u svakom trenutku išao u najbliže nepoznato mjesto, bez plana cijelog puta.
          <br /><br />
          <strong>Zašto GA prolazi bolje:</strong> drži <em>cijelu populaciju</em> različitih ruta odjednom, kombinira ih i mutira
          — pa preskače brežuljke krajolika rješenja. Mutacija 0% → populacija brzo zapne kao i pohlepni; previsoka (8–10%) → algoritam
          postaje gotovo nasumičan. Optimalna ravnoteža je obično 1–3%.
        </div>
      </div>

      <GreedyExplainer cities={cities} />
      <PopulationGallery cities={cities} population={popRef.current} />
      <GAMechanicsDemo />
    </div>
  );
}

/* ── GreedyExplainer ────────────────────────────────────────────────────────
   Step-by-step animation of the greedy / nearest-neighbour heuristic.
   Lets the lecturer click "Sljedeći korak" and see one edge added at a time.
   ──────────────────────────────────────────────────────────────────────── */
function GreedyExplainer({ cities }) {
  const canvasRef = useRef(null);
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(false);

  // Reset when cities change
  useEffect(() => { setStep(0); setAuto(false); }, [cities]);

  // Build the full greedy sequence once
  const sequence = useMemo(() => {
    if (!cities || cities.length === 0) return [];
    const n = cities.length;
    const visited = new Array(n).fill(false);
    const seq = [0]; visited[0] = true;
    for (let s = 1; s < n; s++) {
      const cur = cities[seq[seq.length - 1]];
      let best = -1, bestD = Infinity;
      for (let i = 0; i < n; i++) {
        if (visited[i]) continue;
        const d = Math.hypot(cur.x - cities[i].x, cur.y - cities[i].y);
        if (d < bestD) { bestD = d; best = i; }
      }
      visited[best] = true; seq.push(best);
    }
    return seq;
  }, [cities]);

  // Auto-play
  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(() => {
      if (step < sequence.length) setStep(step + 1);
      else setAuto(false);
    }, 350);
    return () => clearTimeout(t);
  }, [auto, step, sequence.length]);

  // Draw
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#f3ede1";
    ctx.fillRect(0, 0, c.width, c.height);
    if (sequence.length === 0) return;

    // unvisited cities — light dots
    const visited = new Set(sequence.slice(0, step + 1));
    for (let i = 0; i < cities.length; i++) {
      ctx.fillStyle = visited.has(i) ? "#1a1814" : "#a59c84";
      ctx.beginPath(); ctx.arc(cities[i].x, cities[i].y, 4, 0, Math.PI * 2); ctx.fill();
    }
    // already-built path
    if (step > 0) {
      ctx.strokeStyle = "#8a3a1f";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(cities[sequence[0]].x, cities[sequence[0]].y);
      for (let i = 1; i <= Math.min(step, sequence.length - 1); i++) {
        ctx.lineTo(cities[sequence[i]].x, cities[sequence[i]].y);
      }
      ctx.stroke();
      // close the loop only when complete
      if (step >= sequence.length) {
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(cities[sequence[sequence.length - 1]].x, cities[sequence[sequence.length - 1]].y);
        ctx.lineTo(cities[sequence[0]].x, cities[sequence[0]].y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    // current city — circled, plus dotted lines to all unvisited (showing "what greedy sees")
    if (step < sequence.length) {
      const cur = cities[sequence[Math.min(step, sequence.length - 1)]];
      ctx.strokeStyle = "rgba(138, 58, 31, 0.25)";
      ctx.lineWidth = 1;
      for (let i = 0; i < cities.length; i++) {
        if (visited.has(i)) continue;
        ctx.beginPath();
        ctx.moveTo(cur.x, cur.y);
        ctx.lineTo(cities[i].x, cities[i].y);
        ctx.stroke();
      }
      // highlight nearest unvisited (the choice greedy will make)
      let best = -1, bestD = Infinity;
      for (let i = 0; i < cities.length; i++) {
        if (visited.has(i)) continue;
        const d = Math.hypot(cur.x - cities[i].x, cur.y - cities[i].y);
        if (d < bestD) { bestD = d; best = i; }
      }
      if (best !== -1) {
        ctx.strokeStyle = "#2a5d57";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cur.x, cur.y);
        ctx.lineTo(cities[best].x, cities[best].y);
        ctx.stroke();
        ctx.fillStyle = "#2a5d57";
        ctx.beginPath(); ctx.arc(cities[best].x, cities[best].y, 6, 0, Math.PI * 2); ctx.fill();
      }
      // current city ring
      ctx.strokeStyle = "#8a3a1f";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cur.x, cur.y, 9, 0, Math.PI * 2); ctx.stroke();
    }
  }, [cities, sequence, step]);

  const explain = step === 0
    ? "Pohlepni postupak kreće od prvog grada (zaokružen). U sljedećem koraku će izabrati najbližeg neposjećenog (zelena točka)."
    : step >= sequence.length
      ? "Gotovo. Pohlepni postupak posjetio je sve gradove, uvijek bireći najbližeg susjeda. Iscrtkana linija zatvara petlju natrag do polaznog grada."
      : "Trenutno smo u gradu označenom narančasto. Sive linije pokazuju sve neposjećene susjede koje 'vidimo'. Zelena točka je najbliži — pohlepni će ići baš tamo. Bez razmišljanja unaprijed.";

  return (
    <div className="panel">
      <h3 style={{ marginBottom: 6 }}>Pohlepni postupak — korak po korak</h3>
      <p style={{ fontSize: 13.5, color: "var(--ink-2)", marginBottom: 12, maxWidth: "70ch" }}>
        Da vidimo zašto pohlepni postupak često zapne u lokalnom optimumu, evo ga animirano. U svakom koraku gleda samo
        susjede iz <em>trenutnog</em> grada i bira najbližeg. Nikad se ne vraća, nikad ne razmišlja "možda bi bilo bolje
        ostaviti ovaj grad za kasnije". <strong>Naranča</strong> = trenutni grad, <strong>zeleno</strong> = idući izbor,
        <strong> sive linije</strong> = sve opcije koje pohlepni "vidi", <strong>tamno smeđa</strong> = put koji je već prešao.
      </p>
      <div className="canvas-wrap smooth">
        <canvas ref={canvasRef} width={840} height={460}></canvas>
      </div>
      <div className="actions">
        <button className="btn primary" onClick={() => setAuto((a) => !a)} disabled={step >= sequence.length}>
          {auto ? "Pauziraj" : "Pokreni animaciju"}
        </button>
        <button className="btn" onClick={() => { setAuto(false); setStep((s) => Math.min(s + 1, sequence.length)); }} disabled={step >= sequence.length}>
          Sljedeći korak
        </button>
        <button className="btn" onClick={() => { setAuto(false); setStep(0); }}>Resetiraj</button>
      </div>
      <div className="metrics">
        <div className="metric"><span className="lbl">Korak</span><span className="num">{Math.min(step, sequence.length)}<span className="unit">/ {sequence.length}</span></span></div>
        <div className="metric"><span className="lbl">Posjećenih gradova</span><span className="num">{Math.min(step + 1, sequence.length)}</span></div>
      </div>
      <div className="callout">{explain}</div>
    </div>
  );
}

/* ── PopulationGallery ──────────────────────────────────────────────────────
   Shows top 6 individuals from the current population as small thumbnails,
   so students can see what "jedna jedinka populacije" actually looks like.
   ──────────────────────────────────────────────────────────────────────── */
function MiniTour({ cities, tour, w = 180, h = 120, color = "#6b4f1d" }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#fbf7ec";
    ctx.fillRect(0, 0, w, h);
    if (!cities || !tour) return;
    // compute bounds
    const xs = cities.map(c => c.x), ys = cities.map(c => c.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const pad = 10;
    const sx = (x) => pad + ((x - minX) / (maxX - minX || 1)) * (w - 2 * pad);
    const sy = (y) => pad + ((y - minY) / (maxY - minY || 1)) * (h - 2 * pad);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let i = 0; i < tour.length; i++) {
      const c0 = cities[tour[i]];
      if (i === 0) ctx.moveTo(sx(c0.x), sy(c0.y));
      else ctx.lineTo(sx(c0.x), sy(c0.y));
    }
    ctx.lineTo(sx(cities[tour[0]].x), sy(cities[tour[0]].y));
    ctx.stroke();
    ctx.fillStyle = "#1a1814";
    for (const i of tour) {
      ctx.beginPath(); ctx.arc(sx(cities[i].x), sy(cities[i].y), 1.6, 0, Math.PI * 2); ctx.fill();
    }
  }, [cities, tour, w, h, color]);
  return <canvas ref={ref} width={w} height={h} style={{ width: "100%", height: "auto" }} />;
}

function PopulationGallery({ cities, population }) {
  if (!population || population.length === 0) return null;
  const sorted = [...population]
    .map((t) => ({ tour: t, len: tourLength(cities, t) }))
    .sort((a, b) => a.len - b.len);
  const top = sorted.slice(0, 6);

  return (
    <div className="panel">
      <h3 style={{ marginBottom: 6 }}>Što je jedna <em style={{ fontStyle: "italic", color: "var(--accent)" }}>jedinka</em> populacije?</h3>
      <p style={{ fontSize: 13.5, color: "var(--ink-2)", marginBottom: 14, maxWidth: "70ch" }}>
        Jedinka (kromosom) u našem GA-u je <strong>jedan kompletan obilazak svih gradova</strong> — jedna permutacija.
        Populacija je skup tih jedinki. U trenutku snimanja ovo su 6 najboljih jedinki iz trenutne populacije,
        sortirane po duljini rute (kraće = bolje). Sve su valjana rješenja, samo su neke kraće od drugih.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        {top.map((item, i) => (
          <div key={i} style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 10, padding: 10 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
              Jedinka #{i + 1}{i === 0 ? " · najbolja" : ""}
            </div>
            <MiniTour cities={cities} tour={item.tour} w={200} h={130} color={i === 0 ? "#2a5d57" : "#6b4f1d"} />
            <div style={{ marginTop: 6, fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--ink-2)" }}>
              duljina: <strong>{item.len.toFixed(0)} px</strong> · kondicija: {(1000 / item.len).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── GAMechanicsDemo ────────────────────────────────────────────────────────
   Toy 6-city A-F problem — separate from the main TSP solver — that
   visualises one round of GA: Selekcija → Križanje → Mutacija → Nova jedinka.
   ──────────────────────────────────────────────────────────────────────── */
const TOY_CITIES = [
  { x: 80, y: 80, label: "A" },
  { x: 280, y: 60, label: "B" },
  { x: 460, y: 110, label: "C" },
  { x: 480, y: 280, label: "D" },
  { x: 260, y: 320, label: "E" },
  { x: 90, y: 250, label: "F" },
];

function toyLen(tour) {
  let d = 0;
  for (let i = 0; i < tour.length; i++) {
    const a = TOY_CITIES[tour[i]], b = TOY_CITIES[tour[(i + 1) % tour.length]];
    d += Math.hypot(a.x - b.x, a.y - b.y);
  }
  return d;
}

const TOY_POP_INIT = [
  [0, 1, 2, 3, 4, 5], // A B C D E F
  [0, 2, 4, 1, 3, 5], // A C E B D F
  [0, 5, 4, 3, 2, 1], // A F E D C B
  [3, 1, 5, 0, 4, 2], // D B F A E C
];

function ToyMap({ tour, slice = null, swap = null, highlight = null, color = "#6b4f1d", w = 280, h = 200 }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#fbf7ec";
    ctx.fillRect(0, 0, w, h);
    // scale toy cities to fit
    const sx = (x) => 12 + (x / 560) * (w - 24);
    const sy = (y) => 12 + (y / 380) * (h - 24);
    // Only draw the path if every gene is a valid city index.
    // During crossover the child temporarily has -1 placeholders — in that
    // case we only want to draw the dots, not the line.
    const isComplete = Array.isArray(tour) && tour.every((idx) => idx >= 0 && idx < TOY_CITIES.length);
    if (isComplete) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let i = 0; i < tour.length; i++) {
        const c0 = TOY_CITIES[tour[i]];
        if (i === 0) ctx.moveTo(sx(c0.x), sy(c0.y));
        else ctx.lineTo(sx(c0.x), sy(c0.y));
      }
      ctx.lineTo(sx(TOY_CITIES[tour[0]].x), sy(TOY_CITIES[tour[0]].y));
      ctx.stroke();
    }
    // city dots + labels
    for (let i = 0; i < TOY_CITIES.length; i++) {
      const t = TOY_CITIES[i];
      const isHl = highlight && highlight.includes(i);
      ctx.fillStyle = isHl ? "#8a3a1f" : "#1a1814";
      ctx.beginPath(); ctx.arc(sx(t.x), sy(t.y), isHl ? 6 : 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#1a1814";
      ctx.font = "bold 12px Source Serif 4, serif";
      ctx.fillText(t.label, sx(t.x) + 8, sy(t.y) - 6);
    }
  }, [tour, slice, swap, highlight, color, w, h]);
  return <canvas ref={ref} width={w} height={h} style={{ width: "100%", height: "auto" }} />;
}

function TourStrip({ tour, slice = null, swap = null, sourceMap = null }) {
  // tour: array of city indices; slice: [i,j] inclusive; swap: [a,b]
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {tour.map((idx, i) => {
        const inSlice = slice && i >= slice[0] && i <= slice[1];
        const isSwap = swap && (i === swap[0] || i === swap[1]);
        const fromB = sourceMap && sourceMap[i] === "B";
        let bg = "var(--paper)";
        let bd = "var(--line)";
        let col = "var(--ink)";
        if (isSwap) { bg = "#ecd6c8"; bd = "#8a3a1f"; col = "#8a3a1f"; }
        else if (inSlice) { bg = "var(--accent-wash)"; bd = "var(--accent)"; }
        else if (fromB) { bg = "var(--good-wash)"; bd = "var(--good)"; col = "var(--good)"; }
        const label = idx >= 0 ? TOY_CITIES[idx].label : "?";
        return (
          <div key={i} style={{
            width: 32, height: 36, display: "grid", placeItems: "center",
            background: bg, border: "1.5px solid " + bd, borderRadius: 6,
            fontFamily: "var(--serif)", fontSize: 18, fontWeight: 500, color: col,
          }}>{label}</div>
        );
      })}
    </div>
  );
}

function GAMechanicsDemo() {
  const [pop, setPop] = useState(TOY_POP_INIT);
  const [step, setStep] = useState(0);
  // step 0: pokaži populaciju; 1: turnir za roditelja A; 2: turnir za roditelja B;
  // 3: križanje (slice); 4: križanje (popunjavanje iz B); 5: mutacija; 6: nova jedinka u populaciju.

  const [tournA, setTournA] = useState(null);   // {indices:[], winner: idx}
  const [tournB, setTournB] = useState(null);
  const [parentA, setParentA] = useState(null); // tour
  const [parentB, setParentB] = useState(null); // tour
  const [slice, setSlice] = useState(null);     // [i,j]
  const [child, setChild] = useState(null);     // tour with -1 for empty
  const [sourceMap, setSourceMap] = useState(null); // ["A","A","B",...]
  const [mutated, setMutated] = useState(null); // final tour after mutation
  const [swap, setSwap] = useState(null);       // [i,j]
  const [seedRef] = useState(() => seededRng(101));

  const reset = () => {
    setStep(0);
    setTournA(null); setTournB(null);
    setParentA(null); setParentB(null);
    setSlice(null); setChild(null); setSourceMap(null);
    setMutated(null); setSwap(null);
  };

  const advance = () => {
    const rng = seedRef;
    if (step === 0) {
      // Tournament for parent A — pick 3 random, best wins
      const picks = [];
      while (picks.length < 3) {
        const x = Math.floor(rng() * pop.length);
        if (!picks.includes(x)) picks.push(x);
      }
      let winner = picks[0];
      for (const p of picks) if (toyLen(pop[p]) < toyLen(pop[winner])) winner = p;
      setTournA({ picks, winner });
      setParentA(pop[winner]);
      setStep(1);
    } else if (step === 1) {
      const picks = [];
      while (picks.length < 3) {
        const x = Math.floor(rng() * pop.length);
        if (!picks.includes(x) && x !== tournA.winner) picks.push(x);
      }
      let winner = picks[0];
      for (const p of picks) if (toyLen(pop[p]) < toyLen(pop[winner])) winner = p;
      setTournB({ picks, winner });
      setParentB(pop[winner]);
      setStep(2);
    } else if (step === 2) {
      // Croosover: pick a slice
      const i = 1 + Math.floor(rng() * 2); // start 1 or 2
      const j = i + 1 + Math.floor(rng() * 2); // length 2-3
      const jj = Math.min(j, parentA.length - 2);
      setSlice([i, jj]);
      // Child: copy slice from A, leave rest empty (-1)
      const c = new Array(parentA.length).fill(-1);
      const sm = new Array(parentA.length).fill(null);
      for (let k = i; k <= jj; k++) { c[k] = parentA[k]; sm[k] = "A"; }
      setChild(c);
      setSourceMap(sm);
      setStep(3);
    } else if (step === 3) {
      // Fill remaining from B in order
      const c = child.slice();
      const sm = sourceMap.slice();
      let pos = (slice[1] + 1) % c.length;
      for (let k = 0; k < parentB.length; k++) {
        const idx = (slice[1] + 1 + k) % parentB.length;
        const gene = parentB[idx];
        if (!c.includes(gene)) {
          c[pos] = gene;
          sm[pos] = "B";
          pos = (pos + 1) % c.length;
        }
      }
      setChild(c);
      setSourceMap(sm);
      setStep(4);
    } else if (step === 4) {
      // Mutation — swap two random positions
      const i = Math.floor(rng() * child.length);
      let j = Math.floor(rng() * child.length);
      while (j === i) j = Math.floor(rng() * child.length);
      const m = child.slice();
      [m[i], m[j]] = [m[j], m[i]];
      setSwap([i, j]);
      setMutated(m);
      setStep(5);
    } else if (step === 5) {
      // Insert into population (replace worst)
      const idxs = pop.map((t, i) => i).sort((a, b) => toyLen(pop[b]) - toyLen(pop[a]));
      const worst = idxs[0];
      const newPop = pop.map((t, i) => i === worst ? mutated : t);
      setPop(newPop);
      setStep(6);
    } else {
      reset();
    }
  };

  const stepText = [
    "1. Pogledaj populaciju. Imamo 4 jedinke (rute kroz 6 gradova A–F). Pritisni 'Sljedeći korak' da pokreneš jedan ciklus GA-a.",
    "2. Selekcija turnirom: izvukli smo 3 nasumične jedinke — najbolja od njih (najkraća ruta) postaje 1. roditelj.",
    "3. Selekcija za 2. roditelja: isti postupak, ponovo 3 jedinke, pobjeđuje najkraća. Ovo nije isti kao 1. roditelj.",
    "4. Križanje (1/2): izaberemo slučajni odsječak u 1. roditelju i kopiramo ga u dijete (smeđi okviri).",
    "5. Križanje (2/2): preostala mjesta nadopunimo gradovima iz 2. roditelja, redom kako se pojavljuju i preskačući one koji su već u djetetu (zeleni okviri).",
    "6. Mutacija: s malom vjerojatnošću zamijenimo dva grada u djetetu (crveni okviri). Ovo unosi raznolikost i sprječava da svi potomci budu kopije roditelja.",
    "7. Nova jedinka ulazi u populaciju, najgora postojeća izlazi (elitizam — najbolji uvijek ostaju). Ciklus se vrti dok ne zadovoljimo uvjet zaustavljanja.",
  ];

  return (
    <div className="panel">
      <h3 style={{ marginBottom: 6 }}>Mehanika GA-a — što se događa u jednom ciklusu?</h3>
      <p style={{ fontSize: 13.5, color: "var(--ink-2)", marginBottom: 14, maxWidth: "70ch" }}>
        Ovo je odvojen demo na malom problemu (samo 6 gradova A–F) da bi se jasno vidio svaki korak.
        Pritišći "Sljedeći korak" i prati: <strong>selekciju</strong> roditelja → <strong>križanje</strong> →
        <strong> mutaciju</strong> → ulazak nove jedinke u populaciju.
      </p>

      <div className="canvas-wrap smooth" style={{ marginBottom: 14, padding: 12 }}>
        <div style={{ width: "100%", maxWidth: 560 }}>
          <ToyMap
            tour={
              // Pick the most "complete" tour available for the current step.
              // child can contain -1 during the slice phase — never render it
              // until it is fully filled.
              step >= 5 ? (mutated || parentA)
              : step === 4 ? (child && !child.includes(-1) ? child : parentA)
              : step >= 2 && parentB ? parentB
              : step >= 1 && parentA ? parentA
              : pop[0]
            }
            highlight={step >= 5 ? swap : null}
            color={
              step >= 5 ? "#2a5d57"
              : step === 4 ? "#6b4f1d"
              : step >= 2 ? "#2a5d57"
              : step >= 1 ? "#6b4f1d"
              : "#a59c84"
            }
            w={560}
            h={380}
          />
        </div>
      </div>

      <div className="callout" style={{ marginTop: 0 }}>{stepText[step]}</div>

      <div className="actions">
        <button className="btn primary" onClick={advance}>
          {step >= 6 ? "Pokreni novi ciklus" : "Sljedeći korak →"}
        </button>
        <button className="btn" onClick={reset}>Resetiraj</button>
      </div>

      {/* Population panel */}
      <div style={{ marginTop: 22 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
          Populacija ({pop.length} jedinke)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          {pop.map((t, i) => {
            const isParentA = tournA && i === tournA.winner;
            const isParentB = tournB && i === tournB.winner;
            const inTournA = tournA && tournA.picks.includes(i);
            const inTournB = tournB && tournB.picks.includes(i);
            let badge = null, border = "var(--line)", bg = "var(--paper)";
            if (isParentA && step >= 1) { badge = "1. roditelj"; border = "var(--accent)"; bg = "var(--accent-wash)"; }
            else if (isParentB && step >= 2) { badge = "2. roditelj"; border = "var(--good)"; bg = "var(--good-wash)"; }
            else if (inTournA && step === 0) { badge = "u turniru A"; border = "var(--accent-soft)"; }
            else if (inTournB && step === 1) { badge = "u turniru B"; border = "var(--good)"; }
            return (
              <div key={i} style={{ padding: 10, background: bg, border: "1.5px solid " + border, borderRadius: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
                  <span>Jedinka {i + 1}</span>
                  <span style={{ color: badge ? "var(--ink)" : "var(--muted)", fontWeight: badge ? 600 : 400 }}>{badge || `${toyLen(t).toFixed(0)} px`}</span>
                </div>
                <TourStrip tour={t} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Crossover/Mutation detail */}
      {step >= 3 && parentA && parentB && (
        <div style={{ marginTop: 22 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
            Križanje i mutacija — detalj
          </div>
          <div style={{ display: "grid", gap: 10, fontFamily: "var(--mono)", fontSize: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 110, color: "var(--accent)" }}>Roditelj A</span>
              <TourStrip tour={parentA} slice={slice} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 110, color: "var(--good)" }}>Roditelj B</span>
              <TourStrip tour={parentB} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 110, color: "var(--ink)" }}>Dijete</span>
              <TourStrip tour={child || []} sourceMap={sourceMap} swap={step >= 5 ? swap : null} />
            </div>
            {step >= 5 && (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 110, color: "var(--warn)" }}>Nakon mutacije</span>
                <TourStrip tour={mutated || []} swap={swap} />
              </div>
            )}
          </div>
          <div style={{ marginTop: 12, fontSize: 12.5, color: "var(--muted)", fontFamily: "var(--sans)" }}>
            <span style={{ color: "var(--accent)" }}>■</span> geni iz roditelja A &nbsp;&nbsp;
            <span style={{ color: "var(--good)" }}>■</span> geni iz roditelja B &nbsp;&nbsp;
            <span style={{ color: "var(--warn)" }}>■</span> mutirani geni
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   2) CONVOLUTION PLAYGROUND
   ══════════════════════════════════════════════════════════════════════════ */

const FILTER_PRESETS = {
  "Identity": { k: [[0, 0, 0], [0, 1, 0], [0, 0, 0]], desc: "Slika ostaje ista — kontrolni primjer." },
  "Sharpen": { k: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]], desc: "Pojačava razlike između susjednih piksela: rubovi i detalji izgledaju izoštreni." },
  "Box blur (1/9)": { k: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], div: 9, desc: "Prosjek 9 susjeda — svi detalji i šum se gube." },
  "Gaussian blur": { k: [[1, 2, 1], [2, 4, 2], [1, 2, 1]], div: 16, desc: "Mekše zamućenje od box blura — centar ima veću težinu." },
  "Sobel-x (vertikalni rubovi)": { k: [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], offset: 128, desc: "Lijeva strana minus desna — reagira samo na vertikalne rubove." },
  "Sobel-y (horizontalni rubovi)": { k: [[-1, -2, -1], [0, 0, 0], [1, 2, 1]], offset: 128, desc: "Vrh minus dno — reagira samo na horizontalne rubove." },
  "Laplacian (svi rubovi)": { k: [[0, 1, 0], [1, -4, 1], [0, 1, 0]], offset: 128, desc: "Drugi izvod — reagira na sve nagle promjene intenziteta." },
  "Outline": { k: [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]], desc: "Crta rubove na crnoj pozadini." },
  "Emboss": { k: [[-2, -1, 0], [-1, 1, 1], [0, 1, 2]], offset: 128, desc: "Reljef efekt — slika izgleda kao iskucana iz metala." },
};

const MATRIX_IMAGES = {
  circle: [
    [0, 0, 0, 100, 200, 200, 100, 0, 0, 0],
    [0, 0, 200, 250, 250, 250, 250, 200, 0, 0],
    [0, 200, 250, 250, 250, 250, 250, 250, 200, 0],
    [100, 250, 250, 250, 250, 250, 250, 250, 250, 100],
    [200, 250, 250, 250, 250, 250, 250, 250, 250, 200],
    [200, 250, 250, 250, 250, 250, 250, 250, 250, 200],
    [100, 250, 250, 250, 250, 250, 250, 250, 250, 100],
    [0, 200, 250, 250, 250, 250, 250, 250, 200, 0],
    [0, 0, 200, 250, 250, 250, 250, 200, 0, 0],
    [0, 0, 0, 100, 200, 200, 100, 0, 0, 0],
  ],
  vline: [
    [0, 0, 0, 0, 250, 250, 0, 0, 0, 0],
    [0, 0, 0, 0, 250, 250, 0, 0, 0, 0],
    [0, 0, 0, 0, 250, 250, 0, 0, 0, 0],
    [0, 0, 0, 0, 250, 250, 0, 0, 0, 0],
    [0, 0, 0, 0, 250, 250, 0, 0, 0, 0],
    [0, 0, 0, 0, 250, 250, 0, 0, 0, 0],
    [0, 0, 0, 0, 250, 250, 0, 0, 0, 0],
    [0, 0, 0, 0, 250, 250, 0, 0, 0, 0],
    [0, 0, 0, 0, 250, 250, 0, 0, 0, 0],
    [0, 0, 0, 0, 250, 250, 0, 0, 0, 0],
  ],
  square: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 250, 250, 250, 250, 250, 250, 0, 0],
    [0, 0, 250, 250, 250, 250, 250, 250, 0, 0],
    [0, 0, 250, 250, 250, 250, 250, 250, 0, 0],
    [0, 0, 250, 250, 250, 250, 250, 250, 0, 0],
    [0, 0, 250, 250, 250, 250, 250, 250, 0, 0],
    [0, 0, 250, 250, 250, 250, 250, 250, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  smiley: [
    [0, 0, 100, 200, 200, 200, 200, 100, 0, 0],
    [0, 200, 250, 250, 250, 250, 250, 250, 200, 0],
    [100, 250, 20, 250, 250, 250, 20, 250, 250, 100],
    [200, 250, 20, 250, 250, 250, 20, 250, 250, 200],
    [200, 250, 250, 250, 250, 250, 250, 250, 250, 200],
    [200, 250, 20, 250, 250, 250, 250, 20, 250, 200],
    [200, 250, 20, 20, 20, 20, 20, 20, 250, 200],
    [100, 250, 250, 250, 250, 250, 250, 250, 250, 100],
    [0, 200, 250, 250, 250, 250, 250, 250, 200, 0],
    [0, 0, 100, 200, 200, 200, 200, 100, 0, 0],
  ],
};

const MATRIX_KERNELS = {
  identity: { label: "Identitet", k: [[0, 0, 0], [0, 1, 0], [0, 0, 0]], div: 1 },
  sobelx: { label: "Sobel X", k: [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], div: 1 },
  sobely: { label: "Sobel Y", k: [[-1, -2, -1], [0, 0, 0], [1, 2, 1]], div: 1 },
  laplacian: { label: "Laplacian", k: [[0, -1, 0], [-1, 4, -1], [0, -1, 0]], div: 1 },
  gaussian: { label: "Gaussian blur", k: [[1, 2, 1], [2, 4, 2], [1, 2, 1]], div: 16 },
  box: { label: "Box blur", k: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], div: 9 },
  sharpen: { label: "Izoštravanje", k: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]], div: 1 },
};

function clamp255(v) {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function matrixCellStyle(v, compact) {
  const c = clamp255(Math.abs(v));
  return {
    background: `rgb(${c},${c},${c})`,
    color: c > 145 ? "#1a1814" : "#fbf7ec",
    width: compact ? 18 : 32,
    height: compact ? 18 : 32,
  };
}

function matrixConvolve(image, kernelDef) {
  const out = [];
  for (let i = 0; i < image.length - 2; i++) {
    out[i] = [];
    for (let j = 0; j < image[0].length - 2; j++) {
      let sum = 0;
      for (let u = 0; u < 3; u++) {
        for (let v = 0; v < 3; v++) sum += image[i + u][j + v] * kernelDef.k[u][v];
      }
      out[i][j] = sum / (kernelDef.div || 1);
    }
  }
  return out;
}

function MatrixGrid({ data, compact = false, showNumbers = true, active = null, computed = null }) {
  const rows = data.length;
  const cols = data[0].length;
  return (
    <div className={"matrix-grid" + (compact ? " compact" : "")} style={{ gridTemplateColumns: `repeat(${cols}, ${compact ? 18 : 32}px)` }}>
      {data.map((row, i) => row.map((v, j) => {
        const isActive = active && i >= active.i && i < active.i + 3 && j >= active.j && j < active.j + 3;
        const isComputed = computed && computed[i]?.[j] !== undefined;
        return (
          <span key={i + "-" + j} className={(isActive ? "is-active " : "") + (isComputed ? "is-computed" : "")} style={matrixCellStyle(v ?? 127, compact)}>
            {showNumbers && !compact ? Math.round(v) : ""}
          </span>
        );
      }))}
    </div>
  );
}

function EdgeMapNote() {
  return (
    <div className="edge-map-note">
      <strong>Nije obrnuto:</strong> ovo nije rekonstruirana slika objekta, nego mapa odziva filtera.
      Tamna područja znače “nema velike promjene”, a svijetla područja znače “ovdje se intenzitet naglo mijenja”.
      Za rubove prikazujemo jačinu odziva, pa su i pozitivni i negativni rubovi nacrtani svijetlo.
    </div>
  );
}

function KernelMatrix({ kernelDef }) {
  return (
    <div className="kernel-readout">
      {kernelDef.k.map((row, i) => row.map((v, j) => <span key={i + "-" + j}>{v}</span>))}
      {kernelDef.div !== 1 && <small>÷ {kernelDef.div}</small>}
    </div>
  );
}

function PixelNumbersDemo() {
  const [numbers, setNumbers] = useState(true);
  const examples = [["Smješko", MATRIX_IMAGES.smiley], ["Krug", MATRIX_IMAGES.circle], ["Vertikalna linija", MATRIX_IMAGES.vline]];
  return (
    <section className="lesson-block">
      <h3>1. Slika je samo brojevi</h3>
      <p>Računalo ne vidi smješka ili krug. Vidi matricu intenziteta: 0 je crno, 255 bijelo, a sve između su nijanse sive.</p>
      <button className="btn" onClick={() => setNumbers((v) => !v)}>{numbers ? "Prikaži kao sivu sliku" : "Prikaži brojeve"}</button>
      <div className="matrix-demo-row">
        {examples.map(([label, data]) => (
          <figure key={label}>
            <MatrixGrid data={data} showNumbers={numbers} compact={!numbers} />
            <figcaption>{label} · ista matrica, drugi prikaz</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function StepConvolutionDemo() {
  const [imageKey, setImageKey] = useState("circle");
  const [kernelKey, setKernelKey] = useState("laplacian");
  const [pos, setPos] = useState(0);
  const [running, setRunning] = useState(false);
  const image = MATRIX_IMAGES[imageKey];
  const kernelDef = MATRIX_KERNELS[kernelKey];
  const outRows = image.length - 2;
  const outCols = image[0].length - 2;
  const maxPos = outRows * outCols;
  const i = Math.floor(pos / outCols);
  const j = pos % outCols;
  const fullOut = matrixConvolve(image, kernelDef);
  const partial = Array.from({ length: outRows }, (_, r) => Array.from({ length: outCols }, (_, c) => (r * outCols + c < pos ? fullOut[r][c] : 127)));
  const finishText = {
    circle: "Gotovo: izračunata je cijela mapa rubova. Zato popunjeni krug završi kao prsten aktivacija.",
    smiley: "Gotovo: izračunata je cijela mapa rubova. Zato smješko završi kao rub lica, oči i usta.",
    vline: "Gotovo: izračunata je cijela mapa rubova. Zato linija završi kao dva ruba: lijevi i desni.",
    square: "Gotovo: izračunata je cijela mapa rubova. Zato kvadrat završi kao okvir aktivacija.",
  }[imageKey];

  useEffect(() => {
    if (!running) return undefined;
    const t = setInterval(() => setPos((p) => Math.min(maxPos, p + 1)), 500);
    return () => clearInterval(t);
  }, [running, maxPos]);

  useEffect(() => {
    if (pos >= maxPos) setRunning(false);
  }, [pos, maxPos]);

  const reset = () => { setRunning(false); setPos(0); };
  const active = pos < maxPos ? { i, j } : null;
  let sum = 0;
  const terms = [];
  if (active) {
    for (let u = 0; u < 3; u++) {
      for (let v = 0; v < 3; v++) {
        const px = image[i + u][j + v];
        const kv = kernelDef.k[u][v];
        terms.push(`${kv}×${px}`);
        sum += kv * px;
      }
    }
  }
  const result = kernelDef.div === 1 ? sum : sum / kernelDef.div;

  return (
    <section className="lesson-block">
      <h3>2. Konvolucija korak po korak</h3>
      <p>Žuti prozor 3×3 klizi preko slike. Za svaku poziciju pomnožimo 9 parova brojeva, zbrojimo ih i taj jedan broj upišemo u izlaznu mapu.</p>
      <EdgeMapNote />
      <div className="lesson-controls">
        <label>Slika
          <select value={imageKey} onChange={(e) => { setImageKey(e.target.value); reset(); }}>
            <option value="circle">Krug</option>
            <option value="smiley">Smješko</option>
            <option value="vline">Vertikalna linija</option>
            <option value="square">Kvadrat</option>
          </select>
        </label>
        <label>Kernel
          <select value={kernelKey} onChange={(e) => { setKernelKey(e.target.value); reset(); }}>
            {Object.entries(MATRIX_KERNELS).map(([key, k]) => <option key={key} value={key}>{k.label}</option>)}
          </select>
        </label>
        <button className="btn primary" onClick={() => setRunning((v) => !v)}>{running ? "Pauza" : "Pokreni"}</button>
        <button className="btn" onClick={() => { setRunning(false); setPos((p) => Math.min(maxPos, p + 1)); }}>Korak</button>
        <button className="btn" onClick={reset}>Reset</button>
        <button className="btn" onClick={() => { setRunning(false); setPos(maxPos); }}>Završi odmah</button>
      </div>
      <div className="conv-step-layout">
        <figure>
          <MatrixGrid data={image} active={active} />
          <figcaption>Ulaz: pikseli kao brojevi</figcaption>
        </figure>
        <figure>
          <KernelMatrix kernelDef={kernelDef} />
          <figcaption>Kernel: {kernelDef.label}</figcaption>
        </figure>
        <figure>
          <MatrixGrid data={partial} compact showNumbers={false} computed={partial} />
          <figcaption>Izlazna mapa značajki: svijetlo = jaka promjena/rub</figcaption>
        </figure>
      </div>
      <div className="calc-readout">
        {active ? (
          <>
            <strong>Račun za out[{i}][{j}]:</strong> {terms.join(" + ")} = {sum}{kernelDef.div !== 1 ? ` ÷ ${kernelDef.div} = ${Math.round(result)}` : ` → ${Math.round(result)}`}
          </>
        ) : <strong>{finishText}</strong>}
      </div>
    </section>
  );
}

function WhyCircleDemo() {
  const examples = [
    ["Krug", MATRIX_IMAGES.circle, "Krug daje svijetli prsten jer se promjena intenziteta događa po kružnoj granici."],
    ["Kvadrat", MATRIX_IMAGES.square, "Kvadrat daje svijetli okvir: filter reagira na rub, ne na ime oblika."],
    ["Vertikalna linija", MATRIX_IMAGES.vline, "Linija daje dvije aktivacije: lijevi i desni rub linije."],
    ["Smješko", MATRIX_IMAGES.smiley, "Smješko daje rub lica, oči i usta. Sljedeći CNN slojevi kombiniraju te aktivacije."],
  ];
  return (
    <section className="lesson-block">
      <h3>3. Zašto se krug otkriva?</h3>
      <p>Laplacian mjeri koliko piksel odudara od susjeda. Zato ne “traži krug”, nego nalazi mjesta gdje svijetlo prelazi u tamno. Ako je granica kružna, aktivacije se poslože u prsten.</p>
      <EdgeMapNote />
      <div className="why-grid">
        {examples.map(([label, img, note]) => (
          <article key={label}>
            <h4>{label}</h4>
            <div className="mini-pair">
              <MatrixGrid data={img} compact showNumbers={false} />
              <span>↓ Laplacian</span>
              <MatrixGrid data={matrixConvolve(img, MATRIX_KERNELS.laplacian)} compact showNumbers={false} />
            </div>
            <p>{note}</p>
          </article>
        ))}
      </div>
      <div className="callout"><strong>Metodički most:</strong> rubovi → kružni uzorci → oči → lice. CNN ne prepoznaje oblike magijom, nego slaže sve složenije uzorke aktivacija.</div>
    </section>
  );
}

function seededNoise(image, type, seed) {
  const rng = seededRng(seed);
  return image.map((row) => row.map((v) => {
    if (type === "saltpepper") {
      const r = rng();
      if (r < 0.08) return 0;
      if (r > 0.92) return 255;
      return v;
    }
    const strength = type === "strong" ? 75 : 30;
    return clamp255(v + (rng() - 0.5 + rng() - 0.5 + rng() - 0.5) * strength);
  }));
}

function padMatrix(image, p) {
  return Array.from({ length: image.length + 2 * p }, (_, i) =>
    Array.from({ length: image[0].length + 2 * p }, (_, j) => {
      const ii = Math.max(0, Math.min(image.length - 1, i - p));
      const jj = Math.max(0, Math.min(image[0].length - 1, j - p));
      return image[ii][jj];
    })
  );
}

function median3(image) {
  return image.map((row, i) => row.map((_, j) => {
    const vals = [];
    for (let u = -1; u <= 1; u++) for (let v = -1; v <= 1; v++) {
      const ii = Math.max(0, Math.min(image.length - 1, i + u));
      const jj = Math.max(0, Math.min(row.length - 1, j + v));
      vals.push(image[ii][jj]);
    }
    return vals.sort((a, b) => a - b)[4];
  }));
}

function NoiseDemo() {
  const [noiseType, setNoiseType] = useState("saltpepper");
  const [filterType, setFilterType] = useState("gaussian");
  const [seed, setSeed] = useState(5);
  const noisy = seededNoise(MATRIX_IMAGES.smiley, noiseType, seed);
  const filtered = filterType === "median"
    ? median3(noisy)
    : matrixConvolve(padMatrix(noisy, 1), filterType === "box" ? MATRIX_KERNELS.box : MATRIX_KERNELS.gaussian);
  return (
    <section className="lesson-block">
      <h3>4. Gaussian blur i šum na smješku</h3>
      <p>Gaussian blur uprosječuje susjede. To često smanji fini šum, ali ga ne uklanja potpuno i zamućuje rubove. Kod salt & pepper šuma bolje radi median filter.</p>
      <div className="lesson-controls">
        <label>Šum
          <select value={noiseType} onChange={(e) => setNoiseType(e.target.value)}>
            <option value="weak">Slabi Gaussov šum</option>
            <option value="strong">Jaki Gaussov šum</option>
            <option value="saltpepper">Salt & pepper</option>
          </select>
        </label>
        <label>Filter
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="gaussian">Gaussian blur 3×3</option>
            <option value="box">Box blur 3×3</option>
            <option value="median">Median 3×3</option>
          </select>
        </label>
        <button className="btn" onClick={() => setSeed((s) => s + 1)}>Drugi šum</button>
      </div>
      <div className="matrix-demo-row">
        <figure><MatrixGrid data={MATRIX_IMAGES.smiley} compact showNumbers={false} /><figcaption>Original</figcaption></figure>
        <figure><MatrixGrid data={noisy} compact showNumbers={false} /><figcaption>Sa šumom</figcaption></figure>
        <figure><MatrixGrid data={filtered} compact showNumbers={false} /><figcaption>Nakon filtra</figcaption></figure>
      </div>
      <div className="callout"><strong>Zaključak za predavanje:</strong> Gaussian blur ne “otklanja” šum kao gumica. On ga zagladi. Ako su problem ekstremni crno-bijeli pikseli, median filter je bolji didaktički primjer.</div>
    </section>
  );
}

function ConvolutionLesson() {
  return (
    <div className="conv-lesson">
      <div className="lesson-check">
        <strong>Uključeno u ovu stranicu:</strong> pikseli kao brojevi, klizni kernel s računom, zašto krug postaje prsten aktivacija i zašto Gaussian blur ne uklanja svaki šum.
      </div>
      <PixelNumbersDemo />
      <StepConvolutionDemo />
      <WhyCircleDemo />
      <NoiseDemo />
    </div>
  );
}

function drawCheckerboard(ctx, w, h) {
  const s = 24;
  for (let y = 0; y < h; y += s) {
    for (let x = 0; x < w; x += s) {
      ctx.fillStyle = ((x / s + y / s) % 2 === 0) ? "#1a1814" : "#fbf7ec";
      ctx.fillRect(x, y, s, s);
    }
  }
}

function drawText(ctx, w, h) {
  ctx.fillStyle = "#fbf7ec";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#1a1814";
  ctx.font = "bold 84px Source Serif 4, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("UI", w / 2, h / 2 - 30);
  ctx.font = "32px Manrope, sans-serif";
  ctx.fillText("Susret 03", w / 2, h / 2 + 40);
}

function drawCoin(ctx, w, h) {
  ctx.fillStyle = "#fbf7ec";
  ctx.fillRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2;
  // outer ring
  ctx.fillStyle = "#1a1814";
  ctx.beginPath(); ctx.arc(cx, cy, 100, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#c9a566";
  ctx.beginPath(); ctx.arc(cx, cy, 92, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#1a1814";
  ctx.font = "bold 90px Source Serif 4, serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("π", cx, cy + 4);
}

function drawSkyline(ctx, w, h) {
  // gradient sky
  const grad = ctx.createLinearGradient(0, 0, 0, h * 0.7);
  grad.addColorStop(0, "#a59c84");
  grad.addColorStop(1, "#f3ede1");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h * 0.7);
  // ground
  ctx.fillStyle = "#3a352c";
  ctx.fillRect(0, h * 0.7, w, h * 0.3);
  // buildings
  const heights = [120, 90, 160, 200, 70, 140, 110, 180, 95, 130];
  let x = 10;
  for (let i = 0; i < heights.length; i++) {
    const bw = 24 + (i * 7) % 18;
    ctx.fillStyle = i % 2 === 0 ? "#1a1814" : "#3a352c";
    ctx.fillRect(x, h * 0.7 - heights[i], bw, heights[i]);
    // windows
    ctx.fillStyle = "#c9a566";
    for (let yy = h * 0.7 - heights[i] + 12; yy < h * 0.7 - 8; yy += 18) {
      for (let xx = x + 4; xx < x + bw - 4; xx += 8) {
        if ((Math.floor(xx) + Math.floor(yy)) % 3 === 0) ctx.fillRect(xx, yy, 4, 6);
      }
    }
    x += bw + 6;
  }
}

function drawNoiseFace(ctx, w, h) {
  // simple stylised face + noise
  ctx.fillStyle = "#ebe3d2";
  ctx.fillRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2;
  // face
  ctx.fillStyle = "#c9a566";
  ctx.beginPath(); ctx.ellipse(cx, cy + 10, 110, 130, 0, 0, Math.PI * 2); ctx.fill();
  // eyes
  ctx.fillStyle = "#1a1814";
  ctx.beginPath(); ctx.ellipse(cx - 38, cy - 20, 8, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 38, cy - 20, 8, 12, 0, 0, Math.PI * 2); ctx.fill();
  // mouth
  ctx.strokeStyle = "#1a1814"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(cx, cy + 30, 30, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
  // salt and pepper noise
  const id = ctx.getImageData(0, 0, w, h);
  for (let i = 0; i < id.data.length; i += 4) {
    if (Math.random() < 0.06) {
      const v = Math.random() < 0.5 ? 0 : 255;
      id.data[i] = v; id.data[i + 1] = v; id.data[i + 2] = v;
    }
  }
  ctx.putImageData(id, 0, 0);
}

function drawGradient(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#1a1814");
  g.addColorStop(0.5, "#c9a566");
  g.addColorStop(1, "#fbf7ec");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // diagonal stripes for edge detection variety
  ctx.strokeStyle = "rgba(26,24,20,0.4)";
  ctx.lineWidth = 2;
  for (let i = -h; i < w; i += 22) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + h, h); ctx.stroke();
  }
}

const PRESET_IMAGES = [
  { name: "Šahovska ploča", draw: drawCheckerboard, hint: "Idealno za Sobel — vertikalni i horizontalni rubovi su pravilni." },
  { name: "Tekst", draw: drawText, hint: "Sharpen pojačava čitljivost; blur je briše; outline ostavlja samo obrise." },
  { name: "Kovanica", draw: drawCoin, hint: "Laplacian i Outline savršeno otkrivaju kružni rub i unutarnji simbol." },
  { name: "Skyline", draw: drawSkyline, hint: "Sobel-x dramatično ističe vertikalne rubove zgrada." },
  { name: "Lice + šum", draw: drawNoiseFace, hint: "Gaussian blur uklanja šum; sharpen ga pogoršava." },
  { name: "Gradijent + crte", draw: drawGradient, hint: "Pokazuje razliku između direkcionalnih filtera." },
];

function applyConvolution(srcData, w, h, kernel, divisor, offset) {
  const k = kernel;
  const kw = k.length;
  const half = (kw - 1) / 2;
  const out = new Uint8ClampedArray(srcData.length);
  const div = divisor || 1;
  const off = offset || 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0;
      for (let ky = 0; ky < kw; ky++) {
        for (let kx = 0; kx < kw; kx++) {
          const sy = Math.min(h - 1, Math.max(0, y + ky - half));
          const sx = Math.min(w - 1, Math.max(0, x + kx - half));
          const idx = (sy * w + sx) * 4;
          const wv = k[ky][kx];
          r += srcData[idx] * wv;
          g += srcData[idx + 1] * wv;
          b += srcData[idx + 2] * wv;
        }
      }
      const oi = (y * w + x) * 4;
      out[oi] = Math.max(0, Math.min(255, r / div + off));
      out[oi + 1] = Math.max(0, Math.min(255, g / div + off));
      out[oi + 2] = Math.max(0, Math.min(255, b / div + off));
      out[oi + 3] = 255;
    }
  }
  return out;
}

function ConvDemo() {
  const [presetIdx, setPresetIdx] = useState(0);
  const [filterName, setFilterName] = useState("Sharpen");
  const [kernel, setKernel] = useState(FILTER_PRESETS["Sharpen"].k.map((r) => r.slice()));
  const [repeat, setRepeat] = useState(1);

  const inputRef = useRef(null);
  const outputRef = useRef(null);
  const thumbRefs = useRef([]);

  const W = 360, H = 360;

  const filter = FILTER_PRESETS[filterName] || {};

  // Draw thumbnails
  useEffect(() => {
    PRESET_IMAGES.forEach((p, i) => {
      const c = thumbRefs.current[i];
      if (!c) return;
      const ctx = c.getContext("2d");
      ctx.clearRect(0, 0, c.width, c.height);
      p.draw(ctx, c.width, c.height);
    });
  }, []);

  // Draw input
  useEffect(() => {
    const c = inputRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    PRESET_IMAGES[presetIdx].draw(ctx, c.width, c.height);
  }, [presetIdx]);

  // Apply filter
  useEffect(() => {
    const inp = inputRef.current, out = outputRef.current;
    if (!inp || !out) return;
    const ictx = inp.getContext("2d");
    const octx = out.getContext("2d");
    let imgData = ictx.getImageData(0, 0, W, H);
    let data = imgData.data;
    for (let i = 0; i < repeat; i++) {
      data = applyConvolution(data, W, H, kernel, filter.div, filter.offset);
    }
    const outImg = octx.createImageData(W, H);
    outImg.data.set(data);
    octx.putImageData(outImg, 0, 0);
  }, [presetIdx, kernel, repeat, filterName]);

  const setKernelFromPreset = (name) => {
    setFilterName(name);
    setKernel(FILTER_PRESETS[name].k.map((r) => r.slice()));
  };

  const updateKernel = (i, j, val) => {
    const next = kernel.map((r) => r.slice());
    next[i][j] = isNaN(val) ? 0 : val;
    setKernel(next);
    setFilterName("Custom");
  };

  return (
    <div>
      <ConvolutionLesson />

      <div className="section-intro">
        <p>
          Konvolucija prelazi malu matricu (<em>kernel</em>) preko slike i za svaki piksel zbraja umnoške
          susjednih vrijednosti i težina iz kernela. Različite vrijednosti u kernelu = različiti efekti.
          U CNN-u, <strong>vrijednosti u kernelu nisu ručno postavljene — mreža ih sama nauči</strong> iz milijun primjera.
        </p>
        <div className="aside">
          <strong>Pokušaj:</strong> klikni na različite slike, mijenjaj filtere, ručno mijenjaj brojeve u kernelu.
          Postavi "Ponovi" na 5 i pogledaj kako se efekt akumulira. Set test slika osmišljen je tako da svaki istakne drugu
          osobinu konvolucije.
        </div>
      </div>

      <div className="panel">
        <h3 style={{ marginBottom: 10 }}>Slika</h3>
        <div className="image-grid">
          {PRESET_IMAGES.map((p, i) => (
            <button key={i} className={i === presetIdx ? "is-active" : ""} onClick={() => setPresetIdx(i)} title={p.hint}>
              <canvas ref={(el) => (thumbRefs.current[i] = el)} width={120} height={120}></canvas>
            </button>
          ))}
        </div>
        <p style={{ marginTop: 10, fontSize: 13, color: "#6f6754", fontFamily: "var(--mono)" }}>
          {PRESET_IMAGES[presetIdx].name} — {PRESET_IMAGES[presetIdx].hint}
        </p>
      </div>

      <div className="panel">
        <h3 style={{ marginBottom: 10 }}>Filter (kernel 3×3)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 24, alignItems: "start" }}>
          <div>
            <div className="kernel-grid">
              {kernel.map((row, i) =>
                row.map((v, j) => (
                  <input
                    key={i + "-" + j}
                    type="number"
                    step="1"
                    value={v}
                    onChange={(e) => updateKernel(i, j, parseFloat(e.target.value))}
                  />
                ))
              )}
            </div>
            <div style={{ marginTop: 12, fontFamily: "var(--mono)", fontSize: 12, color: "#6f6754" }}>
              {filter.div ? `Djelitelj: ${filter.div}` : "Bez djelitelja"} · {filter.offset ? `Offset: +${filter.offset}` : "Bez offseta"}
            </div>
          </div>
          <div>
            <div className="control" style={{ maxWidth: 320 }}>
              <div className="control-label"><span>Preset filteri</span></div>
              <select value={filterName} onChange={(e) => setKernelFromPreset(e.target.value)}>
                {Object.keys(FILTER_PRESETS).map((n) => <option key={n} value={n}>{n}</option>)}
                <option value="Custom" disabled>(custom)</option>
              </select>
            </div>
            <div className="control" style={{ maxWidth: 320, marginTop: 12 }}>
              <div className="control-label"><span>Ponovi filter</span><span className="val">{repeat}×</span></div>
              <input type="range" min="1" max="10" value={repeat} onChange={(e) => setRepeat(+e.target.value)} />
            </div>
            <p style={{ marginTop: 14, fontSize: 14, color: "#3a352c" }}>
              {FILTER_PRESETS[filterName] ? FILTER_PRESETS[filterName].desc : "Vlastiti kernel — eksperimentiraj. Suma težina ≈ 1 čuva svjetlinu; suma 0 detektira promjene."}
            </p>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="split">
          <figure>
            <div className="canvas-wrap smooth">
              <canvas ref={inputRef} width={W} height={H}></canvas>
            </div>
            <figcaption>Ulaz</figcaption>
          </figure>
          <figure>
            <div className="canvas-wrap smooth">
              <canvas ref={outputRef} width={W} height={H}></canvas>
            </div>
            <figcaption>Izlaz nakon konvolucije ({repeat}×)</figcaption>
          </figure>
        </div>
        <div className="callout">
          <strong>Most prema CNN-u:</strong> Sobel filter za rubove smislili su matematičari 1968. Tko je rekao da je
          baš <code>[-1,0,1; -2,0,2; -1,0,1]</code> "pravi"? Mi. Što ako želimo filter koji pronalazi <em>oči na licu</em>?
          Nitko ne zna pravu matricu unaprijed. CNN to rješava — pustimo gradient descent da <em>nauči</em>
          vrijednosti u kernelu iz tisuća primjera. Sve ostalo (pooling, ReLU, slojevi) je tehnika oko te jedne ideje.
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: "#6f6754" }}>
          Atribucija: ova interaktiva inspirirana je open-source projektom <a href="https://github.com/generic-github-user/Image-Convolution-Playground" target="_blank" rel="noopener">Image Convolution Playground</a> (MIT licenca, autor generic-github-user). Vlastita implementacija s hrvatskim opisima i odabranim test slikama.
        </p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   3) NEXT-TOKEN PREDICTION & HALLUCINATION
   ══════════════════════════════════════════════════════════════════════════ */

const PROMPTS = [
  {
    id: "zg",
    text: "Glavni grad Hrvatske je",
    type: "factual",
    note: "Visoka koncentracija vjerojatnosti na jedan token — model je 'siguran'. Ovo je ono što želimo: činjenica je u trening skupu nebrojeno puta.",
    dist: [
      { tok: " Zagreb", p: 0.962 },
      { tok: " najveći", p: 0.013 },
      { tok: " također", p: 0.008 },
      { tok: " Split", p: 0.005 },
      { tok: " grad", p: 0.004 },
      { tok: " ostalo", p: 0.008 },
    ],
  },
  {
    id: "bih",
    text: "Glavni grad Bosne i Hercegovine je",
    type: "factual",
    note: "Slično — model je siguran, ali ima mali dio mase na 'Mostar' jer postoje rasprave o entitetima u korpusu.",
    dist: [
      { tok: " Sarajevo", p: 0.91 },
      { tok: " grad", p: 0.04 },
      { tok: " Mostar", p: 0.02 },
      { tok: " Banja", p: 0.013 },
      { tok: " također", p: 0.007 },
      { tok: " ostalo", p: 0.01 },
    ],
  },
  {
    id: "pizza",
    text: "Moja omiljena pizza je",
    type: "ambiguous",
    note: "Prompt nema činjenični odgovor. Distribucija je široka — model nasumično bira nešto stilski razumno. Različiti pozivi → različiti odgovori.",
    dist: [
      { tok: " margherita", p: 0.21 },
      { tok: " s", p: 0.18 },
      { tok: " Quattro", p: 0.13 },
      { tok: " ona", p: 0.11 },
      { tok: " napolitanska", p: 0.09 },
      { tok: " kapri", p: 0.06 },
      { tok: " bila", p: 0.05 },
      { tok: " definitivno", p: 0.04 },
      { tok: " ostalo", p: 0.13 },
    ],
  },
  {
    id: "halu",
    text: "Glumac koji je glumio Krešimira u filmu \"Plavi Marko\" iz 1973. zove se",
    type: "hallucination",
    note: "Film ne postoji. Model nema činjeničnu informaciju, ali je strukturno 'naučio' da nakon 'zove se' dolazi ime. Bira ime koje statistički zvuči vjerodostojno — to je halucinacija.",
    dist: [
      { tok: " Boris", p: 0.18 },
      { tok: " Ivo", p: 0.16 },
      { tok: " Slavko", p: 0.13 },
      { tok: " Fabijan", p: 0.10 },
      { tok: " Mladen", p: 0.09 },
      { tok: " Relja", p: 0.08 },
      { tok: " Bata", p: 0.07 },
      { tok: " Ranko", p: 0.06 },
      { tok: " Tomislav", p: 0.05 },
      { tok: " ostalo", p: 0.08 },
    ],
  },
  {
    id: "math",
    text: "12 × 7 =",
    type: "factual",
    note: "Matematički točan odgovor. Moderni modeli ovo dobro rade za male brojeve; za velike brojeve postaju nesigurni i mogu pogriješiti — to je također halucinacija.",
    dist: [
      { tok: " 84", p: 0.96 },
      { tok: " 84.", p: 0.018 },
      { tok: " 89", p: 0.008 },
      { tok: " osamdeset", p: 0.005 },
      { tok: " 88", p: 0.004 },
      { tok: " ostalo", p: 0.005 },
    ],
  },
];

function LLMDemo() {
  const [promptIdx, setPromptIdx] = useState(0);
  const [generated, setGenerated] = useState("");
  const [picked, setPicked] = useState(null);
  const prompt = PROMPTS[promptIdx];

  useEffect(() => {
    setGenerated("");
    setPicked(null);
  }, [promptIdx]);

  const sample = () => {
    const r = Math.random();
    let acc = 0, picked = prompt.dist[prompt.dist.length - 1].tok;
    for (const item of prompt.dist) {
      acc += item.p;
      if (r <= acc) { picked = item.tok; break; }
    }
    setPicked(picked);
    setGenerated(prompt.text + picked);
  };

  const greedy = () => {
    const top = prompt.dist[0];
    setPicked(top.tok);
    setGenerated(prompt.text + top.tok);
  };

  return (
    <div>
      <div className="section-intro">
        <p>
          LLM je u srcu <em>predviđač sljedećeg tokena</em>. Za svaki ulazni tekst, model računa
          vjerojatnost <strong>svih</strong> tokena iz svog rječnika i bira (uzima uzorak) sljedeći. Sve što LLM "radi" —
          razgovor, kod, sažimanje — svodi se na ponavljanje ovog koraka tisuću puta.
        </p>
        <div className="aside">
          <strong>Što tražiti:</strong> kad je odgovor činjenica, distribucija je <em>uska</em> i top token ima &gt;90%
          mase. Kad činjenice nema (4. primjer dolje — film koji ne postoji), distribucija je <em>široka</em> — to je
          trenutak halucinacije.
        </div>
      </div>

      <div className="panel">
        <div className="control">
          <div className="control-label"><span>Primjer prompta</span></div>
          <select value={promptIdx} onChange={(e) => setPromptIdx(+e.target.value)}>
            {PROMPTS.map((p, i) => <option key={p.id} value={i}>{i + 1}. {p.text}</option>)}
          </select>
        </div>

        <div style={{ marginTop: 18, padding: "14px 16px", background: "var(--paper-2)", border: "1px solid var(--line)", borderRadius: 10, fontFamily: "var(--serif)", fontSize: 18, lineHeight: 1.5 }}>
          <span style={{ color: "var(--ink)" }}>{prompt.text}</span>
          {picked && <span style={{ color: "var(--accent)", fontStyle: "italic", fontWeight: 500 }}>{picked}</span>}
          {!picked && <span style={{ color: "var(--muted)" }}><span style={{ animation: "blink 1s infinite" }}>▮</span></span>}
        </div>

        <h3 style={{ marginTop: 22, marginBottom: 6 }}>Distribucija sljedećeg tokena</h3>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>
          Top {prompt.dist.length} tokena prema vjerojatnosti.
        </p>

        <div className="bars">
          {prompt.dist.map((d, i) => (
            <div key={i} className={"bar-row" + (picked === d.tok ? " is-pick" : "")}>
              <span className="lbl">{d.tok.replace(/^ /, "·") || "(prazno)"}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: (d.p * 100).toFixed(1) + "%" }}></div>
              </div>
              <span className="pct">{(d.p * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>

        <div className="actions">
          <button className="btn primary" onClick={sample}>Uzmi uzorak (slučajno)</button>
          <button className="btn" onClick={greedy}>Najvjerojatniji (greedy)</button>
          <button className="btn" onClick={() => { setGenerated(""); setPicked(null); }}>Resetiraj</button>
        </div>

        <div className={"callout" + (prompt.type === "hallucination" ? " warn" : "")}>
          {prompt.type === "factual" && <><strong>Činjenični prompt.</strong> Distribucija je uska, model "zna" odgovor jer je nebrojeno puta vidio sličan obrazac u trening skupu.</>}
          {prompt.type === "ambiguous" && <><strong>Dvosmislen prompt.</strong> Nema "točnog" odgovora — model bira nešto stilski razumno. Dvije konzultacije s istim modelom mogu dati različite odgovore.</>}
          {prompt.type === "hallucination" && <><strong>Halucinacija.</strong> Film ne postoji — ali model je naučio da nakon "zove se" dolazi ime. Bira <em>najuvjerljivije</em> ime, ne <em>točno</em>. To je halucinacija u klasičnom obliku: uvjerljiv ton, nula veze sa stvarnošću.</>}
          {" "}{prompt.note}
        </div>
      </div>

      <div className="panel">
        <h3 style={{ marginBottom: 10 }}>Što ovo znači u praksi</h3>
        <dl className="kv">
          <dt>Bez "ne znam"</dt>
          <dd>Model ne razlikuje "siguran sam" od "izmišljam". On uvijek vraća sljedeći najvjerojatniji token. Kontroliraš ga <em>strukturom prompta</em>.</dd>
          <dt>Ekspert vs. laik</dt>
          <dd>Kad si stručnjak za temu, halucinaciju vidiš odmah. Kad nisi — odgovor zvuči autoritativno čak i kad griješi.</dd>
          <dt>Temperatura</dt>
          <dd>Parametar koji "ravna" distribuciju. Niska (0–0.2) → uvijek bira top token, deterministički. Visoka (1.0+) → kreativnije, ali rizičnije.</dd>
          <dt>RAG</dt>
          <dd>Rješenje za činjenice: prije generiranja, sustav <em>dohvati</em> relevantne dokumente i ubaci ih u prompt. Tada distribucija "zna" gdje gledati.</dd>
        </dl>
      </div>

      <style>{`@keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }`}</style>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Mount
   ────────────────────────────────────────────────────────────────────────── */
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
