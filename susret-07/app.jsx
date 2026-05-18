/* eslint-disable */
const { useMemo, useState } = React;

const METRICS = {
  euclidean: {
    label: "Euklidska",
    short: "ravna crta",
    meaning: "Gleda ukupnu razliku kroz sve atribute. Dobra je kad su atributi na usporedivoj skali i kad želimo opću sličnost.",
  },
  manhattan: {
    label: "Manhattan",
    short: "zbroj razlika",
    meaning: "Zbraja pojedinačne razlike po atributima. Korisna je kad svaku razliku čitamo kao zaseban trošak ili pomak.",
  },
  chebyshev: {
    label: "Chebyshev",
    short: "najveća razlika",
    meaning: "Gleda najveću pojedinačnu razliku. Korisna je kad jedna velika razlika može presuditi procjeni.",
  },
};

const TEACHING_PRESETS = [
  {
    id: "euclidean-demo",
    label: "Euklidska",
    title: "Dijagonala kao ravna crta",
    metric: "euclidean",
    scaled: false,
    target: { complaints: 2, satisfaction: 2, spend: 50 },
    note: "Usporedi Korisnika A dijagonalno gore-desno i Korisnika B ravno gore. Ravna crta do A je malo kraća.",
  },
  {
    id: "manhattan-demo",
    label: "Manhattan",
    title: "Zbroj koraka po osima",
    metric: "manhattan",
    scaled: false,
    target: { complaints: 2, satisfaction: 2, spend: 50 },
    note: "Isti raspored, ali sad se broje koraci po atributima. Put ravno gore do B ima manji zbroj razlika.",
  },
  {
    id: "chebyshev-demo",
    label: "Chebyshev",
    title: "Najveći pojedinačni skok",
    metric: "chebyshev",
    scaled: false,
    target: { complaints: 2, satisfaction: 2, spend: 50 },
    note: "Gleda se najveća pojedinačna razlika. Kod A su najveći skokovi 2, a kod B je skok zadovoljstva 3.",
  },
  {
    id: "scale-demo",
    label: "Skala",
    title: "Euri mogu preglasati graf",
    metric: "euclidean",
    scaled: true,
    target: { complaints: 3, satisfaction: 2, spend: 31 },
    note: "Ovdje uključi skaliranje: bez njega pobjeđuje mala razlika u eurima, nakon njega više vrijede usporedive razlike po atributima.",
  },
];

