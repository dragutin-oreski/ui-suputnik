/* eslint-disable */
const { useMemo, useState } = React;

const makeId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

const createBlankAttribute = () => ({ id: makeId("attr"), label: "", min: 1, max: 5, weight: 1, ideal: "" });
const createBlankCandidate = () => ({ id: makeId("candidate"), name: "", note: "", values: {} });
const createInitialAttributes = () => Array.from({ length: 4 }, createBlankAttribute);
const createInitialCandidates = () => Array.from({ length: 4 }, createBlankCandidate);
const EXAMPLE_ATTRIBUTES = [
  { id: "excel", label: "Excel", min: 1, max: 5, weight: 1, ideal: 5 },
  { id: "python", label: "Python", min: 1, max: 5, weight: 1, ideal: 4 },
  { id: "komunikacija", label: "Komunikacija", min: 1, max: 5, weight: 1, ideal: 5 },
  { id: "timski", label: "Timski rad", min: 1, max: 5, weight: 1, ideal: 4 },
  { id: "problem", label: "Rješavanje problema", min: 1, max: 5, weight: 1, ideal: 5 },
  { id: "pouzdanost", label: "Pouzdanost", min: 1, max: 5, weight: 1, ideal: 5 },
];
const EXAMPLE_CANDIDATES = [
  {
    id: "ana",
    name: "Ana",
    note: "analitična, uredna",
    values: { excel: 5, python: 2, komunikacija: 4, timski: 4, problem: 5, pouzdanost: 5 },
  },
  {
    id: "boris",
    name: "Boris",
    note: "tehnički jak",
    values: { excel: 4, python: 5, komunikacija: 2, timski: 3, problem: 5, pouzdanost: 3 },
  },
  {
    id: "iva",
    name: "Iva",
    note: "dobra s korisnicima",
    values: { excel: 4, python: 2, komunikacija: 5, timski: 5, problem: 3, pouzdanost: 4 },
  },
  {
    id: "marko",
    name: "Marko",
    note: "uravnotežen profil",
    values: { excel: 4, python: 3, komunikacija: 4, timski: 4, problem: 4, pouzdanost: 4 },
  },
];

function cloneRows(rows) {
  return rows.map((row) => ({ ...row, values: { ...(row.values || {}) } }));
}

