// PANTECA · la vitrina de la casona
import { initKit } from '../kit/kit.js?v=1';
import { opcionesRetiro } from '../kit/core/encargos.js?v=1';
import { ahoraEn, DIAS, aMin } from '../kit/core/turnos.js?v=1';

window.__panteca = true;
const html = document.documentElement;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esDesk = () => matchMedia('(min-width: 1024px)').matches;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const DLARGO = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DCORTO = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const hs = (s) => String(s).replace(/^0/, '').replace(/:00$/, '');
const ENCARGABLES = ['tortas-enteras', 'boxes', 'rotiseria'];
const TZ = 'America/Argentina/Buenos_Aires';

// ============ INTRO: se prende el cartel y sube el vidrio ============
async function intro() {
  const el = $('#intro');
  if (!html.classList.contains('con-intro') || !el) { html.classList.add('listo'); return; }
  const celu = !matchMedia('(min-width: 768px)').matches;
  const heroImg = $('.hero__arco img');
  const imgOk = heroImg && !heroImg.complete ? new Promise(r => { heroImg.onload = heroImg.onerror = r; }) : Promise.resolve();
  await Promise.race([Promise.all([document.fonts?.ready, imgOk]), sleep(2600)]);
  el.classList.add('play');
  await sleep(celu ? 1100 : 1550);
  el.classList.add('abre');
  html.classList.add('listo');
  await sleep(celu ? 600 : 760);
  html.classList.remove('con-intro');
  el.remove();
}

// ============ ENTRADAS ============
function reveal() {
  const io = new IntersectionObserver((es) => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); }
  }), { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  $$('.anim, .titulo, .vitrina, .ustedes, .mapa, .descubre').forEach(el => { if (!el.closest('.hero')) io.observe(el); });
  const neon = $('[data-neon]');
  if (neon) new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { neon.classList.add('prendido'); o.disconnect(); } }), { threshold: 0.6 }).observe(neon);
}

// ============ BARRA + MENÚ ============
function barra() {
  const b = $('#barra'), menu = $('#menu'), btn = $('[data-menu]');
  let tick = false;
  const enHero = () => html.classList.toggle('en-hero', scrollY < innerHeight * .55);
  enHero();
  addEventListener('scroll', () => { if (tick) return; tick = true; requestAnimationFrame(() => { b.classList.toggle('con-borde', scrollY > 8); enHero(); tick = false; }); }, { passive: true });
  let y = 0;
  const abrir = (on) => {
    btn.setAttribute('aria-expanded', on); btn.setAttribute('aria-label', on ? 'Cerrar menú' : 'Abrir menú');
    btn.innerHTML = on ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg>';
    if (on) { menu.hidden = false; $$('a', menu).forEach((a, i) => a.style.setProperty('--i', i)); requestAnimationFrame(() => menu.classList.add('is-open')); y = scrollY; html.classList.add('menu-abierto'); }
    else { menu.classList.remove('is-open'); html.classList.remove('menu-abierto'); setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 350); }
  };
  btn.addEventListener('click', () => abrir(btn.getAttribute('aria-expanded') !== 'true'));
  $$('[data-menu-link]').forEach(a => a.addEventListener('click', () => abrir(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') abrir(false); });
  // link activo en desktop
  const links = $$('.barra__nav a');
  const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.classList.toggle('is-on', a.hash === '#' + e.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(a => { const s = $(a.hash); if (s) io.observe(s); });
}

function contadorCaja(kit) {
  const n = $('[data-caja-n]');
  const pintar = (bump) => {
    const total = (kit.carrito?.lineas || []).reduce((a, l) => a + (Number(l.cant) || 0), 0);
    n.hidden = !total; n.textContent = total;
    if (bump && total) { n.classList.remove('bump'); void n.offsetWidth; n.classList.add('bump'); }
  };
  document.addEventListener('kit:carrito', () => pintar(true));
  kit.carrito?.listo?.then(() => pintar(false));
  pintar(false);
}

// arrastrar con el mouse una fila deslizable (en el dedo ya es nativo)
function arrastrable(el) {
  let x0 = 0, s0 = 0, activo = false, movio = false, vel = 0, ultX = 0, ultT = 0, raf = 0;
  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    activo = true; movio = false; x0 = ultX = e.clientX; s0 = el.scrollLeft; ultT = performance.now(); vel = 0; cancelAnimationFrame(raf);
  });
  addEventListener('pointermove', (e) => {
    if (!activo) return;
    const dx = e.clientX - x0;
    if (!movio && Math.abs(dx) > 6) { movio = true; el.classList.add('arrastrando'); }
    if (!movio) return;
    const t = performance.now(); vel = (e.clientX - ultX) / Math.max(1, t - ultT); ultX = e.clientX; ultT = t;
    el.scrollLeft = s0 - dx;
  });
  const soltar = () => {
    if (!activo) return; activo = false;
    if (!movio) return;
    let v = vel * 16;
    const paso = () => { if (Math.abs(v) < .4) { el.classList.remove('arrastrando'); return; } el.scrollLeft -= v; v *= .93; raf = requestAnimationFrame(paso); };
    raf = requestAnimationFrame(paso);
    el.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); }, { capture: true, once: true });
  };
  addEventListener('pointerup', soltar); addEventListener('pointercancel', soltar);
}

