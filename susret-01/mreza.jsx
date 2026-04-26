// Mreža pojmova — Venn-style concept network with timeline + drag chips
// + Signalna ploča (sliders → live distribution across categories)

const D = window.UISuputnikData;

const REGION_SHAPES = {
  ai: { type: "rect", x: 40, y: 82, w: 720, h: 478, rx: 28 },
  expert: { type: "ellipse", cx: 160, cy: 320, rx: 95, ry: 130 },
  ml: { type: "ellipse", cx: 510, cy: 340, rx: 230, ry: 180 },
  dl: { type: "ellipse", cx: 530, cy: 380, rx: 150, ry: 110 },
  genai: { type: "ellipse", cx: 470, cy: 410, rx: 75, ry: 60 },
  nlp: { type: "ellipse", cx: 380, cy: 510, rx: 320, ry: 50, rot: -3 },
  automation: { type: "rect", x: 8, y: 8, w: 200, h: 56, rx: 10 },
};

const DROP_REGION_PRIORITY = ["genai", "dl", "ml", "expert", "nlp", "automation", "ai"];

function pointInShape(shape, x, y) {
  if (shape.type === "rect") {
    return x >= shape.x && x <= shape.x + shape.w && y >= shape.y && y <= shape.y + shape.h;
  }

  const angle = -((shape.rot || 0) * Math.PI) / 180;
  const dx = x - shape.cx;
  const dy = y - shape.cy;
  const px = dx * Math.cos(angle) - dy * Math.sin(angle);
  const py = dx * Math.sin(angle) + dy * Math.cos(angle);
  return (px * px) / (shape.rx * shape.rx) + (py * py) / (shape.ry * shape.ry) <= 1;
}

function regionsAtPoint(x, y) {
  return DROP_REGION_PRIORITY.filter((id) => pointInShape(REGION_SHAPES[id], x, y));
}

function ConceptVenn({ selected, onSelect, hovered, onHover, onStageDragOver, onStageDrop, dragOverRegion, placedChips, activeIds }) {
  const isHL = (id) => selected === id || hovered === id;
  const isActive = (id) => !activeIds || activeIds.includes(id);

  const regionProps = (id, color) => ({
    isHL: isHL(id),
    isActive: isActive(id),
    onSelect, onHover, dragOverRegion,
    color,
  });

  return (
    <div className="mreza-stage" onDragOver={onStageDragOver} onDrop={onStageDrop}>
      <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
        {/* UI universe — big rounded rectangle */}
        <RegionShape id="ai" shape={REGION_SHAPES.ai} {...regionProps("ai", "#3a3526")} />
        <text x="400" y="116" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="22" fill="#3a3526" opacity={isActive("ai") ? 0.85 : 0.25}>Umjetna inteligencija</text>

        {/* Symbolic UI / Expert — left side, inside UI but outside strojno učenje */}
        <RegionShape id="expert" shape={REGION_SHAPES.expert} {...regionProps("expert", "#2a5d57")} />
        <text x="160" y="240" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="16" fill="#2a5d57" opacity={isActive("expert") ? 1 : 0.25}>Simbolička UI</text>
        <text x="160" y="380" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#2a5d57" opacity={isActive("expert") ? 0.75 : 0.25}>ekspertni sustavi</text>
        <text x="160" y="396" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#2a5d57" opacity={isActive("expert") ? 0.75 : 0.25}>pravila + znanje</text>

        {/* Strojno učenje — large oval right side */}
        <RegionShape id="ml" shape={REGION_SHAPES.ml} {...regionProps("ml", "#6b4f1d")} />
        <text x="510" y="205" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="22" fill="#6b4f1d" opacity={isActive("ml") ? 1 : 0.25}>Strojno učenje</text>
        <text x="510" y="224" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#6b4f1d" opacity={isActive("ml") ? 0.7 : 0.25}>učenje iz podataka</text>

        {/* Duboko učenje — inside strojno učenje */}
        <RegionShape id="dl" shape={REGION_SHAPES.dl} {...regionProps("dl", "#5c3d8a")} />
        <text x="530" y="338" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="17" fill="#5c3d8a" opacity={isActive("dl") ? 1 : 0.25}>Duboko učenje</text>
        <text x="530" y="354" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#5c3d8a" opacity={isActive("dl") ? 0.7 : 0.25}>neuronske mreže</text>

        {/* Generativna UI — inside duboko učenje, lower-left */}
        <RegionShape id="genai" shape={REGION_SHAPES.genai} {...regionProps("genai", "#8a3a1f")} />
        <text x="470" y="408" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14" fill="#8a3a1f" opacity={isActive("genai") ? 1 : 0.25}>Generativna UI</text>
        <text x="470" y="424" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#8a3a1f" opacity={isActive("genai") ? 0.7 : 0.25}>transformeri · GAN · VAE</text>

        {/* Obrada jezika — long oval that overlaps expert + strojno/duboko/generativno */}
        <RegionShape id="nlp" shape={REGION_SHAPES.nlp} {...regionProps("nlp", "#1a4a8a")} />
        <text x="100" y="538" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14" fill="#1a4a8a" opacity={isActive("nlp") ? 1 : 0.25}>Obrada jezika — područje primjene</text>

        {/* Automation — outside UI universe, top-left corner */}
        <RegionShape id="automation" shape={REGION_SHAPES.automation} {...regionProps("automation", "#6f6754")} />
        <text x="20" y="32" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14" fill="#6f6754" opacity={isActive("automation") ? 1 : 0.25}>automatizacija</text>
        <text x="20" y="50" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#6f6754" opacity={isActive("automation") ? 0.7 : 0.25}>izvan UI · pravila ručno</text>

        {/* Render placed chips on top */}
        {placedChips.map((p) => (
          <PlacedChipMarker key={p.id} placed={p} chip={D.exampleChips.find(c => c.id === p.id)} />
        ))}
      </svg>
    </div>
  );
}

