import fs from 'node:fs';
import path from 'node:path';

export const GA_ID = 'G-W8L23NJLP6';
export const JS_PATH = '/assets/ac-cookie-consent-v1.js';
export const CSS_PATH = '/assets/ac-cookie-consent-v1.css';

// First-party consent control. No CMP, remote script or Google request before opt-in.
function browserConsent() {
  'use strict';
  if (window.ACConsent) return;
  const ID = document.getElementById('ac-cookie-runtime')?.dataset.ga;
  if (!/^G-[A-Z0-9]+$/.test(ID || '')) return;
  const KEY = 'ac_cookie_consent', DENY = 'ac_cookie_denied_session';
  const VERSION = 1, TTL = 180 * 86400000;
  let choice = null, started = false, enabled = false, timer = 0, returnFocus = null;
  const banner = document.getElementById('ac-cookie-banner');
  const dialog = document.getElementById('ac-cookie-dialog');
  const toggle = document.getElementById('ac-cookie-analytics');
  const status = document.getElementById('ac-cookie-status');
  window['ga-disable-' + ID] = true;

  function readChoice() {
    try {
      if (sessionStorage.getItem(DENY) === '1') return null;
      const data = JSON.parse(localStorage.getItem(KEY) || 'null');
      const now = Date.now();
      if (!data || data.version !== VERSION || typeof data.analytics !== 'boolean' ||
          !Number.isFinite(data.decidedAt) || !Number.isFinite(data.expiresAt) ||
          data.decidedAt > now || data.expiresAt <= now || data.expiresAt > data.decidedAt + TTL) return null;
      return data;
    } catch (_) { return null; }
  }
  function saveChoice(analytics) {
    const decidedAt = Date.now();
    choice = { version: VERSION, analytics, decidedAt, expiresAt: decidedAt + TTL };
    try {
      localStorage.setItem(KEY, JSON.stringify(choice));
      sessionStorage.removeItem(DENY);
    } catch (_) {
      // Never retain an old opt-in when a withdrawal cannot be saved.
      try { localStorage.removeItem(KEY); } catch (_) {}
      if (!analytics) { try { sessionStorage.setItem(DENY, '1'); } catch (_) {} }
    }
  }
  function clearAnalyticsCookies() {
    let cookies;
    try { cookies = document.cookie; } catch (_) { return; }
    const names = cookies.split(';').map(c => c.split('=')[0].trim())
      .filter(n => /^_ga(?:_|$)|^_gid$|^_gat(?:_|$)/.test(n));
    const labels = location.hostname.split('.');
    const domains = ['', location.hostname, '.' + location.hostname];
    for (let i = 1; i < labels.length - 1; i++) {
      const domain = labels.slice(i).join('.'); domains.push(domain, '.' + domain);
    }
    const paths = new Set(['/']);
    const parts = location.pathname.split('/').filter(Boolean);
    for (let i = 1; i <= parts.length; i++) {
      const p = '/' + parts.slice(0, i).join('/'); paths.add(p); paths.add(p + '/');
    }
    for (const name of names) for (const domain of new Set(domains)) for (const p of paths) {
      try { document.cookie = name + '=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=' + p +
        (domain ? '; domain=' + domain : '') + '; SameSite=Lax'; } catch (_) {}
    }
  }
  function allowed() { return choice?.analytics === true && choice.expiresAt > Date.now(); }
  function safeURL(raw) {
    try { const u = new URL(raw, location.href); return u.origin + u.pathname; }
    catch (_) { return ''; }
  }
  function startAnalytics() {
    if (!allowed() || started) return;
    started = true; enabled = true;
    window['ga-disable-' + ID] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('consent', 'update', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('js', new Date());
    window.gtag('config', ID, {
      cookie_expires: 15552000, cookie_update: false, cookie_domain: location.hostname,
      cookie_flags: 'SameSite=Lax;Secure', allow_google_signals: false,
      allow_ad_personalization_signals: false,
      page_location: location.origin + location.pathname,
      page_referrer: document.referrer ? safeURL(document.referrer) : ''
    });
    const script = document.createElement('script');
    script.id = 'ac-google-analytics'; script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ID);
    document.head.appendChild(script);
  }
  function stopAnalytics() {
    enabled = false;
    window['ga-disable-' + ID] = true;
    // Suppress queued and subsequent calls; do not send denied-mode pings.
    if (started) { window.gtag = function () {}; if (Array.isArray(window.dataLayer)) window.dataLayer.length = 0; }
    document.getElementById('ac-google-analytics')?.remove();
    clearAnalyticsCookies();
  }
  function paint() {
    if (banner) banner.hidden = choice !== null;
    if (toggle && !dialog?.open) toggle.checked = allowed();
    if (status) status.textContent = choice ? (allowed() ? 'Analítica activada.' : 'Solo preferencias necesarias. Analítica desactivada.') : 'Analítica desactivada hasta que aceptes.';
    const height = banner && !banner.hidden ? banner.getBoundingClientRect().height : 0;
    document.documentElement.style.setProperty('--ac-cookie-space', height ? (height + 20) + 'px' : '0px');
  }
  function closeSettings() {
    if (dialog?.open) {
      if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open');
    }
    if (returnFocus?.isConnected && returnFocus.getClientRects().length) returnFocus.focus({ preventScroll: true });
  }
  function openSettings() {
    returnFocus = document.activeElement;
    if (!dialog) return;
    toggle.checked = allowed();
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    document.getElementById('ac-cookie-dialog-title')?.focus();
  }
  function scheduleExpiry() {
    clearTimeout(timer);
    if (!choice) return;
    timer = setTimeout(() => {
      if (choice && choice.expiresAt <= Date.now()) {
        choice = null; const reload = started; stopAnalytics(); paint();
        if (reload) location.reload();
      } else scheduleExpiry();
    }, Math.min(2147483000, Math.max(1, choice.expiresAt - Date.now())));
  }
  function decide(analytics) {
    const reload = started && !analytics;
    saveChoice(analytics);
    if (analytics) startAnalytics(); else stopAnalytics();
    closeSettings(); paint(); scheduleExpiry();
    // Removing a script does not unload its listeners. Reload once to remove GA completely.
    if (reload) location.reload();
  }
  function policy() {
    closeSettings();
    const details = document.getElementById('ac-cookie-policy');
    if (details) { details.open = true; details.scrollIntoView({ block: 'start' }); details.querySelector('summary')?.focus(); }
  }
  function synchronize() {
    const next = readChoice();
    const reload = started && next?.analytics !== true;
    choice = next;
    if (allowed()) startAnalytics(); else stopAnalytics();
    paint(); scheduleExpiry();
    if (reload) location.reload();
  }
  window.ACConsent = Object.freeze({
    hasAnalyticsConsent: allowed,
    open: openSettings,
    track(name, href) {
      if (!allowed() || !enabled || window['ga-disable-' + ID] || typeof window.gtag !== 'function') return;
      if (name !== 'click_llamada' && name !== 'click_whatsapp') return;
      const link = /^tel:/i.test(href) ? href.split(/[?;]/)[0] : /^whatsapp:/i.test(href) ? 'whatsapp:' : safeURL(href);
      window.gtag('event', name, { send_to: ID, event_category: 'contacto', link_url: link,
        page_location: location.origin + location.pathname, transport_type: 'beacon' });
    }
  });
  document.querySelectorAll('[data-ac-cookie-open]').forEach(b => { b.hidden = false; b.addEventListener('click', openSettings); });
  document.querySelectorAll('[data-ac-cookie-accept]').forEach(b => b.addEventListener('click', () => decide(true)));
  document.querySelectorAll('[data-ac-cookie-reject]').forEach(b => b.addEventListener('click', () => decide(false)));
  document.querySelectorAll('[data-ac-cookie-policy]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); policy(); }));
  document.querySelector('[data-ac-cookie-save]')?.addEventListener('click', () => decide(toggle.checked));
  document.querySelector('[data-ac-cookie-close]')?.addEventListener('click', closeSettings);
  dialog?.addEventListener('cancel', () => { /* Escape closes without granting consent. */ });
  window.addEventListener('storage', e => { if (e.key === KEY || e.key === null) synchronize(); });
  window.addEventListener('pageshow', e => { if (e.persisted) synchronize(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) synchronize(); });
  window.addEventListener('resize', paint, { passive: true });
  choice = readChoice();
  if (allowed()) startAnalytics(); else clearAnalyticsCookies();
  paint(); scheduleExpiry();
}
export const RUNTIME = '(' + browserConsent.toString() + ')();\n';

export const CSS = `
/* Isolated consent UI: no shared button or photo styles are changed. */
body{padding-bottom:var(--ac-cookie-space,0px)}
#ac-cookie-banner[hidden],#ac-cookie-dialog:not([open]),[data-ac-cookie-open][hidden]{display:none!important}
.ac-cookie-footer{background:#082b4d;color:#fff;padding:16px max(18px,calc((100% - 1280px)/2));font:14px/1.55 Arial,Helvetica,sans-serif}
.ac-cookie-tools{display:flex;gap:12px 24px;align-items:flex-start;flex-wrap:wrap}
#ac-cookie-policy{flex:1 1 220px;min-width:0;scroll-margin-top:110px}
#ac-cookie-policy summary{cursor:pointer;font-weight:700;text-decoration:underline;text-underline-offset:3px}
#ac-cookie-policy .ac-cookie-policy-text{max-width:960px;padding:14px 0 4px;color:#e9f0f5}
#ac-cookie-policy h3{font-size:17px;color:#fff;margin:16px 0 6px}
#ac-cookie-policy p{margin:8px 0}
#ac-cookie-policy a{color:#fff!important;text-decoration:underline!important;overflow-wrap:anywhere}
#ac-cookie-policy dl{margin:12px 0}#ac-cookie-policy dt{font-weight:700;color:#fff;margin-top:12px}#ac-cookie-policy dd{margin:3px 0 0}
.ac-cookie-tools>button{background:transparent;border:1px solid #dce5ec;border-radius:7px;padding:10px 13px;color:#fff;font:700 14px Arial;cursor:pointer;min-height:44px}
#ac-cookie-banner{position:fixed;z-index:100;left:16px;bottom:16px;width:min(510px,calc(100% - 32px));box-sizing:border-box;padding:18px;background:#fff;color:#10243a;border:1px solid #dce5ec;border-top:3px solid #ff8700;border-radius:12px;box-shadow:0 8px 28px #082b4d33;font:14px/1.5 Arial,Helvetica,sans-serif;max-height:calc(100dvh - 32px);overflow:auto}
#ac-cookie-banner strong{font-size:18px;color:#0a3f73}#ac-cookie-banner p{margin:8px 0 12px}#ac-cookie-banner a{color:#0a3f73!important;text-decoration:underline!important}
.ac-cookie-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.ac-cookie-actions button,#ac-cookie-dialog .ac-cookie-close{font:700 14px Arial,Helvetica,sans-serif;min-height:44px;padding:11px 10px;border:1px solid #0a3f73;border-radius:8px;background:#0a3f73;color:#fff;cursor:pointer;text-align:center}
.ac-cookie-actions .ac-cookie-config{grid-column:1/-1;background:#fff;color:#0a3f73}
.ac-cookie-actions button:focus-visible,.ac-cookie-tools button:focus-visible,#ac-cookie-dialog button:focus-visible,#ac-cookie-policy summary:focus-visible{outline:3px solid #ff8700;outline-offset:3px}
#ac-cookie-dialog{width:min(530px,calc(100% - 32px));box-sizing:border-box;padding:22px;border:1px solid #dce5ec;border-top:3px solid #ff8700;border-radius:12px;color:#10243a;background:#fff;max-height:calc(100dvh - 40px);overflow:auto;font:15px/1.5 Arial,Helvetica,sans-serif}
#ac-cookie-dialog::backdrop{background:#082b4d88}#ac-cookie-dialog h2{font-size:22px;line-height:1.2;color:#0a3f73;margin:0 0 14px}#ac-cookie-dialog p{margin:10px 0}#ac-cookie-dialog a{color:#0a3f73!important;text-decoration:underline!important}
.ac-cookie-option{display:flex;align-items:flex-start;gap:12px;margin:16px 0;padding:14px;border:1px solid #dce5ec;border-radius:9px;background:#f7fbff}
.ac-cookie-option input{width:22px;height:22px;flex:none;margin:2px 0;accent-color:#0a3f73}.ac-cookie-option span{min-width:0}.ac-cookie-option small{display:block;margin-top:4px;font-size:13px;color:#435365}
#ac-cookie-dialog .ac-cookie-close{display:block;margin:12px 0 0 auto;background:#fff;color:#0a3f73}
#ac-cookie-status{font-size:13px;color:#435365}
@media(max-width:640px){body{padding-bottom:calc(62px + env(safe-area-inset-bottom) + var(--ac-cookie-space,0px))}#ac-cookie-banner{left:10px;bottom:calc(72px + env(safe-area-inset-bottom));width:calc(100% - 20px);padding:14px;max-height:calc(100dvh - 100px - env(safe-area-inset-bottom))}#ac-cookie-dialog{padding:18px}}
`;

export const FOOTER = `<!-- AC-COOKIE-FOOTER-START --><div class="ac-cookie-footer" data-nosnippet><div class="ac-cookie-tools"><details id="ac-cookie-policy"><summary>Política de cookies</summary><div class="ac-cookie-policy-text">
<p>Esta información describe las cookies y el almacenamiento utilizados para la analítica de Antenista Cerca. Última actualización: 15 de septiembre de 2026.</p>
<h3>Qué utilizamos y para qué</h3><p>Con tu consentimiento usamos Google Analytics 4, proporcionado por Google, para conocer visitas, navegación y clics en nuestros botones de llamada y WhatsApp. No medimos el contenido de tus llamadas o mensajes. Rechazar la analítica no impide navegar ni contactar.</p>
<dl><dt>ac_cookie_consent — preferencia necesaria</dt><dd>Almacenamiento local del navegador, no cookie de seguimiento. Guarda tu elección, versión y fecha de caducidad durante 180 días. No incluye un identificador de visitante. No se utiliza para publicidad.</dd><dt>ac_cookie_denied_session — protección necesaria</dt><dd>Almacenamiento de sesión, solo si no se puede guardar una retirada del consentimiento. Evita reutilizar un permiso anterior; se elimina al cerrar la sesión de la pestaña.</dd><dt>_ga y _ga_W8L23NJLP6 — analítica opcional</dt><dd>Cookies de Google Analytics guardadas en este dominio para distinguir visitas y mantener información de sesión. Solo se habilitan al aceptar la analítica. En esta web se configura una duración de 180 días sin renovación automática en cada visita; se intentan eliminar al retirar el permiso.</dd></dl>
<h3>Tu decisión y cómo cambiarla</h3><p>La analítica está desactivada por defecto. Puedes aceptar, rechazar o guardar tu selección desde el aviso y volver a abrir «Configurar cookies» en el pie de cualquier página. Las opciones de aceptar y rechazar tienen la misma presentación. No interpretamos seguir navegando como aceptación. Volvemos a preguntar cuando caduque la elección o cambien sus finalidades.</p><p>Al desactivar una analítica que ya se había cargado, la página se recarga una vez para detener también sus procesos. Retirar el permiso no borra los datos ya tratados. También puedes gestionar y borrar cookies y almacenamiento desde tu navegador; si borras la preferencia, volverá a aparecer el aviso.</p>
<h3>Proveedor y conexiones externas</h3><p>La analítica transmite datos de uso, dispositivo y navegación a Google, con posibles tratamientos fuera del Espacio Económico Europeo conforme a sus condiciones. Consulta <a href="https://policies.google.com/privacy?hl=es" target="_blank" rel="noopener noreferrer">la privacidad de Google</a> y <a href="https://business.safety.google/adsprocessorterms/" target="_blank" rel="noopener noreferrer">sus condiciones de tratamiento</a>. No activamos señales de Google ni personalización publicitaria desde esta integración.</p><p>Este control no carga GA4 antes de aceptar ni al rechazar. Las fotografías externas pueden conectarse a sus proveedores para mostrarse. Al abrir WhatsApp sales a un servicio externo con sus propias condiciones. Este panel no cambia las preferencias de otros sitios.</p><p>Contacto sobre esta web: <a href="tel:+34641589394">641 589 394</a>. La información anterior se refiere a cookies y no sustituye la información sobre el tratamiento de consultas o datos de clientes.</p>
</div></details><button type="button" data-ac-cookie-open hidden>Configurar cookies</button></div><noscript><p>La analítica permanece desactivada sin JavaScript. Puedes consultar esta política y utilizar los enlaces de contacto.</p></noscript></div><!-- AC-COOKIE-FOOTER-END -->`;

export const UI = `<!-- AC-COOKIE-UI-START --><div data-nosnippet><aside id="ac-cookie-banner" role="region" aria-labelledby="ac-cookie-title" data-nosnippet hidden><strong id="ac-cookie-title">Tú decides sobre las cookies</strong><p>Antenista Cerca utiliza analítica de Google para medir visitas y clics en llamada y WhatsApp, solo si aceptas. Puedes rechazarla y usar la web igualmente. <a href="#ac-cookie-policy" data-ac-cookie-policy>Política de cookies</a>.</p><div class="ac-cookie-actions"><button type="button" data-ac-cookie-accept>Aceptar</button><button type="button" data-ac-cookie-reject>Rechazar</button><button class="ac-cookie-config" type="button" data-ac-cookie-open>Configurar</button></div></aside>
<dialog id="ac-cookie-dialog" aria-labelledby="ac-cookie-dialog-title" data-nosnippet><h2 id="ac-cookie-dialog-title" tabindex="-1">Configurar cookies</h2><p>Las preferencias necesarias guardan tu decisión. La analítica es opcional.</p><label class="ac-cookie-option"><input type="checkbox" id="ac-cookie-analytics"><span><strong>Analítica de Google Analytics</strong><small>Medición de visitas y clics de contacto. Desactivada hasta que la aceptes.</small></span></label><p id="ac-cookie-status" role="status"></p><p><a href="#ac-cookie-policy" data-ac-cookie-policy>Ver política de cookies</a></p><div class="ac-cookie-actions"><button type="button" data-ac-cookie-accept>Aceptar</button><button type="button" data-ac-cookie-reject>Rechazar</button><button class="ac-cookie-config" type="button" data-ac-cookie-save>Guardar preferencias</button></div><button class="ac-cookie-close" type="button" data-ac-cookie-close>Cerrar sin cambios</button></dialog></div><!-- AC-COOKIE-UI-END -->`;

export const CONVERSIONS = `<script id="antenistacerca-conversions">(()=>{document.addEventListener('click',function(e){const el=e.target instanceof Element?e.target:null;const a=el&&el.closest('a[href]');if(!a)return;const href=(a.getAttribute('href')||'').trim();if(/^tel:/i.test(href))window.ACConsent?.track('click_llamada',href);else if(/(?:^whatsapp:|wa\\.me|(?:api\\.|web\\.)?whatsapp\\.com)/i.test(href))window.ACConsent?.track('click_whatsapp',href);},true);})();</script>`;

export function transformConsent(html) {
  if (!/<head\b[^>]*>/i.test(html) || !/<\/body>/i.test(html)) throw new Error('Cookies: estructura HTML incompleta');
  let h = html.replace(/<!-- Google tag \(gtag\.js\) -->[\s\S]*?<script>window\.dataLayer[\s\S]*?<\/script>\s*/i, '')
    .replace(/<script\b[^>]*\bid=["']antenistacerca-conversions["'][^>]*>[\s\S]*?<\/script>\s*/gi, '')
    .replace(/<script\b[^>]*\bid=["']ac-cookie-runtime["'][^>]*>[\s\S]*?<\/script>\s*/gi, '')
    .replace(/<link\b[^>]*href=["']\/assets\/ac-cookie-consent-v1\.css["'][^>]*>\s*/gi, '')
    .replace(/<!-- AC-COOKIE-FOOTER-START -->[\s\S]*?<!-- AC-COOKIE-FOOTER-END -->/g, '')
    .replace(/<!-- AC-COOKIE-UI-START -->[\s\S]*?<!-- AC-COOKIE-UI-END -->/g, '');
  const assets = `<link rel="stylesheet" href="${CSS_PATH}"><script id="ac-cookie-runtime" src="${JS_PATH}" data-ga="${GA_ID}" defer></script>${CONVERSIONS}`;
  h = h.replace(/<\/head>/i, assets + '</head>');
  h = /<\/footer>/i.test(h) ? h.replace(/<\/footer>/i, FOOTER + '</footer>') : h.replace(/<\/body>/i, FOOTER + '</body>');
  h = h.replace(/<\/body>/i, UI + '</body>');
  const errors = auditConsent(h);
  if (errors.length) throw new Error('Cookies: ' + errors.join('; '));
  return h;
}

export function auditConsent(h) {
  const errors = [];
  const count = id => (h.match(new RegExp(`\\bid=["']${id}["']`, 'g')) || []).length;
  for (const id of ['ac-cookie-runtime', 'antenistacerca-conversions', 'ac-cookie-policy', 'ac-cookie-banner', 'ac-cookie-dialog', 'ac-cookie-analytics']) {
    if (count(id) !== 1) errors.push(id + ': debe existir una vez');
  }
  if (!h.includes(`data-ga="${GA_ID}"`) || !h.includes(`src="${JS_PATH}"`) || !h.includes(`href="${CSS_PATH}"`)) errors.push('faltan recursos locales de consentimiento');
  if (/<script\b[^>]*\bsrc=["'][^"']*(?:googletagmanager|google-analytics)\.com/i.test(h)) errors.push('etiqueta Google cargada sin consentimiento');
  if (/gtag\s*\(\s*["'](?:config|js)["']/i.test(h)) errors.push('inicialización GA directa');
  if (!h.includes('window.ACConsent?.track')) errors.push('conversiones sin control de consentimiento');
  if (!h.includes('data-ac-cookie-accept') || !h.includes('data-ac-cookie-reject') || !h.includes('data-ac-cookie-open')) errors.push('opciones de consentimiento ausentes');
  if (/<input\b[^>]*id=["']ac-cookie-analytics["'][^>]*\bchecked/i.test(h)) errors.push('analítica premarcada');
  return errors;
}

export function writeAssets(root) {
  fs.mkdirSync(path.join(root, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(root, JS_PATH.slice(1)), RUNTIME);
  fs.writeFileSync(path.join(root, CSS_PATH.slice(1)), CSS);
}