// ============ 2 · VITRINA ============
function vitrina(kit, productos) {
  const pista = $('[data-pista]');
  const porcion = productos.find(p => p.id === 'porcion-del-dia');
  const precioP = porcion?.precio != null ? kit.money(porcion.precio) : null;
  if (precioP) $$('[data-precio-porcion]').forEach(e => { e.textContent = precioP; });
  let tortas = productos.filter(p => p.categoria === 'tortas-enteras' && (p.etiquetas || []).includes('vitrina') && p.disponible !== false);
  if (!tortas.length) tortas = productos.filter(p => p.categoria === 'tortas-enteras').slice(0, 8);
  pista.innerHTML = tortas.map((p, i) => `
    <article class="torta" style="--i:${i}" data-torta="${esc(p.id)}" tabindex="0" role="button" aria-pressed="false" aria-label="${esc(p.nombre)}">
      <span class="torta__foto">${p.foto ? `<img src="${esc(kit.asset(p.foto))}" alt="" width="640" height="800" loading="lazy" decoding="async">` : ''}${(p.etiquetas || []).includes('nuevo') ? '<span class="torta__tag">Nueva</span>' : ''}</span>
      <span class="torta__info">
        <span class="torta__n">${esc(p.nombre)}</span>
        <span class="torta__p">${precioP ? `Porción ${precioP} en el salón` : 'Por porción en el salón'}</span>
        <span class="torta__acc"><a href="#encargos" data-encargar="${esc(p.id)}">Encargala entera</a></span>
      </span>
    </article>`).join('');
  if (pista.dataset.init) return;
  pista.dataset.init = '1';
  const prender = (t) => $$('.torta', pista).forEach(x => { const on = x === t && !x.classList.contains('is-on'); x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on); });
  pista.addEventListener('click', (e) => {
    const a = e.target.closest('[data-encargar]');
    if (a) { e.preventDefault(); document.dispatchEvent(new CustomEvent('panteca:sabor', { detail: a.dataset.encargar })); $('#encargos').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); return; }
    const t = e.target.closest('.torta'); if (t) prender(t);
  });
  pista.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('torta')) { e.preventDefault(); prender(e.target); } });
  arrastrable(pista);
  const mover = (d) => { const c = $('.torta', pista); const w = c ? c.getBoundingClientRect().width + 26 : 300; pista.scrollBy({ left: d * w * (esDesk() ? 2 : 1), behavior: reduce ? 'auto' : 'smooth' }); };
  $$('[data-mover]').forEach(b => b.addEventListener('click', () => mover(Number(b.dataset.mover))));
  const flechas = () => { const [a, b] = $$('[data-mover]'); if (!a) return; a.disabled = pista.scrollLeft < 8; b.disabled = pista.scrollLeft + pista.clientWidth >= pista.scrollWidth - 8; };
  pista.addEventListener('scroll', () => requestAnimationFrame(flechas), { passive: true }); flechas();
  // en el celu, la primera arranca encendida para que se entienda el gesto
  if (!esDesk()) { const t = $('.torta', pista); if (t) setTimeout(() => prender(t), 600); }
}

// ============ 3 · RELOJ DE LA CASONA ============
const MOMENTOS = {
  manana: { desde: 510, hasta: 720, hora: '8:30 a 12 h', t: 'Desayuno y Brunchteca', p: 'Café, exprimidos grandes, tostones y la Brunchteca para dos: infusiones, torta, tostón, tostado de pan árabe y budín.', img: 'toston-bosque', cta: 'Ver la Brunchteca', cat: 'brunch', casona: 'dia' },
  mediodia: { desde: 720, hasta: 960, hora: '12 a 16 h', t: 'Menú ejecutivo al mediodía', p: 'Platos que cambian, mac & cheese y pizzas estilo napolitano. El almuerzo se puede reservar.', img: 'pizza', cta: 'Reservar el almuerzo', reservar: true, casona: 'dia' },
  merienda: { desde: 960, hasta: 1200, hora: '16 a 20 h', t: 'Merienda de tortas y tostones', p: 'La hora pico de la casona: porciones gigantes, tostones para compartir y la vitrina llena. Por orden de llegada.', img: 'brownies-merengue', cta: 'Ver las tortas por porción', cat: 'porciones', casona: 'dia' },
  noche: { desde: 1200, hasta: 1410, hora: '20 h al cierre', t: 'Noche de pastas', p: 'Pastas hechas en casa, la casona iluminada y una porción de torta de postre. La cena se puede reservar.', img: 'mac-cheese', cta: 'Reservar la cena', reservar: true, casona: 'noche' },
};
const momentoDe = (min) => Object.entries(MOMENTOS).find(([, m]) => min >= m.desde && min < m.hasta)?.[0] || (min < 510 ? 'manana' : 'noche');

