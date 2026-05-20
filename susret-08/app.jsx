/* eslint-disable */
const { useMemo, useState } = React;

const makeId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

const createBlankAttribute = () => ({ id: makeId("attr"), label: "", min: 1, max: 5, weight: 1, ideal: "" });
const createBlankCandidate = () => ({ id: makeId("candidate"), name: "", note: "", values: {} });
const createInitialAttributes = () => Array.from({ length: 4 }, createBlankAttribute);
const createInitialCandidates = () => Array.from({ length: 4 }, createBlankCandidate);
const EXAMPLE_ATTRIBUTES = [
  { id: "excel", label: "Excel", min: 1, max: 5, weight: 1, ideal: 5 },
  { id: "python", label: "Python", min: 1, max: 5, weight: 1, ideal: 3 },
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
  const [tableMode, setTableMode] = useState("blank");
  const [selectedCandidateId, setSelectedCandidateId] = useState("");

  const activeAttributes = attributes;
  const ranked = useMemo(
    () => rankCandidates(candidates, activeAttributes, scaled),
    [candidates, activeAttributes, scaled]
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
    setTableMode("blank");
    setSelectedCandidateId("");
  };

  const loadExample = () => {
    setAttributes(cloneRows(EXAMPLE_ATTRIBUTES));
    setCandidates(cloneRows(EXAMPLE_CANDIDATES));
    setMetric("euclidean");
    setScaled(false);
    setTableMode("example");
    setSelectedCandidateId(EXAMPLE_CANDIDATES[0].id);
  };

  const exportExcel = () => {
    downloadExcelWorkbook({
      attributes: activeAttributes,
      candidates,
      ranked,
      scaled,
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
          <label className="switch">
            <input type="checkbox" checked={scaled} onChange={(event) => setScaled(event.target.checked)} />
            <span>Skaliraj / ponderiraj</span>
          </label>
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
              <p>{metric === "euclidean" ? "Euklidska mjeri ukupnu udaljenost od ideala." : "Chebyshev mjeri najveću pojedinačnu razliku od ideala."}</p>
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
                    Trake pokazuju koliko je iskorišten moguć raspon razlike za taj atribut. Kad je skaliranje uključeno, vidi se i doprinos koji ulazi u izračun distance.
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
                          <span>Razlika {formatDistance(item.raw)}</span>
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

function rankCandidates(candidates, attributes, scaled) {
  const usableAttributes = attributes.filter((attr) => isFiniteNumber(attr.ideal));
  return candidates.map((candidate) => {
    const complete =
      usableAttributes.length > 0 &&
      usableAttributes.every((attr) => isFiniteNumber(candidate.values[attr.id]));
    if (!complete) {
      return { ...candidate, complete: false, euclidean: Number.POSITIVE_INFINITY, chebyshev: Number.POSITIVE_INFINITY };
    }
    const differences = usableAttributes.map((attr, index) => {
      const raw = Math.abs(Number(candidate.values[attr.id]) - Number(attr.ideal));
      const range = Math.max(1, Number(attr.max) - Number(attr.min));
      const weight = scaled ? Number(attr.weight || 1) : 1;
      const normalized = scaled ? raw / range : raw;
      const weighted = normalized * weight;
      return {
        id: attr.id,
        label: attr.label.trim() || `Atribut ${index + 1}`,
        value: Number(candidate.values[attr.id]),
        ideal: Number(attr.ideal),
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

function downloadExcelWorkbook({ attributes, candidates, ranked, scaled }) {
  const labels = attributes.map((attr, index) => attr.label.trim() || `Atribut ${index + 1}`);
  const completeRankEuclidean = [...ranked]
    .filter((row) => row.complete)
    .sort((a, b) => a.euclidean - b.euclidean)
    .map((row, index) => [row.id, index + 1]);
  const completeRankChebyshev = [...ranked]
    .filter((row) => row.complete)
    .sort((a, b) => a.chebyshev - b.chebyshev)
    .map((row, index) => [row.id, index + 1]);
  const rankEuclidean = Object.fromEntries(completeRankEuclidean);
  const rankChebyshev = Object.fromEntries(completeRankChebyshev);
  const resultById = Object.fromEntries(ranked.map((row) => [row.id, row]));

  const rows = [
    ["Tip", "Ime", "Bilješka", ...labels, "Euklidska", "Chebyshev", "Rang Euk", "Rang Cheb"],
    ["Idealni", "Idealni", "referentni profil", ...attributes.map((attr) => attr.ideal), "", "", "", ""],
    ...candidates.map((candidate, index) => {
      const result = resultById[candidate.id];
      return [
        "Kandidat",
        candidate.name.trim() || `Kandidat ${index + 1}`,
        candidate.note,
        ...attributes.map((attr) => candidate.values[attr.id] ?? ""),
        result?.complete ? formatDistance(result.euclidean) : "",
        result?.complete ? formatDistance(result.chebyshev) : "",
        result?.complete ? rankEuclidean[candidate.id] : "",
        result?.complete ? rankChebyshev[candidate.id] : "",
      ];
    }),
    [],
    ["Postavka", "Vrijednost"],
    ["Skaliranje", scaled ? "uključeno" : "isključeno"],
  ];

  const workbookBytes = createXlsxBytes(rows);
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

function createXlsxBytes(rows) {
  const files = {
    "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`,
    "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
    "xl/workbook.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Rezultati" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`,
    "xl/_rels/workbook.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
    "xl/styles.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>
  <fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>
</styleSheet>`,
    "xl/worksheets/sheet1.xml": createWorksheetXml(rows),
  };
  return createZip(files);
}

function createWorksheetXml(rows) {
  const sheetRows = rows.map((row, rowIndex) => {
    const cells = row.map((value, colIndex) => createCellXml(value, rowIndex + 1, colIndex + 1, rowIndex === 0));
    return `<row r="${rowIndex + 1}">${cells.join("")}</row>`;
  });
  const colCount = Math.max(...rows.map((row) => row.length), 1);
  const rowCount = Math.max(rows.length, 1);
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="A1:${columnName(colCount)}${rowCount}"/>
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <cols>${Array.from({ length: colCount }, (_, index) => `<col min="${index + 1}" max="${index + 1}" width="${index < 3 ? 18 : 14}" customWidth="1"/>`).join("")}</cols>
  <sheetData>${sheetRows.join("")}</sheetData>
</worksheet>`;
}

function createCellXml(value, rowIndex, colIndex, isHeader) {
  const ref = `${columnName(colIndex)}${rowIndex}`;
  const style = isHeader ? ` s="1"` : "";
  if (value === "" || value === null || value === undefined) return `<c r="${ref}"${style}/>`;
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
