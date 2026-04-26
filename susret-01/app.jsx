// Root app — composes all modules
const D5 = window.UISuputnikData;

function App() {
  const [classifierStats, setClassifierStats] = React.useState({ correct: 0, total: D5.quizItems.length });

  React.useEffect(() => {
    const update = () => {
      try {
        const placements = JSON.parse(localStorage.getItem("ui-suputnik-placements-v2") || "{}");
        const correct = Object.entries(placements).filter(([qid, cat]) => {
          const it = D5.quizItems.find((q) => q.id === qid);
          return it && it.answer === cat;
        }).length;
        setClassifierStats({ correct, total: D5.quizItems.length });
      } catch {}
    };
    update();
    const id = setInterval(update, 1500);
    return () => clearInterval(id);
  }, []);

  const tweakDefaults = /*EDITMODE-BEGIN*/{
    "concept_map_mode": "venn",
    "classifier_mode": "drag",
    "show_confusion": false,
    "accent_hue": "ochre"
  }/*EDITMODE-END*/;
  const [tweaks, setTweak] = useTweaks(tweakDefaults);

  React.useEffect(() => {
    const root = document.documentElement;
    if (tweaks.accent_hue === "teal") {
      root.style.setProperty("--accent", "#2a5d57");
      root.style.setProperty("--accent-wash", "#dde9e6");
      root.style.setProperty("--accent-soft", "#7fb1a8");
    } else if (tweaks.accent_hue === "rust") {
      root.style.setProperty("--accent", "#8a3a1f");
      root.style.setProperty("--accent-wash", "#ecd6c8");
      root.style.setProperty("--accent-soft", "#d9a890");
    } else {
      root.style.setProperty("--accent", "#6b4f1d");
      root.style.setProperty("--accent-wash", "#efe3c7");
      root.style.setProperty("--accent-soft", "#c9a566");
    }
  }, [tweaks.accent_hue]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">s</span>
          <div>
            <div className="brand-name">UI Suputnik</div>
            <div className="brand-meta">vizualni pratitelj · Susret 01</div>
          </div>
        </div>
        <div className="topbar-right">
          <span>kolegij · Umjetna inteligencija</span>
          <span>· dobrobiti i rizici</span>
        </div>
      </header>

      <section className="hero" data-screen-label="01 Hero">
        <div>
          <span className="kicker kicker--accent">Susret 01 · Uvod i osnovni pojmovi UI</span>
          <h1 className="hero-title" style={{ marginTop: 16 }}>
            Što zapravo znači reći — <em>"to je UI"</em>?
          </h1>
          <p className="hero-sub">
            Šest pojmova koji se često miješaju, jedan obrazac razmišljanja, i jedan kompas koji ostaje s tobom kroz ostatak kolegija.
          </p>
        </div>
        <div className="spine">
          <div className="spine-label">
            <span className="kicker">Obrazac kolegija</span>
            <span className="kicker" style={{ color: "var(--accent)" }}>od koncepta do odluke</span>
          </div>
          <div className="spine-flow">
            {D5.spineSteps.map((s, i) => (
              <div key={s.id} className={`spine-step ${i === 0 ? "spine-step--active" : ""}`}>
                <span className="spine-dot"></span>
                <span className="spine-name">{s.name}</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 14, fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--muted)", fontSize: 14 }}>
            Svaki novi sustav koji upoznajemo prolazi kroz isti obrazac.
          </p>
        </div>
      </section>

      <section id="mreza" className="module" data-screen-label="02 Mreža pojmova">
        <div className="module-head">
          <span className="module-num">01</span>
          <div className="module-title">
            <span className="kicker">Vidi · Mijenjaj</span>
            <h2>Mreža pojmova</h2>
            <p className="module-summary">
              UI nije jedna stvar. Pojmovi su skupovi — neki su <em>unutar</em> drugih, neki ih <em>presijecaju</em>. Klikni regiju, povuci primjer u nju, ili pomiči vremensku liniju.
            </p>
          </div>
          <div className="module-pattern">
            <span className="on">Vidi</span>
            <span className="on">Mijenjaj</span>
            <span>Objasni</span>
            <span>Koristi</span>
            <span>Pamti</span>
          </div>
        </div>

        {tweaks.concept_map_mode === "venn" ? <MrezaPanel /> : <ConceptListAlt />}
        <SignalnaPloca />
      </section>

      <section id="sortirnica" className="module" data-screen-label="03 Sortirnica">
        <div className="module-head">
          <span className="module-num">02</span>
          <div className="module-title">
            <span className="kicker">Koristi · Objasni</span>
            <h2>Sortirnica — UI ili nije UI?</h2>
            <p className="module-summary">
              Povuci svaki primjer u kategoriju koja mu najbolje pristaje. Točni i pogrešni odabiri sastavljaju <em>matricu zabune</em> — istu vrstu mape grešaka koju ćemo koristiti u Susretu 15.
            </p>
          </div>
          <div className="module-pattern">
            <span>Vidi</span>
            <span>Mijenjaj</span>
            <span className="on">Objasni</span>
            <span className="on">Koristi</span>
            <span>Pamti</span>
          </div>
        </div>

        <Sortirnica showConfusion={tweaks.show_confusion} />
      </section>

      <section id="misao" className="module" data-screen-label="04 Ponašanje ili razumijevanje">
        <div className="module-head">
          <span className="module-num">03</span>
          <div className="module-title">
            <span className="kicker">Vidi · Objasni</span>
            <h2>Ponašanje ili razumijevanje?</h2>
            <p className="module-summary">
              Dva klasična misaona eksperimenta postavljaju isto pitanje s dvije strane: ako se sustav <em>ponaša</em> inteligentno, znači li to da <em>razumije</em>?
            </p>
          </div>
          <div className="module-pattern">
            <span className="on">Vidi</span>
            <span>Mijenjaj</span>
            <span className="on">Objasni</span>
            <span>Koristi</span>
            <span>Pamti</span>
          </div>
        </div>
        <div className="thought">
          <TuringPanel />
          <ChineseRoom />
        </div>
      </section>

      <section id="definicija" className="module" data-screen-label="05 Moja definicija">
        <div className="module-head">
          <span className="module-num">04</span>
          <div className="module-title">
            <span className="kicker">Objasni · Pamti</span>
            <h2>Moja definicija UI-ja</h2>
            <p className="module-summary">
              Ne pišeš akademsku definiciju — <em>slažeš</em> je. Cilj: ona koja ti pomaže razlikovati sustave i postaviti prava pitanja.
            </p>
          </div>
          <div className="module-pattern">
            <span>Vidi</span>
            <span>Mijenjaj</span>
            <span className="on">Objasni</span>
            <span>Koristi</span>
            <span className="on">Pamti</span>
          </div>
        </div>
        <DefinicijaPanel />
      </section>

      <section id="takeaway" className="module" data-screen-label="06 Sažetak">
        <div className="module-head">
          <span className="module-num">05</span>
          <div className="module-title">
            <span className="kicker">Pamti</span>
            <h2>Sažetak</h2>
            <p className="module-summary">Sažetak koji možeš kopirati i ponijeti dalje — u bilješke, u chat, u sljedeći susret.</p>
          </div>
          <div className="module-pattern">
            <span>Vidi</span>
            <span>Mijenjaj</span>
            <span>Objasni</span>
            <span>Koristi</span>
            <span className="on">Pamti</span>
          </div>
        </div>
        <TakeawayPanel classifierStats={classifierStats} />
      </section>

      <section id="roadmap" className="module" data-screen-label="07 Plan kolegija">
        <div className="module-head">
          <span className="module-num">06</span>
          <div className="module-title">
            <span className="kicker">Plan kroz kolegij</span>
            <h2>Put kroz kolegij</h2>
            <p className="module-summary">
              Svaki budući susret pada pod jedan korak iste spine: <em>problem → podaci → metoda → metrika → odluka → rizik</em>.
            </p>
          </div>
          <div className="module-pattern">
            <span>plan</span>
          </div>
        </div>
        <RoadmapPanel />
      </section>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Mapa pojmova" />
        <TweakRadio
          label="Vizualizacija"
          value={tweaks.concept_map_mode}
          options={[
            { value: "venn", label: "Venn" },
            { value: "list", label: "Lista" },
          ]}
          onChange={(v) => setTweak("concept_map_mode", v)}
        />
        <TweakSection label="Sortirnica" />
        <TweakToggle
          label="Matrica zabune"
          value={tweaks.show_confusion}
          onChange={(v) => setTweak("show_confusion", v)}
        />
        <TweakSection label="Ton" />
        <TweakRadio
          label="Akcent"
          value={tweaks.accent_hue}
          options={[
            { value: "ochre", label: "Oker" },
            { value: "teal", label: "Teal" },
            { value: "rust", label: "Cigla" },
          ]}
          onChange={(v) => setTweak("accent_hue", v)}
        />
      </TweaksPanel>
    </div>
  );
}

function ConceptListAlt() {
  const [selected, setSelected] = React.useState("ai");
  const detail = D5.concepts[selected];

  const tree = [
    { id: "automation", label: "Automatizacija", indent: 0, note: "izvan UI · ručna pravila" },
    { id: "ai", label: "UI (krovni pojam)", indent: 0, note: "metode + sustavi" },
    { id: "expert", label: "└ Simbolička UI / Ekspertni", indent: 1, note: "pravila + znanje" },
    { id: "ml", label: "└ Strojno učenje", indent: 1, note: "uči iz podataka" },
    { id: "dl", label: "    └ Duboko učenje", indent: 2, note: "neuronske mreže" },
    { id: "genai", label: "        └ Generativna UI", indent: 3, note: "transformeri, GAN, VAE" },
    { id: "nlp", label: "Obrada jezika — područje primjene", indent: 0, note: "može koristiti pravila, strojno ili duboko učenje" },
  ];

  return (
    <div className="mreza">
      <div className="surface" style={{ padding: 22 }}>
        <span className="kicker">Hijerarhija pojmova</span>
        <h4 style={{ margin: "8px 0 16px", color: "var(--ink-2)" }}>Klikni za objašnjenje</h4>
        {tree.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelected(t.id)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "10px 12px",
              marginBottom: 6,
              background: selected === t.id ? "var(--accent-wash)" : "var(--paper-2)",
              borderRadius: "var(--r-md)",
              border: selected === t.id ? "1px solid var(--accent)" : "1px solid var(--line)",
              fontFamily: "var(--mono)",
              fontSize: 13,
              paddingLeft: 12 + t.indent * 18,
            }}
          >
            <span style={{ color: selected === t.id ? "var(--accent)" : "var(--ink)", fontWeight: 600 }}>{t.label}</span>
            <span style={{ display: "block", fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{t.note}</span>
          </button>
        ))}
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
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