function RegionShape({ id, shape, color, isHL, isActive, onSelect, onHover, dragOverRegion }) {
  const isOver = dragOverRegion === id;
  const baseFill = isActive ? (isHL ? 0.18 : (isOver ? 0.22 : 0.07)) : 0.025;
  const baseStroke = isActive ? (isHL || isOver ? 1 : 0.55) : 0.18;
  const strokeWidth = isHL || isOver ? 2.5 : 1.4;

  const props = {
    fill: color,
    fillOpacity: baseFill,
    stroke: color,
    strokeWidth,
    strokeOpacity: baseStroke,
    style: { cursor: "pointer", transition: "fill-opacity 220ms ease, stroke-opacity 220ms ease, stroke-width 180ms ease" },
    onClick: () => onSelect(id),
    onMouseEnter: () => onHover(id),
    onMouseLeave: () => onHover(null),
  };

  if (shape.type === "rect") {
    return <rect x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={shape.rx} {...props} />;
  }
  return (
    <ellipse cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry}
      transform={shape.rot ? `rotate(${shape.rot} ${shape.cx} ${shape.cy})` : undefined}
      {...props} />
  );
}

function PlacedChipMarker({ placed, chip }) {
  if (!chip) return null;
  return (
    <g transform={`translate(${placed.x}, ${placed.y})`}>
      <rect x={-4} y={-12} rx={4}
        width={chip.label.length * 6.5 + 14} height={20}
        fill={placed.correct ? "#2f6b3a" : "#8a3a1f"} />
      <text x={3} y={2} fontFamily="JetBrains Mono, monospace" fontSize="10" fill="white" alignmentBaseline="middle">
        {chip.label}
      </text>
    </g>
  );
}

