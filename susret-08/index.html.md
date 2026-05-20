# UI Suputnik · Susret 08 · Idealni zaposlenik

> Radna tablica za vježbu "Idealni zaposlenik": studenti dodaju kandidate i atribute, definiraju idealni profil, automatski računaju udaljenosti i izvoze rezultat u Excel.

Kanonska stranica: https://dragutinoreski.com/courses/ui-suputnik/susret-08/

Početna stranica kolegija: https://dragutinoreski.com/courses/ui-suputnik/

## Namjena

Alat služi kao pojednostavljena Excel-tablica u pregledniku. Početna tablica je mali prazan grid sa stupcima i retcima u koje studenti odmah mogu pisati. Stupci se dodaju gumbom `+` uz zaglavlje, a brišu gumbom `−` u zaglavlju stupca. Retci se dodaju gumbom `+ redak`, a brišu gumbom `−` u retku. Poseban redak "Idealni" predstavlja referentni profil.

Preklopnik `Prazno / Primjer` omogućuje povratak na početni prazan grid ili učitavanje ispunjenog primjera s kandidatima, atributima i idealnim profilom.

Opcija `Skaliraj / ponderiraj` početno je isključena. Kad se uključi, u zaglavljima stupaca pojavljuju se postavke `min`, `max` i `važ.`. Zadana važnost svakog atributa je 1. Panel doprinosa tada prikazuje raspon, važnost i doprinos koji ulazi u izračun distance.

## Predloženi rad u grupama

1. Upišite nazive atributa u prazna zaglavlja stupaca.
2. Po potrebi dodajte ili obrišite stupce gumbima `+` i `−`.
3. Dogovorite i unesite idealni profil.
4. Unesite vrijednosti kandidata u prazne retke.
5. Po potrebi dodajte ili obrišite retke.
6. Usporedite poredak po Euklidskoj i Chebyshev udaljenosti.
7. Promijenite jednu pretpostavku: atribut, ideal ili skaliranje.
8. Izvezite rezultat u `.xlsx` datoteku. Export sadrži retke `Minimum`, `Maksimum` i `Važnost`, a udaljenosti i rangovi ostaju Excel formule pa se rezultat mijenja kad se u Excelu promijene ideal, kandidat ili postavke skaliranja. Radna knjiga je formatirana s čitljivim zaglavljima, zamrznutim početnim stupcima, filterom na tablici i grafom usporedbe Euklidske i Chebyshev udaljenosti.

## Pedagoški naglasak

Formula ne bira najboljeg čovjeka. Formula rangira retke u tablici prema atributima koje je grupa odabrala i vrijednostima koje je unijela.
