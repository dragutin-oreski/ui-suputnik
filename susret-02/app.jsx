const DEFAULT_POINTS = [
  { x: 1.2, y: 2.1 },
  { x: 2.1, y: 2.7 },
  { x: 3.4, y: 3.0 },
  { x: 4.4, y: 4.2 },
  { x: 5.2, y: 4.1 },
  { x: 6.0, y: 5.0 },
  { x: 7.1, y: 5.4 },
];

const DATASETS = [
  {
    label: "Blagi rast",
    points: DEFAULT_POINTS,
  },
  {
    label: "Jedan odskok",
    points: [
      { x: 1.0, y: 1.5 },
      { x: 2.0, y: 2.1 },
      { x: 3.1, y: 2.9 },
      { x: 4.0, y: 3.5 },
      { x: 5.2, y: 4.3 },
      { x: 6.1, y: 4.8 },
      { x: 7.0, y: 2.0 },
    ],
  },
  {
    label: "Gotovo ravno",
    points: [
      { x: 1.1, y: 3.2 },
      { x: 2.0, y: 2.8 },
      { x: 3.0, y: 3.1 },
      { x: 4.1, y: 3.0 },
      { x: 5.1, y: 3.3 },
      { x: 6.2, y: 3.1 },
      { x: 7.0, y: 3.4 },
    ],
  },
];

const CLUSTER_POINTS = [
  { x: 1.0, y: 1.2 },
  { x: 1.5, y: 1.8 },
  { x: 2.0, y: 1.1 },
  { x: 1.7, y: 2.4 },
  { x: 4.6, y: 4.1 },
  { x: 5.0, y: 4.8 },
  { x: 5.6, y: 4.3 },
  { x: 4.8, y: 5.4 },
  { x: 6.5, y: 1.4 },
  { x: 7.0, y: 2.0 },
  { x: 6.1, y: 2.5 },
  { x: 7.2, y: 2.8 },
];

const CLUSTER_CENTROIDS = [
  { x: 1.0, y: 1.0 },
  { x: 4.2, y: 5.8 },
  { x: 7.2, y: 1.2 },
  { x: 3.8, y: 3.1 },
];

const X_DOMAIN = [0, 8];
const Y_DOMAIN = [0, 7];
const SVG_W = 920;
const SVG_H = 560;
const PAD = { left: 64, right: 26, top: 34, bottom: 76 };

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value, digits = 2) {
  const p = 10 ** digits;
  return Math.round(value * p) / p;
}

function fitLine(points) {
  if (points.length < 2) return null;
  const n = points.length;
  const sx = points.reduce((sum, p) => sum + p.x, 0);
  const sy = points.reduce((sum, p) => sum + p.y, 0);
  const mx = sx / n;
  const my = sy / n;
  const sxx = points.reduce((sum, p) => sum + (p.x - mx) ** 2, 0);
  if (Math.abs(sxx) < 0.0001) return null;
  const sxy = points.reduce((sum, p) => sum + (p.x - mx) * (p.y - my), 0);
  const slope = sxy / sxx;
  const intercept = my - slope * mx;
  const sse = points.reduce((sum, p) => sum + (p.y - (intercept + slope * p.x)) ** 2, 0);
  const sst = points.reduce((sum, p) => sum + (p.y - my) ** 2, 0);
  const r2 = sst === 0 ? 1 : 1 - sse / sst;
  return { slope, intercept, sse, r2 };
}

function lineFromEndpoints(line) {
  const dx = line.x2 - line.x1;
  const slope = Math.abs(dx) < 0.0001 ? 0 : (line.y2 - line.y1) / dx;
  const intercept = line.y1 - slope * line.x1;
  return { slope, intercept };
}

function sseForLine(points, line) {
  const { slope, intercept } = lineFromEndpoints(line);
  return points.reduce((sum, p) => sum + (p.y - (intercept + slope * p.x)) ** 2, 0);
}

function distanceSquared(a, b) {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}