const SCENARIOS = [
  {
    id: "churn",
    label: "Churn",
    point: "jedan korisnik usluge",
    goal: "procijeniti rizik odlaska korisnika",
    targetName: "Novi korisnik",
    outcomeLabel: "Ishod",
    axes: ["complaints", "satisfaction"],
    target: { complaints: 2, satisfaction: 2, spend: 50 },
    features: [
      { key: "complaints", label: "Reklamacije", min: 0, max: 5, step: 1, unit: "" },
      { key: "satisfaction", label: "Zadovoljstvo", min: 1, max: 5, step: 1, unit: "/ 5" },
      { key: "spend", label: "Mjesečna potrošnja", min: 20, max: 120, step: 1, unit: "€" },
    ],
    points: [
      { name: "Korisnik A", values: { complaints: 4, satisfaction: 4, spend: 50 }, outcome: "ostao", tone: "good", item: "standardna komunikacija" },
      { name: "Korisnik B", values: { complaints: 2, satisfaction: 5, spend: 50 }, outcome: "otišao", tone: "bad", item: "provjera zadovoljstva" },
      { name: "Korisnik C", values: { complaints: 0, satisfaction: 2, spend: 33 }, outcome: "ostao", tone: "good", item: "nema hitne intervencije" },
      { name: "Korisnik D", values: { complaints: 3, satisfaction: 3, spend: 70 }, outcome: "otišao", tone: "bad", item: "provjera računa i iskustva" },
      { name: "Korisnik E", values: { complaints: 5, satisfaction: 1, spend: 75 }, outcome: "otišao", tone: "bad", item: "hitna provjera iskustva" },
      { name: "Korisnik F", values: { complaints: 5, satisfaction: 1, spend: 50 }, outcome: "ostao", tone: "good", item: "zahvala i cross-sell" },
    ],
    distanceMeaning: "Udaljenost ovdje znači koliko novi korisnik nalikuje ranijim korisnicima prema reklamacijama, zadovoljstvu i potrošnji.",
    legend: { good: "ostao", bad: "otišao", neutral: "drugi profil" },
    decisionTitle: "Moguća poslovna odluka",
    decisionText: "Ako su najbliži susjedi većinom korisnici koji su otišli, to je signal za intervenciju. Nije dokaz da će novi korisnik sigurno otići.",
    scaleText: "Ovdje je skala važna: euri mogu nadglasati reklamacije. Uključi skaliranje i prati kako se mijenja najbliži susjed.",
    metricExamples: {
      euclidean: "Ukupno sličan churn profil: malo reklamacija, slično zadovoljstvo i slična potrošnja zajedno čine malu udaljenost.",
      manhattan: "Svaka razlika ima svoj doprinos: jedna reklamacija više, jedan bod zadovoljstva manje i nekoliko eura potrošnje zbrajaju se u ukupnu razliku.",
      chebyshev: "Jedna velika razlika može biti presudna, primjerice mnogo više reklamacija od inače sličnih korisnika.",
    },
  },
  {
    id: "streaming",
    label: "Preporuke",
    point: "jedan gledatelj",
    goal: "pronaći sadržaj koji bi gledatelj mogao pogledati",
    targetName: "Novi gledatelj",
    outcomeLabel: "Volio/la je",
    axes: ["action", "comedy"],
    target: { action: 4, comedy: 2, documentary: 1, horror: 0 },
    features: [
      { key: "action", label: "Akcija", min: 0, max: 5, step: 1, unit: "/ 5" },
      { key: "comedy", label: "Komedija", min: 0, max: 5, step: 1, unit: "/ 5" },
      { key: "documentary", label: "Dokumentarci", min: 0, max: 5, step: 1, unit: "/ 5" },
      { key: "horror", label: "Horor", min: 0, max: 5, step: 1, unit: "/ 5" },
    ],
    points: [
      { name: "Ana", values: { action: 5, comedy: 2, documentary: 1, horror: 0 }, outcome: "Noćni agent", tone: "good", item: "Noćni agent" },
      { name: "Marko", values: { action: 4, comedy: 2, documentary: 2, horror: 1 }, outcome: "Dosje Zagreb", tone: "good", item: "Dosje Zagreb" },
      { name: "Sara", values: { action: 1, comedy: 5, documentary: 3, horror: 0 }, outcome: "Smijeh na poslu", tone: "neutral", item: "Smijeh na poslu" },
      { name: "Ivan", values: { action: 2, comedy: 1, documentary: 5, horror: 1 }, outcome: "Planet oceana", tone: "neutral", item: "Planet oceana" },
      { name: "Lana", values: { action: 5, comedy: 1, documentary: 1, horror: 4 }, outcome: "Ponoćna stanica", tone: "neutral", item: "Ponoćna stanica" },
    ],
    distanceMeaning: "Udaljenost ovdje znači sličnost ukusa prema žanrovima. Dvije osobe mogu biti blizu po akciji i komediji, ali daleko po hororu.",
    legend: { good: "sličan ukus", bad: "veliko odstupanje", neutral: "drugi ukus" },
    decisionTitle: "Kandidat za preporuku",
    decisionText: "Sadržaj najbližeg susjeda može biti kandidat. Stvarni preporučivač bi obično gledao više susjeda i izbacio sadržaj koji je osoba već gledala.",
    scaleText: "Ocjene žanrova već su na istoj skali 0-5, pa skaliranje malo mijenja rezultat. Problem bi se pojavio kad bismo dodali minute gledanja ili broj klikova.",
    metricExamples: {
      euclidean: "Opća sličnost ukusa: gledatelji su blizu ako su im sve žanrovske ocjene ukupno slične.",
      manhattan: "Zbrajanje razlika po žanrovima: svako neslaganje u akciji, komediji, dokumentarcima i hororu dodaje svoj dio razlike.",
      chebyshev: "Najveće neslaganje po jednom žanru može biti važno ako, primjerice, jedan gledatelj voli horor, a drugi ga potpuno izbjegava.",
    },
  },
  {
    id: "iris",
    label: "Iris",
    point: "jedan cvijet perunike",
    goal: "klasificirati vrstu cvijeta",
    targetName: "Novi cvijet",
    outcomeLabel: "Vrsta",
    axes: ["petalLength", "petalWidth"],
    target: { sepalLength: 5.0, sepalWidth: 3.4, petalLength: 1.5, petalWidth: 0.2 },
    features: [
      { key: "sepalLength", label: "Duljina lapa", min: 4.3, max: 7.9, step: 0.1, unit: "cm" },
      { key: "sepalWidth", label: "Širina lapa", min: 2.0, max: 4.4, step: 0.1, unit: "cm" },
      { key: "petalLength", label: "Duljina latice", min: 1.0, max: 6.9, step: 0.1, unit: "cm" },
      { key: "petalWidth", label: "Širina latice", min: 0.1, max: 2.5, step: 0.1, unit: "cm" },
    ],
    points: [
      { name: "Iris 1", values: { sepalLength: 5.1, sepalWidth: 3.5, petalLength: 1.4, petalWidth: 0.2 }, outcome: "setosa", tone: "good", item: "setosa" },
      { name: "Iris 2", values: { sepalLength: 4.9, sepalWidth: 3.0, petalLength: 1.4, petalWidth: 0.2 }, outcome: "setosa", tone: "good", item: "setosa" },
      { name: "Iris 3", values: { sepalLength: 5.9, sepalWidth: 3.0, petalLength: 4.2, petalWidth: 1.5 }, outcome: "versicolor", tone: "neutral", item: "versicolor" },
      { name: "Iris 4", values: { sepalLength: 6.7, sepalWidth: 3.1, petalLength: 4.7, petalWidth: 1.5 }, outcome: "versicolor", tone: "neutral", item: "versicolor" },
      { name: "Iris 5", values: { sepalLength: 6.5, sepalWidth: 3.0, petalLength: 5.8, petalWidth: 2.2 }, outcome: "virginica", tone: "bad", item: "virginica" },
    ],
    distanceMeaning: "Udaljenost ovdje znači sličnost mjera cvijeta. Ovo je uredan školski primjer jer su svi atributi numerički i mjerljivi.",
    legend: { good: "setosa", bad: "virginica", neutral: "versicolor" },
    decisionTitle: "Moguća klasifikacija",
    decisionText: "Ako su najbliži susjedi većinom iste vrste, ta vrsta je razumna procjena za novi cvijet.",
    scaleText: "Svi atributi su centimetri, ali nemaju isti raspon. Latice često nose više informacije od lapova, pa sama udaljenost nije cijela priča.",
    metricExamples: {
      euclidean: "Cvjetovi su blizu ako su im mjere latica i lapova ukupno slične.",
      manhattan: "Svaka razlika u duljini ili širini dodaje se posebno, što može biti čitljivije kod ručnog računanja.",
      chebyshev: "Najveća razlika po jednoj mjeri može izdvojiti cvijet koji po jednom atributu snažno odskače.",
    },
  },
  {
    id: "titanic",
    label: "Titanic",
    point: "jedan putnik",
    goal: "procijeniti vjerojatnost preživljavanja",
    targetName: "Novi putnik",
    outcomeLabel: "Ishod",
    axes: ["age", "fare"],
    target: { age: 29, pclass: 2, fare: 26, family: 1 },
    features: [
      { key: "age", label: "Dob", min: 0, max: 80, step: 1, unit: "g" },
      { key: "pclass", label: "Razred", min: 1, max: 3, step: 1, unit: "" },
      { key: "fare", label: "Cijena karte", min: 0, max: 100, step: 1, unit: "£" },
      { key: "family", label: "Obitelj na brodu", min: 0, max: 6, step: 1, unit: "" },
    ],
    points: [
      { name: "Putnik A", values: { age: 30, pclass: 2, fare: 13, family: 0 }, outcome: "nije preživio", tone: "bad", item: "oprez u procjeni" },
      { name: "Putnik B", values: { age: 27, pclass: 1, fare: 52, family: 1 }, outcome: "preživio", tone: "good", item: "sličan profil, viša karta" },
      { name: "Putnik C", values: { age: 8, pclass: 3, fare: 21, family: 3 }, outcome: "preživio", tone: "good", item: "dijete s obitelji" },
      { name: "Putnik D", values: { age: 45, pclass: 3, fare: 8, family: 0 }, outcome: "nije preživio", tone: "bad", item: "udaljen profil" },
      { name: "Putnik E", values: { age: 33, pclass: 2, fare: 26, family: 2 }, outcome: "preživio", tone: "good", item: "slična karta i razred" },
    ],
    distanceMeaning: "Udaljenost ovdje znači sličnost putnika prema odabranim atributima. Ne znači vrijednost osobe niti objašnjava cijelu povijesnu situaciju.",
    legend: { good: "preživio", bad: "nije preživio", neutral: "drugi profil" },
    decisionTitle: "Moguća procjena modela",
    decisionText: "Najbliži susjedi mogu dati signal o procjeni, ali Titanic je dobar primjer za oprez: neki važni faktori nisu u tablici ili su grubo kodirani.",
    scaleText: "Dob i cijena karte imaju veće brojeve od razreda i broja članova obitelji. Bez skaliranja mogu preuzeti izračun.",
    metricExamples: {
      euclidean: "Putnici su blizu ako su im dob, razred, cijena karte i obitelj ukupno slični.",
      manhattan: "Razlike se čitaju kao odvojeni doprinosi: dob, razred, karta i obitelj dodaju se u ukupnu razliku.",
      chebyshev: "Jedna velika razlika, primjerice vrlo različita cijena karte, može dominirati procjenom blizine.",
    },
  },
];

