// --- Demo-data ---------------------------------------------------------
/**
 * Rediger/erstatt denne listen med deres egne drakter.
 * image: kan være en URL eller lokal filsti.
 * status: "tilgjengelig" | "ibruk"
 * type: "individuell" | "par" | "tropp"
 * tilbud: "leie" | "kjøp"
 * pris: tall (NOK)
 * eier: "navn"
 */
const drakter = [
  {
    id: "K-001",
    navn: "Troppsdrakt",
    storrelse: "S",
    farger: ["svart", "blonder"],
    image: "/Users/ingvild/Sportsdrill/Drakter-i-Fana/Bilder/srtropp24.jpeg",
    status: "tilgjengelig",
    eier: ["Ingvild, Anna, Sofie, Margrete, Alida, Nora, Marie"],
    beskrivelse: "Svart med ben og blonder",
    type: "Tropp (7)",
    tilbud: "leie / selge",
    pris: 650
  },
  {
    id: "K-002",
    navn: "Piratsuite",
    storrelse: "L",
    farger: ["svart", "brun"],
    image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=1200&auto=format&fit=crop",
    status: "ibruk",
    eier: ["Margrete"],
    beskrivelse: "Inkluderer skjorte, vest og bukser.",
    type: "Par",
    tilbud: "leie",
    pris: 400
  },
  {
    id: "K-003",
    navn: "Labfrakk",
    storrelse: "S",
    farger: ["hvit"],
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop",
    status: "tilgjengelig",
    eier: ["Sofie"],
    beskrivelse: "Standard labfrakk.",
    type: "Individuell",
    tilbud: "kjøp",
    pris: 600
  },
  {
    id: "K-004",
    navn: "Uniform – Kaptein",
    storrelse: "XL",
    farger: ["marine", "gull"],
    image: "https://images.unsplash.com/photo-1530884698388-509e3973021e?q=80&w=1200&auto=format&fit=crop",
    status: "ibruk",
    eier: ["Anna"],
    beskrivelse: "Formell jakke og bukse med detaljer.",
    type: "Tropp (6)",
    tilbud: "leie",
    pris: 900
  },
  {
    id: "K-005",
    navn: "Charleston-kjole",
    storrelse: "M",
    farger: ["svart", "sølv"],
    image: "https://images.unsplash.com/photo-1528712306091-ed0763094c98?q=80&w=1200&auto=format&fit=crop",
    status: "tilgjengelig",
    eier: ["Annabell"],
    beskrivelse: "1920-talls stil, frynser og glitter.",
    type: "Individuell",
    tilbud: "leie",
    pris: 300
  }
];

// --- Elementreferanser -------------------------------------------------
const grid = document.getElementById('grid');
const q = document.getElementById('q');
const type = document.getElementById('type');
const storrelse = document.getElementById('storrelse');
const statusSel = document.getElementById('status');
const sortSel = document.getElementById('sort');
const statTotal = document.getElementById('statTotal');
const statTilgjengelig = document.getElementById('statTilgjengelig');

const dlg = document.getElementById('detailDialog');
const dlgClose = document.getElementById('dlgClose');
const dlgTitle = document.getElementById('dlgTitle');
const dlgImg = document.getElementById('dlgImg');
const dlgSize = document.getElementById('dlgSize');
const dlgTyp = document.getElementById('dlgTyp');
const dlgOwn = document.getElementById('dlgOwn');
const dlgPrice = document.getElementById('dlgPrice');
const dlgOff = document.getElementById('dlgOff');
const dlgStatus = document.getElementById('dlgStatus');
const dlgDesc = document.getElementById('dlgDesc');

// --- Rendering ---------------------------------------------------------
function renderCards(items) {
  grid.innerHTML = '';
  items.forEach(item => {
    const card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', item.navn + ' detaljer');
    card.innerHTML = `
      <div class="thumb">
        <img src="${item.image}" alt="${item.navn}" loading="lazy" />
        <span class="badge">${item.id}</span>
      </div>
      <div class="body">
        <div class="title-row">
          <div>
            <div class="name">${item.navn}</div>
            <div class="size">Str. ${item.storrelse} • ${item.type}</div>
          </div>
          <span class="status ${item.status}">${labelForStatus(item.status)}</span>
        </div>
        <div class="meta">
          <span>Farger: ${item.farger.join(', ')}</span>
          <span>Eier: ${item.eier.join(', ')}</span>
          <span>Type: ${capitalize(item.type)}</span>
          <span>Tilbud: ${capitalize(item.tilbud)}</span>
          <span>Pris: ${formatNOK(item.pris)}</span>
        </div>
        <div class="actions">
          <button class="btn" data-id="${item.id}">Detaljer</button>
          <small class="muted">${shorten(item.beskrivelse, 60)}</small>
        </div>
      </div>
    `;
    card.querySelector('button').addEventListener('click', () => openDialog(item));
    card.addEventListener('keypress', (e) => { if (e.key === 'Enter') openDialog(item); });
    grid.appendChild(card);
  });
}