function reloj(kit) {
  const sec = $('#reloj'), panel = $('[data-panel]');
  const img = $('[data-mom-img]'), casona = $('[data-casona-img]');
  const per = $('[data-perilla]'), dia = $('[data-dia]');
  const MIN = 510, MAX = 1410;
  let actual = null, min = 1020;
  const now = ahoraEn(TZ);
  const q = new URLSearchParams(location.search).get('momento');
  const dow = new Date(now.dia * 864e5).getUTCDay();
  const abiertoHoy = (kit.config.horarios[DIAS[dow]] || []).length > 0;
  if (q && MOMENTOS[q]) min = MOMENTOS[q].desde + 30;
  else if (abiertoHoy && now.min >= MIN && now.min < MAX) min = now.min;
  const ahoraTxt = $('[data-reloj-ahora]');
  if (!q && abiertoHoy && now.min >= MIN && now.min < MAX) ahoraTxt.textContent = `Son las ${hs(String(Math.floor(now.min / 60)).padStart(2, '0') + ':' + String(now.min % 60).padStart(2, '0'))}: esto es lo que está pasando ahora en la casona.`;
  else if (!q) ahoraTxt.textContent = 'Ahora está cerrado. Mové la perilla para ver qué pasa en cada momento del día.';

  function pintar(id, animar = true) {
    if (id === actual) return;
    actual = id; const m = MOMENTOS[id];
    sec.dataset.momento = id;
    $$('[data-mom]').forEach(c => c.setAttribute('aria-selected', c.dataset.mom === id));
    const aplicar = () => {
      $('[data-mom-hora]').textContent = m.hora; $('[data-mom-t]').textContent = m.t; $('[data-mom-p]').textContent = m.p;
      const cta = $('[data-mom-cta]'); cta.textContent = m.cta;
      cta.onclick = (e) => {
        e.preventDefault();
        if (m.reservar) { kit.reservas?.abrir ? kit.reservas.abrir({}) : $('[data-kit-open="reservas"]')?.click(); return; }
        document.dispatchEvent(new CustomEvent('panteca:carta', { detail: m.cat }));
        $('#carta').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      };
      img.src = `img/f/${m.img}.webp`;
      const noche = m.casona === 'noche';
      casona.src = noche ? 'img/f/casona-noche-720.webp' : 'img/f/casona-dia-720.webp';
      $('[data-casona-cap]').textContent = noche ? 'La casona, de noche' : 'La casona, de día';
      panel.classList.remove('cambia'); img.classList.remove('sale');
    };
    if (!animar || reduce) { aplicar(); return; }
    panel.classList.add('cambia'); img.classList.add('sale');
    setTimeout(aplicar, 260);
  }
  function setMin(v, animar = true) {
    min = Math.max(MIN, Math.min(MAX, Math.round(v / 5) * 5));
    const pct = (min - MIN) / (MAX - MIN);
    per.style.left = `${pct * 100}%`;
    const t = `${Math.floor(min / 60)}:${String(min % 60).padStart(2, '0')}`;
    $('[data-perilla-h]').textContent = t; per.setAttribute('aria-valuenow', min); per.setAttribute('aria-valuetext', t);
    pintar(momentoDe(min), animar);
  }
  // chips (celu)
  $$('[data-mom]').forEach(c => c.addEventListener('click', () => { setMin(MOMENTOS[c.dataset.mom].desde + 30); c.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: reduce ? 'auto' : 'smooth' }); }));
  // perilla (desktop): arrastre con mouse o dedo, teclado
  let arr = false;
  const desdeX = (x) => { const r = dia.getBoundingClientRect(); setMin(MIN + ((x - r.left) / r.width) * (MAX - MIN)); };
  per.addEventListener('pointerdown', (e) => { arr = true; per.setPointerCapture(e.pointerId); e.preventDefault(); });
  per.addEventListener('pointermove', (e) => { if (arr) desdeX(e.clientX); });
  per.addEventListener('pointerup', () => { arr = false; });
  dia.addEventListener('click', (e) => { if (e.target === per || per.contains(e.target)) return; desdeX(e.clientX); });
  per.addEventListener('keydown', (e) => { const d = { ArrowRight: 30, ArrowUp: 30, ArrowLeft: -30, ArrowDown: -30, PageUp: 120, PageDown: -120 }[e.key]; if (d) { e.preventDefault(); setMin(min + d); } });
  setMin(min, false);
}