function App() {
  const [scenarioId, setScenarioId] = useState("churn");
  const [metric, setMetric] = useState("euclidean");
  const [scaled, setScaled] = useState(false);
  const [activePresetId, setActivePresetId] = useState("euclidean-demo");
  const scenario = SCENARIOS.find((item) => item.id === scenarioId);
  const [target, setTarget] = useState(scenario.target);

  const rows = useMemo(() => rankNeighbors(scenario, target, metric, scaled), [scenario, target, metric, scaled]);
  const rawRows = useMemo(() => rankNeighbors(scenario, target, metric, false), [scenario, target, metric]);
  const scaledRows = useMemo(() => rankNeighbors(scenario, target, metric, true), [scenario, target, metric]);
  const nearest = rows[0];
  const vote = summarizeSignal(scenario, rows.slice(0, 3));
  const selectScenario = (id) => {
    const next = SCENARIOS.find((item) => item.id === id);
    setScenarioId(id);
    setTarget(next.target);
    setScaled(false);
    setMetric("euclidean");
    setActivePresetId(id === "churn" ? "euclidean-demo" : "");
  };
  const applyPreset = (preset) => {
    setScenarioId("churn");
    setTarget(preset.target);
    setMetric(preset.metric);
    setScaled(preset.scaled);
    setActivePresetId(preset.id);
  };
  const updateTarget = (nextTarget) => {
    setTarget(nextTarget);
    setActivePresetId("");
  };
  const updateMetric = (nextMetric) => {
    setMetric(nextMetric);
    setActivePresetId("");
  };
  const updateScaled = (nextScaled) => {
    setScaled(nextScaled);
    setActivePresetId("");
  };

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="../">
          <span className="brand-mark" aria-hidden="true">D</span>
          <span>
            <span className="brand-name">Dragutin Oreški</span>
            <span className="brand-meta">UI Suputnik · Susret 07</span>
          </span>
        </a>
        <nav className="topbar-right">
          <a href="../">← Svi susreti</a>
          <a href="../susret-05/">← Susret 05</a>
        </nav>
      </header>

      <section className="hero">
        <div className="kicker"><span className="dot"></span>Susret 07 · Nadzirano i nenadzirano učenje</div>
        <h1>Model ne vidi ljude. Vidi <em>točke</em>.</h1>
        <p className="hero-sub">
          Odaberi primjer i prati istu logiku kroz točke, susjede, distance,
          preporuku ili odluku te problem skale.
        </p>
      </section>

      <main className="module">
        <ScenarioPicker scenario={scenario} onChange={selectScenario} />
        <TeachingPresets activePresetId={activePresetId} onApply={applyPreset} />
        <ConceptStrip scenario={scenario} />

        <section className="workbench">
          <article className="panel controls-panel">
            <span className="eyebrow">Nova točka</span>
            <h2>{scenario.targetName}</h2>
            <p className="panel-copy">
              Pomakni vrijednosti i gledaj kako se mijenjaju najbliži susjedi i udaljenosti.
            </p>
            <div className="slider-stack">
              {scenario.features.map((feature) => (
                <RangeControl
                  key={feature.key}
                  feature={feature}
                  value={target[feature.key]}
                  onChange={(value) => updateTarget({ ...target, [feature.key]: value })}
                />
              ))}
            </div>
          </article>

          <article className="panel chart-panel">
            <div className="panel-head">
              <div>
                <span className="eyebrow">Susjedi</span>
                <h2>Najbliži primjeri</h2>
              </div>
              <MetricControls metric={metric} setMetric={updateMetric} />
            </div>
            <label className="toggle">
              <input type="checkbox" checked={scaled} onChange={(event) => updateScaled(event.target.checked)} />
              <span>Skaliraj prije računanja distance</span>
            </label>
            <p className="projection-note">
              Rang koristi sve klizače. Graf prikazuje dvije osi radi čitljivosti, pa vizualno najbliža točka nije uvijek prva u listi.
            </p>
            <PointPlot scenario={scenario} target={target} rows={rows} />
            <Legend scenario={scenario} />
          </article>
        </section>

        <section className="two-column">
          <article className="panel">
            <span className="eyebrow">Udaljenost</span>
            <h2>{METRICS[metric].label}: {METRICS[metric].short}</h2>
            <p className="panel-copy">{METRICS[metric].meaning}</p>
            <p className="panel-copy">{scenario.distanceMeaning}</p>
            <DistanceBreakdown scenario={scenario} target={target} neighbor={nearest} metric={metric} scaled={scaled} />
          </article>

          <article className="panel">
            <span className="eyebrow">Preporuka ili odluka</span>
            <h2>{scenario.decisionTitle}</h2>
            <div className="result-callout">
              <span>Najbliži susjed</span>
              <strong>{nearest.name} · {nearest.outcome}</strong>
              <small>d = {format(nearest.distance)} · {scaled ? "skalirano" : "bez skaliranja"}</small>
            </div>
            <p className="plain-note">{scenario.decisionText}</p>
            <div className="result-callout soft">
              <span>Signal iz 3 najbliža</span>
              <strong>{vote}</strong>
              <small>{scenario.outcomeLabel}: {nearest.item}</small>
            </div>
          </article>
        </section>

        <section className="two-column">
          <article className="panel">
            <span className="eyebrow">Tri distance na istom primjeru</span>
            <h2>Što se mijenja kad promijeniš metriku?</h2>
            <MetricCards scenario={scenario} target={target} scaled={scaled} />
          </article>

          <article className="panel">
            <span className="eyebrow">Skala</span>
            <h2>Veliki brojevi mogu preuzeti izračun</h2>
            <p className="panel-copy">{scenario.scaleText}</p>
            <ScaleComparison rawRows={rawRows} scaledRows={scaledRows} scenario={scenario} />
          </article>
        </section>
      </main>

      <footer className="colophon">
        <span>UI Suputnik · materijali za kolegij</span>
        <span>Anonimna analitika · bez snimanja sesije</span>
        <span><a href="../">Početna</a></span>
      </footer>
    </div>
  );
}

