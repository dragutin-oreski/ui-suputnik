// Turing dual-window chat — REFRAMED: A/B persuasiveness, not human/machine.
// + Chinese Room rule assembler
const D3 = window.UISuputnikData;

// Shuffle helper
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function TuringPanel() {
  const [qid, setQid] = React.useState(null);
  const [verdict, setVerdict] = React.useState(null);
  const [revealed, setRevealed] = React.useState(false);
  // Randomize which side shows the "better" answer
  const [betterSide, setBetterSide] = React.useState("A");

  const pickQ = (id) => {
    setQid(id);
    setVerdict(null);
    setRevealed(false);
    setBetterSide(Math.random() > 0.5 ? "A" : "B");
  };

  const q = D3.turingQuestions.find((x) => x.id === qid);
  // Map A/B sides to a_text/b_text based on betterSide
  const aIsBetter = betterSide === "A";
  const aText = q ? (aIsBetter ? q.a_text : q.b_text) : null;
  const bText = q ? (aIsBetter ? q.b_text : q.a_text) : null;
  const aLabel = q ? (aIsBetter ? q.a_label : q.b_label) : null;
  const bLabel = q ? (aIsBetter ? q.b_label : q.a_label) : null;

  return (
    <div className="tcard">
      <span className="kicker kicker--accent">A · Turingov ispit (preokrenut)</span>
      <h3 style={{ marginTop: 6 }}>Koji odgovor više otkriva razumijevanje?</h3>
      <p className="sub">
        Oba odgovora generirao je sustav. Pravo pitanje nije <em>tko je čovjek</em> — nego je li tvoje pitanje uopće dovoljno dobro da napravi razliku.
      </p>

      <span className="kicker">Odaberi pitanje</span>
      <div className="q-picker">
        {D3.turingQuestions.map((x) => (
          <button
            key={x.id}
            className={`q-option ${qid === x.id ? "active" : ""}`}
            onClick={() => pickQ(x.id)}
          >
            {x.q}
            <span className="what">testira: {x.probes}</span>
          </button>
        ))}
      </div>

      {q && (
        <div className="turing-room">
          <div className="turing-tabs">
            <div className="turing-tab">Odgovor A</div>
            <div className="turing-tab">Odgovor B</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div className="turing-window">
              <span className="turing-msg you">Pitanje: {q.q}</span>
              <span className="turing-msg them">{aText}</span>
            </div>
            <div className="turing-window">
              <span className="turing-msg you">Pitanje: {q.q}</span>
              <span className="turing-msg them">{bText}</span>
            </div>
          </div>

          {!revealed && (
            <>
              <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 12, fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Koji odgovor jače otkriva razumijevanje?
              </p>
              <div className="verdict">
                <button onClick={() => { setVerdict("A"); setRevealed(true); }}>Odgovor A</button>
                <button onClick={() => { setVerdict("B"); setRevealed(true); }}>Odgovor B</button>
                <button onClick={() => { setVerdict("tie"); setRevealed(true); }} style={{ gridColumn: "1 / -1" }}>Ne mogu razlikovati</button>
              </div>
            </>
          )}

          {revealed && (
            <div className="reveal">
              {q.better === "tie" ? (
                <strong>Nema "bolje" strane — pitanje ne pravi razliku.</strong>
              ) : (
                <strong>
                  {(verdict === "tie") ? "Ipak postoji razlika — " : (verdict === betterSide ? "Tako je — " : "Nije tako — ")}
                  {betterSide === "A" ? "odgovor A" : "odgovor B"} je dijagnostički jači
                  {" "}({aIsBetter ? q.a_label.toLowerCase() : q.b_label.toLowerCase()}).
                </strong>
              )}
              <p style={{ marginTop: 8 }}><em>Zašto:</em> {q.diagnostic_note}</p>
              {!q.diagnostic && (
                <p style={{ marginTop: 8, color: "var(--rust)", fontFamily: "var(--mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  ⚠ Ovo pitanje nije dijagnostično — pokušaj s drugim.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ChineseRoom() {
  const [shelfRules, setShelfRules] = React.useState(D3.ruleCards);
  const [roomRules, setRoomRules] = React.useState([]);
  const [over, setOver] = React.useState(false);
  const [input, setInput] = React.useState("Molim hitno trebam pomoć oko cijene");
  const [output, setOutput] = React.useState(null);
  const [showGaps, setShowGaps] = React.useState(false);

  const onDragStart = (e, id) => {
    e.dataTransfer.setData("text/plain", id);
  };
  const onDropRoom = (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    const rule = shelfRules.find((r) => r.id === id) || roomRules.find((r) => r.id === id);
    if (!rule) return;
    if (roomRules.find((r) => r.id === id)) return;
    setRoomRules((r) => [...r, rule]);
    setShelfRules((s) => s.filter((r) => r.id !== id));
    setOver(false);
  };
  const removeFromRoom = (id) => {
    const rule = roomRules.find((r) => r.id === id);
    if (!rule) return;
    setRoomRules((r) => r.filter((x) => x.id !== id));
    setShelfRules((s) => [...s, rule]);
  };

  const send = () => {
    if (!roomRules.length) {
      setOutput({ ans: "(soba nema pravila — nema odgovora)", trace: [], fired: [] });
      return;
    }
    const text = input.toLowerCase();
    const fired = [];
    const ans = [];
    for (const r of roomRules) {
      let match = false;
      if (r.id === "r-hitno" && text.includes("hitno")) match = true;
      else if (r.id === "r-molim" && text.includes("molim")) match = true;
      else if (r.id === "r-cijena" && text.includes("cijen")) match = true;
      else if (r.id === "r-pomoc" && (text.includes("pomoć") || text.includes("pomoc"))) match = true;
      else if (r.id === "r-pozdrav" && (text.includes("bok") || text.includes("pozdrav"))) match = true;
      if (match) { fired.push(r.id); ans.push(r.then); }
    }
    if (!fired.length && roomRules.find((r) => r.id === "r-default")) {
      fired.push("r-default");
      ans.push(roomRules.find((r) => r.id === "r-default").then);
    }
    setOutput({
      ans: ans.length ? ans.join(" ") : "(nijedno pravilo nije aktivirano)",
      fired,
    });
  };

  return (
    <div className="tcard">
      <span className="kicker kicker--accent">B · Kineska soba</span>
      <h3 style={{ marginTop: 6 }}>Sklopi sobu od pravila. Pošalji poruku.</h3>
      <p className="sub">Soba ne razumije. Ona samo izvršava pravila. Tvoj posao je vidjeti gdje to izgleda kao razumijevanje, a gdje pukne.</p>

      <div className="room-stage" onDragOver={(e) => e.preventDefault()}>
        <div className="rule-shelf">
          <h5>Polica pravila</h5>
          {shelfRules.length === 0 && (
            <p style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>Sva pravila su u sobi.</p>
          )}
          {shelfRules.map((r) => (
            <div key={r.id} className="rule" draggable onDragStart={(e) => onDragStart(e, r.id)}>
              <span className="if">AKO {r.iff}</span>
              <span className="then">→ {r.then}</span>
            </div>
          ))}
        </div>
        <div
          className={`rule-room ${over ? "over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={onDropRoom}
        >
          <h5>Soba (povuci pravila ovdje)</h5>
          {roomRules.length === 0 && (
            <p style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>Soba je prazna. Bez pravila nema odgovora.</p>
          )}
          {roomRules.map((r) => (
            <div
              key={r.id}
              className={`rule ${output?.fired.includes(r.id) ? "fired" : ""}`}
              onClick={() => removeFromRoom(r.id)}
              title="Klik = vrati na policu"
              style={{ cursor: "pointer" }}
            >
              <span className="if">AKO {r.iff}</span>
              <span className="then">→ {r.then}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="room-input-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Poruka u sobu…"
        />
        <button className="btn" onClick={send}>Pošalji</button>
      </div>

      {output && (
        <div className="room-output">
          <div className="ans">"{output.ans}"</div>
          <div className="trace">
            Aktivirana pravila: {output.fired.length ? output.fired.join(", ") : "—"}
          </div>
        </div>
      )}

      <div className={`understand-toggle ${showGaps ? "on" : ""}`}>
        <span className="pill" onClick={() => setShowGaps((v) => !v)}></span>
        <span>Pokaži što soba <strong>nije</strong> razumjela</span>
      </div>

      {showGaps && (
        <ul className="gap-list" style={{ listStyle: "none", padding: 0 }}>
          {D3.understandingGaps.map((g, i) => <li key={i}>{g}</li>)}
        </ul>
      )}
    </div>
  );
}

window.TuringPanel = TuringPanel;
window.ChineseRoom = ChineseRoom;
