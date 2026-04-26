// Sortirnica — drag-to-bin classifier with live confusion matrix
const D2 = window.UISuputnikData;

function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Sortirnica({ showConfusion = true }) {
  const [placements, setPlacements] = React.useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("ui-suputnik-placements-v2") || "{}");
      // Drop any stale IDs that no longer exist in current quizItems
      const valid = {};
      Object.entries(raw).forEach(([qid, cat]) => {
        if (D2.quizItems.find((q) => q.id === qid)) valid[qid] = cat;
      });
      return valid;
    } catch { return {}; }
  });
  const [overBin, setOverBin] = React.useState(null);
  const [lastFeedback, setLastFeedback] = React.useState(null);
  // Shuffle order on mount so examples don't always appear in same sequence
  const [order, setOrder] = React.useState(() => shuffleArr(D2.quizItems).map(q => q.id));

  React.useEffect(() => {
    localStorage.setItem("ui-suputnik-placements-v2", JSON.stringify(placements));
  }, [placements]);

  const onDragStart = (e, qid) => {
    e.dataTransfer.setData("text/plain", qid);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDrop = (e, binId) => {
    e.preventDefault();
    const qid = e.dataTransfer.getData("text/plain");
    if (!qid) return;
    setPlacements((p) => ({ ...p, [qid]: binId }));
    const item = D2.quizItems.find((q) => q.id === qid);
    setLastFeedback({ item, chosen: binId, correct: item.answer === binId });
    setOverBin(null);
  };

  const reset = () => {
    setPlacements({});
    setLastFeedback(null);
    setOrder(shuffleArr(D2.quizItems).map(q => q.id));
  };

  const orderedItems = order.map(id => D2.quizItems.find(q => q.id === id)).filter(Boolean);
  const unplaced = orderedItems.filter((q) => !placements[q.id]);
  const correctCount = Object.entries(placements).filter(([qid, cat]) => {
    const it = D2.quizItems.find((q) => q.id === qid);
    return it && it.answer === cat;
  }).length;

  const cats = D2.categories;
  const matrix = {};
  cats.forEach((c) => { matrix[c.id] = {}; cats.forEach((c2) => matrix[c.id][c2.id] = 0); });
  Object.entries(placements).forEach(([qid, guessed]) => {
    const it = D2.quizItems.find((q) => q.id === qid);
    if (it) matrix[it.answer][guessed] = (matrix[it.answer][guessed] || 0) + 1;
  });

  return (
    <>
      <div className="sortirnica">
        <div className="sort-pool">
          <h4>Primjeri ({unplaced.length} preostalo)</h4>
          <div className="sort-stack">
            {unplaced.length === 0 && (
              <p style={{ color: "var(--muted)", fontSize: 13, fontFamily: "var(--serif)", fontStyle: "italic" }}>
                Svi su primjeri smješteni. Pogledaj matricu zabune ispod.
              </p>
            )}
            {unplaced.map((q) => (
              <div
                key={q.id}
                className="sort-card"
                draggable
                onDragStart={(e) => onDragStart(e, q.id)}
              >
                <div className="title">{q.title}</div>
                <div className="sig">
                  {q.signals.map((s, i) => <span key={i}>{s}</span>)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="kicker">Točno: {correctCount} / {Object.keys(placements).length || 0}</span>
            <button className="btn btn--ghost" onClick={reset} style={{ padding: "6px 10px" }}>Resetiraj</button>
          </div>
        </div>

        <div>
          <div className="sort-bins">
            {cats.map((cat) => {
              const placedHere = Object.entries(placements).filter(([, c]) => c === cat.id);
              return (
                <div
                  key={cat.id}
                  className={`bin ${overBin === cat.id ? "over" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setOverBin(cat.id); }}
                  onDragLeave={() => { if (overBin === cat.id) setOverBin(null); }}
                  onDrop={(e) => onDrop(e, cat.id)}
                >
                  <h5>
                    <span>{cat.label}</span>
                    <span className="count">{placedHere.length}</span>
                  </h5>
                  <div className="bin-cards">
                    {placedHere.map(([qid]) => {
                      const it = D2.quizItems.find((q) => q.id === qid);
                      const right = it.answer === cat.id;
                      return (
                        <div
                          key={qid}
                          className={`placed-card ${right ? "right" : "wrong"}`}
                          draggable
                          onDragStart={(e) => onDragStart(e, qid)}
                          title={right ? "Točno" : `Bolje: ${cats.find((c) => c.id === it.answer).label}`}
                        >
                          <span className="mark">{right ? "✓" : "×"}</span>
                          <span className="label">{it.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {lastFeedback && (
            <div className="feedback">
              <span className="stamp">{lastFeedback.correct ? "✓" : "!"}</span>
              <div>
                <h4>
                  {lastFeedback.correct
                    ? "Dobra klasifikacija."
                    : `Bolje: ${cats.find((c) => c.id === lastFeedback.item.answer).label}`}
                </h4>
                <p>{lastFeedback.item.feedback}</p>
                <p className="takeaway">↳ {lastFeedback.item.takeaway}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showConfusion && <ConfusionMatrix matrix={matrix} cats={cats} />}
    </>
  );
}

function ConfusionMatrix({ matrix, cats }) {
  const colW = `60px`;
  const cols = `100px repeat(${cats.length}, ${colW})`;
  return (
    <div className="confusion">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <h4 style={{ margin: 0 }}>Matrica zabune</h4>
        <span className="kicker">vraća se u Susretu 15 · mapa grešaka</span>
      </div>
      <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 14, fontFamily: "var(--serif)", fontStyle: "italic" }}>
        Redovi = stvarna kategorija, stupci = tvoja procjena. Dijagonala su pogoci; off-dijagonala otkriva sustavne zablude.
      </p>
      <div className="matrix" style={{ gridTemplateColumns: cols }}>
        <div className="corner"></div>
        {cats.map((c) => <div key={c.id} className="head">{c.short}</div>)}
        {cats.map((rowCat) => (
          <React.Fragment key={rowCat.id}>
            <div className="head row">{rowCat.label}</div>
            {cats.map((colCat) => {
              const n = matrix[rowCat.id][colCat.id];
              const diag = rowCat.id === colCat.id;
              return (
                <div key={colCat.id} className={`cell ${diag ? "diag" : ""} ${n === 0 ? "empty" : ""}`}>
                  <span className="n">{n || "·"}</span>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <div className="matrix-axes">
        <span>↓ stvarno</span>
        <span>tvoja procjena →</span>
      </div>
    </div>
  );
}

window.Sortirnica = Sortirnica;