// === Mreža container ===
function MrezaPanel() {
  const [selected, setSelected] = React.useState("ai");
  const [hovered, setHovered] = React.useState(null);
  const [placedChips, setPlacedChips] = React.useState([]);
  const [dragOverRegion, setDragOverRegion] = React.useState(null);
  const [draggingChipId, setDraggingChipId] = React.useState(null);

  // Timeline — controls which regions are "active" (full opacity)
  const [eraIdx, setEraIdx] = React.useState(0); // default: first era
  const era = D.vennEras[eraIdx];

  const detail = D.concepts[selected];

  const selectEra = (nextIdx) => {
    const nextEra = D.vennEras[nextIdx];
    setEraIdx(nextIdx);
    if (nextEra?.selected) setSelected(nextEra.selected);
  };

  const selectConcept = (conceptId) => {
    setSelected(conceptId);
    const matchingEraIdx = D.vennEras.findIndex((e) => e.selected === conceptId);
    if (matchingEraIdx >= 0) {
      setEraIdx(matchingEraIdx);
      return;
    }

    const firstActiveEraIdx = D.vennEras.findIndex((e) => e.active.includes(conceptId));
    if (firstActiveEraIdx >= 0) setEraIdx(firstActiveEraIdx);
  };

  const validRegions = (chip) => {
    const r = chip.region;
    if (r === "ml") return ["ml"];
    if (r === "dl") return ["dl", "ml"];
    if (r === "nlp") return ["nlp"];
    if (r === "nlp-dl") return ["nlp", "dl"];
    if (r === "expert") return ["expert"];
    if (r === "expert-nlp") return ["expert", "nlp"];
    if (r === "automation") return ["automation"];
    if (r === "genai") return ["genai", "dl"];
    if (r === "genai-nlp") return ["genai", "nlp", "dl"];
    return [r];
  };

  const svgPointFromEvent = (e) => {
    const svg = e.currentTarget.querySelector("svg");
    const rect = svg.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 800,
      y: ((e.clientY - rect.top) / rect.height) * 600,
    };
  };

  const pickDropRegion = (chip, x, y) => {
    const hits = regionsAtPoint(x, y);
    const valid = validRegions(chip);
    return hits.find((id) => valid.includes(id)) || hits[0] || null;
  };

  const handleStageDragOver = (e) => {
    e.preventDefault();
    const chip = D.exampleChips.find((c) => c.id === draggingChipId);
    const { x, y } = svgPointFromEvent(e);
    const regionId = chip ? pickDropRegion(chip, x, y) : regionsAtPoint(x, y)[0];
    setDragOverRegion(regionId || null);
  };

  const handleStageDrop = (e) => {
    e.preventDefault();
    const chipId = e.dataTransfer.getData("text/plain") || draggingChipId;
    const chip = D.exampleChips.find((c) => c.id === chipId);
    if (!chip) return;
    const { x, y } = svgPointFromEvent(e);
    const regionId = pickDropRegion(chip, x, y);
    if (!regionId) return;
    const ok = validRegions(chip).includes(regionId);
    setPlacedChips((prev) => [...prev.filter((p) => p.id !== chipId), { id: chipId, x, y, correct: ok }]);
    setDragOverRegion(null);
    setDraggingChipId(null);
  };

  const handleChipDragStart = (e, id) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "copy";
    setDraggingChipId(id);
  };

  const handleChipDragEnd = () => {
    setDraggingChipId(null);
    setDragOverRegion(null);
  };

  const resetChips = () => setPlacedChips([]);

  return (
    <>
      <div className="mreza">
        <div>
          <ConceptVenn
            selected={selected}
            onSelect={selectConcept}
            hovered={hovered}
            onHover={setHovered}
            onStageDragOver={handleStageDragOver}
            onStageDrop={handleStageDrop}
            dragOverRegion={dragOverRegion}
            placedChips={placedChips}
            activeIds={era.active}
          />

          {/* Timeline below the diagram */}
          <div className="venn-timeline">
            <div className="venn-timeline-head">
              <span className="kicker">Vremenska linija</span>
              <span className="venn-era-label">
                <strong>{era.year}</strong> · {era.label}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={D.vennEras.length - 1}
              step="1"
              value={eraIdx}
              onChange={(e) => selectEra(Number(e.target.value))}
              className="venn-slider"
            />
            <div className="venn-ticks">
              {D.vennEras.map((e, i) => (
                <button key={e.id} className={`venn-tick ${i === eraIdx ? "on" : ""}`} onClick={() => selectEra(i)}>
                  {e.year}
                </button>
              ))}
            </div>
            <p className="venn-era-note">{era.note}</p>
          </div>
        </div>

        <div className="mreza-detail">
          <div className="mreza-card">
            <span className="kicker kicker--accent">{detail.kicker}</span>
            <h3 style={{ marginTop: 6 }}>{detail.title}</h3>
            <span className="relation">{detail.relation}</span>
            <p className="desc">{detail.desc}</p>
            <dl className="mreza-rows">
              <div className="mreza-row"><dt>Primjer</dt><dd>{detail.example}</dd></div>
              <div className="mreza-row"><dt>Nije isto</dt><dd>{detail.contrast}</dd></div>
              <div className="mreza-row"><dt>Ključno pitanje</dt><dd><em>{detail.pitanje}</em></dd></div>
            </dl>
          </div>
          <div className="mreza-hint">
            Klikni regiju za detalje · povuci primjer iz banke ispod u regiju
          </div>
        </div>
      </div>

      <div className="bench">
        <div className="bench-label">
          <h4 style={{ margin: 0, color: "var(--ink-2)" }}>Primjeri za smještaj</h4>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span className="kicker">{placedChips.length} / {D.exampleChips.length} smješteno</span>
            <button className="btn btn--ghost" onClick={resetChips} style={{ padding: "6px 10px" }}>Resetiraj</button>
          </div>
        </div>
        <div className="bench-chips">
          {D.exampleChips.map((c) => {
            const placed = placedChips.find((p) => p.id === c.id);
            return (
              <span
                key={c.id}
                className={`chip ${placed ? (placed.correct ? "placed" : "placed-wrong") : ""}`}
                draggable={!placed || !placed.correct}
                onDragStart={(e) => handleChipDragStart(e, c.id)}
                onDragEnd={handleChipDragEnd}
                title={placed ? (placed.correct ? "U pravoj regiji" : "Probaj još jednom") : "Povuci u regiju na mapi"}
              >
                {c.label}
              </span>
            );
          })}
        </div>
      </div>
    </>
  );
}