function App() {
  const [attributes, setAttributes] = useState(createInitialAttributes);
  const [candidates, setCandidates] = useState(createInitialCandidates);
  const [metric, setMetric] = useState("euclidean");
  const [scaled, setScaled] = useState(false);
  const [shortfallOnly, setShortfallOnly] = useState(false);
  const [tableMode, setTableMode] = useState("blank");
  const [selectedCandidateId, setSelectedCandidateId] = useState("");

  const activeAttributes = attributes;
  const ranked = useMemo(
    () => rankCandidates(candidates, activeAttributes, scaled, shortfallOnly),
    [candidates, activeAttributes, scaled, shortfallOnly]
  );
  const sorted = useMemo(
    () => [...ranked].sort((a, b) => metricValue(a, metric) - metricValue(b, metric)),
    [ranked, metric]
  );
  const completeRows = ranked.filter((row) => row.complete).length;
  const selectedCandidate =
    ranked.find((candidate) => candidate.id === selectedCandidateId) ||
    ranked.find((candidate) => candidate.complete) ||
    ranked[0];

  const updateCandidateValue = (candidateId, attributeId, value) => {
    setTableMode("custom");
    setCandidates((items) =>
      items.map((candidate) =>
        candidate.id === candidateId
          ? { ...candidate, values: { ...candidate.values, [attributeId]: value } }
          : candidate
      )
    );
  };

  const updateCandidateText = (candidateId, field, value) => {
    setTableMode("custom");
    setCandidates((items) =>
      items.map((candidate) => (candidate.id === candidateId ? { ...candidate, [field]: value } : candidate))
    );
  };

  const updateAttribute = (attributeId, field, rawValue) => {
    setTableMode("custom");
    setAttributes((items) =>
      items.map((attr) => {
        if (attr.id !== attributeId) return attr;
        if (field === "label" || field === "ideal") return { ...attr, [field]: rawValue };
        const value = Number(rawValue);
        if (Number.isNaN(value)) return attr;
        const next = { ...attr, [field]: value };
        if (field === "min" && next.max <= value) next.max = value + 1;
        if (field === "max" && next.min >= value) next.min = value - 1;
        if (field === "weight") next.weight = Math.min(3, Math.max(0.5, value));
        return next;
      })
    );
  };

  const addCandidate = () => {
    setTableMode("custom");
    const candidate = createBlankCandidate();
    setCandidates((items) => [...items, candidate]);
    setSelectedCandidateId(candidate.id);
  };

  const removeCandidate = (candidateId) => {
    setTableMode("custom");
    setCandidates((items) => items.filter((candidate) => candidate.id !== candidateId));
    if (selectedCandidateId === candidateId) setSelectedCandidateId("");
  };

  const addAttribute = () => {
    setTableMode("custom");
    setAttributes((items) => [...items, createBlankAttribute()]);
  };

  const removeAttribute = (attributeId) => {
    setTableMode("custom");
    setAttributes((items) => items.filter((attr) => attr.id !== attributeId));
    setCandidates((items) =>
      items.map((candidate) => {
        const values = { ...candidate.values };
        delete values[attributeId];
        return { ...candidate, values };
      })
    );
  };

  const clearValues = () => {
    setTableMode("custom");
    setAttributes((items) => items.map((attr) => ({ ...attr, ideal: "" })));
    setCandidates((items) => items.map((candidate) => ({ ...candidate, note: "", values: {} })));
  };

  const resetTemplate = () => {
    setAttributes(createInitialAttributes());
    setCandidates(createInitialCandidates());
    setMetric("euclidean");
    setScaled(false);
    setShortfallOnly(false);
    setTableMode("blank");
    setSelectedCandidateId("");
  };

  const loadExample = () => {
    setAttributes(cloneRows(EXAMPLE_ATTRIBUTES));
    setCandidates(cloneRows(EXAMPLE_CANDIDATES));
    setMetric("euclidean");
    setScaled(false);
    setShortfallOnly(false);
    setTableMode("example");
    setSelectedCandidateId(EXAMPLE_CANDIDATES[0].id);
  };

  const exportExcel = () => {
    downloadExcelWorkbook({
      attributes: activeAttributes,
      candidates,
      ranked,
      scaled,
      shortfallOnly,
    });
  };

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="../">
          <span className="brand-mark">UI</span>
          <span>
            <span className="brand-name">UI Suputnik</span>
            <span className="brand-meta">Susret 08 · Idealni zaposlenik</span>
          </span>
        </a>
        <nav className="topbar-right" aria-label="Navigacija">
          <a href="../susret-07/">← Susret 07</a>
          <a href="../">Svi susreti</a>
        </nav>
      </header>

      <main>
        <section className="hero compact">
          <div>
            <p className="kicker"><span className="dot"></span>Radna tablica</p>
            <h1>Idealni zaposlenik</h1>
          </div>
          <p className="hero-sub">
            Unesite kandidate, atribute i idealni profil. Udaljenosti se računaju automatski, a trenutnu tablicu možete izvesti u Excel.
          </p>
        </section>

        <section className="control-strip" aria-label="Kontrole tablice">
          <div className="actions primary-actions">
            <button onClick={addCandidate}>+ redak</button>
            <button onClick={addAttribute}>+ stupac</button>
            <button className="export" onClick={exportExcel}>Izvezi u Excel</button>
          </div>
          <div className="metric-toggle" aria-label="Metrika za poredak">
            <button className={metric === "euclidean" ? "is-active" : ""} onClick={() => setMetric("euclidean")}>
              Euklidska
            </button>
            <button className={metric === "chebyshev" ? "is-active" : ""} onClick={() => setMetric("chebyshev")}>
              Chebyshev
            </button>
          </div>
          <div className="calc-options">
            <label className="switch">
              <input type="checkbox" checked={scaled} onChange={(event) => setScaled(event.target.checked)} />
              <span>Skaliraj / ponderiraj</span>
            </label>
            <label className="switch">
              <input type="checkbox" checked={shortfallOnly} onChange={(event) => setShortfallOnly(event.target.checked)} />
              <span>Samo manjak</span>
            </label>
          </div>
          <div className="mode-toggle" aria-label="Način rada tablice">
            <button className={tableMode === "blank" ? "is-active" : ""} onClick={resetTemplate}>Prazno</button>
            <button className={tableMode === "example" ? "is-active" : ""} onClick={loadExample}>Primjer</button>
          </div>
          <div className="actions secondary-actions">
            <button className="ghost" onClick={clearValues}>Očisti vrijednosti</button>
            <button className="ghost" onClick={resetTemplate}>Novi prazan grid</button>
          </div>
        </section>

        <section className="table-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Unos</span>
              <h2>Kandidati, atributi i idealni profil</h2>
            </div>
            <span className="table-count">{candidates.length} redaka · {attributes.length} stupaca · {completeRows} izračunato</span>
          </div>

          {attributes.length === 0 && candidates.length === 0 && (
            <div className="start-panel">
              <strong>Tablica je prazna.</strong>
              <span>Dodajte prvi stupac i prvi redak ili vratite novi prazan grid.</span>
              <div>
                <button onClick={addAttribute}>+ prvi stupac</button>
                <button onClick={addCandidate}>+ prvi redak</button>
                <button onClick={resetTemplate}>grid 4 × 4</button>
              </div>
            </div>
          )}

          <div className="table-wrap">
            <table className="candidate-table">
              <thead>
                <tr>
                  <th className="sticky-col">Kandidat</th>
                  <th>Bilješka</th>
                  {attributes.map((attr, attrIndex) => (
                    <th key={attr.id}>
                      <input
                        aria-label={`Naziv atributa ${attr.label}`}
                        className="attribute-name"
                        placeholder="Naziv atributa"
                        value={attr.label}
                        onChange={(event) => updateAttribute(attr.id, "label", event.target.value)}
                      />
                      <button
                        className="mini-control remove"
                        aria-label={`Obriši stupac ${attrIndex + 1}`}
                        title="Obriši stupac"
                        onClick={() => removeAttribute(attr.id)}
                      >
                        −
                      </button>
                      {scaled && (
                        <div className="attribute-meta">
                          <label>
                            min
                            <input type="number" value={attr.min} onChange={(event) => updateAttribute(attr.id, "min", event.target.value)} />
                          </label>
                          <label>
                            max
                            <input type="number" value={attr.max} onChange={(event) => updateAttribute(attr.id, "max", event.target.value)} />
                          </label>
                          <label>
                            važ.
                            <input type="number" min="0.5" max="3" step="0.5" value={attr.weight} onChange={(event) => updateAttribute(attr.id, "weight", event.target.value)} />
                          </label>
                        </div>
                      )}
                    </th>
                  ))}
                  <th className="add-col">
                    <button className="mini-control add" aria-label="Dodaj stupac" title="Dodaj stupac" onClick={addAttribute}>+</button>
                  </th>
                  <th className="calc-col">Euklidska</th>
                  <th className="calc-col">Chebyshev</th>
                  <th className="calc-col">Rang</th>
                  <th>Uredi</th>
                </tr>
              </thead>
              <tbody>
                <tr className="ideal-row">
                  <th className="sticky-col">Idealni</th>
                  <td>referentni profil</td>
                  {attributes.map((attr) => (
                    <td key={attr.id}>
                      <input
                        type="number"
                        min={attr.min}
                        max={attr.max}
                        step="0.5"
                        placeholder="ideal"
                        value={attr.ideal}
                        onChange={(event) => updateAttribute(attr.id, "ideal", event.target.value)}
                      />
                    </td>
                  ))}
                  <td className="add-col-cell"></td>
                  <td className="calc-cell">-</td>
                  <td className="calc-cell">-</td>
                  <td className="calc-cell">-</td>
                  <td><span className="locked">sidro</span></td>
                </tr>
                {candidates.map((candidate, candidateIndex) => {
                  const result = ranked.find((item) => item.id === candidate.id);
                  const rankIndex = sorted.findIndex((item) => item.id === candidate.id);
                  return (
                    <tr
                      key={candidate.id}
                      className={candidate.id === selectedCandidate?.id ? "is-selected" : ""}
                      onClick={() => setSelectedCandidateId(candidate.id)}
                    >
                      <th className="sticky-col">
                        <input
                          placeholder={`Kandidat ${candidateIndex + 1}`}
                          value={candidate.name}
                          onChange={(event) => updateCandidateText(candidate.id, "name", event.target.value)}
                        />
                      </th>
                      <td>
                        <input placeholder="opcionalno" value={candidate.note} onChange={(event) => updateCandidateText(candidate.id, "note", event.target.value)} />
                      </td>
                      {attributes.map((attr) => (
                        <td key={attr.id}>
                          <input
                            type="number"
                            min={attr.min}
                            max={attr.max}
                            step="0.5"
                            value={candidate.values[attr.id] ?? ""}
                            onChange={(event) => updateCandidateValue(candidate.id, attr.id, event.target.value)}
                          />
                        </td>
                      ))}
                      <td className="add-col-cell"></td>
                      <td className="calc-cell">{result?.complete ? formatDistance(result.euclidean) : "-"}</td>
                      <td className="calc-cell">{result?.complete ? formatDistance(result.chebyshev) : "-"}</td>
                      <td className="calc-cell">{result?.complete ? rankIndex + 1 : "-"}</td>
                      <td>
                        <button
                          className="mini-control remove row-remove"
                          aria-label={`Obriši redak ${candidateIndex + 1}`}
                          title="Obriši redak"
                          onClick={() => removeCandidate(candidate.id)}
                        >
                          −
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="table-foot-actions">
            <button onClick={addCandidate}>+ redak</button>
          </div>
        </section>

        <section className="result-grid">
          <article className="rank-section">
            <div className="panel-head">
              <div>
                <span className="eyebrow">Rezultat</span>
                <h2>Poredak kandidata</h2>
              </div>
              <p>
                {shortfallOnly
                  ? "U načinu Samo manjak vrijednost iznad ideala ne povećava udaljenost."
                  : metric === "euclidean"
                    ? "Euklidska mjeri ukupnu udaljenost od ideala."
                    : "Chebyshev mjeri najveću pojedinačnu razliku od ideala."}
              </p>
            </div>
            <div className="rank-list">
              {sorted.filter((candidate) => candidate.complete).map((candidate, index) => {
                const value = metricValue(candidate, metric);
                const max = Math.max(...sorted.filter((item) => item.complete).map((item) => metricValue(item, metric)), 1);
                return (
                  <button
                    className={`rank-row ${candidate.id === selectedCandidate?.id ? "is-selected" : ""}`}
                    key={candidate.id}
                    onClick={() => setSelectedCandidateId(candidate.id)}
                  >
                    <span>{index + 1}</span>
                    <strong>{candidate.name.trim() || `Kandidat ${index + 1}`}</strong>
                    <div className="bar"><i style={{ width: `${Math.max(4, 100 - (value / max) * 86)}%` }}></i></div>
                    <b>{formatDistance(value)}</b>
                  </button>
                );
              })}
              {!completeRows && <p className="empty-note">Dodajte stupce i retke, zatim unesite idealni redak i vrijednosti kandidata za izračun udaljenosti.</p>}
            </div>
          </article>

          <div className="side-results">
            <article className="distance-panel">
              <span className="eyebrow">Doprinos udaljenosti</span>
              {selectedCandidate?.complete ? (
                <>
                  <h2>{selectedCandidate.name.trim() || "Odabrani kandidat"}</h2>
                  <p className="panel-copy">
                    {shortfallOnly
                      ? "U ovom načinu ideal čitamo kao minimalni prag: višak se ne kažnjava, a udaljenost nastaje samo kad kandidat ne doseže dogovorenu razinu."
                      : "Trake pokazuju koliko je iskorišten moguć raspon razlike za taj atribut. Kad je skaliranje uključeno, vidi se i doprinos koji ulazi u izračun distance."}
                  </p>
                  <div className="distance-summary">
                    <div><span>Euklidska</span><strong>{formatDistance(selectedCandidate.euclidean)}</strong></div>
                    <div><span>Chebyshev</span><strong>{formatDistance(selectedCandidate.chebyshev)}</strong></div>
                  </div>
                  <div className="contribution-list">
                    {selectedCandidate.differences.map((item) => (
                      <div className={`contribution-row ${item.isMax ? "is-max" : ""}`} key={item.id}>
                        <div className="contribution-head">
        <strong>{item.label}</strong>
                          {item.isMax && <span>max</span>}
                        </div>
                        <div className="contribution-values">
                          <span>Kandidat {formatCell(item.value)}</span>
                          <span>Ideal {formatCell(item.ideal)}</span>
                          <span>{shortfallOnly ? "Manjak" : "Razlika"} {formatDistance(item.raw)}</span>
                          {scaled && <span>Raspon {formatCell(item.range)}</span>}
                          {scaled && <span>Važ. {formatCell(item.weight)}</span>}
                          <span>Doprinos {formatDistance(item.weighted)}</span>
                        </div>
                        <div className="bar contribution-bar">
                          <i style={{ width: `${Math.max(4, Math.min(100, item.barWidth))}%` }}></i>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="empty-note">Kliknite kandidata nakon što unesete idealni redak i njegove vrijednosti. Ovdje će se vidjeti koji atribut najviše stvara udaljenost.</p>
              )}
            </article>

            <article className="help-panel">
              <span className="eyebrow">Kako koristiti</span>
              <ol>
                <li>Dodajte stupce za atribute koje grupa želi mjeriti.</li>
                <li>U red "Idealni" unesite vrijednosti dogovorenog profila.</li>
                <li>Dodajte retke za kandidate.</li>
                <li>U retke kandidata unesite odgovore iz ankete.</li>
                <li>Usporedite poredak po Euklidskoj i Chebyshev udaljenosti.</li>
                <li>Izvezite tablicu i rezultat u Excel.</li>
              </ol>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}

function rankCandidates(candidates, attributes, scaled, shortfallOnly) {
  const usableAttributes = attributes.filter((attr) => isFiniteNumber(attr.ideal));
  return candidates.map((candidate) => {
    const complete =
      usableAttributes.length > 0 &&
      usableAttributes.every((attr) => isFiniteNumber(candidate.values[attr.id]));
    if (!complete) {
      return { ...candidate, complete: false, euclidean: Number.POSITIVE_INFINITY, chebyshev: Number.POSITIVE_INFINITY };
    }
    const differences = usableAttributes.map((attr, index) => {
      const candidateValue = Number(candidate.values[attr.id]);
      const idealValue = Number(attr.ideal);
      const raw = shortfallOnly ? Math.max(0, idealValue - candidateValue) : Math.abs(candidateValue - idealValue);
      const range = Math.max(1, Number(attr.max) - Number(attr.min));
      const weight = scaled ? Number(attr.weight || 1) : 1;
      const normalized = scaled ? raw / range : raw;
      const weighted = normalized * weight;
      return {
        id: attr.id,
        label: attr.label.trim() || `Atribut ${index + 1}`,
        value: candidateValue,
        ideal: idealValue,
        raw,
        range,
        weight,
        weighted,
        fillRatio: scaled ? Math.min(1, raw / range) : 0,
      };
    });
    const maxWeighted = Math.max(...differences.map((item) => item.weighted), 0);
    const enrichedDifferences = differences
      .map((item) => ({
        ...item,
        isMax: maxWeighted > 0 && item.weighted === maxWeighted,
        barWidth: scaled
          ? item.fillRatio * 100
          : (maxWeighted > 0 ? (item.weighted / maxWeighted) * 100 : 0),
      }))
      .sort((a, b) => b.weighted - a.weighted);
    return {
      ...candidate,
      complete: true,
      differences: enrichedDifferences,
      euclidean: Math.sqrt(differences.reduce((sum, item) => sum + item.weighted ** 2, 0)),
      chebyshev: maxWeighted,
    };
  });
}

function metricValue(candidate, metric) {
  return metric === "euclidean" ? candidate.euclidean : candidate.chebyshev;
}

function isFiniteNumber(value) {
  return value !== "" && value !== null && value !== undefined && Number.isFinite(Number(value));
}

function formatDistance(value) {
  if (!Number.isFinite(value)) return "-";
  return Number(value).toFixed(2);
}

function formatCell(value) {
  if (!Number.isFinite(Number(value))) return "-";
  return Number(value).toLocaleString("hr-HR", { maximumFractionDigits: 2 });
}

function downloadExcelWorkbook({ attributes, candidates, ranked, scaled, shortfallOnly }) {
  const labels = attributes.map((attr, index) => attr.label.trim() || `Atribut ${index + 1}`);
  const attributeStartCol = 4;
  const candidateStartRow = 6;
  const candidateEndRow = candidateStartRow + candidates.length - 1;
  const settingsHeaderRow = candidateStartRow + candidates.length + 1;
  const scalingSettingCell = `$B$${settingsHeaderRow + 1}`;
  const shortfallSettingCell = `$B$${settingsHeaderRow + 2}`;
  const eukCol = columnName(attributeStartCol + attributes.length);
  const chebCol = columnName(attributeStartCol + attributes.length + 1);
  const resultById = Object.fromEntries(ranked.map((row) => [row.id, row]));

  const rows = [
    ["Tip", "Ime", "Bilješka", ...labels, "Euklidska", "Chebyshev", "Rang Euk", "Rang Cheb"],
    ["Idealni", "Idealni", "referentni profil", ...attributes.map((attr) => attr.ideal), "", "", "", ""],
    ["Skaliranje", "Minimum", "", ...attributes.map((attr) => attr.min), "", "", "", ""],
    ["Skaliranje", "Maksimum", "", ...attributes.map((attr) => attr.max), "", "", "", ""],
    ["Skaliranje", "Važnost", "", ...attributes.map((attr) => attr.weight), "", "", "", ""],
    ...candidates.map((candidate, index) => {
      const rowNumber = candidateStartRow + index;
      const euclideanRef = `${eukCol}${rowNumber}`;
      const chebyshevRef = `${chebCol}${rowNumber}`;
      return [
        "Kandidat",
        candidate.name.trim() || `Kandidat ${index + 1}`,
        candidate.note,
        ...attributes.map((attr) => candidate.values[attr.id] ?? ""),
        formulaCell(createDistanceFormula("euclidean", rowNumber, attributes.length, scalingSettingCell, shortfallSettingCell)),
        formulaCell(createDistanceFormula("chebyshev", rowNumber, attributes.length, scalingSettingCell, shortfallSettingCell)),
        formulaCell(createRankFormula(euclideanRef, eukCol, candidateStartRow, candidateEndRow)),
        formulaCell(createRankFormula(chebyshevRef, chebCol, candidateStartRow, candidateEndRow)),
      ];
    }),
    [],
    ["Postavka", "Vrijednost"],
    ["Skaliranje", scaled ? "uključeno" : "isključeno"],
    ["Samo manjak", shortfallOnly ? "uključeno" : "isključeno"],
  ];

  const chartData = {
    candidateStartRow,
    candidateEndRow,
    categories: candidates.map((candidate, index) => candidate.name.trim() || `Kandidat ${index + 1}`),
    euclideanValues: candidates.map((candidate) => resultById[candidate.id]?.euclidean),
    chebyshevValues: candidates.map((candidate) => resultById[candidate.id]?.chebyshev),
    euclideanCol: eukCol,
    chebyshevCol: chebCol,
    chartStartCol: Math.max(attributeStartCol + attributes.length + 6, 9),
  };

  const workbookBytes = createXlsxBytes(rows, chartData);
  const blob = new Blob([workbookBytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `idealni-zaposlenik-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function formulaCell(formula) {
  return { type: "formula", formula };
}

function createDistanceFormula(metric, rowNumber, attributeCount, scalingSettingCell, shortfallSettingCell) {
  if (attributeCount === 0) return `""`;
  const firstAttributeCol = columnName(4);
  const lastAttributeCol = columnName(3 + attributeCount);
  const idealRange = `$${firstAttributeCol}$2:$${lastAttributeCol}$2`;
  const rowRange = `${firstAttributeCol}${rowNumber}:${lastAttributeCol}${rowNumber}`;
  const weightedTerms = Array.from({ length: attributeCount }, (_, index) => {
    const col = columnName(4 + index);
    const rawDifference = `IF(${shortfallSettingCell}="uključeno",MAX(0,${col}$2-${col}${rowNumber}),ABS(${col}${rowNumber}-${col}$2))`;
    return `IF(${scalingSettingCell}="uključeno",(${rawDifference})/MAX(1,${col}$4-${col}$3)*${col}$5,${rawDifference})`;
  });
  const missingGuard = `OR(COUNT(${idealRange})<${attributeCount},COUNT(${rowRange})<${attributeCount})`;
  const distance =
    metric === "euclidean"
      ? `SQRT(SUM(${weightedTerms.map((term) => `(${term})^2`).join(",")}))`
      : `MAX(${weightedTerms.join(",")})`;
  return `IF(${missingGuard},"",${distance})`;
}

function createRankFormula(valueRef, resultCol, startRow, endRow) {
  if (endRow < startRow) return `""`;
  return `IF(${valueRef}="","",RANK.EQ(${valueRef},$${resultCol}$${startRow}:$${resultCol}$${endRow},1))`;
}

function createXlsxBytes(rows, chartData = null) {
  const files = {
    "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/xl/charts/chart1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>
  <Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`,
    "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`,
    "docProps/app.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>UI Suputnik</Application>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
  <HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>1</vt:i4></vt:variant></vt:vector></HeadingPairs>
  <TitlesOfParts><vt:vector size="1" baseType="lpstr"><vt:lpstr>Rezultati</vt:lpstr></vt:vector></TitlesOfParts>
  <Company></Company>
  <LinksUpToDate>false</LinksUpToDate>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>16.0300</AppVersion>
</Properties>`,
    "docProps/core.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Idealni zaposlenik</dc:title>
  <dc:creator>UI Suputnik</dc:creator>
  <cp:lastModifiedBy>UI Suputnik</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:modified>
</cp:coreProperties>`,
    "xl/workbook.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <workbookPr date1904="false"/>
  <bookViews><workbookView xWindow="0" yWindow="0" windowWidth="24000" windowHeight="15000"/></bookViews>
  <sheets>
    <sheet name="Rezultati" sheetId="1" r:id="rId1"/>
  </sheets>
  <calcPr calcMode="auto" fullCalcOnLoad="1" forceFullCalc="1"/>
</workbook>`,
    "xl/_rels/workbook.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
    "xl/worksheets/_rels/sheet1.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/>
</Relationships>`,
    "xl/drawings/drawing1.xml": createDrawingXml(chartData),
    "xl/drawings/_rels/drawing1.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart1.xml"/>
</Relationships>`,
    "xl/charts/chart1.xml": createChartXml(chartData),
    "xl/styles.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <numFmts count="1"><numFmt numFmtId="164" formatCode="0.00"/></numFmts>
  <fonts count="3"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FF0F172A"/><name val="Calibri"/></font></fonts>
  <fills count="6"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1F4E78"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE8F1FA"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFF7D6"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFEAF7EA"/><bgColor indexed="64"/></patternFill></fill></fills>
  <borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFD9E2EC"/></left><right style="thin"><color rgb="FFD9E2EC"/></right><top style="thin"><color rgb="FFD9E2EC"/></top><bottom style="thin"><color rgb="FFD9E2EC"/></bottom><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="7"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/><xf numFmtId="164" fontId="0" fillId="5" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/></cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
  <dxfs count="0"/>
  <tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/>
</styleSheet>`,
    "xl/worksheets/sheet1.xml": createWorksheetXml(rows, Boolean(chartData)),
  };
  return createZip(files);
}

function createWorksheetXml(rows, includeDrawing = false) {
  const sheetRows = rows.map((row, rowIndex) => {
    const cells = row.map((value, colIndex) => createCellXml(value, rowIndex + 1, colIndex + 1, cellStyleId(rowIndex, colIndex, rows)));
    return `<row r="${rowIndex + 1}">${cells.join("")}</row>`;
  });
  const colCount = Math.max(...rows.map((row) => row.length), 1);
  const rowCount = Math.max(rows.length, 1);
  const firstBlankRowIndex = rows.findIndex((row) => row.length === 0);
  const dataEndRow = firstBlankRowIndex === -1 ? rowCount : Math.max(1, firstBlankRowIndex);
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <dimension ref="A1:${columnName(colCount)}${rowCount}"/>
  <sheetViews><sheetView workbookViewId="0"><pane xSplit="3" ySplit="1" topLeftCell="D2" activePane="bottomRight" state="frozen"/><selection pane="bottomRight" activeCell="D2" sqref="D2"/></sheetView></sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <cols>${Array.from({ length: colCount }, (_, index) => `<col min="${index + 1}" max="${index + 1}" width="${columnWidth(index, rows)}" customWidth="1"/>`).join("")}</cols>
  <sheetData>${sheetRows.join("")}</sheetData>
  <autoFilter ref="A1:${columnName(colCount)}${dataEndRow}"/>
  <pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>
  ${includeDrawing ? `<drawing r:id="rId1"/>` : ""}
</worksheet>`;
}

function createDrawingXml(chartData) {
  const startCol = Math.max(0, Number(chartData?.chartStartCol || 14) - 1);
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <xdr:oneCellAnchor>
    <xdr:from><xdr:col>${startCol}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>1</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from>
    <xdr:ext cx="7200000" cy="3600000"/>
    <xdr:graphicFrame macro="">
      <xdr:nvGraphicFramePr><xdr:cNvPr id="2" name="Graf udaljenosti"/><xdr:cNvGraphicFramePr/></xdr:nvGraphicFramePr>
      <xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm>
      <a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart"><c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="rId1"/></a:graphicData></a:graphic>
    </xdr:graphicFrame>
    <xdr:clientData/>
  </xdr:oneCellAnchor>
</xdr:wsDr>`;
}

function createChartXml(chartData) {
  const startRow = chartData?.candidateStartRow || 6;
  const endRow = Math.max(startRow, chartData?.candidateEndRow || startRow);
  const euclideanCol = chartData?.euclideanCol || "J";
  const chebyshevCol = chartData?.chebyshevCol || "K";
  const categoryRange = `'Rezultati'!$B$${startRow}:$B$${endRow}`;
  const euclideanRange = `'Rezultati'!$${euclideanCol}$${startRow}:$${euclideanCol}$${endRow}`;
  const chebyshevRange = `'Rezultati'!$${chebyshevCol}$${startRow}:$${chebyshevCol}$${endRow}`;
  const euclideanTitle = `'Rezultati'!$${euclideanCol}$1`;
  const chebyshevTitle = `'Rezultati'!$${chebyshevCol}$1`;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <c:date1904 val="0"/><c:lang val="hr-HR"/><c:roundedCorners val="0"/>
  <c:chart>
    <c:title><c:tx><c:rich><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="hr-HR" b="1" sz="1400"/><a:t>Udaljenost od idealnog (manje je bolje)</a:t></a:r></a:p></c:rich></c:tx><c:overlay val="0"/></c:title>
    <c:plotArea><c:layout/>
      <c:barChart><c:barDir val="col"/><c:grouping val="clustered"/><c:varyColors val="0"/>
        ${createChartSeriesXml(0, "Euklidska", euclideanTitle, categoryRange, euclideanRange, chartData?.categories || [], chartData?.euclideanValues || [])}
        ${createChartSeriesXml(1, "Chebyshev", chebyshevTitle, categoryRange, chebyshevRange, chartData?.categories || [], chartData?.chebyshevValues || [])}
        <c:dLbls><c:showLegendKey val="0"/><c:showVal val="0"/><c:showCatName val="0"/><c:showSerName val="0"/><c:showPercent val="0"/><c:showBubbleSize val="0"/></c:dLbls>
        <c:gapWidth val="150"/><c:axId val="10"/><c:axId val="100"/>
      </c:barChart>
      <c:catAx><c:axId val="10"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:delete val="0"/><c:axPos val="b"/><c:title><c:tx><c:rich><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="hr-HR" b="1"/><a:t>Kandidat</a:t></a:r></a:p></c:rich></c:tx><c:overlay val="0"/></c:title><c:numFmt formatCode="General" sourceLinked="1"/><c:majorTickMark val="none"/><c:minorTickMark val="none"/><c:tickLblPos val="nextTo"/><c:crossAx val="100"/><c:crosses val="autoZero"/><c:auto val="0"/><c:lblAlgn val="ctr"/><c:lblOffset val="100"/><c:noMultiLvlLbl val="0"/></c:catAx>
      <c:valAx><c:axId val="100"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:delete val="0"/><c:axPos val="l"/><c:majorGridlines/><c:title><c:tx><c:rich><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="hr-HR" b="1"/><a:t>Distanca</a:t></a:r></a:p></c:rich></c:tx><c:overlay val="0"/></c:title><c:numFmt formatCode="0.00" sourceLinked="0"/><c:majorTickMark val="none"/><c:minorTickMark val="none"/><c:tickLblPos val="nextTo"/><c:crossAx val="10"/><c:crosses val="autoZero"/><c:crossBetween val="between"/></c:valAx>
    </c:plotArea>
    <c:legend><c:legendPos val="r"/><c:overlay val="0"/></c:legend><c:plotVisOnly val="1"/><c:dispBlanksAs val="gap"/><c:showDLblsOverMax val="0"/>
  </c:chart>
  <c:printSettings><c:headerFooter/><c:pageMargins b="0.75" l="0.7" r="0.7" t="0.75" header="0.3" footer="0.3"/><c:pageSetup/></c:printSettings>
</c:chartSpace>`;
}

function createChartSeriesXml(index, label, titleRef, categoryRange, valueRange, categories, values) {
  const categoryCache = categories
    .map((name, pointIndex) => `<c:pt idx="${pointIndex}"><c:v>${escapeXml(name)}</c:v></c:pt>`)
    .join("");
  const valueCache = values
    .map((value, pointIndex) => (Number.isFinite(value) ? `<c:pt idx="${pointIndex}"><c:v>${Number(value)}</c:v></c:pt>` : ""))
    .join("");
  return `<c:ser><c:idx val="${index}"/><c:order val="${index}"/><c:tx><c:strRef><c:f>${titleRef}</c:f><c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>${escapeXml(label)}</c:v></c:pt></c:strCache></c:strRef></c:tx><c:invertIfNegative val="0"/><c:cat><c:strRef><c:f>${categoryRange}</c:f><c:strCache><c:ptCount val="${categories.length}"/>${categoryCache}</c:strCache></c:strRef></c:cat><c:val><c:numRef><c:f>${valueRange}</c:f><c:numCache><c:formatCode>0.00</c:formatCode><c:ptCount val="${values.length}"/>${valueCache}</c:numCache></c:numRef></c:val></c:ser>`;
}

function cellStyleId(rowIndex, colIndex, rows) {
  if (rowIndex === 0) return 1;
  if (rowIndex === 1) return 2;
  if (rowIndex >= 2 && rowIndex <= 4) return 3;
  if (rows[rowIndex]?.[0] === "Postavka") return 1;
  if (rowIndex >= 5 && colIndex >= Math.max(rows[0].length - 4, 0)) return 5;
  if (colIndex === 0 && rows[rowIndex]?.[0]) return 6;
  return 4;
}

function columnWidth(index, rows) {
  const longest = Math.max(
    ...rows.map((row) => String(row[index]?.type ? "" : row[index] ?? "").length),
    String(rows[0]?.[index] ?? "").length
  );
  const base = index < 3 ? 18 : 12;
  return Math.min(28, Math.max(base, longest + 2));
}

function createCellXml(value, rowIndex, colIndex, styleId) {
  const ref = `${columnName(colIndex)}${rowIndex}`;
  const style = styleId ? ` s="${styleId}"` : "";
  if (value === "" || value === null || value === undefined) return `<c r="${ref}"${style}/>`;
  if (value?.type === "formula") {
    return `<c r="${ref}"${style}><f>${escapeXml(value.formula)}</f><v></v></c>`;
  }
  if (typeof value === "number" || (String(value).trim() !== "" && Number.isFinite(Number(value)))) {
    return `<c r="${ref}"${style}><v>${Number(value)}</v></c>`;
  }
  return `<c r="${ref}" t="inlineStr"${style}><is><t>${escapeXml(value)}</t></is></c>`;
}

function columnName(index) {
  let name = "";
  let next = index;
  while (next > 0) {
    const remainder = (next - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    next = Math.floor((next - 1) / 26);
  }
  return name;
}

function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function createZip(files) {
  const encoder = new TextEncoder();
  const fileEntries = Object.entries(files).map(([name, content]) => {
    const data = encoder.encode(content);
    return { name, data, crc: crc32(data) };
  });
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const file of fileEntries) {
    const nameBytes = encoder.encode(file.name);
    const local = new Uint8Array(30 + nameBytes.length + file.data.length);
    const localView = new DataView(local.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, 0, true);
    localView.setUint16(12, 0, true);
    localView.setUint32(14, file.crc, true);
    localView.setUint32(18, file.data.length, true);
    localView.setUint32(22, file.data.length, true);
    localView.setUint16(26, nameBytes.length, true);
    localView.setUint16(28, 0, true);
    local.set(nameBytes, 30);
    local.set(file.data, 30 + nameBytes.length);
    localParts.push(local);

    const central = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(central.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, 0, true);
    centralView.setUint16(14, 0, true);
    centralView.setUint32(16, file.crc, true);
    centralView.setUint32(20, file.data.length, true);
    centralView.setUint32(24, file.data.length, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, 0, true);
    centralView.setUint32(42, offset, true);
    central.set(nameBytes, 46);
    centralParts.push(central);
    offset += local.length;
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, fileEntries.length, true);
  endView.setUint16(10, fileEntries.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, offset, true);

  const size = offset + centralSize + end.length;
  const zip = new Uint8Array(size);
  let cursor = 0;
  for (const part of [...localParts, ...centralParts, end]) {
    zip.set(part, cursor);
    cursor += part.length;
  }
  return zip;
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