function TeachingPresets({ activePresetId, onApply }) {
  return (
    <section className="preset-panel" aria-label="Brzi primjeri za distance">
      <div>
        <span className="eyebrow">Brzi primjeri</span>
        <h2>Usporedi distance na istim točkama</h2>
        <p>
          Prva tri gumba namjerno koriste iste vrijednosti novog korisnika. Tako se mijenja samo metrika:
          ravna crta, zbroj koraka ili najveći pojedinačni skok. Gumb Skala koristi drugi primjer.
        </p>
      </div>
      <div className="preset-grid">
        {TEACHING_PRESETS.map((preset) => (
          <button
            key={preset.id}
            className={"preset-button" + (preset.id === activePresetId ? " is-active" : "")}
            onClick={() => onApply(preset)}
          >
            <span>{preset.label}</span>
            <strong>{preset.title}</strong>
            <small>{preset.note}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function ScenarioPicker({ scenario, onChange }) {
  return (
    <section className="scenario-picker" aria-label="Odabir primjera">
      {SCENARIOS.map((item) => (
        <button key={item.id} className={"scenario-choice" + (item.id === scenario.id ? " is-active" : "")} onClick={() => onChange(item.id)}>
          <span>{item.label}</span>
          <small>{item.point}</small>
        </button>
      ))}
    </section>
  );
}

function ConceptStrip({ scenario }) {
  return (
    <section className="concept-strip">
      <article>
        <span>Točka</span>
        <strong>{scenario.point}</strong>
      </article>
      <article>
        <span>Cilj</span>
        <strong>{scenario.goal}</strong>
      </article>
      <article>
        <span>Blizina znači</span>
        <strong>{scenario.distanceMeaning}</strong>
      </article>
    </section>
  );
}

function MetricControls({ metric, setMetric }) {
  return (
    <div className="metric-controls" role="group" aria-label="Odabir distance">
      {Object.entries(METRICS).map(([key, item]) => (
        <button key={key} className={metric === key ? "is-active" : ""} onClick={() => setMetric(key)}>
          {item.label}
        </button>
      ))}
    </div>
  );
}

function RangeControl({ feature, value, onChange }) {
  return (
    <label className="range-control">
      <span>{feature.label}</span>
      <strong>{formatValue(value, feature)}</strong>
      <input type="range" min={feature.min} max={feature.max} step={feature.step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function PointPlot({ scenario, target, rows }) {
  const width = 620;
  const height = 380;
  const pad = 48;
  const [xKey, yKey] = scenario.axes;
  const xFeature = featureByKey(scenario, xKey);
  const yFeature = featureByKey(scenario, yKey);
  const x = (value) => pad + ((value - xFeature.min) / (xFeature.max - xFeature.min)) * (width - pad * 2);
  const y = (value) => height - pad - ((value - yFeature.min) / (yFeature.max - yFeature.min)) * (height - pad * 2);
  const nearestNames = new Set(rows.slice(0, 3).map((item) => item.name));
  const ticksX = ticksFor(xFeature);
  const ticksY = ticksFor(yFeature);

  return (
    <div className="plot-wrap">
      <svg className="plot" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Graf točaka za primjer ${scenario.label}`}>
        <rect x="0" y="0" width={width} height={height} rx="12" />
        {ticksX.map((tick) => (
          <g key={`x-${tick}`}>
            <line x1={x(tick)} y1={pad} x2={x(tick)} y2={height - pad} />
            <text x={x(tick)} y={height - 18}>{formatTick(tick)}</text>
          </g>
        ))}
        {ticksY.map((tick) => (
          <g key={`y-${tick}`}>
            <line x1={pad} y1={y(tick)} x2={width - pad} y2={y(tick)} />
            <text x="24" y={y(tick) + 4}>{formatTick(tick)}</text>
          </g>
        ))}
        <text className="axis-label" x={width / 2} y={height - 4}>{xFeature.label}</text>
        <text className="axis-label" x="42" y="24">{yFeature.label}</text>

        {rows.slice(0, 3).map((point) => (
          <line key={`line-${point.name}`} className="distance-line" x1={x(target[xKey])} y1={y(target[yKey])} x2={x(point.values[xKey])} y2={y(point.values[yKey])} />
        ))}
        {scenario.points.map((point) => (
          <g key={point.name}>
            <circle
              className={`data-point ${point.tone} ${nearestNames.has(point.name) ? "nearest" : ""}`}
              cx={x(point.values[xKey])}
              cy={y(point.values[yKey])}
              r={nearestNames.has(point.name) ? 9 : 7}
            />
            <text className="point-label" x={x(point.values[xKey]) + 12} y={y(point.values[yKey]) + 4}>{point.name}</text>
          </g>
        ))}
        <circle className="new-point" cx={x(target[xKey])} cy={y(target[yKey])} r="11" />
        <text className="new-label" x={x(target[xKey]) + 14} y={y(target[yKey]) - 12}>nova točka</text>
      </svg>
      <p className="ranking-note">Rang po odabranoj distanci: {rows.length ? rows[0].distanceLabel : ""}</p>
      <div className="neighbor-list">
        {rows.slice(0, 5).map((item, index) => (
          <div className="neighbor-row" key={item.name}>
            <span>{index + 1}</span>
            <strong>{item.name}</strong>
            <em className={item.tone}>{item.outcome}</em>
            <small>d = {format(item.distance)}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

function Legend({ scenario }) {
  return (
    <div className="legend">
      <span><i className="legend-dot good"></i>{scenario.legend.good}</span>
      <span><i className="legend-dot bad"></i>{scenario.legend.bad}</span>
      <span><i className="legend-dot neutral"></i>{scenario.legend.neutral}</span>
      <span><i className="legend-dot new"></i>nova točka</span>
    </div>
  );
}

function DistanceBreakdown({ scenario, target, neighbor, metric, scaled }) {
  const diffs = scenario.features.map((feature) => {
    const raw = Math.abs(target[feature.key] - neighbor.values[feature.key]);
    const used = scaled ? raw / (feature.max - feature.min) : raw;
    return { feature, raw, used };
  });
  return (
    <div className="breakdown">
      <h3>Usporedba s: {neighbor.name}</h3>
      <div className="diff-list">
        {diffs.map(({ feature, raw, used }) => (
          <div className="diff-row" key={feature.key}>
            <span>{feature.label}</span>
            <strong>{formatValue(raw, feature, true)}</strong>
            <small>{scaled ? `u izračunu: ${format(used)}` : "sirova razlika"}</small>
          </div>
        ))}
      </div>
      <p className="formula">{formulaText(metric, diffs)} = {format(neighbor.distance)}</p>
    </div>
  );
}

function MetricCards({ scenario, target, scaled }) {
  const cards = Object.entries(METRICS).map(([key, metric]) => {
    const nearest = rankNeighbors(scenario, target, key, scaled)[0];
    return { key, ...metric, nearest, value: nearest.distance, example: scenario.metricExamples[key] };
  });
  const max = Math.max(...cards.map((item) => item.value), 1);
  return (
    <div className="metric-card-list">
      {cards.map((card) => (
        <div className="metric-row" key={card.key}>
          <div className="metric-head">
            <strong>{card.label}</strong>
            <span>{format(card.value)}</span>
          </div>
          <div className="bar-track"><span style={{ width: `${(card.value / max) * 100}%` }} /></div>
          <small className="metric-nearest">Najbliži: {card.nearest.name} · {card.nearest.outcome}</small>
          <p>{card.example}</p>
        </div>
      ))}
    </div>
  );
}

function ScaleComparison({ rawRows, scaledRows, scenario }) {
  return (
    <div className="scale-comparison">
      <div>
        <h3>Bez skaliranja</h3>
        <MiniRanking rows={rawRows.slice(0, 3)} />
      </div>
      <div>
        <h3>Nakon min-max skaliranja</h3>
        <MiniRanking rows={scaledRows.slice(0, 3)} />
      </div>
      <p className="plain-note">
        {rawRows[0].name === scaledRows[0].name
          ? `Najbliži susjed ostaje isti, ali udaljenosti se čitaju drugačije. U primjeru ${scenario.label} to je znak da skala ne mora uvijek promijeniti rang.`
          : `Najbliži susjed se promijenio: bez skaliranja je ${rawRows[0].name}, a nakon skaliranja ${scaledRows[0].name}. To pokazuje zašto priprema podataka mijenja rezultat modela.`}
      </p>
    </div>
  );
}

function MiniRanking({ rows }) {
  return (
    <div className="mini-ranking">
      {rows.map((row, index) => (
        <div className="mini-row" key={row.name}>
          <span>{index + 1}</span>
          <strong>{row.name}</strong>
          <small>{format(row.distance)}</small>
        </div>
      ))}
    </div>
  );
}

function rankNeighbors(scenario, target, metric, scaled) {
  return scenario.points.map((point) => ({
    ...point,
    distance: distanceForScenario(scenario, target, point.values, metric, scaled),
    distanceLabel: METRICS[metric].label,
  })).sort((a, b) => a.distance - b.distance);
}

function distanceForScenario(scenario, aValues, bValues, metric, scaled) {
  const a = scenario.features.map((feature) => scaledValue(aValues[feature.key], feature, scaled));
  const b = scenario.features.map((feature) => scaledValue(bValues[feature.key], feature, scaled));
  if (metric === "manhattan") return manhattan(a, b);
  if (metric === "chebyshev") return chebyshev(a, b);
  return euclidean(a, b);
}

function scaledValue(value, feature, scaled) {
  if (!scaled) return value;
  return (value - feature.min) / (feature.max - feature.min);
}

function summarizeSignal(scenario, rows) {
  if (scenario.id === "streaming") {
    return `Kandidati: ${rows.map((row) => row.item).join(", ")}`;
  }
  const counts = rows.reduce((acc, row) => {
    acc[row.outcome] = (acc[row.outcome] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([label, count]) => `${count}/3 ${label}`).join(" · ");
}

function featureByKey(scenario, key) {
  return scenario.features.find((feature) => feature.key === key);
}

function ticksFor(feature) {
  if (feature.max - feature.min <= 6 && feature.step >= 1) {
    return Array.from({ length: feature.max - feature.min + 1 }, (_, index) => feature.min + index);
  }
  const count = 5;
  return Array.from({ length: count }, (_, index) => feature.min + ((feature.max - feature.min) / (count - 1)) * index);
}

function formatTick(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formulaText(metric, diffs) {
  const values = diffs.map((item) => format(item.used));
  if (metric === "manhattan") return values.join(" + ");
  if (metric === "chebyshev") return `max(${values.join(", ")})`;
  return `√(${values.map((value) => `${value}²`).join(" + ")})`;
}

function formatValue(value, feature, omitUnit) {
  const rounded = Number.isInteger(feature.step) ? Math.round(value) : Number(value).toFixed(1);
  if (omitUnit || !feature.unit) return rounded;
  return `${rounded} ${feature.unit}`;
}

function euclidean(a, b) {
  return Math.sqrt(a.reduce((sum, value, index) => sum + Math.pow(value - b[index], 2), 0));
}

function manhattan(a, b) {
  return a.reduce((sum, value, index) => sum + Math.abs(value - b[index]), 0);
}

function chebyshev(a, b) {
  return Math.max(...a.map((value, index) => Math.abs(value - b[index])));
}

function format(value) {
  return Number(value).toFixed(2);
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
