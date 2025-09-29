// --- Data ---------------------------------------------------------
/**
 * image: kan være en URL eller lokal filsti.
 * status: "tilgjengelig" | "ibruk"
 * type: "freestyle" | "par" | "tropp" | "oblig" | "one baton"
 * tilbud: "leie" | "kjøp"
 * pris: tall (NOK)
 * eier: "navn"
 */
let drakter = [];

async function hentDrakter() {
  try {
    const response = await fetch("drakter.json");
    drakter = await response.json();
    renderCards(drakter);
  } catch (error) {
    console.error("Klarte ikke å hente drakter:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  hentDrakter();
});

// --- Elementreferanser -------------------------------------------------
const grid = document.getElementById('grid');
const q = document.getElementById('q');
const type = document.getElementById('type');
//const storrelse = document.getElementById('storrelse');
const statusSel = document.getElementById('status');
const sortSel = document.getElementById('sort');
const statTotal = document.getElementById('statTotal');
const statTilgjengelig = document.getElementById('statTilgjengelig');

const dlg = document.getElementById('detailDialog');
const dlgClose = document.getElementById('dlgClose');
const dlgTitle = document.getElementById('dlgTitle');
const dlgImg = document.getElementById('dlgImg');
//const dlgSize = document.getElementById('dlgSize');
const dlgTyp = document.getElementById('dlgTyp');
const dlgOwn = document.getElementById('dlgOwn');
const dlgPrice = document.getElementById('dlgPrice');
const dlgOff = document.getElementById('dlgOff');
const dlgStatus = document.getElementById('dlgStatus');
const dlgDesc = document.getElementById('dlgDesc');

// --- Rendering ---------------------------------------------------------
function renderCards(items) {
  updateStats(items);
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
      </div>
      <div class="body">
        <div class="title-row">
          <div>
            <div class="name">${item.navn}</div>
            <!--<div class="size">Str. ${item.storrelse} • ${item.type}</div>-->
          </div>
          <span class="status ${item.status}">${labelForStatus(item.status)}</span>
        </div>
        <div class="meta">
          <span>Farger: ${item.farger.join(', ')}</span>
          <span>Eier: ${item.eier.join(', ')}</span>
          <span class="capitalize">Type: ${item.type}</span>
          <span class="capitalize">Tilbud: ${item.tilbud}</span>
          <span>Pris: ${item.pris}</span>
        </div>
        <div class="actions">
          <button class="btn">Detaljer</button>
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
  //const size = storrelse.value;
  const st = statusSel.value;
  const sort = sortSel ? sortSel.value : '';

  let filtered = drakter.filter(k => {
    const matchesQuery = !query ||
      k.navn.toLowerCase().includes(query) ||
      k.type.toLowerCase().includes(query) ||
      k.farger.join(' ').toLowerCase().includes(query) ||
      k.eier.join(' ').toLowerCase().includes(query)
    const matchesTyp = !typ || k.type === typ;
    //const matchesSize = !size || k.storrelse === size;
    const matchesStatus = !st || k.status === st;
    return matchesQuery && matchesTyp && matchesStatus; //matchesSize
  });

  //filtered = sortItems(filtered, sort);
  renderCards(filtered);
  updateStats(filtered);
}

/*function sortItems(items, sort) {
  const copy = [...items];
  switch (sort) {
    case 'prisAsc':
      return copy.sort((a, b) => (a.pris ?? Infinity) - (b.pris ?? Infinity));
    case 'prisDesc':
      return copy.sort((a, b) => (b.pris ?? -Infinity) - (a.pris ?? -Infinity));
    case 'tilbud':
      const rank = v => v === 'leie' ? 0 : v === 'kjøp' ? 1 : 2;
      return copy.sort((a, b) => rank(a.tilbud) - rank(b.tilbud));
    default:
      return copy;
  }
}*/

// --- Dialog ------------------------------------------------------------
function openDialog(item) {
  dlgTitle.textContent = `${item.navn}`;
  dlgImg.src = item.image; dlgImg.alt = item.navn;
  //dlgSize.textContent = item.storrelse;
  dlgTyp.textContent = item.type;
  dlgOwn.textContent = item.eier.join(', ');
  dlgPrice.textContent = `${item.pris}`;
  dlgOff.textContent = item.tilbud;
  dlgStatus.textContent = labelForStatus(item.status);
  dlgStatus.className = `status ${item.status}`;
  dlgDesc.textContent = `${item.beskrivelse}\n`;

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
//storrelse.addEventListener('change', applyFiltersAndSort);
statusSel.addEventListener('change', applyFiltersAndSort);
if (sortSel) sortSel.addEventListener('change', applyFiltersAndSort);

// --- Init --------------------------------------------------------------
renderCards(drakter);