// ============ 4 · CARTA ============
function plantilla(p, ctx) {
  const pedir = ENCARGABLES.includes(p.categoria) && ctx.pedible(p);
  const precio = ctx.money(p.precio) ?? `<span class="kit-price--na">${pedir ? 'A confirmar' : 'Consultar'}</span>`;
  return `${p.foto ? `<img class="kit-item__foto" src="${esc(ctx.asset(p.foto.replace('.webp', '-t.webp')))}" alt="" width="240" height="300" loading="lazy" decoding="async">` : ''}
    <div class="kit-item__body"><h3 class="plato__n">${esc(p.nombre)}${p.foto ? '<span class="punto" title="Tiene foto"></span>' : ''}</h3>${p.descripcion ? `<p class="plato__d">${esc(p.descripcion)}</p>` : ''}</div>
    <div class="kit-item__side"><span class="kit-price">${precio}</span>${pedir ? `<div class="kit-qty" data-kit-qty="${esc(p.id)}"></div>` : ''}${p.disponible === false ? '<span class="kit-badge kit-badge--off">Hoy no hay</span>' : ''}</div>`;
}
const NOTAS = {
  cafeteria: 'Se pide en la mesa. Café con leche, cortado y lágrima entran en las promos de la semana.',
  brunch: 'Para compartir: se pide en la mesa, por orden de llegada.',
  tostones: 'Los más grandes de CABA: comen dos tranquilos.',
  mediodia: 'Al mediodía, de martes a domingo. El almuerzo se puede reservar.',
  pastas: 'Hechas en casa. Ideales para la noche.',
  porciones: 'Todos los días, hasta agotar stock. Solo para comer en el salón.',
  'tortas-enteras': 'Para encargar entera con 48 h de anticipación. Seña del 50% y el resto al retirar.',
  boxes: 'Para regalar: se encarga con 24 h y se retira en la casona.',
  rotiseria: 'Se encarga con seña y se retira entre el 22 y el 31 de diciembre.',
};
const UNA_COL = ['tortas-enteras', 'brunch', 'tostones', 'rotiseria', 'boxes'];

const GRUPOS = [{ nombre: 'En el salón', categorias: ['cafeteria', 'brunch', 'tostones', 'mediodia', 'pastas', 'porciones'] }, { nombre: 'Para encargar', categorias: ['tortas-enteras', 'boxes', 'rotiseria'] }];
let pend = null;
function cartaEventos() {
  document.addEventListener('kit:carta', (e) => {
    const { el, categorias, productos } = e.detail;
    if (el.id === 'carta-fiestas') { fiestasLista(el); return; }
    if (el.id !== 'carta-principal') return;
    const tabs = $('.kit-tabs', el);
    // etiquetas de grupo (En el salón / Para encargar) en el índice de desktop
    const grupos = GRUPOS;
    if (tabs) grupos.forEach(g => {
      const primera = $$('.kit-tab', tabs).find(t => g.categorias.includes(t.dataset.cat));
      if (primera) primera.insertAdjacentHTML('beforebegin', `<span class="carta__grupo">${esc(g.nombre)}</span>`);
    });
    const paneles = $$('.kit-carta__panel', el);
    paneles.forEach((pn, i) => {
      const cat = categorias.find(c => pn.id.endsWith('-p-' + c.id));
      if (!cat) return;
      const n = $$('.kit-item', pn).length;
      pn.classList.toggle('una-col', UNA_COL.includes(cat.id));
      pn.insertAdjacentHTML('afterbegin', `<div class="sec-cab"><div class="sec-cab__fila"><h3 class="sec-cab__t">${esc(cat.nombre)}</h3><span class="sec-cab__n">${n} ${n === 1 ? 'opción' : 'opciones'}</span></div>${NOTAS[cat.id] ? `<p class="sec-cab__nota">${esc(NOTAS[cat.id])}</p>` : ''}</div>`);
      const ant = paneles[i - 1], sig = paneles[i + 1];
      const nombre = (p) => p ? (categorias.find(c => p.id.endsWith('-p-' + c.id))?.nombre || '') : '';
      pn.insertAdjacentHTML('beforeend', `<div class="carta-nav"><button type="button" class="carta-nav__ant" data-ir="${ant ? ant.id : ''}" ${ant ? '' : 'disabled'}><small>← Anterior</small>${esc(nombre(ant))}</button><button type="button" class="carta-nav__sig" data-ir="${sig ? sig.id : ''}" ${sig ? '' : 'disabled'}><small>Siguiente →</small>${esc(nombre(sig))}</button></div>`);
    });
    $$('[data-ir]', el).forEach(b => b.addEventListener('click', () => {
      const tab = $(`.kit-tab[aria-controls="${b.dataset.ir}"]`, el); if (!tab) return;
      tab.click(); tab.scrollIntoView({ inline: 'center', block: 'nearest' });
      const top = el.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(html).getPropertyValue('--barra')) || 64) - 10;
      if (el.getBoundingClientRect().top < 0) scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    }));
    if (pend) { const c = pend; pend = null; irA(c); }
  });
}
function irA(cat) {
    const el0 = $('#carta-principal');
    const tab0 = $(`.kit-tab[data-cat="${cat}"]`, el0);
    if (tab0) tab0.click(); else pend = cat;
}
function carta() {
  const foto = $('[data-carta-foto] img'), cap = $('[data-carta-foto-cap]');
  function _irA(cat) {
    const el = $('#carta-principal');
    const tab = $(`.kit-tab[data-cat="${cat}"]`, el);
    if (tab) { tab.click(); } else pend = cat;
  }
  document.addEventListener('panteca:carta', (e) => irA(e.detail));
  // la pestaña activa siempre a la vista en el celu
  $('#carta-principal').addEventListener('click', (ev) => { const t = ev.target.closest('.kit-tab'); if (t && !esDesk()) t.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduce ? 'auto' : 'smooth' }); });
  // foto fija del plato al pasar el mouse (desktop)
  let raf = 0, ultima = '';
  $('#carta-principal').addEventListener('pointerover', (e) => {
    if (e.pointerType !== 'mouse') return;
    const it = e.target.closest('.kit-item[data-photo]'); if (!it) return;
    const src = it.dataset.photo; if (src === ultima) return;
    ultima = src; cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      foto.classList.add('sale');
      setTimeout(() => { foto.src = src; cap.textContent = $('.plato__n', it)?.textContent || ''; foto.onload = () => foto.classList.remove('sale'); }, 180);
    });
  });
}