// === Signalna ploča — sliders → distribution ===
function SignalnaPloca() {
  const [signals, setSignals] = React.useState({
    rules: 70,
    learning: 30,
    complex: 20,
    language: 10,
    history: 40,
  });

  const update = (key, val) => setSignals((s) => ({ ...s, [key]: Number(val) }));

  const dist = React.useMemo(() => {
    const { rules, learning, complex, language, history } = signals;
    const raw = {
      "Nije UI": Math.max(0, 30 - learning * 0.3 - complex * 0.3 - language * 0.4 - rules * 0.1),
      "Automatizacija": Math.max(0, rules * 0.9 - learning * 0.5 - complex * 0.3 - language * 0.4),
      "Ekspertni": Math.max(0, rules * 0.7 + (rules > 60 ? 20 : 0) - learning * 0.6 - complex * 0.5 - language * 0.3),
      "Strojno učenje": Math.max(0, learning * 1.0 + history * 0.3 - complex * 0.3 - language * 0.4),
      "Duboko učenje": Math.max(0, learning * 0.5 + complex * 1.0 - rules * 0.3 - language * 0.2),
      "Obrada jezika": Math.max(0, language * 1.2 + (learning * 0.2)),
    };
    const total = Object.values(raw).reduce((a, b) => a + b, 0) || 1;
    const pct = {};
    for (const k in raw) pct[k] = Math.round((raw[k] / total) * 100);
    return pct;
  }, [signals]);

  const lead = React.useMemo(() => {
    let max = -1, name = "";
    for (const k in dist) if (dist[k] > max) { max = dist[k]; name = k; }
    return name;
  }, [dist]);

  const sliderRows = [
    { key: "rules", label: "Ručno napisana pravila" },
    { key: "learning", label: "Učenje iz primjera" },
    { key: "complex", label: "Slike, govor, složeni uzorci" },
    { key: "language", label: "Jezik / tekst kao primarni objekt" },
    { key: "history", label: "Povijesni podaci za predviđanje" },
  ];

  return (
    <div className="signals">
      <div>
        <span className="kicker kicker--accent">Mijenjaj</span>
        <h3 style={{ marginTop: 6 }}>Signalna ploča</h3>
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 4, marginBottom: 16 }}>
          Pomiči klizače za zamišljeni sustav. Distribucija desno pokazuje koliko sliči svakoj kategoriji — ne samo koja "pobjeđuje".
        </p>
        {sliderRows.map((row) => (
          <div className="slider-row" key={row.key}>
            <label>
              <span>{row.label}</span>
              <span className="val">{signals[row.key]}</span>
            </label>
            <input
              type="range"
              min="0" max="100"
              value={signals[row.key]}
              onChange={(e) => update(row.key, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div>
        <span className="kicker">Distribucija sličnosti</span>
        <h3 style={{ marginTop: 6, marginBottom: 14 }}>Najbliža kategorija: <em style={{ color: "var(--accent)", fontStyle: "normal" }}>{lead}</em></h3>
        <div className="distribution">
          {Object.entries(dist).map(([name, pct]) => (
            <div className={`dist-row ${name === lead ? "lead" : ""}`} key={name}>
              <span className={`name ${name === lead ? "lead" : ""}`}>{name}</span>
              <span className="dist-bar"><i style={{ width: `${pct}%` }}></i></span>
              <span className="pct">{pct}%</span>
            </div>
          ))}
        </div>
        <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 14, fontFamily: "var(--mono)" }}>
          ↳ U realnom sustavu klasifikator nikad nema "pobjeđuje sve" — postoji distribucija sličnosti.
        </p>
      </div>
    </div>
  );
}

window.MrezaPanel = MrezaPanel;
window.SignalnaPloca = SignalnaPloca;