function nearestCentroid(point, centroids) {
  if (centroids.length === 0) return -1;
  let best = 0;
  let bestDistance = distanceSquared(point, centroids[0]);
  for (let i = 1; i < centroids.length; i += 1) {
    const d = distanceSquared(point, centroids[i]);
    if (d < bestDistance) {
      best = i;
      bestDistance = d;
    }
  }
  return best;
}

function assignClusters(points, centroids) {
  return points.map((point) => nearestCentroid(point, centroids));
}

function recomputeCentroids(points, assignments, centroids) {
  return centroids.map((centroid, index) => {
    const assigned = points.filter((_, pointIndex) => assignments[pointIndex] === index);
    if (assigned.length === 0) return centroid;
    return {
      x: assigned.reduce((sum, point) => sum + point.x, 0) / assigned.length,
      y: assigned.reduce((sum, point) => sum + point.y, 0) / assigned.length,
    };
  });
}

function clusterInertia(points, centroids, assignments) {
  return points.reduce((sum, point, index) => {
    const centroid = centroids[assignments[index]];
    return centroid ? sum + distanceSquared(point, centroid) : sum;
  }, 0);
}

function App() {
  const [points, setPoints] = React.useState(DEFAULT_POINTS);
  const [studentLine, setStudentLine] = React.useState({ x1: 0.8, y1: 2.0, x2: 7.4, y2: 5.1 });
  const [showStudentLine, setShowStudentLine] = React.useState(false);
  const [showFit, setShowFit] = React.useState(true);
  const [showResiduals, setShowResiduals] = React.useState(true);
  const [datasetIndex, setDatasetIndex] = React.useState(0);

  const fit = React.useMemo(() => fitLine(points), [points]);
  const studentModel = React.useMemo(() => lineFromEndpoints(studentLine), [studentLine]);
  const studentSse = React.useMemo(() => sseForLine(points, studentLine), [points, studentLine]);
  const improvement = fit ? Math.max(0, 1 - fit.sse / Math.max(studentSse, 0.0001)) : 0;

  const addPoint = (point) => {
    setPoints((current) => [...current, point]);
  };

  const loadDataset = () => {
    const next = (datasetIndex + 1) % DATASETS.length;
    setDatasetIndex(next);
    setPoints(DATASETS[next].points);
    setShowFit(false);
  };

  const clearPoints = () => {
    setPoints([]);
    setShowFit(false);
  };

  const undoPoint = () => {
    setPoints((current) => current.slice(0, -1));
  };

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="../">
          <span className="brand-mark">s</span>
          <span>
            <span className="brand-name">UI Suputnik</span>
            <span className="brand-meta">vizualni pratitelj · Susret 02</span>
          </span>
        </a>
        <nav className="topbar-right">
          <a href="../">Svi susreti</a>
          <span>Umjetna inteligencija</span>
        </nav>
      </header>

      <section className="hero">
        <div>
          <span className="kicker kicker--accent">Susret 02 · Vježba 1</span>
          <h1>Od točaka do <em>pravca</em>.</h1>
          <p className="hero-sub">
            Prije formule: pogledaj podatke, nacrtaj procjenu, izmjeri pogrešku i tek onda otkrij što radi linearna regresija.
          </p>
        </div>
        <aside className="brief surface">
          <span className="kicker">Kako koristiti stranicu</span>
          <p>
            Kreni od grafa. Dodaj ili promijeni točke, usporedi vlastitu procjenu s modelom i objasni što se promijenilo.
          </p>
          <div className="brief-flow">
            <span>dodaj točke</span>
            <span>usporedi</span>
            <span>promijeni K</span>
            <span>objasni</span>
          </div>
        </aside>
      </section>

      <section className="module" id="regresija">
        <div className="module-head">
          <span className="module-num">01</span>
          <div className="module-title">
            <span className="kicker">Vidi · Mijenjaj · Objasni</span>
            <h2>Interaktivna linearna regresija</h2>
            <p className="module-summary">
              Klikni u graf za dodavanje točaka. Povuci krajeve crvenog pravca dok ne misliš da najbolje objašnjava podatke. Plavi pravac prikazuje najmanji mogući zbroj kvadriranih pogrešaka za te točke.
            </p>
          </div>
          <div className="module-pattern">
            <span className="on">točke</span>
            <span className="on">pravac</span>
            <span>ZKP</span>
          </div>
        </div>

        <div className="lab">
          <div className="lab-main">
            <RegressionPlot
              points={points}
              studentLine={studentLine}
              fit={fit}
              showStudentLine={showStudentLine}
              showFit={showFit}
              showResiduals={showResiduals}
              onAddPoint={addPoint}
              onLineChange={setStudentLine}
            />
            <div className="panel-section prompt">
              <span className="kicker">Pitanja za razmisliti</span>
              <ol>
                <li>Koje točke najviše vuku pravac?</li>
                <li>Je li najbolji pravac uvijek i najbolja odluka?</li>
                <li>Što se dogodi kada dodamo netipičnog klijenta?</li>
              </ol>
            </div>
          </div>
          <aside className="panel">
            <div className="panel-section">
              <span className="kicker">Podaci</span>
              <div className="button-row">
                <button className="btn btn-primary" onClick={loadDataset}>Promijeni skup</button>
                <button className="btn" onClick={undoPoint} disabled={points.length === 0}>Vrati točku</button>
                <button className="btn" onClick={clearPoints}>Očisti</button>
              </div>
              <p className="small-note">
                Trenutni skup: <strong>{points.length}</strong> točaka · {DATASETS[datasetIndex].label}
              </p>
            </div>

            <div className="panel-section">
              <span className="kicker">Usporedba</span>
              <Metric label="Tvoj ZKP" value={round(studentSse, 3)} tone="student" />
              <Metric label="Najmanji ZKP" value={fit ? round(fit.sse, 3) : "dodaj 2 točke"} tone="fit" />
              <Metric label="Koliko se može popraviti" value={fit ? `${Math.round(improvement * 100)}%` : "-"} />
              <label className="check">
                <input
                  type="checkbox"
                  checked={showStudentLine}
                  onChange={(e) => setShowStudentLine(e.target.checked)}
                />
                <span>Prikaži moj pravac</span>
              </label>
              <label className="check">
                <input type="checkbox" checked={showFit} onChange={(e) => setShowFit(e.target.checked)} />
                <span>Prikaži regresijski pravac</span>
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={showResiduals}
                  disabled={!showStudentLine}
                  onChange={(e) => setShowResiduals(e.target.checked)}
                />
                <span>Prikaži pogreške do crvenog pravca</span>
              </label>
            </div>

            <div className="panel-section equations">
              <span className="kicker">Modeli</span>
              <code>tvoj: y = {round(studentModel.intercept, 2)} + {round(studentModel.slope, 2)}x</code>
              <code>
                regresija: {fit ? `y = ${round(fit.intercept, 2)} + ${round(fit.slope, 2)}x` : "dodaj barem 2 točke"}
              </code>
              <code>R² = {fit ? round(fit.r2, 3) : "-"}</code>
            </div>
          </aside>
        </div>
      </section>

      <ClusteringModule />
      <HuggingFaceLinks />
    </div>
  );
}