function fiestasLista(el) {
  const pn = $('.kit-carta__panel', el); if (!pn) return;
  pn.hidden = false;
  const items = $$('.kit-item', pn), N = esDesk() ? 10 : 6;
  if (items.length <= N + 1) return;
  items.slice(N).forEach(i => i.classList.add('oculta'));
  pn.insertAdjacentHTML('beforeend', `<button type="button" class="fiestas__mas">Ver los ${items.length - N} platos restantes</button>`);
  $('.fiestas__mas', pn).addEventListener('click', (e) => { items.forEach((i, k) => { i.classList.remove('oculta'); i.style.setProperty('--i', Math.max(0, k - N)); }); e.currentTarget.remove(); });
}

// ============ 5 · TORTA-METRO ============
const SABOR_COLOR = {
  't-dubai': ['#4A2814', '#A9B86A'], 't-tiramisu-pistacho': ['#E8D9B8', '#A9B86A'], 't-pistacho': ['#5A3420', '#B9C67A'],
  't-brownie-merengue': ['#3E2112', '#F3E0D2'], 't-cookies-cream': ['#2E2420', '#F4F0EA'], 't-red-pie': ['#E6C99A', '#C2303C'],
  't-carrot': ['#B07A45', '#FFF4E2'], 't-rogel': ['#E8C48C', '#8A4F22'], 't-lemon-brownie': ['#3E2112', '#F2D46B'],
  't-torta-brownie': ['#3A1E10', '#6E4229'], 't-mar-del-plata': ['#7A4A28', '#F3E0D2'], 't-vasca': ['#D9A55E', '#FFF4E2'],
};
const TAM = [8, 12, 16, 20];