function labelForStatus(s) {
  return s === 'tilgjengelig' ? 'Tilgjengelig' : s === 'ibruk' ? 'I bruk' : 'Utlånt';
}

function shorten(text, n) { return text.length > n ? text.slice(0, n - 1) + '…' : text; }
function capitalize(t) { return t ? t.charAt(0).toUpperCase() + t.slice(1) : ''; }
function formatNOK(n) { return new Intl.NumberFormat('no-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(n); }

function updateStats(items) {
  statTotal.textContent = `${items.length} drakter`;
  const tilgjengeligCount = items.filter(i => i.status === 'tilgjengelig').length;
  statTilgjengelig.textContent = `${tilgjengeligCount} tilgjengelig`;
}

// --- Filtrering og sortering ------------------------------------------
function applyFiltersAndSort() {
  const query = q.value.trim().toLowerCase();
  const typ = type.value;
  const size = storrelse.value;
  const st = statusSel.value;
  const sort = sortSel ? sortSel.value : '';

  let filtered = drakter.filter(k => {
    const matchesQuery = !query ||
      k.navn.toLowerCase().includes(query) ||
      k.type.toLowerCase().includes(query) ||
      k.farger.join(' ').toLowerCase().includes(query) ||
      k.id.toLowerCase().includes(query);
    const matchesTyp = !typ || k.type === typ;
    const matchesSize = !size || k.storrelse === size;
    const matchesStatus = !st || k.status === st;
    return matchesQuery && matchesTyp && matchesSize && matchesStatus;
  });

  filtered = sortItems(filtered, sort);
  renderCards(filtered);
  updateStats(filtered);
}

function sortItems(items, sort) {
  const copy = [...items];
  switch (sort) {
    case 'prisAsc':
      return copy.sort((a, b) => (a.pris ?? Infinity) - (b.pris ?? Infinity));
    case 'prisDesc':
      return copy.sort((a, b) => (b.pris ?? -Infinity) - (a.pris ?? -Infinity));
    case 'type':
      return copy.sort((a, b) => (a.type || '').localeCompare(b.type || ''));
    case 'tilbud':
      // ønsket rekkefølge: leie før kjøp
      const rank = v => v === 'leie' ? 0 : v === 'kjøp' ? 1 : 2;
      return copy.sort((a, b) => rank(a.tilbud) - rank(b.tilbud));
    default:
      return copy; // ingen sortering
  }
}

// --- Dialog ------------------------------------------------------------
function openDialog(item) {
  dlgTitle.textContent = `${item.navn} (${item.id})`;
  dlgImg.src = item.image; dlgImg.alt = item.navn;
  dlgSize.textContent = item.storrelse;
  dlgTyp.textContent = item.type;
  dlgOwn.textContent = item.eier.join(', ');
  dlgPrice.textContent = `${formatNOK(item.pris)}`;
  dlgOff.textContent = item.tilbud;
  dlgStatus.textContent = labelForStatus(item.status);
  dlgStatus.className = `status ${item.status}`;
  dlgDesc.textContent = `${item.beskrivelse}\n`;

  // Åpne modalen (med fallback for nettlesere uten showModal)
  if (typeof dlg.showModal === 'function') {
    dlg.showModal();
  } else {
    dlg.setAttribute('open', '');
  }
}

// --- Event listeners ---------------------------------------------------
if (dlgClose) dlgClose.addEventListener('click', () => dlg.close());
if (dlg) dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

let t; const onChange = () => { clearTimeout(t); t = setTimeout(applyFiltersAndSort, 80); };
q.addEventListener('input', onChange);
type.addEventListener('change', applyFiltersAndSort);
storrelse.addEventListener('change', applyFiltersAndSort);
statusSel.addEventListener('change', applyFiltersAndSort);
if (sortSel) sortSel.addEventListener('change', applyFiltersAndSort);

// --- Init --------------------------------------------------------------
renderCards(drakter);
updateStats(drakter);