function Metric({ label, value, tone }) {
  return (
    <div className={`metric ${tone ? `metric--${tone}` : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RegressionPlot({ points, studentLine, fit, showStudentLine, showFit, showResiduals, onAddPoint, onLineChange }) {
  const svgRef = React.useRef(null);
  const [drag, setDrag] = React.useState(null);

  const xScale = (x) => PAD.left + ((x - X_DOMAIN[0]) / (X_DOMAIN[1] - X_DOMAIN[0])) * (SVG_W - PAD.left - PAD.right);
  const yScale = (y) => SVG_H - PAD.bottom - ((y - Y_DOMAIN[0]) / (Y_DOMAIN[1] - Y_DOMAIN[0])) * (SVG_H - PAD.top - PAD.bottom);
  const xValue = (px) => X_DOMAIN[0] + ((px - PAD.left) / (SVG_W - PAD.left - PAD.right)) * (X_DOMAIN[1] - X_DOMAIN[0]);
  const yValue = (py) => Y_DOMAIN[0] + ((SVG_H - PAD.bottom - py) / (SVG_H - PAD.top - PAD.bottom)) * (Y_DOMAIN[1] - Y_DOMAIN[0]);

  const toDataPoint = (clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * SVG_W;
    const py = ((clientY - rect.top) / rect.height) * SVG_H;
    return {
      x: round(clamp(xValue(px), X_DOMAIN[0], X_DOMAIN[1]), 2),
      y: round(clamp(yValue(py), Y_DOMAIN[0], Y_DOMAIN[1]), 2),
    };
  };

  React.useEffect(() => {
    const move = (event) => {
      if (!drag) return;
      const point = toDataPoint(event.clientX, event.clientY);
      onLineChange((line) => ({
        ...line,
        [drag === "start" ? "x1" : "x2"]: point.x,
        [drag === "start" ? "y1" : "y2"]: point.y,
      }));
    };
    const up = () => setDrag(null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [drag]);

  const handlePlotClick = (event) => {
    if (event.target.closest("[data-handle='line']")) return;
    onAddPoint(toDataPoint(event.clientX, event.clientY));
  };

  const fitLine = fit ? { x1: X_DOMAIN[0], y1: fit.intercept, x2: X_DOMAIN[1], y2: fit.intercept + fit.slope * X_DOMAIN[1] } : null;
  const studentModel = lineFromEndpoints(studentLine);

  const ticksX = Array.from({ length: 9 }, (_, i) => i);
  const ticksY = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div className="plot-wrap surface">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        role="img"
        aria-label="Interaktivni graf za linearni regresijski pravac"
        onClick={handlePlotClick}
      >
        <rect className="plot-bg" x="0" y="0" width={SVG_W} height={SVG_H} />
        <g className="grid">
          {ticksX.map((tick) => (
            <line key={`x-${tick}`} x1={xScale(tick)} x2={xScale(tick)} y1={PAD.top} y2={SVG_H - PAD.bottom} />
          ))}
          {ticksY.map((tick) => (
            <line key={`y-${tick}`} x1={PAD.left} x2={SVG_W - PAD.right} y1={yScale(tick)} y2={yScale(tick)} />
          ))}
        </g>
        <line className="axis" x1={PAD.left} x2={SVG_W - PAD.right} y1={yScale(0)} y2={yScale(0)} />
        <line className="axis" x1={xScale(0)} x2={xScale(0)} y1={PAD.top} y2={SVG_H - PAD.bottom} />
        <g className="ticks">
          {ticksX.map((tick) => (
            <text key={`tx-${tick}`} x={xScale(tick)} y={SVG_H - 42}>{tick}</text>
          ))}
          {ticksY.map((tick) => (
            <text key={`ty-${tick}`} x={PAD.left - 18} y={yScale(tick) + 4}>{tick}</text>
          ))}
        </g>
        <text className="axis-label" x={SVG_W - 142} y={SVG_H - 18}>ulazni atribut (x)</text>
        <text className="axis-label" x={PAD.left + 82} y={24}>ocjena rizika (y)</text>

        {showStudentLine && showResiduals && points.map((point, index) => {
          const predicted = studentModel.intercept + studentModel.slope * point.x;
          return (
            <line
              key={`res-${index}`}
              className="residual"
              x1={xScale(point.x)}
              x2={xScale(point.x)}
              y1={yScale(point.y)}
              y2={yScale(predicted)}
            />
          );
        })}

        {showStudentLine && (
          <line
            className="student-line"
            x1={xScale(studentLine.x1)}
            y1={yScale(studentLine.y1)}
            x2={xScale(studentLine.x2)}
            y2={yScale(studentLine.y2)}
          />
        )}
        {showFit && fitLine && (
          <line
            className="fit-line"
            x1={xScale(fitLine.x1)}
            y1={yScale(fitLine.y1)}
            x2={xScale(fitLine.x2)}
            y2={yScale(fitLine.y2)}
          />
        )}

        {points.map((point, index) => (
          <g key={`p-${index}`} className="point">
            <circle cx={xScale(point.x)} cy={yScale(point.y)} r="7" />
            <text x={xScale(point.x) + 10} y={yScale(point.y) - 10}>{index + 1}</text>
          </g>
        ))}

        {showStudentLine && (
          <>
            <g
              data-handle="line"
              className="handle"
              onPointerDown={(event) => {
                event.preventDefault();
                setDrag("start");
              }}
            >
              <circle cx={xScale(studentLine.x1)} cy={yScale(studentLine.y1)} r="12" />
              <circle cx={xScale(studentLine.x1)} cy={yScale(studentLine.y1)} r="4" />
            </g>
            <g
              data-handle="line"
              className="handle"
              onPointerDown={(event) => {
                event.preventDefault();
                setDrag("end");
              }}
            >
              <circle cx={xScale(studentLine.x2)} cy={yScale(studentLine.y2)} r="12" />
              <circle cx={xScale(studentLine.x2)} cy={yScale(studentLine.y2)} r="4" />
            </g>
          </>
        )}
      </svg>
      <div className="plot-footer">
        <span>Klik u graf dodaje točku.</span>
        <span>{showStudentLine ? "Povuci crvene ručke za vlastiti pravac." : "U panelu možeš uključiti vlastiti pravac."}</span>
      </div>
    </div>
  );
}

function ClusteringModule() {
  const [points, setPoints] = React.useState(CLUSTER_POINTS);
  const [k, setK] = React.useState(3);
  const [centroids, setCentroids] = React.useState(CLUSTER_CENTROIDS.slice(0, 3));
  const [iteration, setIteration] = React.useState(0);
  const [showClusterLines, setShowClusterLines] = React.useState(true);
  const [isRunning, setIsRunning] = React.useState(false);
  const runTimer = React.useRef(null);

  const assignments = React.useMemo(() => assignClusters(points, centroids), [points, centroids]);
  const inertia = React.useMemo(() => clusterInertia(points, centroids, assignments), [points, centroids, assignments]);
  const counts = React.useMemo(() => centroids.map((_, index) => assignments.filter((a) => a === index).length), [assignments, centroids]);

  React.useEffect(() => {
    return () => {
      if (runTimer.current) window.clearTimeout(runTimer.current);
    };
  }, []);

  const resetCentroids = (nextK = k) => {
    if (runTimer.current) window.clearTimeout(runTimer.current);
    setIsRunning(false);
    setCentroids(CLUSTER_CENTROIDS.slice(0, nextK));
    setIteration(0);
  };

  const changeK = (nextK) => {
    setK(nextK);
    resetCentroids(nextK);
  };

  const step = () => {
    if (points.length === 0 || centroids.length === 0 || isRunning) return;
    setCentroids((current) => {
      const currentAssignments = assignClusters(points, current);
      return recomputeCentroids(points, currentAssignments, current);
    });
    setIteration((current) => current + 1);
  };

  const runSteps = () => {
    if (points.length === 0 || centroids.length === 0 || isRunning) return;
    setIsRunning(true);
    let remaining = 6;
    const tick = () => {
      setCentroids((current) => {
        const currentAssignments = assignClusters(points, current);
        return recomputeCentroids(points, currentAssignments, current);
      });
      setIteration((current) => current + 1);
      remaining -= 1;
      if (remaining > 0) {
        runTimer.current = window.setTimeout(tick, 760);
      } else {
        runTimer.current = null;
        setIsRunning(false);
      }
    };
    tick();
  };

  const addPoint = (point) => {
    setPoints((current) => [...current, point]);
  };

  const undoPoint = () => {
    setPoints((current) => current.slice(0, -1));
  };

  const restorePoints = () => {
    if (runTimer.current) window.clearTimeout(runTimer.current);
    setIsRunning(false);
    setPoints(CLUSTER_POINTS);
    resetCentroids(k);
  };

  return (
    <section className="module" id="klasteriranje">
      <div className="module-head">
        <span className="module-num">02</span>
        <div className="module-title">
          <span className="kicker">Vidi · Mijenjaj · Objasni</span>
          <h2>Vizualizacija klasteriranja - K-sredine</h2>
          <p className="module-summary">
            Klikni za dodavanje podataka, odaberi broj klastera i pusti središta da se pomiču prema sredini svojih grupa. Boje se mijenjaju prema najbližem središtu klastera.
          </p>
        </div>
        <div className="module-pattern">
          <span className="on">K</span>
          <span className="on">središte</span>
          <span>inercija</span>
        </div>
      </div>

      <div className="lab">
        <div className="lab-main">
          <ClusterPlot
            points={points}
            centroids={centroids}
            assignments={assignments}
            showClusterLines={showClusterLines}
            onAddPoint={addPoint}
            onCentroidsChange={setCentroids}
          />
          <div className="panel-section prompt">
            <span className="kicker">Pitanja za razmisliti</span>
            <ol>
              <li>Što se promijeni kada K povećamo s 2 na 3?</li>
              <li>Zašto početni položaj središta može promijeniti rezultat?</li>
              <li>Koje točke su na granici između dva klastera?</li>
            </ol>
          </div>
        </div>
        <aside className="panel">
          <div className="panel-section">
            <span className="kicker">Postavke</span>
            <div className="segmented" aria-label="Broj klastera">
              {[2, 3, 4].map((value) => (
                <button
                  key={value}
                  className={value === k ? "active" : ""}
                  onClick={() => changeK(value)}
                  disabled={isRunning}
                >
                  K = {value}
                </button>
              ))}
            </div>
            <div className="button-row">
              <button className="btn btn-primary" onClick={step} disabled={isRunning}>Jedan korak</button>
              <button className="btn" onClick={runSteps} disabled={isRunning}>{isRunning ? "Pomičem..." : "Pokreni"}</button>
              <button className="btn" onClick={() => resetCentroids(k)}>Vrati središta</button>
            </div>
            <label className="check">
              <input type="checkbox" checked={showClusterLines} onChange={(e) => setShowClusterLines(e.target.checked)} />
              <span>Prikaži veze do središta</span>
            </label>
          </div>

          <div className="panel-section">
            <span className="kicker">Mjerenje</span>
            <Metric label="Iteracija" value={iteration} />
            <Metric label="Inercija" value={round(inertia, 3)} tone="fit" />
            <Metric label="Broj točaka" value={points.length} />
            <p className="small-note">
              Metoda K-sredina smanjuje udaljenost točaka od središta njihovog klastera. Manja inercija znači kompaktnije klastere, ali veći K gotovo uvijek smanjuje brojku.
            </p>
          </div>

          <div className="panel-section cluster-list">
            <span className="kicker">Klasteri</span>
            {centroids.map((centroid, index) => (
              <div key={index} className={`cluster-row cluster-${index}`}>
                <span className="cluster-swatch"></span>
                <span>Klaster {index + 1}</span>
                <strong>{counts[index]} točaka</strong>
                <code>({round(centroid.x, 2)}, {round(centroid.y, 2)})</code>
              </div>
            ))}
          </div>

          <div className="panel-section">
            <span className="kicker">Podaci</span>
            <div className="button-row">
              <button className="btn" onClick={undoPoint} disabled={points.length === 0}>Vrati točku</button>
              <button className="btn" onClick={restorePoints}>Početni skup</button>
              <button className="btn" onClick={() => setPoints([])}>Očisti</button>
            </div>
          </div>

        </aside>
      </div>
    </section>
  );
}

function ClusterPlot({ points, centroids, assignments, showClusterLines, onAddPoint, onCentroidsChange }) {
  const svgRef = React.useRef(null);
  const [dragIndex, setDragIndex] = React.useState(null);

  const xScale = (x) => PAD.left + ((x - X_DOMAIN[0]) / (X_DOMAIN[1] - X_DOMAIN[0])) * (SVG_W - PAD.left - PAD.right);
  const yScale = (y) => SVG_H - PAD.bottom - ((y - Y_DOMAIN[0]) / (Y_DOMAIN[1] - Y_DOMAIN[0])) * (SVG_H - PAD.top - PAD.bottom);
  const xValue = (px) => X_DOMAIN[0] + ((px - PAD.left) / (SVG_W - PAD.left - PAD.right)) * (X_DOMAIN[1] - X_DOMAIN[0]);
  const yValue = (py) => Y_DOMAIN[0] + ((SVG_H - PAD.bottom - py) / (SVG_H - PAD.top - PAD.bottom)) * (Y_DOMAIN[1] - Y_DOMAIN[0]);

  const toDataPoint = (clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * SVG_W;
    const py = ((clientY - rect.top) / rect.height) * SVG_H;
    return {
      x: round(clamp(xValue(px), X_DOMAIN[0], X_DOMAIN[1]), 2),
      y: round(clamp(yValue(py), Y_DOMAIN[0], Y_DOMAIN[1]), 2),
    };
  };

  React.useEffect(() => {
    const move = (event) => {
      if (dragIndex === null) return;
      const point = toDataPoint(event.clientX, event.clientY);
      onCentroidsChange((current) => current.map((centroid, index) => index === dragIndex ? point : centroid));
    };
    const up = () => setDragIndex(null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragIndex]);

  const handlePlotClick = (event) => {
    if (event.target.closest("[data-handle='centroid']")) return;
    onAddPoint(toDataPoint(event.clientX, event.clientY));
  };

  const ticksX = Array.from({ length: 9 }, (_, i) => i);
  const ticksY = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div className="plot-wrap surface">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        role="img"
        aria-label="Interaktivni graf za klasteriranje metodom K-sredina"
        onClick={handlePlotClick}
      >
        <rect className="plot-bg" x="0" y="0" width={SVG_W} height={SVG_H} />
        <g className="grid">
          {ticksX.map((tick) => (
            <line key={`cx-${tick}`} x1={xScale(tick)} x2={xScale(tick)} y1={PAD.top} y2={SVG_H - PAD.bottom} />
          ))}
          {ticksY.map((tick) => (
            <line key={`cy-${tick}`} x1={PAD.left} x2={SVG_W - PAD.right} y1={yScale(tick)} y2={yScale(tick)} />
          ))}
        </g>
        <line className="axis" x1={PAD.left} x2={SVG_W - PAD.right} y1={yScale(0)} y2={yScale(0)} />
        <line className="axis" x1={xScale(0)} x2={xScale(0)} y1={PAD.top} y2={SVG_H - PAD.bottom} />
        <g className="ticks">
          {ticksX.map((tick) => (
            <text key={`ctx-${tick}`} x={xScale(tick)} y={SVG_H - 42}>{tick}</text>
          ))}
          {ticksY.map((tick) => (
            <text key={`cty-${tick}`} x={PAD.left - 18} y={yScale(tick) + 4}>{tick}</text>
          ))}
        </g>
        <text className="axis-label" x={SVG_W - 132} y={SVG_H - 18}>atribut 1</text>
        <text className="axis-label" x={PAD.left + 62} y={42}>atribut 2</text>

        {showClusterLines && points.map((point, index) => {
          const centroid = centroids[assignments[index]];
          if (!centroid) return null;
          return (
            <line
              key={`link-${index}`}
              className={`cluster-link cluster-stroke-${assignments[index]}`}
              x1={xScale(point.x)}
              y1={yScale(point.y)}
              x2={xScale(centroid.x)}
              y2={yScale(centroid.y)}
            />
          );
        })}

        {points.map((point, index) => (
          <g key={`cluster-point-${index}`} className={`cluster-point cluster-fill-${assignments[index]}`}>
            <circle cx={xScale(point.x)} cy={yScale(point.y)} r="8" />
          </g>
        ))}

        {centroids.map((centroid, index) => (
          <g
            key={`centroid-${index}`}
            data-handle="centroid"
            className={`centroid cluster-fill-${index}`}
            onPointerDown={(event) => {
              event.preventDefault();
              setDragIndex(index);
            }}
          >
            <circle cx={xScale(centroid.x)} cy={yScale(centroid.y)} r="17" />
            <path d={`M ${xScale(centroid.x) - 8} ${yScale(centroid.y)} L ${xScale(centroid.x) + 8} ${yScale(centroid.y)} M ${xScale(centroid.x)} ${yScale(centroid.y) - 8} L ${xScale(centroid.x)} ${yScale(centroid.y) + 8}`} />
            <text x={xScale(centroid.x)} y={yScale(centroid.y) - 24}>C{index + 1}</text>
          </g>
        ))}
      </svg>
      <div className="plot-footer">
        <span>Klik u graf dodaje točku.</span>
        <span>Povuci središte ili pokreni korak metode K-sredina.</span>
      </div>
    </div>
  );
}

function HuggingFaceLinks() {
  const resources = [
    {
      label: "Maskiranje osobnih podataka",
      title: "Automatsko sakrivanje osobnih podataka",
      href: "https://huggingface.co/ai4privacy/llama-ai4privacy-english-anonymiser-openpii",
      description: "Model za redakciju osobnih podataka u tekstu. Dobar primjer za razgovor o privatnosti, označavanju dijelova teksta i tome zašto detekciju osobnih podataka treba dodatno provjeriti prije produkcije.",
      meta: "tekst · redakcija · osobni podaci",
    },
    {
      label: "Prepoznavanje entiteta",
      title: "Pronalaženje osobnih podataka u tekstu",
      href: "https://huggingface.co/DataFog/pii-small-en",
      description: "Kompaktan model za prepoznavanje imenovanih entiteta i pronalaženje osobnih podataka u tekstu. Dobar za objasniti razliku između detekcije entiteta i samog maskiranja.",
      meta: "tekst · entiteti · privatnost",
    },
    {
      label: "Procjena dobi",
      title: "Procjena dobi iz slike lica",
      href: "https://huggingface.co/Sharris/age_detection_regression",
      description: "Model koji procjenjuje dob osobe iz slike lica. Koristan kao primjer računalnog vida, regresije i etičkog pitanja: kada je procjena dobi opravdana, a kada postaje rizična.",
      meta: "slika · regresija · dob",
    },
    {
      label: "Segmentacija slike",
      title: "Podjela slike na semantičke regije",
      href: "https://huggingface.co/facebook/mask2former-swin-tiny-cityscapes-semantic",
      description: "Model koji dijeli sliku na semantičke regije. Koristan za objašnjenje da model ne vraća jednu oznaku za cijelu sliku, nego predikciju po pikselima.",
      meta: "slika · pikseli · segmentacija",
    },
  ];

  return (
    <section className="module" id="huggingface">
      <div className="module-head">
        <span className="module-num">03</span>
        <div className="module-title">
          <span className="kicker">Primjeri modela</span>
          <h2>Primjeri s platforme Hugging Face</h2>
          <p className="module-summary">
            Primjeri za raspravu: redakcija osobnih podataka, prepoznavanje osobnih podataka, procjena dobi i segmentacija slike.
          </p>
        </div>
        <div className="module-pattern">
          <span className="on">privatnost</span>
          <span className="on">vid</span>
          <span>etika</span>
        </div>
      </div>

      <div className="resource-grid">
        {resources.map((resource) => (
          <a key={resource.href} className="resource-card" href={resource.href} target="_blank" rel="noreferrer">
            <span className="kicker">{resource.label}</span>
            <h3>{resource.title}</h3>
            <p>{resource.description}</p>
            <span className="resource-meta">{resource.meta}</span>
          </a>
        ))}
      </div>
      <p className="resource-note">
        Napomena: primjere treba tretirati kao demonstracije. Ne unositi stvarne osobne podatke i ne koristiti fotografije osoba bez jasne privole.
      </p>
    </section>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