function metro(kit, productos, categorias) {
  const st = { sabor: null, tam: 16, fecha: '', franja: '' };
  const tortas = productos.filter(p => p.categoria === 'tortas-enteras' && p.disponible !== false);
  const cont = $('[data-sabores]'), pisos = $('[data-pisos]');
  if (!tortas.length) { $('#encargos').hidden = true; return; }
  st.sabor = tortas[0].id;
  cont.innerHTML = tortas.map(p => `<button type="button" class="sabor" role="radio" aria-checked="false" data-sabor="${esc(p.id)}">${p.foto ? `<img src="${esc(kit.asset(p.foto.replace('.webp', '-t.webp')))}" alt="" width="240" height="300" loading="lazy" decoding="async">` : ''}<span>${esc(p.nombre)}</span></button>`).join('');
  arrastrable(cont);
  $$('[data-sab-mover]').forEach(b => b.addEventListener('click', () => cont.scrollBy({ left: Number(b.dataset.sabMover) * cont.clientWidth * .75, behavior: reduce ? 'auto' : 'smooth' })));

  const sel = () => tortas.find(p => p.id === st.sabor);
  function pintarSabor(scroll) {
    $$('[data-sabor]', cont).forEach(b => b.setAttribute('aria-checked', b.dataset.sabor === st.sabor));
    const p = sel(); const [masa, relleno] = SABOR_COLOR[p.id] || ['#6E4229', '#F3E0D2'];
    pisos.style.setProperty('--masa', masa); pisos.style.setProperty('--relleno', relleno);
    const mini = $('[data-metro-foto]'); if (p.foto) mini.src = kit.asset(p.foto.replace('.webp', '-t.webp'));
    if (scroll) $(`[data-sabor="${st.sabor}"]`, cont)?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    pintarTotal();
  }
  function pintarTam(salta) {
    const n = TAM.indexOf(st.tam) + 1;
    pisos.dataset.n = n;
    $$('[data-tam]').forEach(b => b.setAttribute('aria-checked', Number(b.dataset.tam) === st.tam));
    if (salta && !reduce) { pisos.classList.remove('salta'); void pisos.offsetWidth; pisos.classList.add('salta'); }
    pintarTotal();
  }
  function pintarTotal() {
    const p = sel();
    $('[data-metro-sel]').textContent = `${p.nombre} · ${st.tam} porciones`;
    const f = st.fecha ? diaTexto(st.fecha) : '';
    $('[data-metro-precio]').textContent = `${p.precio != null ? kit.money(p.precio) : 'Precio a confirmar'} · seña 50%${f ? ` · retiro ${f}` : ''}`;
  }
  const diaTexto = (f) => { const [y, m, d] = f.split('-').map(Number); return `${DCORTO[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]} ${d}/${m}`; };

  function pintarDias() {
    const op = opcionesRetiro({ horarios: kit.config.horarios, encargo: kit.config.pedidos?.encargo, tz: kit.config.zonaHoraria || TZ, productos, categorias, lineas: [{ id: st.sabor, cant: 1 }] });
    const dias = op.dias.slice(0, 14);
    if (!dias.some(d => d.fecha === st.fecha && d.abierto)) st.fecha = dias.find(d => d.abierto)?.fecha || '';
    $('[data-dias]').innerHTML = dias.map(d => { const [, m, dd] = d.fecha.split('-').map(Number); return `<button type="button" role="radio" data-fecha="${d.fecha}" aria-checked="${d.fecha === st.fecha}" ${d.abierto ? '' : 'disabled'} aria-label="${DLARGO[d.dow]} ${dd}/${m}${d.abierto ? '' : ', cerrado'}"><small>${DCORTO[d.dow]}</small>${dd}</button>`; }).join('');
    const dia = dias.find(d => d.fecha === st.fecha);
    const frs = dia?.franjas || op.dias[0]?.franjas || [];
    if (!frs.some(f => f.id === st.franja && f.disponible)) st.franja = frs.find(f => f.disponible)?.id || '';
    $('[data-franjas]').innerHTML = (frs.length ? frs : kit.config.pedidos.encargo.franjas).map(f => `<button type="button" role="radio" data-franja="${f.id}" aria-checked="${f.id === st.franja}" ${f.disponible ? '' : 'disabled'}>${esc(f.nombre)} <small>${hs(f.desde)} a ${hs(f.hasta)} h</small></button>`).join('');
    pintarTotal();
  }
  cont.addEventListener('click', (e) => { const b = e.target.closest('[data-sabor]'); if (!b) return; st.sabor = b.dataset.sabor; pintarSabor(); pintarDias(); });
  $$('[data-tam]').forEach(b => b.addEventListener('click', () => { st.tam = Number(b.dataset.tam); pintarTam(true); }));
  $('[data-dias]').addEventListener('click', (e) => { const b = e.target.closest('[data-fecha]'); if (!b || b.disabled) return; st.fecha = b.dataset.fecha; pintarDias(); });
  $('[data-franjas]').addEventListener('click', (e) => { const b = e.target.closest('[data-franja]'); if (!b || b.disabled) return; st.franja = b.dataset.franja; $$('[data-franja]').forEach(x => x.setAttribute('aria-checked', x === b)); });
  document.addEventListener('panteca:sabor', (e) => { if (tortas.some(p => p.id === e.detail)) { st.sabor = e.detail; pintarSabor(true); pintarDias(); } });

  // arrastrar la torta para arriba (dedo y mouse) o rueda
  const escena = $('[data-metro-torta]');
  let y0 = null, n0 = 3;
  const tope = $('[data-arrastre]');
  const empezar = (e) => { y0 = e.clientY; n0 = TAM.indexOf(st.tam) + 1; tope.setPointerCapture?.(e.pointerId); e.preventDefault(); };
  pisos.addEventListener('pointerdown', empezar);
  pisos.addEventListener('pointermove', (e) => {
    if (y0 == null) return;
    const alto = pisos.querySelector('.piso')?.getBoundingClientRect().height || 70;
    const n = Math.max(1, Math.min(4, n0 + Math.round((y0 - e.clientY) / (alto * .8))));
    if (TAM[n - 1] !== st.tam) { st.tam = TAM[n - 1]; pintarTam(true); }
  });
  const fin = () => { y0 = null; };
  pisos.addEventListener('pointerup', fin); pisos.addEventListener('pointercancel', fin);
  escena.addEventListener('wheel', (e) => {
    if (!esDesk()) return;
    const i = TAM.indexOf(st.tam), j = Math.max(0, Math.min(3, i + (e.deltaY < 0 ? 1 : -1)));
    if (j !== i) { e.preventDefault(); st.tam = TAM[j]; pintarTam(true); }
  }, { passive: false });

  // sumar a la caja
  const btn = $('[data-metro-sumar]');
  btn.addEventListener('click', () => {
    const p = sel();
    if (st.fecha) {
      const fr = kit.config.pedidos.encargo.franjas.find(f => f.id === st.franja);
      kit.carrito.setRetiro({ fecha: st.fecha, franja: st.franja || fr?.id || '' });
    }
    kit.carrito.agregar(p.id, 1, { nota: `${st.tam} porciones`, origen: btn });
    btn.classList.add('sumado'); btn.textContent = '¡Sumada a tu caja!';
    setTimeout(() => { btn.classList.remove('sumado'); btn.textContent = 'Sumar a mi caja'; kit.carrito.abrir(); }, 750);
  });
  pintarSabor(); pintarTam(false); pintarDias();
}

