// --- Demo-data ---------------------------------------------------------
/**
 * Rediger/erstatt denne listen med deres egne kostymer.
 * image: kan være en URL eller lokal filsti.
 * status: "available" | "reservert" | "utlaan"
 */
const kostymer = [
  {
    id: "K-001",
    navn: "Viktoriansk kjole",
    storrelse: "M",
    kategori: "Historisk",
    farger: ["burgunder", "krem"],
    image: "https://images.unsplash.com/photo-1516826957135-700dedea698c?q=80&w=1200&auto=format&fit=crop",
    status: "available",
    tilbehor: ["korsett", "hatt"],
    beskrivelse: "Detaljert kjole med blonder. Passer 38–40."
  },
  {
    id: "K-002",
    navn: "Piratsuite",
    storrelse: "L",
    kategori: "Fantasy",
    farger: ["svart", "brun"],
    image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=1200&auto=format&fit=crop",
    status: "reservert",
    tilbehor: ["hatt", "belte"],
    beskrivelse: "Inkluderer skjorte, vest og bukser."
  },
  {
    id: "K-003",
    navn: "Labfrakk",
    storrelse: "S",
    kategori: "Moderne",
    farger: ["hvit"],
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop",
    status: "available",
    tilbehor: ["briller"],
    beskrivelse: "Standard labfrakk."
  },
  {
    id: "K-004",
    navn: "Uniform – Kaptein",
    storrelse: "XL",
    kategori: "Uniform",
    farger: ["marine", "gull"],
    image: "https://images.unsplash.com/photo-1530884698388-509e3973021e?q=80&w=1200&auto=format&fit=crop",
    status: "utlaan",
    tilbehor: ["skulderklaffer"],
    beskrivelse: "Formell jakke og bukse med detaljer."
  },
  {
    id: "K-005",
    navn: "Charleston-kjole",
    storrelse: "M",
    kategori: "Dans",
    farger: ["svart", "sølv"],
    image: "https://images.unsplash.com/photo-1528712306091-ed0763094c98?q=80&w=1200&auto=format&fit=crop",
    status: "available",
    tilbehor: ["fjærboa"],
    beskrivelse: "1920-talls stil, frynser og glitter."
  }
];

// --- App logikk -------------------------------------------------------
const grid = document.getElementById('grid');
const q = document.getElementById('q');
const kategori = document.getElementById('kategori');
const storrelse = document.getElementById('storrelse');
const statusSel = document.getElementById('status');
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
          <span>${item.farger.join(', ')}</span>
          <span>Tilbehør: ${item.tilbehor.join(', ')}</span>
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

function shorten(text, n) {
  return text.length > n ? text.slice(0, n - 1) + '…' : text;
}

function updateStats(items) {
  statTotal.textContent = `${items.length} kostymer`;
  const availableCount = items.filter(i => i.status === 'available').length;
  statAvailable.textContent = `${availableCount} tilgjengelig`;
}

function applyFilters() {
  const query = q.value.trim().toLowerCase();
  const cat = kategori.value;
  const size = storrelse.value;
  const st = statusSel.value;

  const filtered = kostymer.filter(k => {
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

  renderCards(filtered);
  updateStats(filtered);
}

function openDialog(item) {
  dlgTitle.textContent = `${item.navn} (${item.id})`;
  dlgImg.src = item.image; dlgImg.alt = item.navn;
  dlgSize.textContent = item.storrelse;
  dlgCat.textContent = item.kategori;
  dlgAcc.textContent = item.tilbehor.join(', ');
  dlgStatus.textContent = labelForStatus(item.status);
  dlgStatus.className = `status ${item.status}`;
  dlgDesc.textContent = item.beskrivelse;
  reserveBtn.onclick = () => {
    const subject = encodeURIComponent(`Reservasjon: ${item.navn} (${item.id})`);
    const body = encodeURIComponent(`Hei!\nJeg ønsker å reservere kostymet ${item.navn} (${item.id}).\nØnsket dato: ____\nNavn: ____\nTelefon: ____\n`);
    window.location.href = `mailto:post@din-klubb.no?subject=${subject}&body=${body}`;
  };
  dlg.showModal();
}

// Lukking av dialog
if (dlgClose) dlgClose.addEventListener('click', () => dlg.close());
if (dlg) dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

// Re-render ved filterendringer (med liten debounce)
let t; const onChange = () => { clearTimeout(t); t = setTimeout(applyFilters, 80); };
q.addEventListener('input', onChange);
kategori.addEventListener('change', applyFilters);
storrelse.addEventListener('change', applyFilters);
statusSel.addEventListener('change', applyFilters);

// Init
renderCards(kostymer);
updateStats(kostymer);
