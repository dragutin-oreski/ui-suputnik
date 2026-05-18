# UI Suputnik - Susret 07: Točke, susjedi i udaljenosti

> Interaktivna studentska stranica za klasu 07: nadzirano i nenadzirano učenje, najbliži susjed, matrica udaljenosti u obliku rangiranja susjeda, Euklidska, Manhattan i Chebyshev udaljenost, preporuke, odluke i problem skaliranja.

Kanonska stranica: https://dragutinoreski.com/courses/ui-suputnik/susret-07/

Početna stranica kolegija: https://dragutinoreski.com/courses/ui-suputnik/

## Glavna ideja

Model ne vidi ljude, cvijeće, putnike ili filmove kao ljudi. Vidi retke u tablici, odnosno točke u prostoru atributa. Udaljenost između točaka znači sličnost prema odabranim atributima, a ne fizičku udaljenost niti stvarnu ljudsku bliskost.

Stranica je organizirana kao jedan tok. Student odabire primjer, a isti odabir odmah mijenja novu točku, povijesne točke, najbliže susjede, izračun distance, moguću preporuku ili odluku i usporedbu bez skaliranja / nakon skaliranja.

## Primjeri

Student može birati između četiri domene:

- Churn: jedna točka je korisnik usluge, a cilj je procijeniti rizik odlaska.
- Preporuke: jedna točka je gledatelj, a cilj je pronaći sadržaj koji bi mogao biti relevantan.
- Iris: jedna točka je cvijet perunike, a cilj je klasificirati vrstu cvijeta.
- Titanic: jedna točka je putnik, a cilj je procijeniti vjerojatnost preživljavanja uz oprez u interpretaciji.

Iznad glavnog grafa postoje i brzi primjeri za distance. Ti gumbi automatski postavljaju Churn primjer na vrijednosti koje jasno pokazuju razliku između Euklidske, Manhattan i Chebyshev udaljenosti.

## Tok Stranice

### 1. Točka

Za odabrani primjer stranica prikazuje što jedna točka predstavlja, koji je cilj modela i što realno znači blizina dviju točaka.

### 2. Nova Točka

Student klizačima mijenja atribute nove točke. Promjena odmah utječe na rang najbližih susjeda, graf i izračun udaljenosti.

Student može i kliknuti brzi primjer:

- Euklidska: nova točka i susjedi pokazuju zašto dijagonalna ravna crta može biti kraća.
- Manhattan: isti raspored pokazuje zašto zbroj koraka po osima može izabrati drugog susjeda.
- Chebyshev: isti raspored pokazuje zašto najveći pojedinačni skok može promijeniti interpretaciju.
- Skala: vrijednosti pokazuju kako veći numerički raspon može preuzeti izračun ako se atributi ne skaliraju.

### 3. Susjedi

Graf prikazuje novu točku i povijesne točke. Tri najbliža susjeda spojena su crtama, a rang lista pokazuje udaljenost i ishod svakog susjeda.

Rang najbližih susjeda računa se iz svih klizača. Graf je 2D projekcija radi čitljivosti, pa točka koja izgleda najbliže na grafu nije uvijek prva ako se razlikuje u atributu koji nije na osi.

### 4. Distance

Student bira Euklidsku, Manhattan ili Chebyshev udaljenost. Stranica prikazuje što odabrana metrika znači, koje su razlike po atributima i kako se računa udaljenost do najbližeg susjeda.

- Euklidska udaljenost: ukupna razlika kroz sve atribute.
- Manhattan udaljenost: zbroj pojedinačnih razlika.
- Chebyshev udaljenost: najveća pojedinačna razlika.

Primjeri su vezani uz trenutno odabranu domenu, tako da se objašnjenje distance mijenja zajedno s primjerom.

Stranica također prikazuje tko bi bio najbliži susjed po svakoj od tri metrike, jer isti podaci mogu dati drugačiji poredak kad promijenimo definiciju udaljenosti.

### 5. Preporuka Ili Odluka

Za churn primjer stranica prikazuje signal za moguću intervenciju. Za preporuke prikazuje kandidata za preporuku. Za Iris prikazuje moguću klasifikaciju. Za Titanic prikazuje procjenu uz upozorenje da odabrani atributi nisu cijela povijesna stvarnost.

### 6. Skala

Student može uključiti skaliranje prije izračuna distance. Stranica uspoređuje rang susjeda bez skaliranja i nakon min-max skaliranja. Kod churn i Titanic primjera to posebno pokazuje kako veći numerički rasponi, poput eura ili cijene karte, mogu preuzeti izračun.

## Pitanja Za Vježbu

- Što jedna točka predstavlja u odabranom primjeru?
- Koji atributi ulaze u izračun udaljenosti?
- Što se promijeni kad prebaciš Euklidsku udaljenost na Manhattan ili Chebyshev?
- Kada manja udaljenost stvarno znači koristan signal, a kada može zavarati?
- Što se dogodi kad uključiš skaliranje?
- Koja bi bila odgovorna odluka na temelju najbližih susjeda?