// ============ 6 · FIESTAS ============
function fiestas(kit, categorias) {
  const cat = kit.visibles(categorias).find(c => c.id === 'rotiseria');
  const sec = $('#fiestas');
  if (!cat) { sec.hidden = true; return; }
  sec.hidden = false;
  if (cat.bajada) $('[data-fiestas-bajada]').textContent = cat.bajada;
  const objetivo = new Date(`${cat.desde}T09:00:00-03:00`).getTime();
  const pintar = () => {
    let s = Math.max(0, Math.floor((objetivo - Date.now()) / 1000));
    const d = Math.floor(s / 86400); s -= d * 86400; const h = Math.floor(s / 3600); s -= h * 3600; const m = Math.floor(s / 60);
    $('[data-c="d"]').textContent = String(d).padStart(2, '0'); $('[data-c="h"]').textContent = String(h).padStart(2, '0'); $('[data-c="m"]').textContent = String(m).padStart(2, '0');
  };
  pintar();
  if (!sec.dataset.init) { sec.dataset.init = '1'; setInterval(pintar, 30_000); }
}

// ============ 8 · LA MESA DE FOTOS ============
function mesa() {
  const m = $('[data-mesa]'); if (!m) return;
  const fotos = $$('.pol', m);
  fotos.forEach((f, i) => f.style.setProperty('--i', i));
  // celu: mazo que se tira con el dedo
  let orden = fotos.slice();
  const apilar = () => orden.forEach((f, i) => { f.style.zIndex = orden.length - i; f.style.setProperty('--rr', `${i === 0 ? 0 : (i % 2 ? 4 : -4) * Math.min(i, 2)}deg`); f.style.opacity = i < 3 ? 1 : 0; });
  if (!esDesk()) apilar();
  let act = null, x0 = 0, y0 = 0, dx = 0, dy = 0;
  m.addEventListener('pointerdown', (e) => {
    const f = e.target.closest('.pol'); if (!f) return;
    if (esDesk()) { arrastrarDesk(e, f); return; }
    if (f !== orden[0]) return;
    act = f; x0 = e.clientX; y0 = e.clientY; dx = dy = 0; f.setPointerCapture(e.pointerId); f.style.transition = 'none';
  });
  m.addEventListener('pointermove', (e) => {
    if (!act) return;
    dx = e.clientX - x0; dy = e.clientY - y0;
    if (Math.abs(dx) > Math.abs(dy)) e.preventDefault();
    act.style.transform = `translate(${dx}px, ${dy * .3}px) rotate(${dx / 14}deg)`;
  });
  const soltar = () => {
    if (!act) return; const f = act; act = null; f.style.transition = '';
    if (Math.abs(dx) > 80) {
      f.style.transform = `translate(${Math.sign(dx) * innerWidth}px, ${dy * .3}px) rotate(${Math.sign(dx) * 30}deg)`; f.classList.add('vuela');
      setTimeout(() => { f.classList.remove('vuela'); f.style.transition = 'none'; f.style.transform = ''; orden.push(orden.shift()); apilar(); requestAnimationFrame(() => { f.style.transition = ''; }); }, 420);
    } else { f.style.transform = ''; }
  };
  m.addEventListener('pointerup', soltar); m.addEventListener('pointercancel', soltar);
  // desktop: mover las fotos por la mesa
  let z = 30;
  function arrastrarDesk(e, f) {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    e.preventDefault();
    const r = m.getBoundingClientRect(), fr = f.getBoundingClientRect();
    const ox = e.clientX - fr.left, oy = e.clientY - fr.top;
    f.classList.add('agarrada'); f.style.zIndex = ++z;
    const mover = (ev) => {
      const x = Math.max(0, Math.min(r.width - fr.width, ev.clientX - r.left - ox));
      const y = Math.max(0, Math.min(r.height - fr.height, ev.clientY - r.top - oy));
      f.style.left = `${(x / r.width) * 100}%`; f.style.top = `${(y / r.height) * 100}%`;
    };
    const fin = () => { f.classList.remove('agarrada'); removeEventListener('pointermove', mover); removeEventListener('pointerup', fin); };
    addEventListener('pointermove', mover); addEventListener('pointerup', fin);
  }
  matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { fotos.forEach(f => { f.style.cssText = `--r:${f.style.getPropertyValue('--r')}; --x:${f.style.getPropertyValue('--x')}; --y:${f.style.getPropertyValue('--y')}; --i:${f.style.getPropertyValue('--i')}`; }); if (!e.matches) { orden = fotos.slice(); apilar(); } });
}

