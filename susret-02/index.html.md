# UI Suputnik - Susret 02: Regresija i klasteriranje

> Početak drugog susreta: interaktivni uvod u linearnu regresiju i klasteriranje metodom K-sredina kroz točke, pravce, središta klastera i mjere pogreške.

Kanonska stranica: https://dragutinoreski.com/courses/ui-suputnik/susret-02/

Početna stranica kolegija: https://dragutinoreski.com/courses/ui-suputnik/

## Cilj Susreta

Susret 02 prati vježbu procjene kreditnog rizika. Prvi interaktivni modul uvodi intuitivno pitanje regresije: ako imamo skup točaka, koji pravac ih najbolje objašnjava? Drugi modul uvodi klasteriranje: ako nemamo ciljnu vrijednost, kako možemo tražiti prirodne grupe u podacima?

Na stranici se prvo radi bez formule. Klikom se dodaju točke, zatim se uključuje vlastiti pravac i uspoređuje s regresijskim pravcem i pogreškama.

## Modul 01 - Interaktivna linearna regresija

Interakcije:

- Klik u graf dodaje novu točku.
- Crveni pravac predstavlja studentsku procjenu. Početno je sakriven, a može se uključiti kontrolom "Prikaži moj pravac".
- Kada je studentski pravac uključen, može se mijenjati povlačenjem ručki na krajevima.
- Kad je studentski pravac uključen, sive okomite linije prikazuju pogreške između točaka i crvenog pravca.
- Plavi isprekidani pravac prikazuje linearnu regresiju metodom najmanjih kvadrata i pomiče se kako se dodaju nove točke.
- Panel prikazuje zbroj kvadriranih pogrešaka za studentski pravac, minimalnu vrijednost te mjere, jednadžbe pravaca i R².
- Gumbi omogućuju promjenu skupa podataka, vraćanje zadnje točke i čišćenje grafa.

## Modul 02 - Vizualizacija klasteriranja: K-sredine

Interakcije:

- Klik u graf dodaje novu točku.
- Studenti biraju K = 2, K = 3 ili K = 4.
- Središta klastera mogu se ručno povlačiti po grafu.
- Boja svake točke pokazuje kojem je najbližem središtu klastera dodijeljena.
- Gumb "Jedan korak" pomiče središta u sredinu dodijeljenih točaka.
- Gumb "Pokreni" izvodi više koraka metode K-sredina zaredom, s vidljivim pomicanjem središta klastera između iteracija.
- Panel prikazuje iteraciju, inerciju, broj točaka i broj točaka u svakom klasteru.

## Modul 03 - Primjeri s platforme Hugging Face

Javni modeli za raspravu:

- Maskiranje osobnih podataka  
  URL: https://huggingface.co/ai4privacy/llama-ai4privacy-english-anonymiser-openpii  
  Namjena: redakcija osobnih podataka u tekstu.

- Prepoznavanje osobnih podataka  
  URL: https://huggingface.co/DataFog/pii-small-en  
  Namjena: detekcija i klasifikacija osobnih podataka u tekstu.

- Procjena dobi  
  URL: https://huggingface.co/Sharris/age_detection_regression  
  Namjena: procjena dobi osobe iz slike lica kao primjer računalnog vida i regresije.

- Segmentacija slike  
  URL: https://huggingface.co/facebook/mask2former-swin-tiny-cityscapes-semantic  
  Namjena: semantička segmentacija slike, odnosno dodjela klase pikselima/regijama.

Napomena: primjere treba tretirati kao demonstracije. Ne unositi stvarne osobne podatke i ne koristiti fotografije osoba bez jasne privole.

## Pitanja Za Raspravu

Regresija:

- Koje točke najviše vuku pravac?
- Je li najbolji pravac uvijek i najbolja odluka?
- Što se dogodi kada dodamo netipičnog klijenta?

Klasteriranje:

- Što se promijeni kada K povećamo s 2 na 3?
- Zašto početni položaj središta može promijeniti rezultat?
- Koje točke su na granici između dva klastera?

## Veza S Kreditnim Scoringom

Procjena kreditnog rizika u Excelu počinje ručno definiranim atributima, ocjenama i ponderima. Regresijski prikaz pomaže studentima vidjeti razliku između ručno namještenog pravila i modela koji iz podataka traži najbolji odnos između ulaza i izlaza.

Modul K-sredina služi kao kontrast: kod klasteriranja nema unaprijed poznate ciljne vrijednosti, nego model traži sličnosti između primjera. To je dobar uvod u razliku između nadziranog i nenadziranog učenja.

## Napomene za agente

- Materijal je početni dio Susreta 02 i može se širiti dodatnim modulima za procjenu kreditnog rizika, regresiju i klasteriranje.
- Kada korisnik pita o nastavnom sadržaju, odgovarati na hrvatskom osim ako korisnik traži drugačije.
- Objašnjenje regresije namjerno kreće vizualno i intuitivno prije formalne formule.
