// --- Demo-data ---------------------------------------------------------
/**
 * Rediger/erstatt denne listen med deres egne drakter.
 * image: kan være en URL eller lokal filsti.
 * status: "available" | "reservert" | "utlaan"
 * type: "individuell" | "par" | "tropp"
 * tilbud: "leie" | "kjøp"
 * pris: tall (NOK)
 */
const drakter = [
  {
    id: "K-001",
    navn: "Viktoriansk kjole",
    storrelse: "M",
    kategori: "Par",
    farger: ["burgunder", "krem"],
    image: "https://images.unsplash.com/photo-1516826957135-700dedea698c?q=80&w=1200&auto=format&fit=crop",
    status: "available",
    tilbehor: ["korsett", "hatt"],
    beskrivelse: "Detaljert kjole med blonder. Passer 38–40.",
    type: "individuell",
    tilbud: "leie",
    pris: 250
  },
  {
    id: "K-002",
    navn: "Piratsuite",
    storrelse: "L",
    kategori: "Tropp",
    farger: ["svart", "brun"],
    image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=1200&auto=format&fit=crop",
    status: "reservert",
    tilbehor: ["hatt", "belte"],
    beskrivelse: "Inkluderer skjorte, vest og bukser.",
    type: "par",
    tilbud: "leie",
    pris: 400
  },
  {
    id: "K-003",
    navn: "Labfrakk",
    storrelse: "S",
    kategori: "Individuell",
    farger: ["hvit"],
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop",
    status: "available",
    tilbehor: ["briller"],
    beskrivelse: "Standard labfrakk.",
    type: "individuell",
    tilbud: "kjøp",
    pris: 600
  },
  {
    id: "K-004",
    navn: "Uniform – Kaptein",
    storrelse: "XL",
    kategori: "Par",
    farger: ["marine", "gull"],
    image: "https://images.unsplash.com/photo-1530884698388-509e3973021e?q=80&w=1200&auto=format&fit=crop",
    status: "utlaan",
    tilbehor: ["skulderklaffer"],
    beskrivelse: "Formell jakke og bukse med detaljer.",
    type: "tropp",
    tilbud: "leie",
    pris: 900
  },
  {
    id: "K-005",
    navn: "Charleston-kjole",
    storrelse: "M",
    kategori: "Tropp",
    farger: ["svart", "sølv"],
    image: "https://images.unsplash.com/photo-1528712306091-ed0763094c98?q=80&w=1200&auto=format&fit=crop",
    status: "available",
    tilbehor: ["fjærboa"],
    beskrivelse: "1920-talls stil, frynser og glitter.",
    type: "individuell",
    tilbud: "leie",
    pris: 300
  }
];

// --- Elementreferanser -------------------------------------------------
const grid = document.getElementById('grid');
const q = document.getElementById('q');
const kategori = document.getElementById('kategori');
const storrelse = document.getElementById('storrelse');
const statusSel = document.getElementById('status');
const sortSel = document.getElementById('sort');
const statTotal = document.getElementById('statTotal');
const statAvailable = document.getElementById('statAvailable');

const dlg = document.getElementById('detailDialog');
const dlgClose = document.getElementById('dlgClose');
const dlgTitle = document.getElementById('dlgTitle');
const dlgImg = document.getElementById('dlgImg');
const dlgSize = document.getElementById('dlgSize');
const dlgCat = document.getElementById('dlgCat');
const dlgAcc = document.getElementById('dlgAcc');
const dlgStatus = document.getElementById('dlgStatus');
const dlgDesc = document.getElementById('dlgDesc');
const reserveBtn = document.getElementById('reserveBtn');

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
            <div class="size">Str. ${item.storrelse} • ${item.kategori}</div>
          </div>
          <span class="status ${item.status}">${labelForStatus(item.status)}</span>
        </div>
        <div class="meta">
          <span>Farger: ${item.farger.join(', ')}</span>
          <span>Tilbehør: ${item.tilbehor.join(', ')}</span>
          <span>Type: ${capitalize(item.type)}</span>
          <span>${capitalize(item.tilbud)}</span>
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
  return s === 'available' ? 'Tilgjengelig' : s === 'reservert' ? 'Reservert' : 'Utlånt';
}

function shorten(text, n) { return text.length > n ? text.slice(0, n - 1) + '…' : text; }
function capitalize(t) { return t ? t.charAt(0).toUpperCase() + t.slice(1) : ''; }
function formatNOK(n) { return new Intl.NumberFormat('no-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(n); }

function updateStats(items) {
  statTotal.textContent = `${items.length} drakter`;
  const availableCount = items.filter(i => i.status === 'available').length;
  statAvailable.textContent = `${availableCount} tilgjengelig`;
}

// --- Filtrering og sortering ------------------------------------------
function applyFiltersAndSort() {
  const query = q.value.trim().toLowerCase();
  const cat = kategori.value;
  const size = storrelse.value;
  const st = statusSel.value;
  const sort = sortSel ? sortSel.value : '';

  let filtered = drakter.filter(k => {
    const matchesQuery = !query ||
      k.navn.toLowerCase().includes(query) ||
      k.kategori.toLowerCase().includes(query) ||
      k.farger.join(' ').toLowerCase().includes(query) ||
      k.id.toLowerCase().includes(query);
    const matchesCat = !cat || k.kategori === cat;
    const matchesSize = !size || k.storrelse === size;
    const matchesStatus = !st || k.status === st;
    return matchesQuery && matchesCat && matchesSize && matchesStatus;
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
  dlgCat.textContent = item.kategori;
  dlgAcc.textContent = item.tilbehor.join(', ');
  dlgStatus.textContent = labelForStatus(item.status);
  dlgStatus.className = `status ${item.status}`;
  dlgDesc.textContent = `${item.beskrivelse}\n\nType: ${capitalize(item.type)}\nTilbud: ${capitalize(item.tilbud)}\nPris: ${formatNOK(item.pris)}`;
  reserveBtn.onclick = () => {
    const subject = encodeURIComponent(`Reservasjon: ${item.navn} (${item.id})`);
    const body = encodeURIComponent(`Hei!\nJeg ønsker å reservere drakten ${item.navn} (${item.id}).\nØnsket dato: ____\nNavn: ____\nTelefon: ____\n`);
    window.location.href = `mailto:ingvildhrh@gmail.com?subject=${subject}&body=${body}`;
  };
  dlg.showModal();
}

// --- Event listeners ---------------------------------------------------
if (dlgClose) dlgClose.addEventListener('click', () => dlg.close());
if (dlg) dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

let t; const onChange = () => { clearTimeout(t); t = setTimeout(applyFiltersAndSort, 80); };
q.addEventListener('input', onChange);
kategori.addEventListener('change', applyFiltersAndSort);
storrelse.addEventListener('change', applyFiltersAndSort);
statusSel.addEventListener('change', applyFiltersAndSort);
if (sortSel) sortSel.addEventListener('change', applyFiltersAndSort);

// --- Init --------------------------------------------------------------
renderCards(drakter);
updateStats(drakter);