// ============ 10 · HORARIOS Y ESTADO ============
function horarios(kit) {
  const H = kit.config.horarios;
  const now = ahoraEn(kit.config.zonaHoraria || TZ);
  const hoy = new Date(now.dia * 864e5).getUTCDay();
  const orden = [2, 3, 4, 5, 6, 0, 1];
  $('[data-horarios]').innerHTML = orden.map(d => {
    const fr = H[DIAS[d]] || [];
    return `<li class="${d === hoy ? 'hoy' : ''}"><span>${DLARGO[d]}</span><span>${fr.length ? fr.map(([a, b]) => `${hs(a)} a ${hs(b)}`).join(' y ') : 'Cerrado'}</span></li>`;
  }).join('');
  const pintar = () => {
    const e = kit.abierto();
    const est = $('[data-estado]');
    est.classList.toggle('abierto', e.abierto);
    let txt;
    if (e.abierto) txt = `Abierto ahora · hasta las ${hs(e.cierra)}`;
    else if (e.abre) txt = `Cerrado · hoy abre a las ${hs(e.abre)}`;
    else { let k = 1, d; while (k < 8) { d = (hoy + k) % 7; if ((H[DIAS[d]] || []).length) break; k++; } const fr = H[DIAS[d]]?.[0]; txt = `Cerrado · abre ${k === 1 ? 'mañana' : DLARGO[d].toLowerCase()} a las ${fr ? hs(fr[0]) : ''}`; }
    $('[data-estado-largo]').textContent = txt;
    $$('[data-estado-txt]').forEach(x => { x.textContent = e.abierto ? `Abierto ahora · hasta las ${hs(e.cierra)}` : txt; });
  };
  pintar(); setInterval(pintar, 60_000);
}

// ============ ARRANQUE ============
const arranque = intro();
barra();
cartaEventos();
let kit;
try {
  kit = await initKit({
    config: 'cliente.json',
    carrito: { label: 'Tu caja', fab: false },
    carta: { template: plantilla, itemClass: 'plato' },
    cartas: { 'carta-fiestas': { template: plantilla, itemClass: 'plato' } },
    badgeTexto: 'Probá el panel de Panteca',
    imagenes: { lqip: 'img/lqip.json' },
  });
  const [productos, categorias] = await Promise.all([kit.store.getProductos(), kit.store.getCategorias()]);
  contadorCaja(kit);
  carta();
  vitrina(kit, productos);
  reloj(kit);
  metro(kit, productos, categorias);
  fiestas(kit, categorias);
  horarios(kit);
  kit.store.onChange?.(async () => {
    const [p2, c2] = await Promise.all([kit.store.getProductos(), kit.store.getCategorias()]);
    vitrina(kit, p2); fiestas(kit, c2);
  });
} catch (err) {
  console.error('[panteca]', err);
}
mesa();
reveal();
await arranque;
