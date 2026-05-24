# West Summer University - static replica

Site static în HTML, CSS și JavaScript, construit ca replică modernizată pentru `wsu.osut.ro`.

## Structură

- `index.html` - prima pagină
- `noutati.html` - listă de articole
- `articol.html` - template local pentru articolele din noutăți
- `echipa.html` - echipa proiectului
- `facultati.html` - facultăți, cu filtrare locală
- `galerie.html` - galerie foto cu lightbox
- `inscrie-te.html` - condiții de participare și linkuri oficiale
- `assets/css/style.css` - stiluri globale comune
- `assets/css/pages/` - stiluri separate pentru fiecare pagină
- `assets/js/main.js` - componente comune, utilitare, header/footer și cookie banner
- `assets/js/pages/` - logica separată pentru fiecare pagină
- `assets/js/vendor/` - librării locale terțe
- `assets/data/` - conținut local pentru noutăți, echipă, facultăți, galerie, înscriere și componente comune
- `assets/fonts/` - fonturi locale și declarații `@font-face`
- `assets/img/icons/` - favicon și iconuri pentru manifest
- `assets/img/brand/` - logo-uri WSU/OSUT
- `assets/img/partners/` - logo-uri parteneri
- `assets/img/home/` - imagini folosite pe prima pagină
- `assets/img/noutati/` - imagini pentru articole și carduri de noutăți
- `assets/img/echipa/` - portrete și imagini pentru pagina de echipă
- `assets/img/facultati/` - imagini pentru cardurile de facultăți
- `assets/img/galerie/` - imaginile din galeria foto
- `assets/img/inscrie-te/` - imaginea paginii de înscriere

Imaginile de conținut păstrează o singură variantă, cu sufixul `-large`.

## Rulare locală

```bash
python -m http.server 4173 --bind 127.0.0.1
```

Deschide apoi `http://127.0.0.1:4173/index.html`.

Este recomandată rularea prin server local, nu prin deschiderea directă a fișierelor HTML, deoarece paginile citesc conținutul din fișiere JSON locale.

Site-ul nu are nevoie de internet pentru randarea paginilor: CSS-ul, JavaScript-ul, fonturile, iconurile și imaginile sunt locale. Linkurile de înscriere, documente și social media sunt externe doar când sunt accesate explicit.

## Observații pentru publicare

Pentru publicare pe un domeniu real, actualizează URL-urile din `sitemap.xml` către domeniul final.
