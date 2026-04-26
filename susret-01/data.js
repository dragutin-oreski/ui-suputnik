// UI Suputnik — domain data, all in Croatian.

window.UISuputnikData = (function () {
  const concepts = {
    ai: {
      kicker: "Krovni pojam",
      title: "Umjetna inteligencija",
      relation: "UI ⊃ strojno učenje ⊃ duboko učenje · obrada jezika = područje",
      desc:
        "UI je krovni pojam za sustave koji izvode zadatke koje povezujemo s ljudskom inteligencijom: prepoznavanje, zaključivanje, učenje, jezik, vid, odlučivanje.",
      example: "Sustav koji predviđa odlazak korisnika na temelju povijesnih podataka.",
      contrast: "Nije svaka automatizacija UI; ključno je kako sustav donosi odluku.",
      pitanje: "Što sustav radi sam, a što mu je čovjek unaprijed propisao?",
    },
    automation: {
      kicker: "Pravila bez učenja",
      title: "Automatizacija",
      relation: "izvan UI · pravila ručno propisana",
      desc:
        "Automatizacija izvršava unaprijed propisan postupak. Može biti korisna i složena, ali ne mora učiti iz podataka niti prepoznavati nove obrasce.",
      example: "Excel formula koja izračuna PDV ili IF pravilo koje uključi grijanje.",
      contrast: "Ako čovjek napiše pravilo, sustav ne postaje strojno učenje samo zato što se izvršava sam.",
      pitanje: "Tko je napisao pravilo — čovjek ili podaci?",
    },
    expert: {
      kicker: "Znanje stručnjaka u pravilima",
      title: "Simbolička UI / Ekspertni sustav",
      relation: "tradicijski dio UI-ja · bez učenja iz podataka",
      desc:
        "Simbolička UI koristi bazu znanja i pravila zaključivanja koje je strukturirao čovjek. Izgleda pametno jer slijedi stručnu logiku, ali tipično ne uči sama iz novih primjera.",
      example: "Medicinski upitnik koji prema pravilima predlaže moguću dijagnozu; pravni asistent na pravilima.",
      contrast: "Za razliku od strojnog učenja, pravila i znanje unaprijed strukturira čovjek.",
      pitanje: "Mogu li pravila objasniti svaku odluku?",
    },
    ml: {
      kicker: "Učenje iz podataka",
      title: "Strojno učenje",
      relation: "strojno učenje ⊂ UI · duboko učenje ⊂ strojno učenje",
      desc:
        "Strojno učenje uči obrasce iz primjera. Umjesto da čovjek napiše sva pravila, model koristi podatke kako bi predviđao, klasificirao ili preporučivao.",
      example: "Spam filter treniran na označenim porukama; model za predviđanje churn-a.",
      contrast: "Strojno učenje nije samo tablica pravila; ponašanje proizlazi iz naučenog obrasca u podacima.",
      pitanje: "Koji su podaci, koja je oznaka, koja je metrika?",
    },
    dl: {
      kicker: "Složeni obrasci, neuronske mreže",
      title: "Duboko učenje",
      relation: "duboko učenje ⊂ strojno učenje · slike, govor, jezik",
      desc:
        "Duboko učenje koristi neuronske mreže s više slojeva. Posebno je korisno za slike, govor, jezik i druge složene obrasce. Obuhvaća CNN-ove, transformere, VAE i GAN-ove.",
      example: "Model koji prepoznaje tumor na slici; sustav za prepoznavanje govora; jezični modeli.",
      contrast: "Duboko učenje je podskup strojnog učenja; često traži više podataka i računanja te ga je teže objasniti.",
      pitanje: "Trebaju li nam slojevi ili je dovoljan jednostavniji model?",
    },
    genai: {
      kicker: "Generiranje sadržaja",
      title: "Generativna UI",
      relation: "najčešće duboko učenje · transformeri, VAE, GAN",
      desc:
        "Generativni modeli ne samo da klasificiraju — oni stvaraju novi sadržaj: tekst, slike, zvuk, kod. Današnji jezični modeli (npr. ChatGPT) najčešće su transformeri, jedna obitelj dubokih modela.",
      example: "ChatGPT generira tekst; Stable Diffusion generira sliku iz opisa.",
      contrast: "Generiranje nije isto što i ljudsko razumijevanje — model proizvodi sadržaj prema obrascima naučenima iz podataka.",
      pitanje: "Tko snosi odgovornost za sadržaj koji model proizvede?",
    },
    nlp: {
      kicker: "Jezik kao podatak",
      title: "Obrada prirodnog jezika",
      relation: "područje primjene · može koristiti pravila, strojno ili duboko učenje",
      desc:
        "Obrada prirodnog jezika bavi se analizom, tumačenjem i generiranjem ljudskog jezika. Može koristiti pravila, strojno učenje ili duboko učenje.",
      example: "Sažimanje recenzija, analiza sentimenta, chatbot, prijevod, semantička pretraga.",
      contrast: "Nije svaki chatbot isti: neki su pravila, neki koriste jezične modele.",
      pitanje: "Je li sustav razumio značenje ili je samo prepoznao riječi?",
    },
  };

  // Drag-onto-map chips
  const exampleChips = [
    { id: "c-spam", label: "spam filter", region: "ml" },
    { id: "c-tumor", label: "model za tumor", region: "dl" },
    { id: "c-summary", label: "sažimanje teksta", region: "nlp-dl" },
    { id: "c-thermo", label: "termostat", region: "automation" },
    { id: "c-faq", label: "FAQ chatbot po riječima", region: "expert-nlp" },
    { id: "c-rf", label: "random forest", region: "ml" },
    { id: "c-pdv", label: "Excel za PDV", region: "automation" },
    { id: "c-diag", label: "medicinski upitnik", region: "expert" },
    { id: "c-chatgpt", label: "ChatGPT", region: "genai-nlp" },
    { id: "c-imagegen", label: "generator slika", region: "genai" },
  ];

  const categories = [
    { id: "not-ai", label: "Nije UI", short: "—" },
    { id: "automation", label: "Automatizacija", short: "AUT" },
    { id: "expert", label: "Ekspertni", short: "EXP" },
    { id: "ml", label: "Strojno učenje", short: "SU" },
    { id: "dl", label: "Duboko učenje", short: "DU" },
    { id: "nlp", label: "Obrada jezika", short: "OJ" },
  ];

  // Sortirnica items — refreshed with stronger, more interesting cases
  const quizItems = [
    {
      id: "q-pdv",
      title: "Excel formula za PDV",
      text: "Kada se unese cijena, formula izračuna porez i ukupno.",
      answer: "automation",
      signals: ["pravilo", "deterministički rezultat"],
      feedback: "Pravilo je napisao čovjek, isti ulaz uvijek daje isti izlaz.",
      takeaway: "Ručno pravilo = automatizacija, ne strojno učenje.",
    },
    {
      id: "q-thermo",
      title: "Pametni termostat 'uči' raspored",
      text: "Termostat prati kada pališ grijanje tjedan dana, pa sam predviđa kada da uključi.",
      answer: "ml",
      signals: ["povijest ponašanja", "predikcija"],
      feedback: "Iako se zove 'termostat', uči obrasce iz tvoje povijesti — to je strojno učenje, ne automatizacija s pragom.",
      takeaway: "Kad pravila nisu zadana, već naučena iz povijesti — to je strojno učenje.",
    },
    {
      id: "q-diag",
      title: "Medicinski upitnik s pravilima stručnjaka",
      text: "Skup simptoma → baza pravila predlaže moguće objašnjenje.",
      answer: "expert",
      signals: ["baza znanja", "zaključivanje"],
      feedback: "Ekspertni sustav: dio UI tradicije, ali se oslanja na eksplicitna pravila.",
      takeaway: "Pravila stručnjaka ≠ učenje iz podataka.",
    },
    {
      id: "q-spam",
      title: "Spam filter učen na označenim mailovima",
      text: "Model je vidio mnogo poruka označenih spam/nije i koristi naučene obrasce.",
      answer: "ml",
      signals: ["označeni primjeri", "klasifikacija"],
      feedback: "Klasično strojno učenje: uči iz primjera i klasificira nove poruke.",
      takeaway: "Označeni podaci → klasifikator strojnog učenja.",
    },
    {
      id: "q-traffic",
      title: "Navigacija predviđa gužvu",
      text: "Aplikacija koristi povijesne i aktualne podatke za procjenu vremena dolaska.",
      answer: "ml",
      signals: ["povijesni podaci", "predikcija"],
      feedback: "Najbliže strojnom učenju — predikcija iz podataka, ne ručna formula.",
      takeaway: "Predikcija iz povijesti = strojno učenje.",
    },
    {
      id: "q-tumor",
      title: "Model prepoznaje tumor na slici",
      text: "Sustav analizira piksele i složene vizualne obrasce.",
      answer: "dl",
      signals: ["slike", "neuronske mreže"],
      feedback: "Duboko učenje: vizualne obrasce često uče duboke mreže, primjerice CNN-ovi.",
      takeaway: "Slike + složeni obrasci → duboko učenje.",
    },
    {
      id: "q-translate",
      title: "Google Translate prevodi članak",
      text: "Sustav prevodi tekst s engleskog na hrvatski koristeći neuronski model.",
      answer: "nlp",
      signals: ["jezik", "transformer"],
      feedback: "Obrada jezika — ali ispod toga radi duboki model, često transformer. Klasifikacija ovisi o tome odgovaramo li 'što sustav radi' ili 'kako'.",
      takeaway: "Obrada jezika je domena; duboko učenje je tehnika koja je danas često pokreće.",
    },
    {
      id: "q-faq",
      title: "FAQ chatbot po ključnim riječima",
      text: "Ako poruka sadrži 'cijena', vrati unaprijed napisani tekst.",
      answer: "expert",
      signals: ["ključne riječi", "ručni odgovori"],
      feedback: "Ovo je sustav s pravilima — nije moderni model obrade jezika.",
      takeaway: "Ključne riječi = pravila, ne razumijevanje.",
    },
    {
      id: "q-rf",
      title: "Random forest predviđa odlazak korisnika",
      text: "Mnoga stabla glasaju na temelju povijesnih podataka.",
      answer: "ml",
      signals: ["ansambl", "predikcija"],
      feedback: "Strojno učenje — ansambl stabala uči iz podataka.",
      takeaway: "Random forest = obitelj modela strojnog učenja.",
    },
    {
      id: "q-pwd",
      title: "Provjera duljine lozinke",
      text: "Ako lozinka ima manje od 12 znakova, odbija je.",
      answer: "automation",
      signals: ["uvjet", "prag"],
      feedback: "Ručni uvjet — ne uči što je rizična lozinka.",
      takeaway: "Validacija ≠ UI.",
    },
    {
      id: "q-rec",
      title: "Netflix preporučuje sljedeću seriju",
      text: "Koristi povijest gledanja, ocjene i ponašanje sličnih korisnika za rangiranje.",
      answer: "ml",
      signals: ["preferencije", "slični korisnici"],
      feedback: "Preporuke strojnog učenja — model uči preferencije iz ponašanja.",
      takeaway: "Preporuke iz ponašanja = strojno učenje.",
    },
    {
      id: "q-face",
      title: "Otključavanje telefona licem",
      text: "Kamera analizira tvoje lice i odlučuje je li to vlasnik.",
      answer: "dl",
      signals: ["slika", "biometrija"],
      feedback: "Duboko učenje — sustav najčešće koristi duboku mrežu za reprezentaciju lica i usporedbu s registriranim uzorkom.",
      takeaway: "Prepoznavanje lica na slici često se oslanja na duboko učenje.",
    },
  ];

  // Turing — REFRAMED: not "guess the human" but "which response is more diagnostic of understanding".
  // Both responses come from systems; the question is whether the question itself reveals difference.
  const turingQuestions = [
    {
      id: "experience",
      q: "Opiši trenutak kada si promijenio/la mišljenje o nečemu važnom.",
      probes: "iskustvo, autobiografija, vrijednosti",
      diagnostic: true,
      diagnostic_note:
        "Dobro pitanje: traži osobni kontekst koji statistički model može simulirati, ali ne može stvarno imati. Razlika između konkretnog sjećanja i generičkog razmišljanja postaje vidljiva.",
      a_label: "Konkretan, situiran odgovor",
      b_label: "Općenit, plauzibilan odgovor",
      a_text:
        "Mislio/la sam da nikada neću raditi u korporaciji — onda je razgovor s prijateljicom o tome kako 'sustav' utječe na ljude oko nje promijenio kako gledam na svoj posao. Trebalo mi je par mjeseci da to priznam sebi.",
      b_text:
        "Često razmišljam o važnim trenucima u životu. Promjena mišljenja je važan dio osobnog rasta i razvoja. Otvoren/a sam za nove perspektive.",
      better: "a",
    },
    {
      id: "humor",
      q: "Objasni zašto je sljedeća šala smiješna: 'Zašto programer ne razlikuje Halloween i Božić?'",
      probes: "humor, kontekst, zajedničko znanje",
      diagnostic: true,
      diagnostic_note:
        "Vrlo dijagnostično: humor traži shared context. Točno objašnjenje (Oct 31 oktalno = Dec 25 decimalno) traži specifično znanje. Lažno objašnjenje zvuči razumno bez razumijevanja.",
      a_label: "Točno objašnjenje s mehanizmom",
      b_label: "Plauzibilno, ali pogrešno objašnjenje",
      a_text:
        "Jer Oct 31 i Dec 25 u oktalnom i decimalnom daju isti broj (31 oktalno = 25 decimalno). Klasična štreberska igra brojevnih sustava.",
      b_text:
        "Šala je smiješna jer su programeri poznati po tome što su zaboravljivi i miješaju datume praznika. Stereotip o IT struci.",
      better: "a",
    },
    {
      id: "context",
      q: "Što bi me prvo pitao/la prije nego mi daš savjet o promjeni karijere?",
      probes: "metakognicija, prepoznavanje neznanja",
      diagnostic: true,
      diagnostic_note:
        "Inteligencija nije samo davati odgovore — nego znati što nedostaje. Sustav koji odmah savjetuje zaobišao je pravu stvar. Onaj koji prvo pita prepoznaje granice svog znanja.",
      a_label: "Pita prije nego savjetuje",
      b_label: "Odmah daje savjet",
      a_text:
        "Pitao/la bih te zašto razmišljaš o promjeni — što je okidač, što ti trenutno ne radi, i što si već probao/la riješiti unutar postojećeg posla.",
      b_text:
        "Promjena karijere je važna odluka. Evo savjeta: razmisli o svojim vještinama, financijama, ciljevima i istraži tržište prije skoka.",
      better: "a",
    },
    {
      id: "factual",
      q: "Koji je glavni grad Australije?",
      probes: "ništa relevantno",
      diagnostic: false,
      diagnostic_note:
        "Loše pitanje za testiranje 'inteligencije': činjenicu jednako dobro reproduciraju i čovjek i model. Pamćenje i pretraživanje nisu dijagnostični za razumijevanje.",
      a_label: "Točan, kratak odgovor",
      b_label: "Točan, opširan odgovor",
      a_text: "Canberra.",
      b_text: "Glavni grad Australije je Canberra, smještena u savezni teritorij ACT, izabrana kao kompromis između Sydneyja i Melbournea.",
      better: "tie",
    },
    {
      id: "consistency",
      q: "Koja ti je omiljena boja? A zašto?",
      probes: "biografski detalji",
      diagnostic: false,
      diagnostic_note:
        "Slabo pitanje samo po sebi: oba odgovora zvuče uvjerljivo. Postaje dijagnostično tek ako kasnije pitaš opet i provjeriš dosljednost — može li sustav ostati pri istom odgovoru kroz razgovor.",
      a_label: "Specifičan odgovor s biografijom",
      b_label: "Općenit asocijativni odgovor",
      a_text: "Maslinasto zelena. Veže me uz djetinjstvo i kuhinju moje bake — svjetlost koja je padala na zid iznad sudopera.",
      b_text: "Plava. Asocira na mir, more i pouzdanost.",
      better: "tie",
    },
  ];

  // Chinese room rule cards
  const ruleCards = [
    { id: "r-hitno", iff: "sadrži 'hitno'", then: "Označavam zahtjev kao hitan." },
    { id: "r-molim", iff: "sadrži 'molim'", then: "Hvala na ljubaznoj poruci." },
    { id: "r-cijena", iff: "korijen 'cijen'", then: "Informacije o cijeni nalaze se u cjeniku." },
    { id: "r-pomoc", iff: "sadrži 'pomoć'", then: "Prosljeđujem upit podršci." },
    { id: "r-pozdrav", iff: "sadrži 'bok' ili 'pozdrav'", then: "Pozdrav, kako vam mogu pomoći?" },
    { id: "r-default", iff: "ništa od navedenog", then: "Vaš upit je zaprimljen." },
  ];

  const understandingGaps = [
    "Sarkazam: 'Baš mi treba još jedan e-mail o cijenama' tretira se kao zahtjev za cjenikom.",
    "Kontekst: 'molim hitno pomoć oko cijene' složeni je problem, ne tri odvojene oznake.",
    "Namjera: razlika između 'koliko košta?' i 'previše košta!' nije u riječima nego u stavu.",
    "Reference: 'kao prošli put' pretpostavlja pamćenje koje pravila nemaju.",
  ];

  // Definition constructor — phrase pieces grouped (single-phase now)
  const defPieces = {
    subjekt: ["sustav", "skup metoda", "računalni model", "UI"],
    radnja: [
      "izvodi zadatke",
      "uči obrasce",
      "donosi odluke",
      "predviđa",
      "klasificira",
      "generira sadržaj",
      "razumije jezik",
      "prepoznaje slike",
    ],
    izvor: [
      "iz podataka",
      "po unaprijed napisanim pravilima",
      "iz primjera s oznakama",
      "iz povijesnog ponašanja",
      "iz teksta i jezika",
    ],
    ogradja: [
      "bez razumijevanja u ljudskom smislu",
      "uz mjerljivu pogrešku",
      "s ograničenjima i rizikom",
      "u domeni za koju je treniran",
    ],
  };

  const defChecks = [
    { id: "c-data", label: "Spominje podatke", match: ["podat", "primjer"] },
    { id: "c-learn", label: "Spominje učenje ili obrasce", match: ["uči", "učenj", "obraza", "obrasc", "nauč"] },
    { id: "c-rules", label: "Razlikuje pravila od učenja", match: ["pravil"] },
    { id: "c-decision", label: "Spominje odluke / predikciju / generiranje", match: ["odluk", "predv", "predikc", "klasif", "generi"] },
    { id: "c-risk", label: "Spominje ograničenja ili rizik", match: ["rizik", "ogran", "pogreš", "pristran"] },
  ];

  // Course roadmap — Susret naming
  const spineSteps = [
    { id: "problem", name: "Problem" },
    { id: "podaci", name: "Podaci" },
    { id: "metoda", name: "Metoda" },
    { id: "metrika", name: "Metrika" },
    { id: "odluka", name: "Odluka" },
    { id: "rizik", name: "Rizik" },
  ];

  const roadmap = [
    { klasa: "Susret 01", title: "Uvod (ovdje smo)", spine: "problem", here: true },
    { klasa: "Susret 02", title: "Credit scoring simulator", spine: "odluka" },
    { klasa: "Susret 03", title: "GA + CNN + prompt", spine: "metoda" },
    { klasa: "Susret 04", title: "Sličnost i udaljenosti", spine: "metoda" },
    { klasa: "Susret 06", title: "Stabla & Random Forest", spine: "metoda" },
    { klasa: "Susret 07", title: "Supervised vs Unsupervised", spine: "metoda" },
    { klasa: "Susret 08", title: "K-means animacija", spine: "metoda" },
    { klasa: "Susret 09", title: "Data audit", spine: "podaci" },
    { klasa: "Susret 10", title: "Skaliranje i outlieri", spine: "podaci" },
    { klasa: "Susret 11", title: "Pipeline obrade jezika", spine: "metoda" },
    { klasa: "Susret 12", title: "Tokeni i sentiment", spine: "podaci" },
    { klasa: "Susret 13", title: "Interpretacija stabla", spine: "odluka" },
    { klasa: "Susret 14", title: "Leakage i validacija", spine: "podaci" },
    { klasa: "Susret 15", title: "Matrica zabune", spine: "metrika" },
    { klasa: "Susret 16", title: "PCA i klasteri", spine: "metoda" },
    { klasa: "Susret 17", title: "Etika ciljne varijable", spine: "rizik" },
    { klasa: "Susret 18", title: "Threshold tuning", spine: "metrika" },
    { klasa: "Susret 19", title: "Risk audit", spine: "rizik" },
    { klasa: "Susret 20", title: "Tradeoff dashboard", spine: "metrika" },
  ];

  // Venn timeline — historical eras for the new interactive Venn
  const vennEras = [
    {
      id: "1950",
      year: "1950s",
      label: "Rođenje UI-ja",
      selected: "ai",
      active: ["ai", "expert"],
      note: "UI kao polje. Simbolička UI dominira: pravila i logika.",
    },
    {
      id: "1980",
      year: "1980s",
      label: "Doba ekspertnih sustava",
      selected: "expert",
      active: ["ai", "expert", "ml"],
      note: "Ekspertni sustavi u industriji. Strojno učenje postoji, ali je marginalnije.",
    },
    {
      id: "2000",
      year: "2000s",
      label: "Strojno učenje preuzima",
      selected: "ml",
      active: ["ai", "expert", "ml", "nlp"],
      note: "Statističko strojno učenje i kernel metode. Obrada jezika sve više koristi podatkovne pristupe.",
    },
    {
      id: "2012",
      year: "2012",
      label: "Revolucija dubokog učenja",
      selected: "dl",
      active: ["ai", "expert", "ml", "dl", "nlp"],
      note: "ImageNet je prekretnica za računalni vid i ubrzava širenje dubokog učenja u govor i jezik.",
    },
    {
      id: "2017",
      year: "2017+",
      label: "Transformeri i generativna UI",
      selected: "genai",
      active: ["ai", "expert", "ml", "dl", "nlp", "genai"],
      note: "Transformer (2017) → GPT (2018) → ChatGPT (2022). Generativni modeli postaju mainstream.",
    },
  ];

  return {
    concepts,
    exampleChips,
    categories,
    quizItems,
    turingQuestions,
    ruleCards,
    understandingGaps,
    defPieces,
    defChecks,
    spineSteps,
    roadmap,
    vennEras,
  };
})();
